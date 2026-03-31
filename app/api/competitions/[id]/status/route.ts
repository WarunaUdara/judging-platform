import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifySession, isAdmin, canAccessCompetition, unauthorizedResponse, forbiddenResponse, badRequestResponse } from '@/lib/utils/auth';
import { CompetitionStatus } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * PATCH /api/competitions/[id]/status
 * Update competition status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify session
  const authContext = await verifySession(request);
  if (!authContext) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  // Only admins can update competition status
  if (!isAdmin(authContext.claims)) {
    return forbiddenResponse();
  }

  // Verify access to this competition
  if (!canAccessCompetition(authContext.claims, id)) {
    return forbiddenResponse('You do not have access to this competition');
  }

  try {
    const body = await request.json();
    const { status }: { status: CompetitionStatus } = body;

    if (!status || !['draft', 'active', 'scoring', 'closed'].includes(status)) {
      return badRequestResponse('Invalid status value');
    }

    const now = Timestamp.now();

    await adminDb.collection('competitions').doc(id).update({
      status,
      updatedAt: now,
    });

    // Write audit log
    await adminDb.collection('audit_logs').add({
      actorUid: authContext.uid,
      actorEmail: authContext.email,
      action: 'competition.status_update',
      resourceType: 'competition',
      resourceId: id,
      competitionId: id,
      meta: { newStatus: status },
      timestamp: now,
    });

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Update competition status error:', error);
    return NextResponse.json(
      { error: 'Failed to update competition status' },
      { status: 500 }
    );
  }
}
