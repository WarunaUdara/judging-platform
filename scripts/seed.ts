/**
 * Script to seed the first competition with CryptX Hackathon criteria
 * Run with: bun scripts/seed.ts <admin-email>
 */

import { initializeApp, cert } from 'firebase-admin/app';
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

const db = getFirestore(app);

const CRITERIA_TEMPLATE = [
  {
    name: 'Problem Identification & Relevance',
    description: 'How well does the solution address a real-world problem? Is it relevant to the target audience?',
    weight: 20,
    maxScore: 10,
    order: 1,
    isRequired: true,
    category: 'Technical Core',
  },
  {
    name: 'Innovation & Uniqueness',
    description: 'How original and creative is the solution? Does it bring something new to the table?',
    weight: 20,
    maxScore: 10,
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
    category: 'Technical Core',
  },
  {
    name: 'Cloud Usage',
    description: 'Effective use of cloud services and infrastructure',
    weight: 10,
    maxScore: 10,
    order: 4,
    isRequired: true,
    category: 'Advanced',
  },
  {
    name: 'Code Quality & Security',
    description: 'Clean code practices, error handling, and security considerations',
    weight: 10,
    maxScore: 10,
    order: 5,
    isRequired: true,
    category: 'Advanced',
  },
  {
    name: 'Entrepreneurial Value',
    description: 'Business potential, market viability, and commercial impact',
    weight: 10,
    maxScore: 10,
    order: 6,
    isRequired: true,
    category: 'Advanced',
  },
  {
    name: 'Presentation Quality & Clarity',
    description: 'How well is the project presented and explained?',
    weight: 10,
    maxScore: 10,
    order: 7,
    isRequired: true,
    category: 'Communication',
  },
  {
    name: 'Technical Viva (Q&A)',
    description: 'Team\'s ability to answer technical questions and defend their choices',
    weight: 10,
    maxScore: 10,
    order: 8,
    isRequired: true,
    category: 'Communication',
  },
];

async function seed(adminEmail: string) {
  try {
    console.log('Seeding CryptX 2.0 Hackathon...\n');

    const now = Timestamp.now();

    // Create competition
    const competitionRef = await db.collection('competitions').add({
      orgId: 'cryptx',
      name: 'CryptX 2.0 — Hackathon',
      type: 'hackathon',
      description: 'The premier hackathon for innovative tech solutions',
      status: 'draft',
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

    console.log(`✓ Created competition: ${competitionRef.id}`);

    // Add criteria
    const batch = db.batch();
    CRITERIA_TEMPLATE.forEach((criterion) => {
      const criterionRef = competitionRef.collection('criteria').doc();
      batch.set(criterionRef, {
        ...criterion,
        competitionId: competitionRef.id,
      });
    });
    await batch.commit();

    console.log(`✓ Added ${CRITERIA_TEMPLATE.length} evaluation criteria`);

    console.log(`\n✅ Seeding complete!`);
    console.log(`Competition ID: ${competitionRef.id}`);
    console.log(`\nNext steps:`);
    console.log(`1. Visit http://localhost:3000/admin`);
    console.log(`2. Go to Competitions → View competition`);
    console.log(`3. Import teams via CSV or JSON`);
    console.log(`4. Invite evaluators`);
    console.log(`5. Change status to "Scoring"`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

const adminEmail = process.argv[2];

if (!adminEmail) {
  console.error('Usage: bun scripts/seed.ts <admin-email>');
  console.error('Example: bun scripts/seed.ts admin@cryptx.lk');
  process.exit(1);
}

seed(adminEmail);
