import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { CustomClaims } from "@/lib/types";

export interface AuthContext {
  uid: string;
  email: string;
  claims: CustomClaims;
}

/**
 * Verifies the session cookie from the request and returns the user context
 * @param request Next.js request object
 * @returns AuthContext if valid, null if invalid
 */
export async function verifySession(
  request: NextRequest,
): Promise<AuthContext | null> {
  try {
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );

    let role = decodedClaims.role as CustomClaims["role"] | undefined;
    let orgId = decodedClaims.orgId as string | undefined;
    let competitionIds =
      (decodedClaims.competitionIds as string[] | undefined) || [];

    // Fallback for users whose Firestore role was updated but session custom claims are stale.
    if (!role || role === "pending") {
      const userDoc = await adminDb
        .collection("users")
        .doc(decodedClaims.uid)
        .get();
      if (userDoc.exists) {
        const userData = userDoc.data() || {};
        const dbRole = userData.role as CustomClaims["role"] | undefined;
        const dbOrgId = userData.orgId as string | undefined;
        const dbCompetitionIds =
          (userData.competitionIds as string[] | undefined) || [];

        if (dbRole) {
          role = dbRole;
        }

        if (!orgId && dbOrgId) {
          orgId = dbOrgId;
        }

        if (dbCompetitionIds.length > 0) {
          competitionIds = [
            ...new Set([...competitionIds, ...dbCompetitionIds]),
          ];
        }
      }
    }

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || "",
      claims: {
        role: role || "pending",
        orgId: orgId || "",
        competitionIds,
      },
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

/**
 * Checks if the user has permission to access a competition
 */
export function canAccessCompetition(
  claims: CustomClaims,
  competitionId: string,
): boolean {
  if (claims.role === "superadmin") return true;
  return claims.competitionIds.includes(competitionId);
}

/**
 * Checks if the user is an admin (superadmin or organizer)
 */
export function isAdmin(claims: CustomClaims): boolean {
  return claims.role === "superadmin" || claims.role === "organizer";
}

/**
 * Checks if the user is an evaluator
 */
export function isEvaluator(claims: CustomClaims): boolean {
  return claims.role === "evaluator";
}

/**
 * Returns unauthorized JSON response
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

/**
 * Returns forbidden JSON response
 */
export function forbiddenResponse(message = "Forbidden") {
  return Response.json({ error: message }, { status: 403 });
}

/**
 * Returns bad request JSON response
 */
export function badRequestResponse(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

/**
 * Returns internal server error JSON response
 */
export function serverErrorResponse(message = "Internal server error") {
  return Response.json({ error: message }, { status: 500 });
}
