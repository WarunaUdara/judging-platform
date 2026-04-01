import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

async function updateSuperAdmin() {
  const uid = '87w0Ehi2ipSKAK0O9C4dbCJheoJ3';
  const email = 'warunaudarasam2003@gmail.com';

  try {
    await db.collection('users').doc(uid).update({
      role: 'superadmin',
      email: email,
    });

    console.log(`✓ Updated ${email} to superadmin role`);
    
    // Verify the update
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    console.log('\nVerified user data:');
    console.log(JSON.stringify(userData, null, 2));
  } catch (error) {
    console.error('Error updating superadmin:', error);
    process.exit(1);
  }
}

updateSuperAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
