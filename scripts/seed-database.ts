/**
 * Database Seeding Script for CryptX Judging Platform
 * 
 * This script seeds the Firestore database with essential bootstrap data:
 * - Superadmin user
 * - Sample competition
 * - Sample evaluators
 * - Sample teams
 * 
 * Required environment variables:
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY
 * - SEED_SUPERADMIN_UID (optional, defaults to generated UUID)
 * - SEED_SUPERADMIN_EMAIL (required)
 * - SEED_SUPERADMIN_NAME (required)
 * 
 * Run with: bun run scripts/seed-database.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'SEED_SUPERADMIN_EMAIL',
  'SEED_SUPERADMIN_NAME',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.error('Please set this variable in your .env file or pass it via CLI');
    process.exit(1);
  }
}

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// Generate a stable UUID based on email hash if not provided
function generateStableUID(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Convert to UUID format (first 8 chars of hex, then standard UUID segments)
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.substring(0, 8)}${hex.substring(0, 4)}-4${hex.substring(4, 7)}-5${hex.substring(7, 10)}-${hex.substring(10, 12)}${hex.substring(12, 14)}-${hex.substring(14, 24)}`.substring(0, 24).padEnd(28, '0').substring(0, 28);
}

// Superadmin user data - from environment variables
const SUPERADMIN_UID = process.env.SEED_SUPERADMIN_UID || generateStableUID(process.env.SEED_SUPERADMIN_EMAIL || '');
const SUPERADMIN = {
  uid: SUPERADMIN_UID,
  email: process.env.SEED_SUPERADMIN_EMAIL,
  displayName: process.env.SEED_SUPERADMIN_NAME,
  role: 'superadmin',
  competitionIds: [],
  photoURL: process.env.SEED_SUPERADMIN_PHOTO_URL || '',
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
