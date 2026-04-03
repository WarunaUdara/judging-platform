/**
 * Clean Database Script
 * Removes all test data except superadmin user
 * Run: bun scripts/clean-database.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
});

const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Get superadmin email from env or prompt
    const superadminEmail = process.env.SEED_SUPERADMIN_EMAIL;
    
    if (!superadminEmail) {
      console.error('❌ SEED_SUPERADMIN_EMAIL not found in environment variables');
      console.error('Please add SEED_SUPERADMIN_EMAIL=your-email@example.com to .env');
      process.exit(1);
    }

    console.log(`📧 Superadmin email: ${superadminEmail}`);
    console.log('⚠️  This user will be PRESERVED\n');

    // Get superadmin UID
    let superadminUid: string | null = null;
    try {
      const superadminUser = await auth.getUserByEmail(superadminEmail);
      superadminUid = superadminUser.uid;
      console.log(`✅ Found superadmin: ${superadminUid}\n`);
    } catch (error) {
      console.error('❌ Superadmin user not found. Please create superadmin first.');
      process.exit(1);
    }

    // 1. Clean Firestore
    console.log('🔥 Cleaning Firestore...');
    
    // Delete all users except superadmin
    const usersSnapshot = await db.collection('users').get();
    let usersDeleted = 0;
    for (const doc of usersSnapshot.docs) {
      if (doc.id !== superadminUid) {
        await doc.ref.delete();
        usersDeleted++;
      }
    }
    console.log(`  ✅ Deleted ${usersDeleted} user documents (kept superadmin)`);

    // Delete all competitions
    const competitionsSnapshot = await db.collection('competitions').get();
    for (const doc of competitionsSnapshot.docs) {
      // Delete subcollections first
      const evaluatorsSnapshot = await doc.ref.collection('evaluators').get();
      for (const evalDoc of evaluatorsSnapshot.docs) {
        await evalDoc.ref.delete();
      }
      
      const teamsSnapshot = await doc.ref.collection('teams').get();
      for (const teamDoc of teamsSnapshot.docs) {
        await teamDoc.ref.delete();
      }
      
      const scoresSnapshot = await doc.ref.collection('scores').get();
      for (const scoreDoc of scoresSnapshot.docs) {
        await scoreDoc.ref.delete();
      }
      
      await doc.ref.delete();
    }
    console.log(`  ✅ Deleted ${competitionsSnapshot.size} competitions (with subcollections)`);

    // Delete invitations
    const invitationsSnapshot = await db.collection('invitations').get();
    for (const doc of invitationsSnapshot.docs) {
      await doc.ref.delete();
    }
    console.log(`  ✅ Deleted ${invitationsSnapshot.size} invitations`);

    // Delete audit logs (optional - keep for history)
    const auditLogsSnapshot = await db.collection('audit_logs').get();
    for (const doc of auditLogsSnapshot.docs) {
      await doc.ref.delete();
    }
    console.log(`  ✅ Deleted ${auditLogsSnapshot.size} audit logs`);

    // 2. Clean Firebase Auth (all users except superadmin)
    console.log('\n🔐 Cleaning Firebase Auth...');
    const listUsersResult = await auth.listUsers();
    let authUsersDeleted = 0;
    for (const userRecord of listUsersResult.users) {
      if (userRecord.uid !== superadminUid) {
        await auth.deleteUser(userRecord.uid);
        authUsersDeleted++;
      }
    }
    console.log(`  ✅ Deleted ${authUsersDeleted} auth users (kept superadmin)`);

    // 3. Clean Realtime Database (leaderboard)
    console.log('\n📊 Cleaning Realtime Database...');
    await rtdb.ref('leaderboard').remove();
    console.log('  ✅ Cleared all leaderboard data');

    console.log('\n✨ Database cleanup complete!\n');
    console.log('📋 Summary:');
    console.log(`  - Firestore users deleted: ${usersDeleted}`);
    console.log(`  - Competitions deleted: ${competitionsSnapshot.size}`);
    console.log(`  - Auth users deleted: ${authUsersDeleted}`);
    console.log(`  - Superadmin preserved: ${superadminEmail}`);
    console.log('\n✅ Database is now clean and ready for production!');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run cleanup
cleanDatabase();
