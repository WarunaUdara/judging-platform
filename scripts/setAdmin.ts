/**
 * Script to set a user as superadmin
 * Run with: bun scripts/setAdmin.ts your-email@example.com org-id
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

async function setAdmin(email: string, orgId: string) {
  try {
    console.log(`Setting ${email} as superadmin...`);

    // Get user by email
    const user = await auth.getUserByEmail(email);
    console.log(`Found user: ${user.uid}`);

    // Set custom claims
    await auth.setCustomUserClaims(user.uid, {
      role: 'superadmin',
      orgId,
      competitionIds: [],
    });

    console.log(`✓ Custom claims set successfully`);

    // Create organisation if it doesn't exist
    const orgRef = db.collection('organisations').doc(orgId);
    const orgDoc = await orgRef.get();

    if (!orgDoc.exists) {
      await orgRef.set({
        id: orgId,
        name: 'CryptX',
        slug: 'cryptx',
        contactEmail: email,
        createdAt: Timestamp.now(),
        createdBy: user.uid,
      });
      console.log(`✓ Created organisation: ${orgId}`);
    } else {
      console.log(`Organisation ${orgId} already exists`);
    }

    console.log(`\n✅ Done! ${email} is now a superadmin.`);
    console.log(`⚠️  User must sign out and sign back in to activate the new role.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get arguments
const email = process.argv[2];
const orgId = process.argv[3] || 'cryptx';

if (!email) {
  console.error('Usage: bun scripts/setAdmin.ts <email> [orgId]');
  console.error('Example: bun scripts/setAdmin.ts admin@cryptx.lk cryptx');
  process.exit(1);
}

setAdmin(email, orgId);
