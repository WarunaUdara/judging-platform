import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { verifySession, isAdmin } from '@/lib/utils/auth';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * POST /api/evaluators/create
 * Directly create evaluator account (no invites needed)
 * Admin creates account with email/password
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await verifySession(request);
    if (!authContext || !isAdmin(authContext.claims)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, displayName, password, competitionId, orgId, assignedTeamIds } = body;

    if (!email || !displayName || !password || !competitionId || !orgId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, displayName, password, competitionId, orgId' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Create Firebase Auth user
    let user;
    try {
      user = await adminAuth.createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
      throw error;
    }

    // Set custom claims
    await adminAuth.setCustomUserClaims(user.uid, {
      role: 'evaluator',
      orgId,
      competitionIds: [competitionId],
    });

    // Create user document in Firestore
    await adminDb.collection('users').doc(user.uid).set({
      uid: user.uid,
      email,
      displayName,
      role: 'evaluator',
      orgId,
      competitionIds: [competitionId],
      createdAt: Timestamp.now(),
      createdBy: authContext.uid,
    });

    // Create evaluator record in competition
    await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('evaluators')
      .doc(user.uid)
      .set({
        uid: user.uid,
        email,
        displayName,
        role: 'evaluator',
        assignedTeamIds: assignedTeamIds || [],
        isActive: true,
        addedAt: Timestamp.now(),
        addedBy: authContext.uid,
        competitionId,
      });

    // Write audit log
    await adminDb.collection('audit_logs').add({
      action: 'evaluator.create',
      actorUid: authContext.uid,
      actorEmail: authContext.email,
      resourceType: 'evaluator',
      resourceId: user.uid,
      competitionId,
      timestamp: Timestamp.now(),
      meta: {
        email,
        displayName,
      },
    });

    return NextResponse.json({
      success: true,
      evaluator: {
        uid: user.uid,
        email,
        displayName,
      },
    });
  } catch (error) {
    console.error('Create evaluator error:', error);
    return NextResponse.json(
      { error: 'Failed to create evaluator', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
