import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { AcceptInvitationRequest, AcceptInvitationResponse } from '@/lib/types';
import { badRequestResponse } from '@/lib/utils/auth';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body: AcceptInvitationRequest = await request.json();
    const { token, idToken } = body;

    if (!token || !idToken) {
      return badRequestResponse('Missing required fields');
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    console.log('Accept invite for:', email, 'uid:', uid);

    if (!email) {
      return badRequestResponse('User email not found');
    }

    const inviteDoc = await adminDb.collection('invitations').doc(token).get();

    if (!inviteDoc.exists) {
      console.log('Invalid invitation token:', token);
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 });
    }

    const invite = inviteDoc.data()!;
    console.log('Invite found:', invite.email, 'role:', invite.role);

    if (invite.expiresAt.toMillis() < Date.now()) {
      console.log('Invitation expired');
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    if (invite.used) {
      console.log('Invitation already used');
      return NextResponse.json({ error: 'Invitation has already been used' }, { status: 400 });
    }

    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      console.log('Email mismatch:', invite.email, 'vs', email);
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    // Also update Firestore user document
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      await userRef.update({
        role: invite.role,
        orgId: invite.orgId,
        competitionIds: [invite.competitionId],
        lastLoginAt: new Date().toISOString(),
      });
      console.log('Updated existing user role to:', invite.role);
    } else {
      await userRef.set({
        uid,
        email,
        displayName: decodedToken.name || email,
        photoURL: decodedToken.picture || null,
        role: invite.role,
        orgId: invite.orgId,
        competitionIds: [invite.competitionId],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
      console.log('Created new user with role:', invite.role);
    }

    const user = await adminAuth.getUser(uid);
    const existingClaims = user.customClaims || {};
    const existingCompetitionIds = (existingClaims.competitionIds as string[]) || [];
    const newCompetitionIds = [...new Set([...existingCompetitionIds, invite.competitionId])];

    const newClaims = {
      role: invite.role,
      orgId: invite.orgId,
      competitionIds: newCompetitionIds,
    };

    await adminAuth.setCustomUserClaims(uid, newClaims);
    console.log('Set custom claims:', newClaims);

    if (invite.role === 'evaluator') {
      // Create or update evaluator record using uid as the document ID
      const evaluatorRef = adminDb
        .collection('competitions')
        .doc(invite.competitionId)
        .collection('evaluators')
        .doc(uid);

      await evaluatorRef.set({
        uid,
        email,
        displayName: decodedToken.name || email,
        role: 'evaluator',
        assignedTeamIds: [],
        isActive: true,
        addedAt: Timestamp.now(),
        competitionId: invite.competitionId,
      }, { merge: true });
      console.log('Created/updated evaluator record');
    }

    await inviteDoc.ref.update({
      used: true,
      usedAt: Timestamp.now(),
    });

    // Create session cookie for seamless redirect
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: isProduction,
      path: '/',
      sameSite: 'lax' as const,
    };

    console.log('Returning role:', invite.role);

    const responseData: AcceptInvitationResponse = {
      success: true,
      competitionId: invite.competitionId,
      role: invite.role,
    };

    const response = NextResponse.json(responseData);
    response.cookies.set('session', sessionCookie, cookieOptions);

    return response;
  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}