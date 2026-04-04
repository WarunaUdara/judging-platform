import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CustomClaims } from "@/lib/types";

export interface AuthContext {
  claims: CustomClaims;
  email: string;
  uid: string;
}

export async function verifySession(
  _request: NextRequest
): Promise<AuthContext | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role, org_id, competition_ids")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return null;
    }

    return {
      uid: user.id,
      email: user.email ?? "",
      claims: {
        role: profile?.role ?? "pending",
        orgId: profile?.org_id ?? "",
        competitionIds: profile?.competition_ids ?? [],
      },
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

export function canAccessCompetition(
  claims: CustomClaims,
  competitionId: string
): boolean {
  if (claims.role === "superadmin") {
    return true;
  }

  return claims.competitionIds.includes(competitionId);
}

export function isAdmin(claims: CustomClaims): boolean {
  return claims.role === "superadmin" || claims.role === "organizer";
}

export function isEvaluator(claims: CustomClaims): boolean {
  return claims.role === "evaluator";
}

export function unauthorizedResponse(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return Response.json({ error: message }, { status: 403 });
}

export function badRequestResponse(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function serverErrorResponse(message = "Internal server error") {
  return Response.json({ error: message }, { status: 500 });
}
