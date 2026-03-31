import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { verifySession, isAdmin, unauthorizedResponse, forbiddenResponse, badRequestResponse } from '@/lib/utils/auth';
import { CustomClaims } from '@/lib/types';

/**
 * POST /api/auth/set-claims
 * Set custom claims for a user (superadmin only)
 */
export async function POST(request: NextRequest) {
  // Verify session
  const authContext = await verifySession(request);
  if (!authContext) {
    return unauthorizedResponse();
  }

  // Only superadmins can set claims
  if (authContext.claims.role !== 'superadmin') {
    return forbiddenResponse('Only superadmins can set custom claims');
  }

  try {
    const body = await request.json();
    const { uid, role, orgId, competitionIds } = body;

    if (!uid || !role || !orgId) {
      return badRequestResponse('Missing required fields: uid, role, orgId');
    }

    const claims: CustomClaims = {
      role,
      orgId,
      competitionIds: competitionIds || [],
    };

    await adminAuth.setCustomUserClaims(uid, claims);

    return NextResponse.json({
      success: true,
      message: 'Custom claims set successfully. User must sign out and back in to activate.',
    });
  } catch (error) {
    console.error('Set claims error:', error);
    return NextResponse.json(
      { error: 'Failed to set custom claims' },
      { status: 500 }
    );
  }
}
