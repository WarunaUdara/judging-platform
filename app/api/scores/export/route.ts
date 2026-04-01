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
    return forbiddenResponse('Only admins can export scores');
  }

  try {
    const scoresSnapshot = await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('scorecards')
      .get();

    if (scoresSnapshot.empty) {
      return NextResponse.json({ message: 'No scores found' }, { status: 404 });
    }

    const scores = scoresSnapshot.docs.map(doc => doc.data());
    
    if (format === 'json') {
      return NextResponse.json({ scores });
    }

    const headers = ['Team ID', 'Evaluator ID', 'Criterion ID', 'Score', 'Feedback', 'Created At'];
    const rows = scores.map(score => [
      score.teamId || '',
      score.evaluatorId || '',
      score.criterionId || '',
      score.score?.toString() || '',
      score.feedback?.replace(/"/g, '""') || '',
      score.createdAt || '',
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="scores-${competitionId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export scores error:', error);
    return NextResponse.json({ error: 'Failed to export scores' }, { status: 500 });
  }
}