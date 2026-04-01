import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fetch from 'node-fetch';

// This helper is intended for local E2E automation only. It requires
// Firebase Admin credentials via environment variables. Do NOT commit
// production secrets into the repo.

function initAdmin() {
  if (getApps().length > 0) return;

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

export async function ensureTestUser(opts: {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  competitionIds?: string[];
}) {
  initAdmin();
  const auth = getAuth();
  const db = getFirestore();

  const { uid, email, displayName, photoURL } = opts;
  const role = opts.role || 'superadmin';
  const competitionIds = opts.competitionIds || [];

  // Ensure Auth user exists
  try {
    await auth.getUser(uid);
  } catch (err) {
    // Create user if not found
    await auth.createUser({
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: photoURL || null,
      emailVerified: true,
    });
  }

  // Set custom claims
  await auth.setCustomUserClaims(uid, { role, competitionIds });

  // Ensure Firestore user doc exists and has the correct role
  const userRef = db.collection('users').doc(uid);
  await userRef.set(
    {
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: photoURL || null,
      role,
      competitionIds,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return { uid, email };
}

/**
 * Create a session cookie value for a given uid that can be set in the browser.
 * This function mints a custom token, exchanges it for an ID token using the
 * Identity Toolkit REST API (requires FIREBASE_API_KEY), then creates a session
 * cookie with the Admin SDK.
 */
export async function createSessionCookieFor(uid: string) {
  initAdmin();
  const auth = getAuth();

  if (!process.env.FIREBASE_API_KEY) {
    throw new Error('FIREBASE_API_KEY is required to exchange custom token for idToken');
  }

  // Mint custom token
  const customToken = await auth.createCustomToken(uid);

  // Exchange custom token for idToken via Identity Toolkit
  const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to sign in with custom token: ${res.status} ${body}`);
  }

  const data = await res.json();
  const idToken = data.idToken;

  // Create session cookie (14 days)
  const expiresIn = 60 * 60 * 24 * 14 * 1000;
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

  // Return the cookie value and expiry timestamp (seconds since epoch)
  const expires = Math.floor(Date.now() / 1000) + expiresIn / 1000;
  return { sessionCookie, expires };
}

export default { ensureTestUser, createSessionCookieFor };
