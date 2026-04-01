/**
 * Database Seeding Script for CryptX Judging Platform
 * 
 * This script seeds the Firestore database with essential bootstrap data:
 * - Superadmin user
 * - Sample competition
 * - Sample evaluators
 * - Sample teams
 * 
 * Run with: bun run scripts/seed-database.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// Superadmin user data
const SUPERADMIN = {
  uid: '87w0Ehi2ipSKAK0O9C4dbCJheoJ3',
  email: 'warunaudarasam2003@gmail.com',
  displayName: 'Waruna Udara',
  role: 'superadmin',
  competitionIds: [],
  photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocJGjOLZMVBdyMANMVVD-E0HQG4Uj7vGPL-nCrJfVPn6nrdz8BT0=s96-c',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Update superadmin user
    console.log('1️⃣  Updating superadmin user...');
    await db.collection('users').doc(SUPERADMIN.uid).set(SUPERADMIN, { merge: true });
    console.log(`   ✓ Superadmin ${SUPERADMIN.email} updated with role: superadmin\n`);

    console.log('✅ Database seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`   - Superadmin: ${SUPERADMIN.email}`);
    console.log(`   - UID: ${SUPERADMIN.uid}`);
    console.log(`   - Role: ${SUPERADMIN.role}\n`);
    
    console.log('Next steps:');
    console.log('   1. Sign in to the platform at http://localhost:3000/login');
    console.log('   2. Create your first competition');
    console.log('   3. Invite evaluators');
    console.log('   4. Import teams\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
