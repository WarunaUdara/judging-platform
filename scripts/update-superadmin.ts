import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'SEED_SUPERADMIN_EMAIL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.error('Please set this variable in your .env file or pass it via CLI');
    process.exit(1);
  }
}

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

// Generate a stable UID based on email hash
function generateStableUID(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.substring(0, 8)}${hex.substring(0, 4)}-4${hex.substring(4, 7)}-5${hex.substring(7, 10)}-${hex.substring(10, 12)}${hex.substring(12, 14)}-${hex.substring(14, 24)}`.substring(0, 24).padEnd(28, '0').substring(0, 28);
}

async function updateSuperAdmin() {
  const email = process.env.SEED_SUPERADMIN_EMAIL || '';
  const uid = process.env.SEED_SUPERADMIN_UID || generateStableUID(email);

  try {
    await db.collection('users').doc(uid).update({
      role: 'superadmin',
      email: email,
    });

    console.log(`✓ Updated ${email} to superadmin role`);
    
    // Verify the update
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    console.log('\nVerified user data:');
    console.log(JSON.stringify(userData, null, 2));
  } catch (error) {
    console.error('Error updating superadmin:', error);
    process.exit(1);
  }
}

updateSuperAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
