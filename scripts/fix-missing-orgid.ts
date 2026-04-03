#!/usr/bin/env tsx
/**
 * Fix Missing orgId in User Documents and Custom Claims
 * This script adds 'default' orgId to all users missing it
 */

import { adminAuth, adminDb } from '../lib/firebase/admin';

async function fixMissingOrgId() {
  console.log('🔧 Fixing missing orgId in user documents and custom claims...\n');

  try {
    // Get all users from Firestore
    const usersSnapshot = await adminDb.collection('users').get();
    
    let fixed = 0;
    let skipped = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userDoc.id;

      // Check if orgId is missing
      if (!userData.orgId) {
        console.log(`Fixing user: ${userData.email} (${uid})`);

        // Update Firestore document
        await adminDb.collection('users').doc(uid).update({
          orgId: 'default',
          updatedAt: new Date().toISOString(),
        });

        // Update custom claims
        try {
          const user = await adminAuth.getUser(uid);
          const existingClaims = user.customClaims || {};
          
          await adminAuth.setCustomUserClaims(uid, {
            ...existingClaims,
            orgId: 'default',
          });

          console.log(`  ✓ Updated orgId for ${userData.email}`);
          fixed++;
        } catch (authError) {
          console.log(`  ⚠ Could not update custom claims for ${uid} (user may not exist in Auth)`);
          fixed++;
        }
      } else {
        skipped++;
      }
    }

    console.log('\n✅ Migration complete!');
    console.log(`   Fixed: ${fixed} users`);
    console.log(`   Skipped: ${skipped} users (already had orgId)`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixMissingOrgId();
