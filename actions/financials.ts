"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const fuelLogSchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional().nullable(),
  fuelQuantity: z.coerce.number().positive("Quantity must be greater than 0"),
  fuelCost: z.coerce.number().positive("Fuel cost must be greater than 0"),
  odometerReading: z.coerce.number().positive("Odometer reading must be positive"),
  date: z.coerce.date(),
});

const expenseSchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional().nullable(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.enum(["FUEL", "MAINTENANCE", "TOLL", "INSURANCE", "OTHERS"]),
  description: z.string().min(3, "Description is required"),
  date: z.coerce.date(),
});

// Fuel Logs Actions
export async function getFuelLogs(searchQuery?: string) {
  try {
    const where: any = {};
    if (searchQuery) {
      where.OR = [
        { vehicle: { name: { contains: searchQuery } } },
        { vehicle: { regNumber: { contains: searchQuery } } },
      ];
    }
    return await prisma.fuelLog.findMany({
      where,
      include: {
        vehicle: true,
        trip: true,
      },
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch fuel logs:", error);
    return [];
  }
}

export async function createFuelLog(data: z.infer<typeof fuelLogSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["ADMIN", "MANAGER", "DISPATCHER", "DRIVER"].includes(currentUser.role)) {
      return { error: "Unauthorized." };
    }

    const validated = fuelLogSchema.parse(data);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validated.vehicleId },
    });

    if (!vehicle) return { error: "Vehicle not found." };

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create fuel log
      const fuelLog = await tx.fuelLog.create({
        data: {
          vehicleId: validated.vehicleId,
          tripId: validated.tripId || null,
          fuelQuantity: validated.fuelQuantity,
          fuelCost: validated.fuelCost,
          odometerReading: validated.odometerReading,
          date: validated.date,
        },
      });

      // 2. Auto create Expense for Fuel
      await tx.expense.create({
        data: {
          vehicleId: validated.vehicleId,
          tripId: validated.tripId || null,
          amount: validated.fuelCost,
          category: "FUEL",
          description: `Fuel purchase: ${validated.fuelQuantity} Liters at odometer ${validated.odometerReading}`,
          date: validated.date,
        },
      });

      // 3. Update vehicle odometer if reading is higher than current
      if (validated.odometerReading > vehicle.odometer) {
        await tx.vehicle.update({
          where: { id: validated.vehicleId },
          data: { odometer: validated.odometerReading },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "FUEL_LOG_CREATE",
          details: `Logged ${validated.fuelQuantity}L fuel for vehicle ${vehicle.regNumber} costing $${validated.fuelCost}`,
        },
      });

      return fuelLog;
    });

    revalidatePath("/dashboard/fuel");
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    return { success: true, fuelLog: result };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: error.message || "Failed to log fuel." };
  }
}

// Expenses Actions
export async function getExpenses(searchQuery?: string, categoryFilter?: string) {
  try {
    const where: any = {};
    if (searchQuery) {
      where.OR = [
        { description: { contains: searchQuery } },
        { vehicle: { name: { contains: searchQuery } } },
        { vehicle: { regNumber: { contains: searchQuery } } },
      ];
    }
    if (categoryFilter && categoryFilter !== "ALL") {
      where.category = categoryFilter;
    }

    return await prisma.expense.findMany({
      where,
      include: {
        vehicle: true,
        trip: true,
      },
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}

export async function createExpense(data: z.infer<typeof expenseSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["ADMIN", "MANAGER"].includes(currentUser.role)) {
      return { error: "Unauthorized. Managers or Admins only." };
    }

    const validated = expenseSchema.parse(data);

    const vehicle = await prisma.vehicle.findUnique({ where: { id: validated.vehicleId } });
    if (!vehicle) return { error: "Vehicle not found." };

    const expense = await prisma.expense.create({
      data: {
        vehicleId: validated.vehicleId,
        tripId: validated.tripId || null,
        amount: validated.amount,
        category: validated.category,
        description: validated.description,
        date: validated.date,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: currentUser.userId,
        action: "EXPENSE_CREATE",
        details: `Logged expense of $${validated.amount} (${validated.category}) for ${vehicle.regNumber}`,
      },
    });

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");
    return { success: true, expense };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: error.message || "Failed to log expense." };
  }
}

export async function deleteExpense(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return { error: "Unauthorized. Admins only can delete expenses." };
    }

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) return { error: "Expense not found." };

    await prisma.expense.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: currentUser.userId,
        action: "EXPENSE_DELETE",
        details: `Deleted expense of $${expense.amount} (${expense.category})`,
      },
    });

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete expense." };
  }
}
