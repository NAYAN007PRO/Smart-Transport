"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const maintenanceSchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().min(1, "Vehicle is required"),
  description: z.string().min(3, "Description is required"),
  cost: z.coerce.number().nonnegative("Cost must be a positive number"),
  status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
  notes: z.string().optional(),
});

export async function getMaintenanceLogs(searchQuery?: string, statusFilter?: string) {
  try {
    const where: any = {};
    if (searchQuery) {
      where.OR = [
        { description: { contains: searchQuery } },
        { notes: { contains: searchQuery } },
        { vehicle: { name: { contains: searchQuery } } },
        { vehicle: { regNumber: { contains: searchQuery } } },
      ];
    }
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    return await prisma.maintenanceLog.findMany({
      where,
      include: {
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch maintenance logs:", error);
    return [];
  }
}

export async function createMaintenance(data: z.infer<typeof maintenanceSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["ADMIN", "MANAGER"].includes(currentUser.role)) {
      return { error: "Unauthorized. Managers or Admins only." };
    }

    const validated = maintenanceSchema.parse(data);

    // Check vehicle status
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validated.vehicleId },
    });

    if (!vehicle) return { error: "Vehicle not found." };
    if (vehicle.status === "ON_TRIP") {
      return { error: `Vehicle ${vehicle.regNumber} is on an active trip and cannot enter maintenance.` };
    }
    if (vehicle.status === "RETIRED") {
      return { error: `Vehicle ${vehicle.regNumber} is retired.` };
    }

    // Transaction to create log and set vehicle to IN_SHOP
    const result = await prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.create({
        data: {
          vehicleId: validated.vehicleId,
          description: validated.description,
          cost: validated.cost,
          status: validated.status,
          notes: validated.notes,
          openedAt: new Date(),
          closedAt: validated.status === "CLOSED" ? new Date() : null,
        },
      });

      // Create an expense for this maintenance if it has a cost
      if (validated.cost > 0) {
        await tx.expense.create({
          data: {
            vehicleId: validated.vehicleId,
            amount: validated.cost,
            category: "MAINTENANCE",
            description: `Maintenance cost: ${validated.description}`,
            date: new Date(),
          },
        });
      }

      // If status is OPEN, vehicle goes IN_SHOP
      // If status is CLOSED, vehicle stays AVAILABLE
      if (validated.status === "OPEN") {
        await tx.vehicle.update({
          where: { id: validated.vehicleId },
          data: { status: "IN_SHOP" },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "MAINTENANCE_CREATE",
          details: `Logged maintenance for ${vehicle.name} (${vehicle.regNumber}). Status: ${validated.status}`,
        },
      });

      return log;
    });

    revalidatePath("/dashboard/maintenance");
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");
    return { success: true, log: result };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: error.message || "Failed to log maintenance." };
  }
}

export async function closeMaintenance(logId: string, notes?: string, actualCost?: number) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["ADMIN", "MANAGER"].includes(currentUser.role)) {
      return { error: "Unauthorized." };
    }

    const log = await prisma.maintenanceLog.findUnique({
      where: { id: logId },
      include: { vehicle: true },
    });

    if (!log) return { error: "Maintenance log not found." };
    if (log.status === "CLOSED") return { error: "Maintenance is already closed." };

    await prisma.$transaction(async (tx) => {
      // Close Maintenance
      await tx.maintenanceLog.update({
        where: { id: logId },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
          notes: notes || log.notes,
          cost: actualCost !== undefined ? actualCost : log.cost,
        },
      });

      // Update maintenance expense if cost changed
      if (actualCost !== undefined && actualCost !== log.cost) {
        // Find existing maintenance expense and update
        const existingExpense = await tx.expense.findFirst({
          where: {
            vehicleId: log.vehicleId,
            category: "MAINTENANCE",
            description: { contains: log.description },
          },
        });

        if (existingExpense) {
          await tx.expense.update({
            where: { id: existingExpense.id },
            data: { amount: actualCost },
          });
        }
      }

      // Restore vehicle to AVAILABLE
      await tx.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: "AVAILABLE" },
      });

      await tx.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "MAINTENANCE_CLOSE",
          details: `Closed maintenance for ${log.vehicle.name} (${log.vehicle.regNumber})`,
        },
      });

      await tx.notification.create({
        data: {
          message: `Maintenance completed for vehicle ${log.vehicle.regNumber}. Status: Available.`,
          type: "INFO",
        },
      });
    });

    revalidatePath("/dashboard/maintenance");
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to close maintenance." };
  }
}
