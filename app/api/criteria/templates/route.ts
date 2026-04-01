import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifySession, isAdmin, unauthorizedResponse, forbiddenResponse, badRequestResponse } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  const authContext = await verifySession(request);
  if (!authContext) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get('competitionId');

  if (!competitionId) {
    return badRequestResponse('competitionId is required');
  }

  if (!isAdmin(authContext.claims)) return forbiddenResponse('Only admins can load templates');

  try {
    const templatesSnap = await adminDb.collection('criteria_templates').get();
    const templates = templatesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authContext = await verifySession(request);
  if (!authContext) return unauthorizedResponse();
  if (!isAdmin(authContext.claims)) return forbiddenResponse('Only admins can create templates');

  try {
    const body = await request.json();
    const { name, criteria, orgId } = body;

    if (!name || !criteria || !Array.isArray(criteria)) {
      return badRequestResponse('name and criteria array are required');
    }

    const docRef = await adminDb.collection('criteria_templates').add({
      name,
      criteria: criteria.map((c: any, idx: number) => ({
        ...c,
        order: idx,
      })),
      orgId: orgId || 'default',
      createdAt: new Date().toISOString(),
      createdBy: authContext.uid,
    });

    return NextResponse.json({ id: docRef.id, success: true });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}