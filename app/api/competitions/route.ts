import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifySession, isAdmin, unauthorizedResponse, forbiddenResponse, badRequestResponse } from '@/lib/utils/auth';
import { CreateCompetitionRequest } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * POST /api/competitions
 * Create a new competition
 */
export async function POST(request: NextRequest) {
  // Verify session
  const authContext = await verifySession(request);
  if (!authContext) {
    return unauthorizedResponse();
  }

  // Only admins can create competitions
  if (!isAdmin(authContext.claims)) {
    return forbiddenResponse('Only organizers and superadmins can create competitions');
  }

  try {
    const body: CreateCompetitionRequest = await request.json();
    const { 
      name, 
      type, 
      description, 
      teamMinSize, 
      teamMaxSize, 
      allowedDomains, 
      scoringConfig 
    } = body;

    if (!name || !type || teamMinSize < 1 || teamMaxSize < teamMinSize) {
      return badRequestResponse('Invalid competition data');
    }

    const now = Timestamp.now();
    
    const competitionData = {
      orgId: authContext.claims.orgId,
      name,
      type,
      description: description || '',
      status: 'draft',
      teamMinSize,
      teamMaxSize,
      allowedDomains: allowedDomains || [],
      scoringConfig: {
        allowPartialSubmit: scoringConfig?.allowPartialSubmit ?? true,
        showLeaderboardTo: scoringConfig?.showLeaderboardTo ?? 'evaluators_and_organizers',
        scoreVisibilityMode: scoringConfig?.scoreVisibilityMode ?? 'live',
        allowRescoring: scoringConfig?.allowRescoring ?? false,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: authContext.uid,
    };

    const docRef = await adminDb.collection('competitions').add(competitionData);

    // Update user's custom claims to include this competition
    if (authContext.claims.role === 'organizer') {
      const user = await adminDb.collection('users').doc(authContext.uid).get();
      const existingClaims = authContext.claims;
      const newCompetitionIds = [...new Set([...existingClaims.competitionIds, docRef.id])];

      const { adminAuth } = await import('@/lib/firebase/admin');
      await adminAuth.setCustomUserClaims(authContext.uid, {
        ...existingClaims,
        competitionIds: newCompetitionIds,
      });
    }

    // Write audit log
    await adminDb.collection('audit_logs').add({
      actorUid: authContext.uid,
      actorEmail: authContext.email,
      action: 'competition.create',
      resourceType: 'competition',
      resourceId: docRef.id,
      competitionId: docRef.id,
      meta: { name, type },
      timestamp: now,
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Create competition error:', error);
    return NextResponse.json(
      { error: 'Failed to create competition' },
      { status: 500 }
    );
  }
}
