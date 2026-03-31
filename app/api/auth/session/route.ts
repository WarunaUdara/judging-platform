import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { SessionResponse } from '@/lib/types';

/**
 * POST /api/auth/session
 * Exchange Firebase ID token for a session cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session cookie (expires in 14 days)
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days in ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set cookie options
    const options = {
      maxAge: expiresIn / 1000, // seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict' as const,
    };

    const response = NextResponse.json<SessionResponse>({
      success: true,
      role: decodedToken.role || 'evaluator',
      competitionIds: decodedToken.competitionIds || [],
      uid: decodedToken.uid,
    });

    // Set the session cookie
    response.cookies.set('session', sessionCookie, options);

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Sign out by clearing the session cookie
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  return response;
}
