import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import {
  verifySession,
  isAdmin,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/utils/auth";

/**
 * GET /api/users/pending
 * Fetch users with the "pending" role
 */
export async function GET(request: NextRequest) {
  // Verify session
  const authContext = await verifySession(request);
  if (!authContext) {
    return unauthorizedResponse();
  }

  // Allow both superadmin and organizer
  if (!isAdmin(authContext.claims)) {
    return forbiddenResponse("Only admins can view pending registrations");
  }

  try {
    const snapshot = await adminDb
      .collection("users")
      .where("role", "==", "pending")
      .get();

    const pendingUsers = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ users: pendingUsers });
  } catch (error) {
    console.error("Fetch pending users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending users" },
      { status: 500 },
    );
  }
}
