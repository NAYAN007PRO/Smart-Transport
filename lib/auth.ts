"use server";

import { prisma } from "./db";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies as getCookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "transitops-super-secret-key-change-in-production-123"
);

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function login(email: string, passwordHash: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  // Check status
  if (user.status !== "ACTIVE") {
    return { error: "User account is suspended or inactive" };
  }

  const isPasswordValid = bcrypt.compareSync(passwordHash, user.passwordHash);
  if (!isPasswordValid) {
    return { error: "Invalid email or password" };
  }

  // Create session
  const sessionData: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = await encrypt(sessionData);
  const cookieStore = await getCookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "USER_LOGIN",
      details: `${user.name} logged in successfully.`,
    },
  });

  return { success: true, user: sessionData };
}

export async function logout() {
  const cookieStore = await getCookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (sessionToken) {
    const payload = await decrypt(sessionToken);
    if (payload) {
      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: payload.userId,
          action: "USER_LOGOUT",
          details: `${payload.name} logged out.`,
        },
      });
    }
  }

  cookieStore.delete("session");
  return { success: true };
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await getCookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return await decrypt(token);
}

export async function checkRole(allowedRoles: string[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
