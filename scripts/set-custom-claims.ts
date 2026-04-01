import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const auth = getAuth(app);

async function setCustomClaims() {
  const uid = '87w0Ehi2ipSKAK0O9C4dbCJheoJ3';
  
  const claims = {
    role: 'superadmin',
    orgId: 'cryptx',
    competitionIds: [], // Add competition IDs here if needed
  };

  try {
    await auth.setCustomUserClaims(uid, claims);
    console.log('✓ Custom claims set successfully');
    console.log('Claims:', JSON.stringify(claims, null, 2));
    console.log('\n⚠️ User must sign out and sign back in for changes to take effect');
  } catch (error) {
    console.error('Error setting claims:', error);
    process.exit(1);
  }
}

setCustomClaims()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });