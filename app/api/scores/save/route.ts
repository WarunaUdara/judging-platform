import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifySession, canAccessCompetition, unauthorizedResponse, forbiddenResponse, badRequestResponse } from '@/lib/utils/auth';
import { SubmitScoreRequest } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * POST /api/scores/save
 * Save a scorecard as draft (without submission or leaderboard update)
 */
export async function POST(request: NextRequest) {
  // Verify session
  const authContext = await verifySession(request);
  if (!authContext) {
    return unauthorizedResponse();
  }

  try {
    const body: SubmitScoreRequest = await request.json();
    const { teamId, competitionId, scores } = body;

    if (!teamId || !competitionId || !scores) {
      return badRequestResponse('Missing required fields');
    }

    // Verify access to this competition
    if (!canAccessCompetition(authContext.claims, competitionId)) {
      return forbiddenResponse('You do not have access to this competition');
    }

    // Get competition
    const compDoc = await adminDb.collection('competitions').doc(competitionId).get();
    if (!compDoc.exists) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    const competition = compDoc.data()!;

    // Check if partial submit is allowed
    if (!competition.scoringConfig.allowPartialSubmit) {
      return badRequestResponse('Draft scores are not allowed for this competition');
    }

    const now = Timestamp.now();

    // Check for existing draft
    const existingScorecardQuery = await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('scorecards')
      .where('teamId', '==', teamId)
      .where('evaluatorId', '==', authContext.uid)
      .get();

    // Prepare scorecard data
    const scorecardData = {
      teamId,
      evaluatorId: authContext.uid,
      competitionId,
      status: 'draft',
      scores: Object.fromEntries(
        Object.entries(scores).map(([criteriaId, data]) => [
          criteriaId,
          {
            ...data,
            updatedAt: now,
          },
        ])
      ),
      totalRawScore: 0, // Not calculated for drafts
      weightedScore: 0, // Not calculated for drafts
      submittedAt: null,
      updatedAt: now,
    };

    // Save or update draft scorecard
    let scorecardId: string;
    if (!existingScorecardQuery.empty) {
      scorecardId = existingScorecardQuery.docs[0].id;
      await adminDb
        .collection('competitions')
        .doc(competitionId)
        .collection('scorecards')
        .doc(scorecardId)
        .update(scorecardData);
    } else {
      const docRef = await adminDb
        .collection('competitions')
        .doc(competitionId)
        .collection('scorecards')
        .add(scorecardData);
      scorecardId = docRef.id;
    }

    return NextResponse.json({ success: true, scorecardId, status: 'draft' });
  } catch (error) {
    console.error('Save draft score error:', error);
    return NextResponse.json(
      { error: 'Failed to save draft score' },
      { status: 500 }
    );
  }
}
