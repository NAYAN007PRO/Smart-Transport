"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const tripSchema = z.object({
  id: z.string().optional(),
  source: z.string().min(2, "Source is required"),
  destination: z.string().min(2, "Destination is required"),
  cargoWeight: z.coerce.number().positive("Cargo weight must be positive"),
  distance: z.coerce.number().positive("Distance must be positive"),
  vehicleId: z.string().min(1, "Vehicle selection is required"),
  driverId: z.string().min(1, "Driver selection is required"),
  status: z.enum(["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"]).default("DRAFT"),
});

export async function getTrips(searchQuery?: string, statusFilter?: string) {
  try {
    const where: any = {};
    if (searchQuery) {
      where.OR = [
        { source: { contains: searchQuery } },
        { destination: { contains: searchQuery } },
        { vehicle: { name: { contains: searchQuery } } },
        { driver: { name: { contains: searchQuery } } },
      ];
    }
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    return await prisma.trip.findMany({
      where,
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    return [];
  }
}

export async function createTrip(data: z.infer<typeof tripSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["ADMIN", "DISPATCHER", "MANAGER"].includes(currentUser.role)) {
      return { error: "Unauthorized. Dispatchers, Managers, or Admins only." };
    }

    const validated = tripSchema.parse(data);

    // Fetch Vehicle & Driver
    const vehicle = await prisma.vehicle.findUnique({ where: { id: validated.vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: validated.driverId } });

    if (!vehicle) return { error: "Vehicle not found." };
    if (!driver) return { error: "Driver not found." };

    // Enforce Business Rules on Assignment
    
    // 1. Retired vehicles cannot be assigned.
    if (vehicle.status === "RETIRED") {
      return { error: `Vehicle ${vehicle.regNumber} is retired and cannot be assigned.` };
    }

    // 2. In Shop vehicles cannot be assigned.
    if (vehicle.status === "IN_SHOP") {
      return { error: `Vehicle ${vehicle.regNumber} is in maintenance (In Shop) and cannot be assigned.` };
    }

    // 3. Drivers with expired licenses cannot be assigned.
    const now = new Date();
    if (new Date(driver.licenseExpiry) < now) {
      return { error: `Driver ${driver.name} has an expired license and cannot be assigned.` };
    }

    // 4. Suspended drivers cannot be assigned.
    if (driver.status === "SUSPENDED") {
      return { error: `Driver ${driver.name} is suspended and cannot be assigned.` };
    }

    // 5. Vehicle already On Trip cannot be assigned.
    if (vehicle.status === "ON_TRIP") {
      return { error: `Vehicle ${vehicle.regNumber} is already on another trip.` };
    }

    // 6. Driver already On Trip cannot be assigned.
    if (driver.status === "ON_TRIP") {
      return { error: `Driver ${driver.name} is already on another trip.` };
    }

    // 7. Cargo Weight must not exceed Vehicle Capacity.
    if (validated.cargoWeight > vehicle.loadCapacity) {
      return {
        error: `Cargo weight (${validated.cargoWeight} kg) exceeds vehicle load capacity (${vehicle.loadCapacity} kg).`,
      };
    }

    // Determine state change based on status
    const shouldDispatch = validated.status === "DISPATCHED";

    // Start Transaction
    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: validated,
      });

      if (shouldDispatch) {
        // Change vehicle to ON_TRIP
        await tx.vehicle.update({
          where: { id: validated.vehicleId },
          data: { status: "ON_TRIP" },
        });

        // Change driver to ON_TRIP
        await tx.driver.update({
          where: { id: validated.driverId },
          data: { status: "ON_TRIP" },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "TRIP_CREATE",
          details: `Created trip #${trip.id.substring(0, 8)} (${trip.source} -> ${trip.destination}) in status: ${trip.status}`,
        },
      });

      if (shouldDispatch) {
        await tx.notification.create({
          data: {
            message: `Trip #${trip.id.substring(0, 8)} has been dispatched. Driver: ${driver.name}, Vehicle: ${vehicle.regNumber}`,
            type: "SUCCESS",
          },
        });
      }

      return trip;
    });

    revalidatePath("/dashboard/trips");
    revalidatePath("/dashboard");
    return { success: true, trip: result };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: error.message || "Failed to create trip." };
  }
}

export async function dispatchTrip(tripId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["ADMIN", "DISPATCHER", "MANAGER"].includes(currentUser.role)) {
      return { error: "Unauthorized." };
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    if (!trip) return { error: "Trip not found." };
    if (trip.status !== "DRAFT") return { error: "Only draft trips can be dispatched." };

    // Verify current status of vehicle/driver
    if (trip.vehicle.status !== "AVAILABLE") {
      return { error: `Vehicle ${trip.vehicle.regNumber} is not available (Current status: ${trip.vehicle.status}).` };
    }
    if (trip.driver.status !== "AVAILABLE") {
      return { error: `Driver ${trip.driver.name} is not available (Current status: ${trip.driver.status}).` };
    }

    // Transaction
    await prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id: tripId },
        data: { status: "DISPATCHED" },
      });

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "ON_TRIP" },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: "ON_TRIP" },
      });

      await tx.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "TRIP_DISPATCH",
          details: `Dispatched trip #${trip.id.substring(0, 8)} (${trip.source} -> ${trip.destination})`,
        },
      });

      await tx.notification.create({
        data: {
          message: `Trip #${trip.id.substring(0, 8)} dispatched. Driver: ${trip.driver.name}, Vehicle: ${trip.vehicle.regNumber}`,
          type: "SUCCESS",
        },
      });
    });

    revalidatePath("/dashboard/trips");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to dispatch trip." };
  }
}

export async function completeTrip(tripId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["ADMIN", "DISPATCHER", "MANAGER"].includes(currentUser.role)) {
      return { error: "Unauthorized." };
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    if (!trip) return { error: "Trip not found." };
    if (trip.status !== "DISPATCHED") return { error: "Only dispatched trips can be completed." };

    await prisma.$transaction(async (tx) => {
      // Complete Trip
      await tx.trip.update({
        where: { id: tripId },
        data: { status: "COMPLETED" },
      });

      // Restore Vehicle status & update odometer
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: "AVAILABLE",
          odometer: trip.vehicle.odometer + trip.distance,
        },
      });

      // Restore Driver status
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: "AVAILABLE" },
      });

      await tx.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "TRIP_COMPLETE",
          details: `Completed trip #${trip.id.substring(0, 8)}. Odometer updated by +${trip.distance} km.`,
        },
      });

      await tx.notification.create({
        data: {
          message: `Trip #${trip.id.substring(0, 8)} completed successfully by ${trip.driver.name}.`,
          type: "SUCCESS",
        },
      });
    });

    revalidatePath("/dashboard/trips");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to complete trip." };
  }
}

export async function cancelTrip(tripId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["ADMIN", "DISPATCHER", "MANAGER"].includes(currentUser.role)) {
      return { error: "Unauthorized." };
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    if (!trip) return { error: "Trip not found." };
    if (["COMPLETED", "CANCELLED"].includes(trip.status)) {
      return { error: `Cannot cancel a trip that is already ${trip.status.toLowerCase()}.` };
    }

    await prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id: tripId },
        data: { status: "CANCELLED" },
      });

      // If active, restore vehicle & driver to AVAILABLE
      if (trip.status === "DISPATCHED") {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: "AVAILABLE" },
        });

        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: "AVAILABLE" },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "TRIP_CANCEL",
          details: `Cancelled trip #${trip.id.substring(0, 8)}`,
        },
      });

      await tx.notification.create({
        data: {
          message: `Trip #${trip.id.substring(0, 8)} was cancelled.`,
          type: "WARNING",
        },
      });
    });

    revalidatePath("/dashboard/trips");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to cancel trip." };
  }
}
