import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { SessionResponse, UserRole } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    console.log('Authenticated user:', decodedToken.email, decodedToken.uid);

    const userRef = adminDb.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();

    let userRole: UserRole = 'pending';
    let competitionIds: string[] = [];

    if (!userDoc.exists) {
      console.log('User not found in Firestore, creating new user');
      await userRef.set({
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        photoURL: decodedToken.picture || null,
        role: 'pending',
        competitionIds: [],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
      userRole = 'pending';
    } else {
      const userData = userDoc.data();
      console.log('User found in Firestore:', userData?.role, userData?.email);
      
      userRole = (userData?.role as UserRole) || 'pending';
      competitionIds = userData?.competitionIds || [];

      await userRef.update({
        lastLoginAt: new Date().toISOString(),
      });
    }

    console.log('Returning role:', userRole);

    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    let sessionCookie;
    try {
      sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    } catch (cookieError) {
      console.error('Session cookie creation failed:', cookieError);
      return NextResponse.json({ error: 'Failed to create session cookie' }, { status: 500 });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    console.log('Environment:', process.env.NODE_ENV, 'Secure cookie:', isProduction);

    const options = {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: isProduction,
      path: '/',
      sameSite: 'lax' as const,
    };

    const response = NextResponse.json<SessionResponse>({
      success: true,
      role: userRole,
      competitionIds,
      uid: decodedToken.uid,
    });

    response.cookies.set('session', sessionCookie, options);
    console.log('Cookie set, redirecting to:', userRole === 'superadmin' || userRole === 'organizer' ? '/admin' : userRole === 'evaluator' ? '/judge/dashboard' : '/');

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
    const userData = userDoc.data();

    console.log('GET /session - user:', decodedClaims.email, 'role:', userData?.role);

    return NextResponse.json({
      authenticated: true,
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      role: userData?.role || 'pending',
      competitionIds: userData?.competitionIds || [],
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  return response;
}