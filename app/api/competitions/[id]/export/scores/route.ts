import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
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

    // Fetch all scorecards for this competition
    const scorecardsSnapshot = await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('scorecards')
      .where('status', '==', 'submitted')
      .get();

    if (scorecardsSnapshot.empty) {
      return NextResponse.json({ error: 'No scores found' }, { status: 404 });
    }

    // Fetch teams and criteria
    const teamsSnapshot = await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('teams')
      .get();
    
    const criteriaSnapshot = await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('criteria')
      .orderBy('order')
      .get();

    const teams = new Map();
    teamsSnapshot.forEach(doc => {
      teams.set(doc.id, doc.data());
    });

    const criteria = criteriaSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; name: string; order: number; [key: string]: any }>;

    // Build CSV rows
    const rows: string[][] = [];
    
    // Header row
    const headers = [
      'Team Name',
      'Domain',
      'Evaluator Email',
      ...criteria.map(c => c.name),
      ...criteria.map(c => `${c.name} (Remarks)`),
      'Total Weighted Score',
      'Submission Time',
    ];
    rows.push(headers);

    // Data rows
    scorecardsSnapshot.forEach(doc => {
      const scorecard = doc.data();
      const team = teams.get(scorecard.teamId);
      
      const row = [
        team?.name || 'Unknown Team',
        team?.domain || '',
        scorecard.evaluatorEmail || scorecard.evaluatorId,
      ];

      // Add scores
      criteria.forEach(c => {
        const criterionScore = scorecard.scores.find((s: any) => s.criterionId === c.id);
        row.push(criterionScore?.score?.toString() || '0');
      });

      // Add remarks
      criteria.forEach(c => {
        const criterionScore = scorecard.scores.find((s: any) => s.criterionId === c.id);
        row.push((criterionScore?.remarks || '').replace(/"/g, '""')); // Escape quotes
      });

      row.push(scorecard.weightedScore?.toFixed(2) || '0');
      row.push(scorecard.submittedAt?.toDate?.()?.toISOString() || '');

      rows.push(row);
    });

    // Convert to CSV
    const csv = rows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="scores-${competitionId}-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export scores error:', error);
    return NextResponse.json(
      { error: 'Failed to export scores' },
      { status: 500 }
    );
  }
}
