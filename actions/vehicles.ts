"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const vehicleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Vehicle name must be at least 2 characters"),
  regNumber: z.string().min(3, "Registration number must be at least 3 characters"),
  model: z.string().min(2, "Model is required"),
  type: z.string().min(2, "Vehicle type is required"),
  loadCapacity: z.coerce.number().positive("Load capacity must be greater than 0"),
  odometer: z.coerce.number().nonnegative("Odometer must be a positive number"),
  acquisitionCost: z.coerce.number().positive("Acquisition cost must be positive"),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]).default("AVAILABLE"),
});

export async function getVehicles(searchQuery?: string, statusFilter?: string) {
  try {
    const where: any = {};
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery } },
        { regNumber: { contains: searchQuery } },
        { model: { contains: searchQuery } },
      ];
    }
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    return await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    return [];
  }
}

export async function upsertVehicle(data: z.infer<typeof vehicleSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["ADMIN", "MANAGER"].includes(currentUser.role)) {
      return { error: "Unauthorized. Managers or Admins only." };
    }

    const validated = vehicleSchema.parse(data);

    // Check unique regNumber
    const existing = await prisma.vehicle.findFirst({
      where: {
        regNumber: validated.regNumber,
        NOT: validated.id ? { id: validated.id } : undefined,
      },
    });

    if (existing) {
      return { error: "Registration number must be unique." };
    }

    if (validated.id) {
      // Update
      const prevVehicle = await prisma.vehicle.findUnique({
        where: { id: validated.id },
      });

      if (!prevVehicle) {
        return { error: "Vehicle not found." };
      }

      // Business rule check: If retired/in shop but on trip, cannot change status
      if (prevVehicle.status === "ON_TRIP" && validated.status !== "ON_TRIP") {
        // Find if there is an active trip
        const activeTrip = await prisma.trip.findFirst({
          where: { vehicleId: validated.id, status: "DISPATCHED" },
        });
        if (activeTrip) {
          return { error: "Vehicle is currently on an active trip and cannot change status." };
        }
      }

      const vehicle = await prisma.vehicle.update({
        where: { id: validated.id },
        data: validated,
      });

      await prisma.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "VEHICLE_UPDATE",
          details: `Updated vehicle ${vehicle.name} (${vehicle.regNumber})`,
        },
      });

      revalidatePath("/dashboard/vehicles");
      return { success: true, vehicle };
    } else {
      // Create
      const vehicle = await prisma.vehicle.create({
        data: validated,
      });

      await prisma.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "VEHICLE_CREATE",
          details: `Created vehicle ${vehicle.name} (${vehicle.regNumber})`,
        },
      });

      revalidatePath("/dashboard/vehicles");
      return { success: true, vehicle };
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: error.message || "Failed to process vehicle request." };
  }
}

export async function deleteVehicle(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return { error: "Unauthorized. Only admins can delete vehicles." };
    }

    // Check if on trip
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { trips: { where: { status: "DISPATCHED" } } },
    });

    if (!vehicle) {
      return { error: "Vehicle not found." };
    }

    if (vehicle.trips.length > 0) {
      return { error: "Cannot delete a vehicle currently on an active trip." };
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: currentUser.userId,
        action: "VEHICLE_DELETE",
        details: `Deleted vehicle ${vehicle.name} (${vehicle.regNumber})`,
      },
    });

    revalidatePath("/dashboard/vehicles");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete vehicle." };
  }
}
