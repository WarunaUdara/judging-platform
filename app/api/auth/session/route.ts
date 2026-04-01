import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { SessionResponse, UserRole } from "@/lib/types";

/**
 * POST /api/auth/session
 * Exchange Firebase ID token for a session cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify the ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Check if user exists in our users collection, create if not
    const userRef = adminDb.collection("users").doc(decodedToken.uid);
    const userDoc = await userRef.get();

    const tokenRole = decodedToken.role as UserRole | undefined;
    const tokenCompetitionIds =
      (decodedToken.competitionIds as string[] | undefined) || [];
    let userRole: UserRole = tokenRole || "pending";
    let competitionIds: string[] = tokenCompetitionIds;

    if (!userDoc.exists) {
      // First time user - create user document
      await userRef.set({
        uid: decodedToken.uid,
        email: decodedToken.email || "",
        displayName:
          decodedToken.name || decodedToken.email?.split("@")[0] || "User",
        photoURL: decodedToken.picture || null,
        role: "pending", // New users start as pending
        competitionIds: [],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
      userRole = "pending";
    } else {
      // Existing user - update last login and get current role
      const userData = userDoc.data();
      userRole = tokenRole || userData?.role || "pending";
      competitionIds =
        tokenCompetitionIds.length > 0
          ? tokenCompetitionIds
          : userData?.competitionIds || [];

      await userRef.update({
        lastLoginAt: new Date().toISOString(),
      });
    }

    // Create session cookie (expires in 14 days)
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days in ms

    let sessionCookie;
    try {
      sessionCookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn,
      });
    } catch (cookieError) {
      console.error("Session cookie creation failed:", cookieError);
      return NextResponse.json(
        { error: "Failed to create session cookie" },
        { status: 500 },
      );
    }

    // Set cookie options
    const options = {
      maxAge: expiresIn / 1000, // seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax" as const, // Changed from strict to lax for better compatibility
    };

    const response = NextResponse.json<SessionResponse>({
      success: true,
      role: userRole,
      competitionIds: competitionIds,
      uid: decodedToken.uid,
    });

    // Set the session cookie
    response.cookies.set("session", sessionCookie, options);

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/auth/session
 * Check current session status
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );

    // Get user data from Firestore as fallback when claims are missing.
    const userDoc = await adminDb
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    const userData = userDoc.data();

    return NextResponse.json({
      authenticated: true,
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      role: decodedClaims.role || userData?.role || "pending",
      competitionIds:
        decodedClaims.competitionIds || userData?.competitionIds || [],
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

/**
 * DELETE /api/auth/session
 * Sign out by clearing the session cookie
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("session");
  return response;
}
