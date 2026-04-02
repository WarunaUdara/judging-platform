import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { v4 as uuidv4 } from 'uuid';
import { verifySession, isAdmin, canAccessCompetition, unauthorizedResponse, forbiddenResponse, badRequestResponse } from '@/lib/utils/auth';
import { CreateInvitationRequest, CreateInvitationResponse, Invitation } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * POST /api/invitations/create
 * Create an invitation link for an evaluator or organizer
 */
export async function POST(request: NextRequest) {
  // Verify session
  const authContext = await verifySession(request);
  if (!authContext) {
    return unauthorizedResponse();
  }

  // Only admins can create invitations
  if (!isAdmin(authContext.claims)) {
    return forbiddenResponse('Only organizers and superadmins can create invitations');
  }

  try {
    const body: CreateInvitationRequest = await request.json();
    const { email, role, competitionId, orgId, assignedTeamIds } = body;

    if (!email || !role || !competitionId || !orgId) {
      return badRequestResponse('Missing required fields');
    }

    // Verify organizer has access to this competition
    if (authContext.claims.role === 'organizer' && !canAccessCompetition(authContext.claims, competitionId)) {
      return forbiddenResponse('You do not have access to this competition');
    }

    // Generate a unique token
    const token = uuidv4();
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + 48 * 60 * 60 * 1000); // 48 hours

    const invitationData = {
      id: token,
      email,
      role,
      competitionId,
      orgId,
      createdBy: authContext.uid,
      createdAt: now,
      expiresAt,
      used: false,
      usedAt: null,
    };

    // Save invitation to Firestore
    await adminDb.collection('invitations').doc(token).set(invitationData);

    // Create evaluator record if role is evaluator
    if (role === 'evaluator') {
      await adminDb
        .collection('competitions')
        .doc(competitionId)
        .collection('evaluators')
        .doc(email)
        .set({
          uid: '', // Will be filled when invitation is accepted
          email,
          displayName: '',
          role: 'evaluator',
          assignedTeamIds: assignedTeamIds || [],
          isActive: false,
          addedAt: now,
          addedBy: authContext.uid,
          competitionId,
        });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${appUrl}/invite/${token}`;

    // Try to send email notification
    let emailSent = false;
    try {
      const competitionDoc = await adminDb.collection('competitions').doc(competitionId).get();
      const competitionData = competitionDoc.data();
      
      const emailResponse = await fetch(`${appUrl}/api/email/send-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          evaluatorName: email.split('@')[0],
          competitionName: competitionData?.name || 'Competition',
          competitionType: competitionData?.type || 'hackathon',
          inviteLink: inviteUrl,
          organizerName: authContext.email || 'CryptX Team',
        }),
      });

      if (emailResponse.ok) {
        emailSent = true;
      } else {
        console.error('Email send failed:', await emailResponse.text());
      }
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    const response: CreateInvitationResponse = {
      inviteUrl,
      token,
      expiresAt: expiresAt.toDate().toISOString(),
      emailSent,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Create invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}
