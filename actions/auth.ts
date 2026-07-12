"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { login } from "@/lib/auth";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signupUser(data: z.infer<typeof signupSchema>) {
  try {
    const validated = signupSchema.parse(data);

    const existing = await prisma.user.findFirst({
      where: { email: validated.email },
    });

    if (existing) {
      return { error: "Email is already registered." };
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(validated.password, salt);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        passwordHash,
        role: "DISPATCHER", // Default public registration role
        status: "ACTIVE",
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "USER_SIGNUP",
        details: `${user.name} registered a new account as DISPATCHER.`,
      },
    });

    // Auto-login after successful signup
    return await login(validated.email, validated.password);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: error.message || "Failed to create account." };
  }
}
