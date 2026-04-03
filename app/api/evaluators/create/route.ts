import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { verifySession, isAdmin } from '@/lib/utils/auth';
import { Timestamp } from 'firebase-admin/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/evaluators/create
 * Directly create evaluator account (no invites needed)
 * Admin creates account with email/password and auto-sends credentials via email
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await verifySession(request);
    if (!authContext || !isAdmin(authContext.claims)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, displayName, password, competitionId, orgId, assignedTeamIds, sendCredentials = true } = body;

    if (!email || !displayName || !password || !competitionId || !orgId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, displayName, password, competitionId, orgId' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get competition name for email
    const competitionDoc = await adminDb.collection('competitions').doc(competitionId).get();
    const competitionName = competitionDoc.data()?.name || 'Competition';

    // Create Firebase Auth user
    let user;
    try {
      user = await adminAuth.createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
      throw error;
    }

    // Set custom claims
    await adminAuth.setCustomUserClaims(user.uid, {
      role: 'evaluator',
      orgId,
      competitionIds: [competitionId],
    });

    // Create user document in Firestore
    await adminDb.collection('users').doc(user.uid).set({
      uid: user.uid,
      email,
      displayName,
      role: 'evaluator',
      orgId,
      competitionIds: [competitionId],
      createdAt: Timestamp.now(),
      createdBy: authContext.uid,
    });

    // Create evaluator record in competition
    await adminDb
      .collection('competitions')
      .doc(competitionId)
      .collection('evaluators')
      .doc(user.uid)
      .set({
        uid: user.uid,
        email,
        displayName,
        role: 'evaluator',
        assignedTeamIds: assignedTeamIds || [],
        isActive: true,
        addedAt: Timestamp.now(),
        addedBy: authContext.uid,
        competitionId,
      });

    // Send credentials via email
    let emailSent = false;
    let emailError = null;
    if (sendCredentials && process.env.RESEND_API_KEY) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'CryptX Judging Platform <onboarding@resend.dev>';
        
        // Format from address if it doesn't include display name
        const formattedFrom = fromAddress.includes('<') 
          ? fromAddress 
          : `CryptX Judging Platform <${fromAddress}>`;
        
        console.log('Attempting to send email from:', formattedFrom, 'to:', email);
        
        const result = await resend.emails.send({
          from: formattedFrom,
          to: email,
          subject: `Your Evaluator Account for ${competitionName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 40px 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #333333; padding: 40px;">
                <h1 style="color: #ffffff; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">Welcome to CryptX Judging Platform</h1>
                
                <p style="color: #a1a1aa; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                  You have been added as an evaluator for <strong style="color: #ffffff;">${competitionName}</strong>.
                </p>
                
                <div style="background-color: #111111; border: 1px solid #333333; padding: 24px; margin: 0 0 24px 0;">
                  <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Your Login Credentials</h2>
                  
                  <p style="color: #a1a1aa; margin: 0 0 8px 0; font-size: 14px;">
                    <strong style="color: #888888;">Email:</strong>
                    <span style="color: #ffffff; font-family: monospace;">${email}</span>
                  </p>
                  
                  <p style="color: #a1a1aa; margin: 0; font-size: 14px;">
                    <strong style="color: #888888;">Password:</strong>
                    <span style="color: #ffffff; font-family: monospace;">${password}</span>
                  </p>
                </div>
                
                <p style="color: #ff4444; margin: 0 0 24px 0; font-size: 14px;">
                  Please change your password after your first login for security.
                </p>
                
                <a href="${appUrl}/login" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 600;">
                  Login to Platform
                </a>
                
                <p style="color: #71717a; margin: 32px 0 0 0; font-size: 12px;">
                  If you did not expect this email, please contact your event organizer.
                </p>
              </div>
            </body>
            </html>
          `,
        });
        emailSent = true;
        console.log('✅ Email sent successfully. ID:', result.data?.id);
      } catch (error: any) {
        emailError = error.message || JSON.stringify(error);
        console.error('❌ Failed to send credentials email:', error);
        console.error('Error details:', {
          message: error.message,
          statusCode: error.statusCode,
          name: error.name,
        });
        // Don't fail the whole operation if email fails
      }
    }

    // Write audit log
    await adminDb.collection('audit_logs').add({
      action: 'evaluator.create',
      actorUid: authContext.uid,
      actorEmail: authContext.email,
      resourceType: 'evaluator',
      resourceId: user.uid,
      competitionId,
      timestamp: Timestamp.now(),
      meta: {
        email,
        displayName,
        emailSent,
      },
    });

    return NextResponse.json({
      success: true,
      evaluator: {
        uid: user.uid,
        email,
        displayName,
      },
      emailSent,
      emailError: emailError || undefined,
    });
  } catch (error) {
    console.error('Create evaluator error:', error);
    return NextResponse.json(
      { error: 'Failed to create evaluator', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
