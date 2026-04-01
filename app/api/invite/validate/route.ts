import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Fetch invitation by token
    const invitationsRef = adminDb.collection('invitations');
    const snapshot = await invitationsRef.where('id', '==', token).limit(1).get();

    if (snapshot.empty) {
      // Try finding by document ID
      const docRef = await invitationsRef.doc(token).get();
      if (!docRef.exists) {
        return NextResponse.json(
          { error: 'Invitation not found' },
          { status: 404 }
        );
      }

      const invitation = docRef.data();
      if (!invitation) {
        return NextResponse.json(
          { error: 'Invitation data not found' },
          { status: 404 }
        );
      }

      if (invitation.used) {
        return NextResponse.json(
          { error: 'Invitation has already been used' },
          { status: 400 }
        );
      }

      // Fetch competition name
      const compDoc = await adminDb
        .collection('competitions')
        .doc(invitation.competitionId)
        .get();
      const competitionName = compDoc.exists
        ? compDoc.data()?.name || 'Unknown Competition'
        : 'Unknown Competition';

      return NextResponse.json({
        email: invitation.email,
        role: invitation.role,
        competitionName,
        expiresAt: invitation.expiresAt.toDate().toISOString(),
      });
    }

    const invitation = snapshot.docs[0].data();

    if (invitation.used) {
      return NextResponse.json(
        { error: 'Invitation has already been used' },
        { status: 400 }
      );
    }

    // Fetch competition name
    const compDoc = await adminDb
      .collection('competitions')
      .doc(invitation.competitionId)
      .get();
    const competitionName = compDoc.exists
      ? compDoc.data()?.name || 'Unknown Competition'
      : 'Unknown Competition';

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      competitionName,
      expiresAt: invitation.expiresAt.toDate().toISOString(),
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}
