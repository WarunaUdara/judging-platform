import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifySession, isAdmin, unauthorizedResponse, forbiddenResponse, badRequestResponse } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  const authContext = await verifySession(request);
  if (!authContext) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get('competitionId');
  const format = searchParams.get('format') || 'csv';

  if (!competitionId) {
    return badRequestResponse('competitionId is required');
  }

  if (!isAdmin(authContext.claims)) {
    return forbiddenResponse('Only admins can export leaderboard');
  }

  try {
    const leaderboardSnapshot = await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('leaderboard_cache')
      .orderBy('totalScore', 'desc')
      .get();

    if (leaderboardSnapshot.empty) {
      return NextResponse.json({ message: 'No leaderboard data found' }, { status: 404 });
    }

    const entries = leaderboardSnapshot.docs.map(doc => doc.data());
    
    if (format === 'json') {
      return NextResponse.json({ leaderboard: entries });
    }

    const headers = ['Rank', 'Team ID', 'Team Name', 'Total Score', 'Criteria Scores'];
    const rows = entries.map((entry, index) => {
      const criteriaScores = entry.scores 
        ? Object.entries(entry.scores).map(([key, value]) => `${key}: ${value}`).join('; ')
        : '';
      return [
        (index + 1).toString(),
        entry.teamId || '',
        entry.teamName?.replace(/"/g, '""') || '',
        entry.totalScore?.toString() || '0',
        criteriaScores.replace(/"/g, '""'),
      ];
    });

    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leaderboard-${competitionId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to export leaderboard' }, { status: 500 });
  }
}