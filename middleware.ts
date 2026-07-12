import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "transitops-super-secret-key-change-in-production-123"
);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");

  if (isDashboardRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verify the JWT token
      await jwtVerify(session, JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      // Session is expired or invalid, delete it and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  if (isAuthRoute) {
    if (session) {
      try {
        await jwtVerify(session, JWT_SECRET);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch (err) {
        // Invalid session token, allow access to auth page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
