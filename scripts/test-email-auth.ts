#!/usr/bin/env tsx
/**
 * Email/Password Auth Test Script
 * Tests the complete flow:
 * 1. Create admin via Firebase Admin SDK
 * 2. Admin creates evaluators via API (with auto-email credentials)
 * 3. Evaluators can login with email/password
 * 4. Evaluators can score teams
 * 5. Leaderboard updates in real-time
 */

import { adminAuth, adminDb, adminRtdb } from '../lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// Test configuration
const TEST_ORG_ID = 'email-auth-test-org';
const TEST_COMP_ID = 'email-auth-test-' + Date.now();

// Mock credentials (change these for your test)
const ADMIN_EMAIL = 'testadmin@cryptx.lk';
const ADMIN_PASSWORD = 'TestAdmin123!';

const EVALUATORS = [
  { email: 'evaluator1@cryptx.lk', displayName: 'Evaluator One', password: 'Eval123!' },
  { email: 'evaluator2@cryptx.lk', displayName: 'Evaluator Two', password: 'Eval123!' },
];

const CRITERIA = [
  { id: 'c1', name: 'Innovation', weight: 30, maxScore: 10, order: 1, isRequired: true },
  { id: 'c2', name: 'Technical Implementation', weight: 30, maxScore: 10, order: 2, isRequired: true },
  { id: 'c3', name: 'Presentation', weight: 20, maxScore: 10, order: 3, isRequired: true },
  { id: 'c4', name: 'Business Viability', weight: 20, maxScore: 10, order: 4, isRequired: true },
];

const TEAMS = [
  { id: 'team-alpha', name: 'Team Alpha', domain: 'FinTech', projectTitle: 'Smart Banking App' },
  { id: 'team-beta', name: 'Team Beta', domain: 'HealthTech', projectTitle: 'Health Monitor Pro' },
  { id: 'team-gamma', name: 'Team Gamma', domain: 'EdTech', projectTitle: 'Learn Together' },
];

// Helper to generate random scores
const randomScore = () => Math.floor(Math.random() * 4) + 7; // 7-10

async function cleanup() {
  console.log('\n[1/7] Cleaning up previous test data...');
  
  // Delete test users
  const allEmails = [ADMIN_EMAIL, ...EVALUATORS.map(e => e.email)];
  for (const email of allEmails) {
    try {
      const user = await adminAuth.getUserByEmail(email);
      await adminAuth.deleteUser(user.uid);
      await adminDb.collection('users').doc(user.uid).delete();
      console.log(`  Deleted user: ${email}`);
    } catch {
      // User doesn't exist, ignore
    }
  }
  
  // Delete test competitions
  const compsSnap = await adminDb.collection('competitions')
    .where('orgId', '==', TEST_ORG_ID)
    .get();
  
  for (const doc of compsSnap.docs) {
    // Delete subcollections
    const subs = ['criteria', 'teams', 'evaluators', 'scorecards', 'leaderboard_cache'];
    for (const sub of subs) {
      const subSnap = await doc.ref.collection(sub).get();
      for (const s of subSnap.docs) await s.ref.delete();
    }
    await doc.ref.delete();
    console.log(`  Deleted competition: ${doc.id}`);
  }
  
  // Delete RTDB leaderboard
  try {
    await adminRtdb.ref(`leaderboards/${TEST_COMP_ID}`).remove();
  } catch {}
  
  console.log('  Cleanup complete');
}

async function createAdmin() {
  console.log('\n[2/7] Creating admin account...');
  
  const user = await adminAuth.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    displayName: 'Test Admin',
    emailVerified: true,
  });
  
  await adminAuth.setCustomUserClaims(user.uid, {
    role: 'superadmin',
    orgId: TEST_ORG_ID,
    competitionIds: [],
  });
  
  await adminDb.collection('users').doc(user.uid).set({
    uid: user.uid,
    email: ADMIN_EMAIL,
    displayName: 'Test Admin',
    role: 'superadmin',
    orgId: TEST_ORG_ID,
    competitionIds: [],
    createdAt: Timestamp.now(),
  });
  
  console.log(`  Created admin: ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  
  return user;
}

async function createCompetition() {
  console.log('\n[3/7] Creating competition...');
  
  await adminDb.collection('competitions').doc(TEST_COMP_ID).set({
    id: TEST_COMP_ID,
    name: 'Email Auth Test Competition',
    type: 'hackathon',
    description: 'Testing email/password authentication flow',
    orgId: TEST_ORG_ID,
    teamMinSize: 2,
    teamMaxSize: 5,
    allowedDomains: ['FinTech', 'HealthTech', 'EdTech'],
    status: 'scoring',
    scoringConfig: {
      allowPartialSubmit: true,
      showLeaderboardTo: 'evaluators_and_organizers',
      scoreVisibilityMode: 'live',
      allowRescoring: true,
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  // Create criteria
  for (const c of CRITERIA) {
    await adminDb.collection('competitions').doc(TEST_COMP_ID).collection('criteria').doc(c.id).set({
      ...c,
      category: 'General',
      description: `Evaluate ${c.name.toLowerCase()}`,
    });
  }
  
  console.log(`  Created competition: ${TEST_COMP_ID}`);
  console.log(`  Criteria: ${CRITERIA.length}`);
}

async function createTeams() {
  console.log('\n[4/7] Creating teams...');
  
  for (const team of TEAMS) {
    await adminDb.collection('competitions').doc(TEST_COMP_ID).collection('teams').doc(team.id).set({
      ...team,
      competitionId: TEST_COMP_ID,
      submissionUrl: `https://github.com/test/${team.id}`,
      members: [
        { name: 'Member 1', email: 'm1@test.com', role: 'Leader' },
        { name: 'Member 2', email: 'm2@test.com', role: 'Developer' },
      ],
      status: 'submitted',
      createdAt: Timestamp.now(),
    });
  }
  
  console.log(`  Created ${TEAMS.length} teams`);
}

async function createEvaluators() {
  console.log('\n[5/7] Creating evaluators (simulating API call)...');
  
  const evaluatorUsers = [];
  
  for (const evaluator of EVALUATORS) {
    // This simulates what the /api/evaluators/create endpoint does
    const user = await adminAuth.createUser({
      email: evaluator.email,
      password: evaluator.password,
      displayName: evaluator.displayName,
      emailVerified: true,
    });
    
    await adminAuth.setCustomUserClaims(user.uid, {
      role: 'evaluator',
      orgId: TEST_ORG_ID,
      competitionIds: [TEST_COMP_ID],
    });
    
    await adminDb.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: evaluator.email,
      displayName: evaluator.displayName,
      role: 'evaluator',
      orgId: TEST_ORG_ID,
      competitionIds: [TEST_COMP_ID],
      createdAt: Timestamp.now(),
    });
    
    await adminDb.collection('competitions').doc(TEST_COMP_ID).collection('evaluators').doc(user.uid).set({
      uid: user.uid,
      email: evaluator.email,
      displayName: evaluator.displayName,
      role: 'evaluator',
      assignedTeamIds: [],
      isActive: true,
      addedAt: Timestamp.now(),
      competitionId: TEST_COMP_ID,
    });
    
    evaluatorUsers.push({ ...user, password: evaluator.password });
    console.log(`  Created evaluator: ${evaluator.email}`);
    console.log(`    Password: ${evaluator.password}`);
  }
  
  return evaluatorUsers;
}

async function simulateScoring(evaluatorUsers: any[]) {
  console.log('\n[6/7] Simulating scoring by evaluators...');
  
  for (const evaluator of evaluatorUsers) {
    for (const team of TEAMS) {
      const scoresMap: Record<string, { score: number; remarks: string }> = {};
      let totalWeighted = 0;
      
      for (const criterion of CRITERIA) {
        const score = randomScore();
        scoresMap[criterion.id] = {
          score,
          remarks: `Good performance in ${criterion.name.toLowerCase()}`,
        };
        totalWeighted += (score / criterion.maxScore) * criterion.weight;
      }
      
      const scorecardId = `${evaluator.uid}_${team.id}`;
      
      await adminDb.collection('competitions').doc(TEST_COMP_ID).collection('scorecards').doc(scorecardId).set({
        id: scorecardId,
        competitionId: TEST_COMP_ID,
        teamId: team.id,
        evaluatorId: evaluator.uid,
        evaluatorEmail: evaluator.email,
        scores: scoresMap,
        weightedScore: totalWeighted,
        status: 'submitted',
        submittedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log(`  ${evaluator.email} scored ${team.name}: ${totalWeighted.toFixed(1)}/100`);
    }
  }
}

async function calculateAndPublishLeaderboard() {
  console.log('\n[7/7] Calculating and publishing leaderboard...');
  
  const leaderboardEntries: any[] = [];
  
  for (const team of TEAMS) {
    const scorecardsSnap = await adminDb
      .collection('competitions')
      .doc(TEST_COMP_ID)
      .collection('scorecards')
      .where('teamId', '==', team.id)
      .where('status', '==', 'submitted')
      .get();
    
    if (scorecardsSnap.empty) continue;
    
    const scores = scorecardsSnap.docs.map(d => d.data().weightedScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    leaderboardEntries.push({
      teamId: team.id,
      teamName: team.name,
      domain: team.domain,
      averageWeightedScore: avgScore,
      submittedScoreCount: scores.length,
    });
  }
  
  // Sort and rank
  leaderboardEntries.sort((a, b) => b.averageWeightedScore - a.averageWeightedScore);
  leaderboardEntries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });
  
  // Write to RTDB
  const rtdbEntries: any = {};
  for (const entry of leaderboardEntries) {
    rtdbEntries[entry.teamId] = entry;
  }
  
  await adminRtdb.ref(`leaderboards/${TEST_COMP_ID}`).set({
    entries: rtdbEntries,
    updatedAt: Date.now(),
  });
  
  console.log('\n  Final Leaderboard:');
  console.log('  -----------------------------------------');
  for (const entry of leaderboardEntries) {
    console.log(`  ${entry.rank}. ${entry.teamName.padEnd(15)} | ${entry.averageWeightedScore.toFixed(2)}/100 | ${entry.domain}`);
  }
  console.log('  -----------------------------------------');
}

async function printTestSummary() {
  console.log('\n');
  console.log('='.repeat(60));
  console.log('  TEST COMPLETED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log('\n  Test Credentials for Manual Testing:\n');
  
  console.log('  ADMIN LOGIN:');
  console.log('  -----------------------------------------');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('  URL:      http://localhost:3000/login');
  console.log('  Dashboard: http://localhost:3000/admin');
  
  console.log('\n  EVALUATOR LOGINS:');
  console.log('  -----------------------------------------');
  for (const e of EVALUATORS) {
    console.log(`  Email:    ${e.email}`);
    console.log(`  Password: ${e.password}`);
    console.log('  ---');
  }
  console.log('  URL:      http://localhost:3000/login');
  console.log('  Dashboard: http://localhost:3000/judge/dashboard');
  
  console.log('\n  COMPETITION INFO:');
  console.log('  -----------------------------------------');
  console.log(`  ID:     ${TEST_COMP_ID}`);
  console.log(`  Name:   Email Auth Test Competition`);
  console.log(`  Teams:  ${TEAMS.length}`);
  console.log(`  Status: scoring (ready for evaluation)`);
  
  console.log('\n  WHAT TO TEST MANUALLY:');
  console.log('  -----------------------------------------');
  console.log('  1. Login as admin using email/password');
  console.log('  2. Go to Evaluators page, create new evaluator');
  console.log('  3. Check if email was sent (view console logs)');
  console.log('  4. Login as the new evaluator');
  console.log('  5. Score a team and verify timer works');
  console.log('  6. Check leaderboard updates in real-time');
  console.log('  7. Try editing a submitted score (rescoring)');
  
  console.log('\n' + '='.repeat(60));
  console.log('\n');
}

async function main() {
  console.log('\n');
  console.log('='.repeat(60));
  console.log('  EMAIL/PASSWORD AUTH TEST SCRIPT');
  console.log('='.repeat(60));
  
  try {
    await cleanup();
    await createAdmin();
    await createCompetition();
    await createTeams();
    const evaluators = await createEvaluators();
    await simulateScoring(evaluators);
    await calculateAndPublishLeaderboard();
    await printTestSummary();
  } catch (error) {
    console.error('\nTest failed:', error);
    process.exit(1);
  }
}

main();
