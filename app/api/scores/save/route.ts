import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminRtdb } from '@/lib/firebase/admin';
import { verifySession, canAccessCompetition, unauthorizedResponse, forbiddenResponse, badRequestResponse } from '@/lib/utils/auth';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

interface ScoreEntry {
  score: number;
  remarks: string;
}

interface SaveScoreRequest {
  competitionId: string;
  teamId: string;
  scores: Record<string, ScoreEntry>;
  submit?: boolean;
}

/**
 * POST /api/scores/save
 * Save a scorecard as draft or submit it
 */
export async function POST(request: NextRequest) {
  // Verify session
  const authContext = await verifySession(request);
  if (!authContext) {
    return unauthorizedResponse();
  }

  try {
    const body: SaveScoreRequest = await request.json();
    const { teamId, competitionId, scores, submit = false } = body;

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

    // Check competition is in scoring phase
    if (competition.status !== 'scoring') {
      return badRequestResponse('Competition is not in scoring phase');
    }

    // Check if draft saving is allowed (when not submitting)
    if (!submit && !competition.scoringConfig.allowPartialSubmit) {
      return badRequestResponse('Draft scores are not allowed for this competition');
    }

    const now = Timestamp.now();

    // Fetch criteria to calculate weighted score
    const criteriaSnap = await adminDb
      .collection(`competitions/${competitionId}/criteria`)
      .get();

    const criteria: Record<string, { weight: number; maxScore: number }> = {};
    criteriaSnap.docs.forEach((doc) => {
      const data = doc.data();
      criteria[doc.id] = { weight: data.weight, maxScore: data.maxScore };
    });

    // Calculate weighted score
    let totalWeighted = 0;
    let totalWeight = 0;
    let totalRaw = 0;

    const formattedScores: Record<string, any> = {};
    Object.entries(scores).forEach(([criterionId, entry]) => {
      const criterion = criteria[criterionId];
      if (criterion && entry.score > 0) {
        const normalizedScore = entry.score / criterion.maxScore;
        totalWeighted += normalizedScore * criterion.weight;
        totalWeight += criterion.weight;
        totalRaw += entry.score;
      }

      formattedScores[criterionId] = {
        score: entry.score,
        remarks: entry.remarks || '',
        updatedAt: now,
      };
    });

    const weightedScore = totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 0;

    // Check for existing scorecard
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
      status: submit ? 'submitted' : 'draft',
      scores: formattedScores,
      totalRawScore: totalRaw,
      weightedScore,
      submittedAt: submit ? now : null,
      updatedAt: now,
    };

    // Save or update scorecard
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

    // If submitted, update leaderboard
    if (submit) {
      await updateLeaderboard(competitionId, teamId);
    }

    return NextResponse.json({
      success: true,
      scorecardId,
      weightedScore,
      status: submit ? 'submitted' : 'draft',
    });
  } catch (error) {
    console.error('Save score error:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}

async function updateLeaderboard(competitionId: string, teamId: string) {
  try {
    // Get team info
    const teamDoc = await adminDb
      .doc(`competitions/${competitionId}/teams/${teamId}`)
      .get();
    const team = teamDoc.data();

    if (!team) return;

    // Get all submitted scorecards for this team
    const scorecardsSnap = await adminDb
      .collection(`competitions/${competitionId}/scorecards`)
      .where('teamId', '==', teamId)
      .where('status', '==', 'submitted')
      .get();

    if (scorecardsSnap.empty) return;

    // Calculate average weighted score
    let totalScore = 0;
    scorecardsSnap.docs.forEach((doc) => {
      totalScore += doc.data().weightedScore || 0;
    });
    const averageScore = totalScore / scorecardsSnap.size;

    // Update RTDB leaderboard
    const leaderboardRef = adminRtdb.ref(
      `leaderboards/${competitionId}/entries/${teamId}`
    );
    await leaderboardRef.set({
      teamName: team.name,
      domain: team.domain || '',
      averageWeightedScore: averageScore,
      submittedScoreCount: scorecardsSnap.size,
    });

    // Recalculate ranks
    const entriesRef = adminRtdb.ref(`leaderboards/${competitionId}/entries`);
    const entriesSnap = await entriesRef.get();
    const entries = entriesSnap.val() || {};

    // Sort by score descending
    const sorted = Object.entries(entries)
      .map(([id, data]: [string, any]) => ({
        id,
        score: data.averageWeightedScore,
      }))
      .sort((a, b) => b.score - a.score);

    // Update ranks
    const updates: Record<string, number> = {};
    sorted.forEach((entry, idx) => {
      updates[`leaderboards/${competitionId}/entries/${entry.id}/rank`] = idx + 1;
    });
    updates[`leaderboards/${competitionId}/updatedAt`] = Date.now();

    await adminRtdb.ref().update(updates);
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}
