#!/usr/bin/env tsx
/**
 * Complete MVP Seed Script
 * Creates a full test environment with admin, evaluators, competition, teams, and scores
 */

import { adminAuth, adminDb } from '../lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

const TEST_ORG_ID = 'cryptx-org-1';
const TEST_COMPETITION_ID = 'cryptx-hackathon-2024';

// Validate environment variables
const requiredEnvVars = [
  'TEST_ADMIN_EMAIL',
  'TEST_ADMIN_PASSWORD',
  'TEST_EVALUATOR_EMAIL',
  'TEST_EVALUATOR_PASSWORD',
  'TEST_EVALUATOR2_EMAIL',
  'TEST_EVALUATOR3_EMAIL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.error('Please create a .env.test file based on .env.test.example');
    process.exit(1);
  }
}

// Test users with email/password for easy testing
const TEST_USERS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL!,
    password: process.env.TEST_ADMIN_PASSWORD!,
    displayName: 'Admin User',
    role: 'superadmin' as const,
  },
  evaluator1: {
    email: process.env.TEST_EVALUATOR_EMAIL!,
    password: process.env.TEST_EVALUATOR_PASSWORD!,
    displayName: 'Judge One',
    role: 'evaluator' as const,
  },
  evaluator2: {
    email: process.env.TEST_EVALUATOR2_EMAIL!,
    password: process.env.TEST_EVALUATOR_PASSWORD!,
    displayName: 'Judge Two',
    role: 'evaluator' as const,
  },
  evaluator3: {
    email: process.env.TEST_EVALUATOR3_EMAIL!,
    password: process.env.TEST_EVALUATOR_PASSWORD!,
    displayName: 'Judge Three',
    role: 'evaluator' as const,
  },
};

// CryptX Default Criteria (weights sum to 100)
const CRITERIA = [
  {
    id: 'c1',
    name: 'Problem Identification & Relevance',
    description: 'How well does the solution address a real problem? Is it relevant to the chosen domain?',
    category: 'Technical Core',
    weight: 20,
    maxScore: 10,
    order: 1,
    isRequired: true,
  },
  {
    id: 'c2',
    name: 'Innovation & Uniqueness',
    description: 'How original and creative is the solution? Does it bring something new to the table?',
    category: 'Technical Core',
    weight: 20,
    maxScore: 10,
    order: 2,
    isRequired: true,
  },
  {
    id: 'c3',
    name: 'Technical Implementation & System Design',
    description: 'Quality of code architecture, system design, and technical execution',
    category: 'Technical Core',
    weight: 10,
    maxScore: 10,
    order: 3,
    isRequired: true,
  },
  {
    id: 'c4',
    name: 'Cloud Usage',
    description: 'Effective use of cloud services and infrastructure',
    category: 'Advanced',
    weight: 10,
    maxScore: 10,
    order: 4,
    isRequired: true,
  },
  {
    id: 'c5',
    name: 'Code Quality & Security',
    description: 'Code quality, best practices, security considerations',
    category: 'Advanced',
    weight: 10,
    maxScore: 10,
    order: 5,
    isRequired: true,
  },
  {
    id: 'c6',
    name: 'Entrepreneurial Value',
    description: 'Business viability, market potential, scalability',
    category: 'Advanced',
    weight: 10,
    maxScore: 10,
    order: 6,
    isRequired: true,
  },
  {
    id: 'c7',
    name: 'Presentation Quality & Clarity',
    description: 'How well the team presents their solution, clarity of communication',
    category: 'Communication',
    weight: 10,
    maxScore: 10,
    order: 7,
    isRequired: true,
  },
  {
    id: 'c8',
    name: 'Technical Viva (Q&A)',
    description: 'Team\'s ability to answer technical questions and defend their design choices',
    category: 'Communication',
    weight: 10,
    maxScore: 10,
    order: 8,
    isRequired: true,
  },
];

// Sample teams
const TEAMS = [
  {
    id: 'team-1',
    name: 'CodeCrafters',
    domain: 'FinTech',
    projectTitle: 'SmartWallet - AI-Powered Personal Finance',
    submissionUrl: 'https://github.com/codecrafters/smartwallet',
    members: [
      { name: 'Alice Johnson', email: 'alice@example.com', studentId: 'CS001', university: 'University of Colombo', role: 'Team Leader' },
      { name: 'Bob Smith', email: 'bob@example.com', studentId: 'CS002', university: 'University of Colombo', role: 'Developer' },
      { name: 'Carol White', email: 'carol@example.com', studentId: 'CS003', university: 'University of Moratuwa', role: 'Designer' },
    ],
    status: 'submitted',
  },
  {
    id: 'team-2',
    name: 'HealthTech Innovators',
    domain: 'HealthTech',
    projectTitle: 'MediTrack - Hospital Management System',
    submissionUrl: 'https://github.com/healthtech/meditrack',
    members: [
      { name: 'David Lee', email: 'david@example.com', studentId: 'IT001', university: 'SLIIT', role: 'Team Leader' },
      { name: 'Emma Davis', email: 'emma@example.com', studentId: 'IT002', university: 'SLIIT', role: 'Backend Developer' },
      { name: 'Frank Miller', email: 'frank@example.com', studentId: 'IT003', university: 'SLIIT', role: 'Frontend Developer' },
      { name: 'Grace Chen', email: 'grace@example.com', studentId: 'IT004', university: 'SLIIT', role: 'UI/UX Designer' },
    ],
    status: 'submitted',
  },
  {
    id: 'team-3',
    name: 'EduTech Warriors',
    domain: 'EdTech',
    projectTitle: 'LearnHub - Collaborative Learning Platform',
    submissionUrl: 'https://github.com/edutech/learnhub',
    members: [
      { name: 'Henry Wilson', email: 'henry@example.com', studentId: 'SE001', university: 'University of Peradeniya', role: 'Team Leader' },
      { name: 'Iris Brown', email: 'iris@example.com', studentId: 'SE002', university: 'University of Peradeniya', role: 'Full Stack Developer' },
      { name: 'Jack Taylor', email: 'jack@example.com', studentId: 'SE003', university: 'University of Peradeniya', role: 'DevOps Engineer' },
    ],
    status: 'submitted',
  },
  {
    id: 'team-4',
    name: 'AgriTech Solutions',
    domain: 'AgriTech',
    projectTitle: 'FarmSmart - IoT-based Crop Monitoring',
    submissionUrl: 'https://github.com/agritech/farmsmart',
    members: [
      { name: 'Kelly Martinez', email: 'kelly@example.com', studentId: 'AG001', university: 'University of Ruhuna', role: 'Team Leader' },
      { name: 'Liam Anderson', email: 'liam@example.com', studentId: 'AG002', university: 'University of Ruhuna', role: 'IoT Developer' },
      { name: 'Mia Thomas', email: 'mia@example.com', studentId: 'AG003', university: 'University of Ruhuna', role: 'Data Analyst' },
    ],
    status: 'submitted',
  },
  {
    id: 'team-5',
    name: 'Smart City Builders',
    domain: 'Smart Cities',
    projectTitle: 'UrbanFlow - Traffic Management AI',
    submissionUrl: 'https://github.com/smartcity/urbanflow',
    members: [
      { name: 'Noah Garcia', email: 'noah@example.com', studentId: 'CE001', university: 'University of Jaffna', role: 'Team Leader' },
      { name: 'Olivia Rodriguez', email: 'olivia@example.com', studentId: 'CE002', university: 'University of Jaffna', role: 'ML Engineer' },
      { name: 'Peter Hernandez', email: 'peter@example.com', studentId: 'CE003', university: 'University of Jaffna', role: 'Backend Developer' },
      { name: 'Quinn Lopez', email: 'quinn@example.com', studentId: 'CE004', university: 'NSBM', role: 'Frontend Developer' },
    ],
    status: 'submitted',
  },
];

async function createUser(userConfig: typeof TEST_USERS[keyof typeof TEST_USERS]) {
  try {
    // Check if user exists
    let user;
    try {
      user = await adminAuth.getUserByEmail(userConfig.email);
      console.log(`✓ User ${userConfig.email} already exists`);
    } catch {
      // Create new user
      user = await adminAuth.createUser({
        email: userConfig.email,
        password: userConfig.password,
        displayName: userConfig.displayName,
        emailVerified: true,
      });
      console.log(`✓ Created user: ${userConfig.email}`);
    }

    // Set custom claims
    await adminAuth.setCustomUserClaims(user.uid, {
      role: userConfig.role,
      orgId: TEST_ORG_ID,
      competitionIds: userConfig.role === 'evaluator' ? [TEST_COMPETITION_ID] : [],
    });

    // Create user document
    await adminDb.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: userConfig.email,
      displayName: userConfig.displayName,
      role: userConfig.role,
      orgId: TEST_ORG_ID,
      competitionIds: userConfig.role === 'evaluator' ? [TEST_COMPETITION_ID] : [],
      createdAt: Timestamp.now(),
    });

    return user;
  } catch (error) {
    console.error(`✗ Error creating user ${userConfig.email}:`, error);
    throw error;
  }
}

async function createOrganisation() {
  try {
    await adminDb.collection('organisations').doc(TEST_ORG_ID).set({
      id: TEST_ORG_ID,
      name: 'CryptX',
      slug: 'cryptx',
      logoUrl: 'https://cryptx.lk/logo.png',
      contactEmail: 'info@cryptx.lk',
      createdAt: Timestamp.now(),
    });
    console.log('✓ Created organisation: CryptX');
  } catch (error) {
    console.error('✗ Error creating organisation:', error);
  }
}

async function createCompetition() {
  const competitionData = {
    id: TEST_COMPETITION_ID,
    name: 'CryptX 2.0 Hackathon',
    type: 'hackathon',
    description: 'National-level hackathon for innovative tech solutions',
    orgId: TEST_ORG_ID,
    teamMinSize: 3,
    teamMaxSize: 4,
    allowedDomains: ['FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'Smart Cities'],
    status: 'scoring',
    scoringConfig: {
      allowPartialSubmit: true,
      showLeaderboardTo: 'evaluators_and_organizers',
      scoreVisibilityMode: 'live',
      allowRescoring: true,
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await adminDb.collection('competitions').doc(TEST_COMPETITION_ID).set(competitionData);
  console.log('✓ Created competition: CryptX 2.0 Hackathon');

  // Create criteria
  const batch = adminDb.batch();
  for (const criterion of CRITERIA) {
    const ref = adminDb.collection('competitions').doc(TEST_COMPETITION_ID).collection('criteria').doc(criterion.id);
    batch.set(ref, criterion);
  }
  await batch.commit();
  console.log(`✓ Created ${CRITERIA.length} evaluation criteria`);
}

async function createTeams() {
  const batch = adminDb.batch();
  for (const team of TEAMS) {
    const ref = adminDb.collection('competitions').doc(TEST_COMPETITION_ID).collection('teams').doc(team.id);
    batch.set(ref, {
      ...team,
      competitionId: TEST_COMPETITION_ID,
      createdAt: Timestamp.now(),
    });
  }
  await batch.commit();
  console.log(`✓ Created ${TEAMS.length} teams`);
}

async function createEvaluators() {
  const evaluators = [TEST_USERS.evaluator1, TEST_USERS.evaluator2, TEST_USERS.evaluator3];
  
  for (const evaluatorConfig of evaluators) {
    const user = await adminAuth.getUserByEmail(evaluatorConfig.email);
    
    await adminDb
      .collection('competitions')
      .doc(TEST_COMPETITION_ID)
      .collection('evaluators')
      .doc(user.uid)
      .set({
        uid: user.uid,
        email: evaluatorConfig.email,
        displayName: evaluatorConfig.displayName,
        role: 'evaluator',
        assignedTeamIds: [], // Empty = can score all teams
        isActive: true,
        addedAt: Timestamp.now(),
        competitionId: TEST_COMPETITION_ID,
      });
  }
  console.log('✓ Created evaluator records');
}

async function main() {
  console.log('\n🚀 Starting MVP Seed Script\n');
  console.log('This will create a complete test environment for CryptX Judging Platform\n');

  try {
    // Create organisation
    await createOrganisation();

    // Create users
    console.log('\nCreating test users...');
    await createUser(TEST_USERS.admin);
    await createUser(TEST_USERS.evaluator1);
    await createUser(TEST_USERS.evaluator2);
    await createUser(TEST_USERS.evaluator3);

    // Create competition with criteria
    console.log('\nCreating competition...');
    await createCompetition();

    // Create teams
    console.log('\nCreating teams...');
    await createTeams();

    // Create evaluators
    console.log('\nCreating evaluators...');
    await createEvaluators();

    console.log('\n✅ MVP Environment Created Successfully!\n');
    console.log('Test Credentials:');
    console.log('=====================================');
    console.log('Admin:');
    console.log(`  Email: ${process.env.TEST_ADMIN_EMAIL}`);
    console.log('  Password: [from environment]');
    console.log('  URL: http://localhost:3000/admin');
    console.log('');
    console.log('Evaluators:');
    console.log(`  Email: ${process.env.TEST_EVALUATOR_EMAIL}, ${process.env.TEST_EVALUATOR2_EMAIL}, ${process.env.TEST_EVALUATOR3_EMAIL}`);
    console.log('  Password: [from environment]');
    console.log('  URL: http://localhost:3000/judge/dashboard');
    console.log('=====================================\n');
    console.log('Competition: CryptX 2.0 Hackathon');
    console.log('Teams: 5 teams created');
    console.log('Status: scoring (ready for evaluation)');
    console.log('\nYou can now run: bun dev\n');
  } catch (error) {
    console.error('\n❌ Error during seed:', error);
    process.exit(1);
  }
}

main();
