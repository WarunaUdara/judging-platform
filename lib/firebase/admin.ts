import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

let adminApp: App;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  
  const apps = getApps();
  const existing = apps.find((a) => a.name === 'admin');
  
  if (existing) {
    adminApp = existing;
    return adminApp;
  }

  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || 
      !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 
      !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    throw new Error('Missing Firebase Admin SDK environment variables');
  }

  adminApp = initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    },
    'admin'
  );

  return adminApp;
}

export const adminDb = getFirestore(getAdminApp());
export const adminAuth = getAuth(getAdminApp());
export const adminRtdb = getDatabase(getAdminApp());
