import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { verifySession, isAdmin } from '@/lib/utils/auth';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * DELETE /api/evaluators/[id]
 * Delete evaluator account and all related data
 * - Removes from Firebase Auth
 * - Removes from users collection
 * - Removes from competition evaluators subcollection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await verifySession(request);
    if (!authContext || !isAdmin(authContext.claims)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: evaluatorId } = await params;

    if (!evaluatorId) {
      return NextResponse.json(
        { error: 'Evaluator ID is required' },
        { status: 400 }
      );
    }

    // Get evaluator data before deletion (for audit log)
    let evaluatorEmail = '';
    let evaluatorDisplayName = '';
    let competitionIds: string[] = [];

    try {
      const userDoc = await adminDb.collection('users').doc(evaluatorId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        evaluatorEmail = userData?.email || '';
        evaluatorDisplayName = userData?.displayName || '';
        competitionIds = userData?.competitionIds || [];
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    // Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(evaluatorId);
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      // Continue if user doesn't exist in Auth
    }

    // Delete from users collection
    await adminDb.collection('users').doc(evaluatorId).delete();

    // Delete from all competition evaluators subcollections
    if (competitionIds.length > 0) {
      const deletePromises = competitionIds.map(async (competitionId) => {
        return adminDb
          .collection('competitions')
          .doc(competitionId)
          .collection('evaluators')
          .doc(evaluatorId)
          .delete();
      });
      await Promise.all(deletePromises);
    }

    // Write audit log
    await adminDb.collection('audit_logs').add({
      action: 'evaluator.delete',
      actorUid: authContext.uid,
      actorEmail: authContext.email,
      resourceType: 'evaluator',
      resourceId: evaluatorId,
      timestamp: Timestamp.now(),
      meta: {
        evaluatorEmail,
        evaluatorDisplayName,
        competitionIds,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Evaluator deleted successfully',
    });
  } catch (error) {
    console.error('Delete evaluator error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete evaluator', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
