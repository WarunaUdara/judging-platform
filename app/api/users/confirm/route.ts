import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import {
  verifySession,
  isAdmin,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
} from "@/lib/utils/auth";
import { CustomClaims, UserRole } from "@/lib/types";

/**
 * POST /api/users/confirm
 * Update a user's role to an active role like organizer or evaluator.
 */
export async function POST(request: NextRequest) {
  const authContext = await verifySession(request);
  if (!authContext) {
    return unauthorizedResponse();
  }

  // Only superadmin and organizers can confirm users
  if (!isAdmin(authContext.claims)) {
    return forbiddenResponse("Only admins can confirm users");
  }

  try {
    const body = await request.json();
    const { uid, role } = body;

    if (!uid || !role) {
      return badRequestResponse("Missing required fields: uid, role");
    }

    // Usually organizers shouldn't elevate someone to superadmin.
    if (authContext.claims.role === "organizer" && role === "superadmin") {
      return forbiddenResponse(
        "Organizers cannot grant superadmin privileges.",
      );
    }

    const newRole: UserRole = role;

    // Update in Firestore
    await adminDb.collection("users").doc(uid).update({
      role: newRole,
      updatedAt: new Date(),
    });

    // We also might want to update Custom Claims immediately
    // If not, they get it on the next login, and the middleware supports fallback to DB checking.
    // Fetch user to preserve their other claims
    const userRecord = await adminAuth.getUser(uid);
    const existingClaims = (userRecord.customClaims || {}) as CustomClaims;

    const newClaims: CustomClaims = {
      ...existingClaims,
      role: newRole,
    };

    await adminAuth.setCustomUserClaims(uid, newClaims);

    return NextResponse.json({
      success: true,
      message: "Registration confirmed.",
    });
  } catch (error) {
    console.error("Registration confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to confirm registration" },
      { status: 500 },
    );
  }
}
