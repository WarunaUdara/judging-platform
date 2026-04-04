import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  // Skip proxy for public routes
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/timer" ||
    pathname.startsWith("/timer/") ||
    pathname.startsWith("/invite/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("session");

  if (hasSupabaseEnv) {
    const { response, hasSession } = await updateSession(request);

    if (!(sessionCookie || hasSession)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (sessionCookie || hasSession) {
      return response;
    }
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify session cookie with Firebase Admin SDK
  // This happens in API routes via admin SDK
  // Here we just check if cookie exists
  // API routes will do actual verification

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)"],
};
