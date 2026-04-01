import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifySession, isAdmin, unauthorizedResponse, forbiddenResponse, badRequestResponse } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  const authContext = await verifySession(request);
  if (!authContext) return unauthorizedResponse();
  if (!isAdmin(authContext.claims)) return forbiddenResponse('Only admins can create teams');

  try {
    const body = await request.json();
    const { competitionId, team } = body;

    if (!competitionId || !team || !team.name) {
      return badRequestResponse('competitionId and team name are required');
    }

    const teamRef = adminDb.collection('competitions').doc(competitionId).collection('teams').doc();
    const teamData = {
      ...team,
      createdAt: new Date().toISOString(),
      createdBy: authContext.uid,
    };

    await teamRef.set(teamData);

    return NextResponse.json({ id: teamRef.id, ...teamData });
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authContext = await verifySession(request);
  if (!authContext) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get('competitionId');

  if (!competitionId) {
    return badRequestResponse('competitionId is required');
  }

  if (!isAdmin(authContext.claims)) return forbiddenResponse('Only admins can view teams');

  try {
    const snapshot = await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('teams')
      .get();

    const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authContext = await verifySession(request);
  if (!authContext) return unauthorizedResponse();
  if (!isAdmin(authContext.claims)) return forbiddenResponse('Only admins can update teams');

  try {
    const body = await request.json();
    const { competitionId, teamId, team } = body;

    if (!competitionId || !teamId || !team) {
      return badRequestResponse('competitionId, teamId, and team data are required');
    }

    await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('teams')
      .doc(teamId)
      .update(team);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authContext = await verifySession(request);
  if (!authContext) return unauthorizedResponse();
  if (!isAdmin(authContext.claims)) return forbiddenResponse('Only admins can delete teams');

  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get('competitionId');
  const teamId = searchParams.get('teamId');

  if (!competitionId || !teamId) {
    return badRequestResponse('competitionId and teamId are required');
  }

  try {
    await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('teams')
      .doc(teamId)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}