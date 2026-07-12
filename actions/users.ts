"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "DISPATCHER", "MANAGER", "DRIVER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
});

export async function getUsers() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["ADMIN", "MANAGER"].includes(currentUser.role)) {
      return [];
    }

    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function upsertUser(data: z.infer<typeof userSchema>) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return { error: "Unauthorized. Admins only can manage users." };
    }

    const validated = userSchema.parse(data);

    // Verify unique email
    const existing = await prisma.user.findFirst({
      where: {
        email: validated.email,
        NOT: validated.id ? { id: validated.id } : undefined,
      },
    });

    if (existing) {
      return { error: "Email address is already in use." };
    }

    if (validated.id) {
      // Update
      const prevUser = await prisma.user.findUnique({
        where: { id: validated.id },
      });

      if (!prevUser) {
        return { error: "User not found." };
      }

      // Check if trying to edit own role
      if (prevUser.id === currentUser.userId && validated.role !== prevUser.role) {
        return { error: "You cannot change your own role." };
      }

      const updateData: any = {
        name: validated.name,
        email: validated.email,
        role: validated.role,
        status: validated.status,
      };

      if (validated.password) {
        const salt = bcrypt.genSaltSync(10);
        updateData.passwordHash = bcrypt.hashSync(validated.password, salt);
      }

      const user = await prisma.user.update({
        where: { id: validated.id },
        data: updateData,
      });

      await prisma.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "USER_UPDATE",
          details: `Updated user ${user.name} (${user.email}), role: ${user.role}, status: ${user.status}`,
        },
      });

      revalidatePath("/dashboard/users");
      return { success: true };
    } else {
      // Create
      if (!validated.password) {
        return { error: "Password is required for new users." };
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(validated.password, salt);

      const user = await prisma.user.create({
        data: {
          name: validated.name,
          email: validated.email,
          role: validated.role,
          status: validated.status,
          passwordHash,
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "USER_CREATE",
          details: `Created user ${user.name} (${user.email}) as ${user.role}`,
        },
      });

      revalidatePath("/dashboard/users");
      return { success: true };
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: error.message || "Failed to process user." };
  }
}

export async function deleteUser(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return { error: "Unauthorized. Admins only." };
    }

    if (id === currentUser.userId) {
      return { error: "You cannot delete your own account." };
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { error: "User not found." };

    await prisma.user.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: currentUser.userId,
        action: "USER_DELETE",
        details: `Deleted user account ${user.name} (${user.email})`,
      },
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete user." };
  }
}

export async function updateProfile(data: { name: string; email: string; password?: string }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { error: "Unauthorized." };

    const updateData: any = {
      name: data.name,
      email: data.email,
    };

    if (data.password) {
      const salt = bcrypt.genSaltSync(10);
      updateData.passwordHash = bcrypt.hashSync(data.password, salt);
    }

    await prisma.user.update({
      where: { id: currentUser.userId },
      data: updateData,
    });

    await prisma.activityLog.create({
      data: {
        userId: currentUser.userId,
        action: "PROFILE_UPDATE",
        details: `Updated personal profile details (Name: ${data.name})`,
      },
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update profile." };
  }
}
