import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { AcceptInvitationRequest, AcceptInvitationResponse } from '@/lib/types';
import { badRequestResponse } from '@/lib/utils/auth';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * POST /api/invite/accept
 * Accept an invitation and set custom claims
 */
export async function POST(request: NextRequest) {
  try {
    const body: AcceptInvitationRequest = await request.json();
    const { token, idToken } = body;

    if (!token || !idToken) {
      return badRequestResponse('Missing required fields');
    }

    // Verify the ID token to get the user
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return badRequestResponse('User email not found');
    }

    // Get the invitation
    const inviteDoc = await adminDb.collection('invitations').doc(token).get();

    if (!inviteDoc.exists) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 });
    }

    const invite = inviteDoc.data()!;

    // Check if invitation is expired
    if (invite.expiresAt.toMillis() < Date.now()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if invitation is already used
    if (invite.used) {
      return NextResponse.json({ error: 'Invitation has already been used' }, { status: 400 });
    }

    // Check if email matches
    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    // Get existing claims
    const user = await adminAuth.getUser(uid);
    const existingClaims = user.customClaims || {};

    // Merge competition IDs
    const existingCompetitionIds = (existingClaims.competitionIds as string[]) || [];
    const newCompetitionIds = [...new Set([...existingCompetitionIds, invite.competitionId])];

    // Set custom claims
    const newClaims = {
      role: invite.role,
      orgId: invite.orgId,
      competitionIds: newCompetitionIds,
    };

    await adminAuth.setCustomUserClaims(uid, newClaims);

    // Update evaluator record if role is evaluator
    if (invite.role === 'evaluator') {
      const evaluatorRef = adminDb
        .collection('competitions')
        .doc(invite.competitionId)
        .collection('evaluators')
        .doc(email);

      const evaluatorDoc = await evaluatorRef.get();
      
      if (evaluatorDoc.exists) {
        await evaluatorRef.update({
          uid,
          displayName: decodedToken.name || email,
          isActive: true,
        });
      }
    }

    // Mark invitation as used
    await inviteDoc.ref.update({
      used: true,
      usedAt: Timestamp.now(),
    });

    // Write audit log
    await adminDb.collection('audit_logs').add({
      actorUid: uid,
      actorEmail: email,
      action: 'invite.accept',
      resourceType: 'invitation',
      resourceId: token,
      competitionId: invite.competitionId,
      meta: { role: invite.role },
      timestamp: Timestamp.now(),
    });

    const response: AcceptInvitationResponse = {
      success: true,
      competitionId: invite.competitionId,
      role: invite.role,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
