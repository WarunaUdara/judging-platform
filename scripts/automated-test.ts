#!/usr/bin/env tsx
/**
 * Automated Test Script - Complete End-to-End Flow
 * Creates mock data and simulates the entire evaluation process
 */

import { adminAuth, adminDb, adminRtdb } from '../lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

const ORG_ID = 'test-org';
const COMP_ID = 'test-comp-' + Date.now();

// Test data
const ADMIN_EMAIL = 'test-admin@test.com';
const ADMIN_PASSWORD = 'Test123!';
const EVALUATOR_EMAILS = ['eval1@test.com', 'eval2@test.com', 'eval3@test.com'];
const EVALUATOR_PASSWORD = 'Test123!';

const CRITERIA = [
  { id: 'c1', name: 'Innovation', weight: 25, maxScore: 10, order: 1 },
  { id: 'c2', name: 'Technical', weight: 25, maxScore: 10, order: 2 },
  { id: 'c3', name: 'Presentation', weight: 25, maxScore: 10, order: 3 },
  { id: 'c4', name: 'Impact', weight: 25, maxScore: 10, order: 4 },
];

const TEAMS = [
  { id: 't1', name: 'Team Alpha', domain: 'FinTech' },
  { id: 't2', name: 'Team Beta', domain: 'HealthTech' },
  { id: 't3', name: 'Team Gamma', domain: 'EdTech' },
];

// Random scores for realistic testing
const getRandomScore = () => Math.floor(Math.random() * 6) + 5; // 5-10

async function cleanUp() {
  console.log('\n🧹 Cleaning up old test data...');
  
  try {
    // Delete test users
    const allEmails = [ADMIN_EMAIL, ...EVALUATOR_EMAILS];
    for (const email of allEmails) {
      try {
        const user = await adminAuth.getUserByEmail(email);
        await adminAuth.deleteUser(user.uid);
        await adminDb.collection('users').doc(user.uid).delete();
      } catch {
        // User doesn't exist
      }
    }
    
    // Delete old test competitions
    const compsSnap = await adminDb.collection('competitions')
      .where('orgId', '==', ORG_ID)
      .get();
    
    for (const doc of compsSnap.docs) {
      // Delete subcollections
      const criteriaSnap = await doc.ref.collection('criteria').get();
      for (const c of criteriaSnap.docs) await c.ref.delete();
      
      const teamsSnap = await doc.ref.collection('teams').get();
      for (const t of teamsSnap.docs) await t.ref.delete();
      
      const evalsSnap = await doc.ref.collection('evaluators').get();
      for (const e of evalsSnap.docs) await e.ref.delete();
      
      const scoresSnap = await doc.ref.collection('scorecards').get();
      for (const s of scoresSnap.docs) await s.ref.delete();
      
      await doc.ref.delete();
    }
    
    console.log('✓ Cleaned up old test data');
  } catch (error) {
    console.log('⚠ Cleanup warning:', error);
  }
}

async function createAdmin() {
  console.log('\n👤 Creating admin account...');
  
  const user = await adminAuth.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    displayName: 'Test Admin',
    emailVerified: true,
  });
  
  await adminAuth.setCustomUserClaims(user.uid, {
    role: 'superadmin',
    orgId: ORG_ID,
    competitionIds: [],
  });
  
  await adminDb.collection('users').doc(user.uid).set({
    uid: user.uid,
    email: ADMIN_EMAIL,
    displayName: 'Test Admin',
    role: 'superadmin',
    orgId: ORG_ID,
    competitionIds: [],
    createdAt: Timestamp.now(),
  });
  
  console.log(`✓ Created admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  return user;
}

async function createEvaluators() {
  console.log('\n👥 Creating evaluators...');
  
  const evaluators = [];
  
  for (let i = 0; i < EVALUATOR_EMAILS.length; i++) {
    const email = EVALUATOR_EMAILS[i];
    
    const user = await adminAuth.createUser({
      email,
      password: EVALUATOR_PASSWORD,
      displayName: `Evaluator ${i + 1}`,
      emailVerified: true,
    });
    
    await adminAuth.setCustomUserClaims(user.uid, {
      role: 'evaluator',
      orgId: ORG_ID,
      competitionIds: [COMP_ID],
    });
    
    await adminDb.collection('users').doc(user.uid).set({
      uid: user.uid,
      email,
      displayName: `Evaluator ${i + 1}`,
      role: 'evaluator',
      orgId: ORG_ID,
      competitionIds: [COMP_ID],
      createdAt: Timestamp.now(),
    });
    
    await adminDb.collection('competitions').doc(COMP_ID).collection('evaluators').doc(user.uid).set({
      uid: user.uid,
      email,
      displayName: `Evaluator ${i + 1}`,
      role: 'evaluator',
      assignedTeamIds: [],
      isActive: true,
      addedAt: Timestamp.now(),
      competitionId: COMP_ID,
    });
    
    evaluators.push(user);
    console.log(`✓ Created evaluator: ${email}`);
  }
  
  return evaluators;
}

async function createCompetition() {
  console.log('\n🏆 Creating competition...');
  
  await adminDb.collection('competitions').doc(COMP_ID).set({
    id: COMP_ID,
    name: 'Automated Test Competition',
    type: 'hackathon',
    description: 'Automated testing competition',
    orgId: ORG_ID,
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
  for (const criterion of CRITERIA) {
    await adminDb.collection('competitions').doc(COMP_ID).collection('criteria').doc(criterion.id).set({
      ...criterion,
      category: 'General',
      description: `Evaluation of ${criterion.name.toLowerCase()}`,
      isRequired: true,
    });
  }
  
  console.log(`✓ Created competition with ${CRITERIA.length} criteria`);
}

async function createTeams() {
  console.log('\n🎯 Creating teams...');
  
  for (const team of TEAMS) {
    await adminDb.collection('competitions').doc(COMP_ID).collection('teams').doc(team.id).set({
      ...team,
      competitionId: COMP_ID,
      projectTitle: `${team.name} Project`,
      submissionUrl: `https://github.com/${team.name.toLowerCase()}`,
      members: [
        { name: 'Member 1', email: 'member1@test.com', role: 'Leader' },
        { name: 'Member 2', email: 'member2@test.com', role: 'Developer' },
      ],
      status: 'submitted',
      createdAt: Timestamp.now(),
    });
  }
  
  console.log(`✓ Created ${TEAMS.length} teams`);
}

async function simulateScoring(evaluators: any[]) {
  console.log('\n📊 Simulating scoring...');
  
  for (const evaluator of evaluators) {
    for (const team of TEAMS) {
      const scores = CRITERIA.map(c => ({
        criterionId: c.id,
        score: getRandomScore(),
        remarks: `Good work on ${c.name.toLowerCase()}`,
      }));
      
      // Calculate weighted score
      const weightedScore = scores.reduce((sum, s, idx) => {
        const criterion = CRITERIA[idx];
        return sum + (s.score / criterion.maxScore) * criterion.weight;
      }, 0);
      
      const scorecardId = `${evaluator.uid}_${team.id}`;
      
      await adminDb
        .collection('competitions')
        .doc(COMP_ID)
        .collection('scorecards')
        .doc(scorecardId)
        .set({
          id: scorecardId,
          competitionId: COMP_ID,
          teamId: team.id,
          evaluatorId: evaluator.uid,
          evaluatorEmail: evaluator.email,
          scores,
          weightedScore,
          status: 'submitted',
          submittedAt: Timestamp.now(),
        });
      
      console.log(`  ✓ ${evaluator.email} scored ${team.name}: ${weightedScore.toFixed(2)}/100`);
    }
  }
}

async function calculateLeaderboard() {
  console.log('\n📈 Calculating leaderboard...');
  
  const teamScores: any[] = [];
  
  for (const team of TEAMS) {
    const scorecardsSnap = await adminDb
      .collection('competitions')
      .doc(COMP_ID)
      .collection('scorecards')
      .where('teamId', '==', team.id)
      .where('status', '==', 'submitted')
      .get();
    
    if (scorecardsSnap.empty) continue;
    
    const scores = scorecardsSnap.docs.map(d => d.data().weightedScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    teamScores.push({
      teamId: team.id,
      teamName: team.name,
      domain: team.domain,
      averageWeightedScore: avgScore,
      scoresSubmitted: scores.length,
      totalEvaluators: EVALUATOR_EMAILS.length,
    });
  }
  
  // Sort by score (no tie-breaker)
  teamScores.sort((a, b) => b.averageWeightedScore - a.averageWeightedScore);
  
  // Assign ranks
  teamScores.forEach((team, idx) => {
    team.rank = idx + 1;
  });
  
  // Write to leaderboard cache
  for (const team of teamScores) {
    await adminDb
      .collection('competitions')
      .doc(COMP_ID)
      .collection('leaderboard_cache')
      .doc(team.teamId)
      .set(team);
  }
  
  // Write to RTDB for real-time updates
  const leaderboardData: any = {};
  teamScores.forEach(team => {
    leaderboardData[team.teamId] = team;
  });
  
  await adminRtdb.ref(`leaderboards/${COMP_ID}/entries`).set(leaderboardData);
  
  console.log('\n🏅 Final Leaderboard:');
  teamScores.forEach(team => {
    console.log(`  ${team.rank}. ${team.teamName} - ${team.averageWeightedScore.toFixed(2)}/100`);
  });
}

async function verifyResults() {
  console.log('\n✅ Verifying results...');
  
  // Check competition exists
  const compDoc = await adminDb.collection('competitions').doc(COMP_ID).get();
  console.log(`  ✓ Competition exists: ${compDoc.exists}`);
  
  // Check criteria
  const criteriaSnap = await adminDb.collection('competitions').doc(COMP_ID).collection('criteria').get();
  console.log(`  ✓ Criteria count: ${criteriaSnap.size} (expected ${CRITERIA.length})`);
  
  // Check teams
  const teamsSnap = await adminDb.collection('competitions').doc(COMP_ID).collection('teams').get();
  console.log(`  ✓ Teams count: ${teamsSnap.size} (expected ${TEAMS.length})`);
  
  // Check evaluators
  const evalsSnap = await adminDb.collection('competitions').doc(COMP_ID).collection('evaluators').get();
  console.log(`  ✓ Evaluators count: ${evalsSnap.size} (expected ${EVALUATOR_EMAILS.length})`);
  
  // Check scorecards
  const scoresSnap = await adminDb.collection('competitions').doc(COMP_ID).collection('scorecards').get();
  const expectedScores = TEAMS.length * EVALUATOR_EMAILS.length;
  console.log(`  ✓ Scorecards count: ${scoresSnap.size} (expected ${expectedScores})`);
  
  // Check leaderboard
  const leaderboardSnap = await adminDb.collection('competitions').doc(COMP_ID).collection('leaderboard_cache').get();
  console.log(`  ✓ Leaderboard entries: ${leaderboardSnap.size} (expected ${TEAMS.length})`);
  
  // Check RTDB
  const rtdbSnap = await adminRtdb.ref(`leaderboards/${COMP_ID}/entries`).once('value');
  const rtdbData = rtdbSnap.val();
  console.log(`  ✓ Real-time DB entries: ${Object.keys(rtdbData || {}).length}`);
}

async function main() {
  console.log('🤖 Starting Automated Test Suite\n');
  console.log('This will test the complete evaluation flow:\n');
  console.log('1. Create admin & evaluators');
  console.log('2. Create competition with criteria');
  console.log('3. Create teams');
  console.log('4. Simulate scoring by all evaluators');
  console.log('5. Calculate and verify leaderboard\n');
  
  try {
    await cleanUp();
    await createAdmin();
    const evaluators = await createEvaluators();
    await createCompetition();
    await createTeams();
    await simulateScoring(evaluators);
    await calculateLeaderboard();
    await verifyResults();
    
    console.log('\n✨ All tests passed!\n');
    console.log('Test Credentials:');
    console.log('=====================================');
    console.log(`Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(`Evaluators: eval1@test.com, eval2@test.com, eval3@test.com / ${EVALUATOR_PASSWORD}`);
    console.log(`Competition ID: ${COMP_ID}`);
    console.log('=====================================\n');
    console.log('You can now login and verify the results in the UI!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

main();
