"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const driverSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Driver name must be at least 2 characters"),
  licenseNumber: z.string().min(3, "License number must be at least 3 characters"),
  licenseCategory: z.string().min(2, "License category is required"),
  licenseExpiry: z.coerce.date(),
  phone: z.string().min(5, "Valid phone number is required"),
  safetyScore: z.coerce.number().min(0).max(100).default(100.0),
  status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]).default("AVAILABLE"),
});

export async function getDrivers(searchQuery?: string, statusFilter?: string) {
  try {
    const where: any = {};
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery } },
        { licenseNumber: { contains: searchQuery } },
        { phone: { contains: searchQuery } },
      ];
    }
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    return await prisma.driver.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch drivers:", error);
    return [];
  }
}

export async function upsertDriver(data: z.infer<typeof driverSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["ADMIN", "MANAGER"].includes(currentUser.role)) {
      return { error: "Unauthorized. Managers or Admins only." };
    }

    const validated = driverSchema.parse(data);

    // Check unique licenseNumber
    const existing = await prisma.driver.findFirst({
      where: {
        licenseNumber: validated.licenseNumber,
        NOT: validated.id ? { id: validated.id } : undefined,
      },
    });

    if (existing) {
      return { error: "License number must be unique." };
    }

    if (validated.id) {
      // Update
      const prevDriver = await prisma.driver.findUnique({
        where: { id: validated.id },
      });

      if (!prevDriver) {
        return { error: "Driver not found." };
      }

      // Check if driver is on trip and trying to change status
      if (prevDriver.status === "ON_TRIP" && validated.status !== "ON_TRIP") {
        const activeTrip = await prisma.trip.findFirst({
          where: { driverId: validated.id, status: "DISPATCHED" },
        });
        if (activeTrip) {
          return { error: "Driver is currently on an active trip and cannot change status." };
        }
      }

      const driver = await prisma.driver.update({
        where: { id: validated.id },
        data: validated,
      });

      await prisma.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "DRIVER_UPDATE",
          details: `Updated driver ${driver.name} (License: ${driver.licenseNumber})`,
        },
      });

      revalidatePath("/dashboard/drivers");
      return { success: true, driver };
    } else {
      // Create
      const driver = await prisma.driver.create({
        data: validated,
      });

      await prisma.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "DRIVER_CREATE",
          details: `Created driver ${driver.name} (License: ${driver.licenseNumber})`,
        },
      });

      revalidatePath("/dashboard/drivers");
      return { success: true, driver };
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: error.message || "Failed to process driver request." };
  }
}

export async function deleteDriver(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return { error: "Unauthorized. Admins only can delete drivers." };
    }

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { trips: { where: { status: "DISPATCHED" } } },
    });

    if (!driver) {
      return { error: "Driver not found." };
    }

    if (driver.trips.length > 0) {
      return { error: "Cannot delete a driver currently on an active trip." };
    }

    await prisma.driver.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: currentUser.userId,
        action: "DRIVER_DELETE",
        details: `Deleted driver ${driver.name} (License: ${driver.licenseNumber})`,
      },
    });

    revalidatePath("/dashboard/drivers");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete driver." };
  }
}
