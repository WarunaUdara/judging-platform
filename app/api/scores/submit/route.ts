import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminRtdb } from '@/lib/firebase/admin';
import { verifySession, canAccessCompetition, unauthorizedResponse, forbiddenResponse, badRequestResponse } from '@/lib/utils/auth';
import { SubmitScoreRequest, SubmitScoreResponse, Criterion } from '@/lib/types';
import { computeWeightedScore, computeAverageScore, assignRanks, CriterionScore } from '@/lib/utils/scoring';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * POST /api/scores/submit
 * Submit a scorecard and recalculate leaderboard
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

    // Check competition status
    if (competition.status !== 'scoring') {
      return badRequestResponse('Competition is not in scoring phase');
    }

    // Get all criteria for this competition
    const criteriaSnapshot = await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('criteria')
      .get();

    const criteria: Criterion[] = criteriaSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Criterion));

    // Validate scores
    const criterionScores: CriterionScore[] = [];
    for (const criterion of criteria) {
      const scoreData = scores[criterion.id];

      // Check if required criterion has a score
      if (criterion.isRequired && (!scoreData || scoreData.score === undefined)) {
        return badRequestResponse(`Missing score for required criterion: ${criterion.name}`);
      }

      if (scoreData) {
        // Validate score range
        if (scoreData.score < 0 || scoreData.score > criterion.maxScore) {
          return badRequestResponse(
            `Score for "${criterion.name}" must be between 0 and ${criterion.maxScore}`
          );
        }

        criterionScores.push({
          criteriaId: criterion.id,
          score: scoreData.score,
          weight: criterion.weight,
          maxScore: criterion.maxScore,
        });
      }
    }

    // Compute weighted score
    const weightedScore = computeWeightedScore(criterionScores);
    
    // Calculate total raw score
    const totalRawScore = criterionScores.reduce((sum, cs) => sum + cs.score, 0);

    const now = Timestamp.now();

    // Check if evaluator can rescore
    const existingScorecardQuery = await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('scorecards')
      .where('teamId', '==', teamId)
      .where('evaluatorId', '==', authContext.uid)
      .get();

    if (!existingScorecardQuery.empty && !competition.scoringConfig.allowRescoring) {
      return badRequestResponse('You have already scored this team and rescoring is not allowed');
    }

    // Prepare scorecard data
    const scorecardData = {
      teamId,
      evaluatorId: authContext.uid,
      competitionId,
      status: 'submitted',
      scores: Object.fromEntries(
        Object.entries(scores).map(([criteriaId, data]) => [
          criteriaId,
          {
            ...data,
            updatedAt: now,
          },
        ])
      ),
      totalRawScore,
      weightedScore,
      submittedAt: now,
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

    // LEADERBOARD RECALCULATION
    await recalculateLeaderboard(competitionId, teamId);

    // Write audit log
    await adminDb.collection('audit_logs').add({
      actorUid: authContext.uid,
      actorEmail: authContext.email,
      action: 'score.submit',
      resourceType: 'scorecard',
      resourceId: scorecardId,
      competitionId,
      meta: { teamId, weightedScore },
      timestamp: now,
    });

    const response: SubmitScoreResponse = {
      success: true,
      weightedScore,
      scorecardId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Submit score error:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}

/**
 * Recalculate leaderboard for a competition after a score submission
 */
async function recalculateLeaderboard(competitionId: string, updatedTeamId: string) {
  // Get all submitted scorecards for this team
  const teamScorecardsSnapshot = await adminDb
    .collection('competitions')
    .doc(competitionId)
    .collection('scorecards')
    .where('teamId', '==', updatedTeamId)
    .where('status', '==', 'submitted')
    .get();

  const teamScores = teamScorecardsSnapshot.docs.map(doc => doc.data().weightedScore);
  const averageWeightedScore = computeAverageScore(teamScores);

  // Get team details
  const teamDoc = await adminDb
    .collection('competitions')
    .doc(competitionId)
    .collection('teams')
    .doc(updatedTeamId)
    .get();

  const team = teamDoc.data();

  if (!team) {
    throw new Error('Team not found');
  }

  // Update leaderboard cache for this team
  await adminDb
    .collection('competitions')
    .doc(competitionId)
    .collection('leaderboard_cache')
    .doc(updatedTeamId)
    .set({
      teamId: updatedTeamId,
      teamName: team.name,
      domain: team.domain,
      averageWeightedScore,
      rank: 0, // Will be calculated below
      submittedScoreCount: teamScores.length,
      totalEvaluators: teamScores.length,
      lastUpdated: Timestamp.now(),
    });

  // Get all teams' leaderboard cache entries
  const leaderboardSnapshot = await adminDb
    .collection('competitions')
    .doc(competitionId)
    .collection('leaderboard_cache')
    .get();

  const entries = leaderboardSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      teamId: doc.id,
      teamName: data.teamName || '',
      domain: data.domain || '',
      averageWeightedScore: data.averageWeightedScore || 0,
      submittedScoreCount: data.submittedScoreCount || 0,
    };
  });

  // Assign ranks
  const rankedEntries = assignRanks(
    entries.map(e => ({
      teamId: e.teamId,
      averageWeightedScore: e.averageWeightedScore,
    }))
  );

  // Update ranks in Firestore (batch)
  const batch = adminDb.batch();
  rankedEntries.forEach(({ teamId, rank }) => {
    const docRef = adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('leaderboard_cache')
      .doc(teamId);
    batch.update(docRef, { rank });
  });
  await batch.commit();

  // Write to Realtime Database for live updates
  const leaderboardData = entries.reduce((acc, entry) => {
    const ranked = rankedEntries.find(r => r.teamId === entry.teamId);
    acc[entry.teamId] = {
      teamName: entry.teamName,
      domain: entry.domain,
      averageWeightedScore: entry.averageWeightedScore,
      rank: ranked?.rank || 0,
      submittedScoreCount: entry.submittedScoreCount,
    };
    return acc;
  }, {} as Record<string, any>);

  await adminRtdb.ref(`leaderboards/${competitionId}`).set({
    entries: leaderboardData,
    updatedAt: Date.now(),
  });
}
