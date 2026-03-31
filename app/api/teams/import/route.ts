import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifySession, isAdmin, canAccessCompetition, unauthorizedResponse, forbiddenResponse, badRequestResponse } from '@/lib/utils/auth';
import { ImportTeamsRequest, ImportTeamsResponse } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * POST /api/teams/import
 * Import teams from CSV or JSON
 */
export async function POST(request: NextRequest) {
  // Verify session
  const authContext = await verifySession(request);
  if (!authContext) {
    return unauthorizedResponse();
  }

  // Only admins can import teams
  if (!isAdmin(authContext.claims)) {
    return forbiddenResponse();
  }

  try {
    const body: ImportTeamsRequest = await request.json();
    const { competitionId, teams, format } = body;

    if (!competitionId || !teams || !Array.isArray(teams)) {
      return badRequestResponse('Invalid request data');
    }

    // Verify access to this competition
    if (!canAccessCompetition(authContext.claims, competitionId)) {
      return forbiddenResponse('You do not have access to this competition');
    }

    // Get competition to validate team sizes
    const compDoc = await adminDb.collection('competitions').doc(competitionId).get();
    if (!compDoc.exists) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    const competition = compDoc.data()!;
    const { teamMinSize, teamMaxSize } = competition;

    const errors: Array<{ index: number; reason: string }> = [];
    const validTeams: any[] = [];

    // Validate each team
    teams.forEach((team, index) => {
      if (!team.name) {
        errors.push({ index, reason: 'Missing team name' });
        return;
      }

      if (!team.members || team.members.length < teamMinSize || team.members.length > teamMaxSize) {
        errors.push({ 
          index, 
          reason: `Team must have between ${teamMinSize} and ${teamMaxSize} members` 
        });
        return;
      }

      // Validate members
      const hasLeader = team.members.some((m: any) => m.role === 'leader');
      if (!hasLeader) {
        errors.push({ index, reason: 'Team must have at least one leader' });
        return;
      }

      validTeams.push({
        ...team,
        competitionId,
        importedAt: Timestamp.now(),
        status: 'registered',
      });
    });

    // Batch write valid teams
    const batch = adminDb.batch();
    validTeams.forEach((team) => {
      const docRef = adminDb
        .collection('competitions')
        .doc(competitionId)
        .collection('teams')
        .doc();
      batch.set(docRef, team);
    });

    await batch.commit();

    // Write audit log
    await adminDb.collection('audit_logs').add({
      actorUid: authContext.uid,
      actorEmail: authContext.email,
      action: 'teams.import',
      resourceType: 'team',
      resourceId: competitionId,
      competitionId,
      meta: { format, imported: validTeams.length, errors: errors.length },
      timestamp: Timestamp.now(),
    });

    const response: ImportTeamsResponse = {
      imported: validTeams.length,
      errors,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Import teams error:', error);
    return NextResponse.json(
      { error: 'Failed to import teams' },
      { status: 500 }
    );
  }
}
