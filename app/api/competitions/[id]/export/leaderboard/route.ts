import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminRtdb } from '@/lib/firebase/admin';
import { verifySession, isAdmin } from '@/lib/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: competitionId } = await params;
    
    const authContext = await verifySession(request);
    if (!authContext || !isAdmin(authContext.claims)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch leaderboard from RTDB
    const leaderboardRef = adminRtdb.ref(`leaderboards/${competitionId}/entries`);
    const snapshot = await leaderboardRef.once('value');
    const entries = snapshot.val();

    if (!entries || Object.keys(entries).length === 0) {
      return NextResponse.json({ error: 'No leaderboard data found' }, { status: 404 });
    }

    // Convert to array and sort by rank
    const leaderboardArray = Object.values(entries).sort((a: any, b: any) => a.rank - b.rank);

    // Build CSV rows
    const rows: string[][] = [];
    
    // Header row
    rows.push([
      'Rank',
      'Team Name',
      'Domain',
      'Average Weighted Score',
      'Scores Submitted',
      'Total Evaluators',
      'Completion %',
    ]);

    // Data rows
    leaderboardArray.forEach((entry: any) => {
      const completionPercentage = entry.totalEvaluators > 0
        ? ((entry.scoresSubmitted / entry.totalEvaluators) * 100).toFixed(0)
        : '0';

      rows.push([
        entry.rank?.toString() || '-',
        entry.teamName || 'Unknown',
        entry.domain || '',
        entry.averageWeightedScore?.toFixed(2) || '0.00',
        entry.scoresSubmitted?.toString() || '0',
        entry.totalEvaluators?.toString() || '0',
        `${completionPercentage}%`,
      ]);
    });

    // Convert to CSV
    const csv = rows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leaderboard-${competitionId}-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to export leaderboard' },
      { status: 500 }
    );
  }
}
