/**
 * Script to seed Test Competition with realistic mock data
 * 
 * Creates:
 * - 1 Test Competition (University category)
 * - 8 Evaluation Criteria (matching CryptX 2.0 marking sheet)
 * - 3 Evaluators (judges)
 * - 15 Mock Teams
 * - Mock evaluations with scores for leaderboard
 * 
 * Run with: bun scripts/seed-test-competition.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'SEED_SUPERADMIN_EMAIL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(\`❌ Missing required environment variable: \${envVar}\`);
    console.error('Please set this variable in your .env file');
    process.exit(1);
  }
}

// Initialize Firebase Admin
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

// University Category Criteria (matches CryptX 2.0 Marking-university.pdf)
const UNIVERSITY_CRITERIA = [
  {
    name: 'Problem Identification & Relevance',
    description: 'How well does the solution address a real-world problem? Is it relevant to the industry/target audience?',
    weight: 20,
    maxScore: 20,
    order: 1,
    isRequired: true,
    category: 'Technical Core',
  },
  {
    name: 'Innovation & Uniqueness',
    description: 'How original and creative is the solution? Does it bring something new to the table?',
    weight: 20,
    maxScore: 20,
    order: 2,
    isRequired: true,
    category: 'Technical Core',
  },
  {
    name: 'Technical Implementation & System Design',
    description: 'Quality of code architecture, scalability, and technical execution',
    weight: 10,
    maxScore: 10,
    order: 3,
    isRequired: true,
    category: 'Technical',
  },
  {
    name: 'Cloud Usage',
    description: 'Effective use of cloud services and infrastructure (e.g., AWS, Azure, GCP)',
    weight: 10,
    maxScore: 10,
    order: 4,
    isRequired: true,
    category: 'Technical',
  },
  {
    name: 'Code Quality & Security',
    description: 'Clean code practices, error handling, and security considerations',
    weight: 10,
    maxScore: 10,
    order: 5,
    isRequired: true,
    category: 'Technical',
  },
  {
    name: 'Entrepreneurial Value',
    description: 'Business potential, market viability, and commercial impact',
    weight: 10,
    maxScore: 10,
    order: 6,
    isRequired: true,
    category: 'Business',
  },
  {
    name: 'Presentation Quality & Clarity',
    description: 'How well is the project presented and explained? Quality of demo.',
    weight: 10,
    maxScore: 10,
    order: 7,
    isRequired: true,
    category: 'Communication',
  },
  {
    name: 'Technical Viva (Q&A)',
    description: 'Team ability to answer technical questions and defend their choices',
    weight: 10,
    maxScore: 10,
    order: 8,
    isRequired: true,
    category: 'Communication',
  },
];

// Mock evaluators
const EVALUATORS = [
  {
    email: 'evaluator1@cryptx.lk',
    displayName: 'Dr. Saman Perera',
    role: 'evaluator',
    photoURL: '',
  },
  {
    email: 'evaluator2@cryptx.lk',
    displayName: 'Prof. Nimal Silva',
    role: 'evaluator',
    photoURL: '',
  },
  {
    email: 'evaluator3@cryptx.lk',
    displayName: 'Eng. Kasun Fernando',
    role: 'evaluator',
    photoURL: '',
  },
];

// 15 Mock teams with diverse domains
const MOCK_TEAMS = [
  { name: 'Team Alpha', projectName: 'EduConnect - Smart Learning Platform', domain: 'EdTech', members: ['Amal Perera', 'Nisha Wickramasinghe', 'Ravindu Silva'] },
  { name: 'Team Beta', projectName: 'HealthTrack - Patient Monitoring System', domain: 'HealthTech', members: ['Kumari Fernando', 'Pathum Jayawardena'] },
  { name: 'Team Gamma', projectName: 'FinSmart - Personal Finance Assistant', domain: 'FinTech', members: ['Dilshan Rajapakse', 'Chamari Gunawardena', 'Isuru Bandara'] },
  { name: 'Team Delta', projectName: 'AgriPro - Crop Disease Detection AI', domain: 'AgriTech', members: ['Sathya Karunaratne', 'Nuwan Dissanayake'] },
  { name: 'Team Epsilon', projectName: 'CodeMentor - AI Programming Tutor', domain: 'EdTech', members: ['Tharindu Wijesinghe', 'Sandali Amarasinghe', 'Kavinda Rathnayake', 'Priya Liyanage'] },
  { name: 'Team Zeta', projectName: 'MediBot - Symptom Checker Chatbot', domain: 'HealthTech', members: ['Dinesh Gunasekara', 'Malsha Perera', 'Chathura Jayasundara'] },
  { name: 'Team Eta', projectName: 'PayEase - Digital Wallet Solution', domain: 'FinTech', members: ['Harsha Wickremesinghe', 'Nadeesha Silva'] },
  { name: 'Team Theta', projectName: 'FarmLink - Farmer-Buyer Marketplace', domain: 'AgriTech', members: ['Ruwan Fernando', 'Tharushi Wijeratne', 'Sachini Rajapakse'] },
  { name: 'Team Iota', projectName: 'ClassSync - Classroom Management System', domain: 'EdTech', members: ['Lakshan Perera', 'Imesha Dissanayake'] },
  { name: 'Team Kappa', projectName: 'VitalCheck - Remote Health Monitoring', domain: 'HealthTech', members: ['Charith Bandara', 'Hansini Gunaratne', 'Thilina Rathnayake'] },
  { name: 'Team Lambda', projectName: 'CryptoSafe - Secure Crypto Wallet', domain: 'FinTech', members: ['Nimesh Jayasinghe', 'Amali Silva', 'Kasun Wijewardena', 'Naduni Fernando'] },
  { name: 'Team Mu', projectName: 'WeatherWise - Smart Farming Weather App', domain: 'AgriTech', members: ['Sahan Perera', 'Thisari Wickramasinghe'] },
  { name: 'Team Nu', projectName: 'QuizMaster - Interactive Quiz Platform', domain: 'EdTech', members: ['Pasan Gunasekara', 'Dilini Rajapakse', 'Supun Silva'] },
  { name: 'Team Xi', projectName: 'PharmTrack - Medicine Inventory System', domain: 'HealthTech', members: ['Madhawa Fernando', 'Sachini Dissanayake'] },
  { name: 'Team Omicron', projectName: 'BudgetPro - Enterprise Expense Tracker', domain: 'FinTech', members: ['Ishara Wijesinghe', 'Kaveesha Amarasinghe', 'Nuwan Perera'] },
];

// Generate realistic scores (variation for leaderboard)
function generateRealisticScore(criterionMaxScore: number, teamIndex: number, evaluatorIndex: number): number {
  const baseMultiplier = 0.6 + (Math.random() * 0.35);
  const teamBonus = (15 - teamIndex) * 0.01;
  const evaluatorVariance = (Math.random() - 0.5) * 0.1;
  
  const score = criterionMaxScore * (baseMultiplier + teamBonus + evaluatorVariance);
  return Math.max(0, Math.min(criterionMaxScore, Math.round(score * 100) / 100));
}

async function seedTestCompetition() {
  console.log('Seeding Test Competition with mock data...\n');

  const now = Timestamp.now();
  const adminEmail = process.env.SEED_SUPERADMIN_EMAIL!;

  try {
    console.log('1 Creating Test Competition...');
    const competitionRef = await db.collection('competitions').add({
      orgId: 'cryptx',
      name: 'Test Competition',
      type: 'hackathon',
      description: 'Testing competition with mock data to validate evaluation workflow and leaderboard functionality',
      status: 'scoring',
      teamMinSize: 2,
      teamMaxSize: 4,
      allowedDomains: ['EdTech', 'HealthTech', 'FinTech', 'AgriTech', 'Other'],
      scoringConfig: {
        allowPartialSubmit: true,
        showLeaderboardTo: 'evaluators_and_organizers',
        scoreVisibilityMode: 'live',
        allowRescoring: false,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: adminEmail,
    });

    console.log(\`   Competition created: \${competitionRef.id}\n\`);

    console.log('2 Adding evaluation criteria...');
    const criteriaRefs: any[] = [];
    const criteriaBatch = db.batch();
    
    for (const criterion of UNIVERSITY_CRITERIA) {
      const criterionRef = competitionRef.collection('criteria').doc();
      criteriaBatch.set(criterionRef, {
        ...criterion,
        competitionId: competitionRef.id,
      });
      criteriaRefs.push({ ref: criterionRef, data: criterion });
    }
    
    await criteriaBatch.commit();
    console.log(\`   Added \${UNIVERSITY_CRITERIA.length} criteria (Total: 100 points)\n\`);

    console.log('3 Creating evaluators...');
    const evaluatorIds: string[] = [];
    
    for (const evaluator of EVALUATORS) {
      const evaluatorRef = db.collection('users').doc();
      await evaluatorRef.set({
        uid: evaluatorRef.id,
        email: evaluator.email,
        displayName: evaluator.displayName,
        role: evaluator.role,
        competitionIds: [competitionRef.id],
        photoURL: evaluator.photoURL,
        createdAt: now.toDate().toISOString(),
        lastLoginAt: now.toDate().toISOString(),
      });
      evaluatorIds.push(evaluatorRef.id);
      console.log(\`   Created: \${evaluator.displayName} (\${evaluator.email})\`);
    }
    console.log();

    console.log('4 Creating mock teams...');
    const teamIds: string[] = [];
    
    for (const team of MOCK_TEAMS) {
      const teamRef = await competitionRef.collection('teams').add({
        competitionId: competitionRef.id,
        teamName: team.name,
        projectName: team.projectName,
        domain: team.domain,
        members: team.members,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });
      teamIds.push(teamRef.id);
      console.log(\`   \${team.name}: \${team.projectName}\`);
    }
    console.log();

    console.log('5 Generating mock evaluations...');
    let evaluationCount = 0;
    
    for (let teamIdx = 0; teamIdx < teamIds.length; teamIdx++) {
      const teamId = teamIds[teamIdx];
      
      for (let evalIdx = 0; evalIdx < evaluatorIds.length; evalIdx++) {
        const evaluatorId = evaluatorIds[evalIdx];
        
        const evaluationRef = await db.collection('evaluations').add({
          competitionId: competitionRef.id,
          teamId: teamId,
          evaluatorId: evaluatorId,
          evaluatorName: EVALUATORS[evalIdx].displayName,
          teamName: MOCK_TEAMS[teamIdx].name,
          status: 'submitted',
          startedAt: now,
          submittedAt: now,
          updatedAt: now,
        });

        let totalScore = 0;
        for (const { ref: criterionRef, data: criterion } of criteriaRefs) {
          const score = generateRealisticScore(criterion.maxScore, teamIdx, evalIdx);
          totalScore += score;
          
          await evaluationRef.collection('scores').add({
            criterionId: criterionRef.id,
            criterionName: criterion.name,
            score: score,
            maxScore: criterion.maxScore,
            weight: criterion.weight,
            comment: \`Good performance on \${criterion.name.toLowerCase()}\`,
            timestamp: now,
          });
        }

        await evaluationRef.update({
          totalScore: Math.round(totalScore * 100) / 100,
          maxPossibleScore: 100,
        });

        evaluationCount++;
      }
    }
    
    console.log(\`   Generated \${evaluationCount} evaluations (\${MOCK_TEAMS.length} teams x 3 evaluators)\n\`);

    console.log('Test Competition seeding completed!\n');
    console.log('Summary:');
    console.log(\`   Competition ID: \${competitionRef.id}\`);
    console.log(\`   Competition Name: Test Competition\`);
    console.log(\`   Status: scoring (active)\`);
    console.log(\`   Criteria: \${UNIVERSITY_CRITERIA.length} (100 points total)\`);
    console.log(\`   Evaluators: \${EVALUATORS.length}\`);
    console.log(\`   Teams: \${MOCK_TEAMS.length}\`);
    console.log(\`   Evaluations: \${evaluationCount}\`);
    console.log();
    console.log('Next Steps:');
    console.log('   1. Visit http://localhost:3000/login');
    console.log('   2. Sign in as any evaluator:');
    EVALUATORS.forEach(e => console.log(\`      - \${e.email}\`));
    console.log('   3. Navigate to Competitions -> Test Competition');
    console.log('   4. View Leaderboard to see rankings');
    console.log('   5. Test evaluation workflow: Select team -> Add scores -> Submit');
    console.log();

  } catch (error) {
    console.error('Error seeding test competition:', error);
    process.exit(1);
  }
}

seedTestCompetition()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
