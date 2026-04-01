import { render } from '@react-email/render';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verifySession } from '@/lib/utils/auth';
import { EvaluatorInviteEmail } from '@/lib/email/templates/evaluator-invite';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await verifySession(request);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      to,
      evaluatorName,
      competitionName,
      competitionType,
      inviteLink,
      organizerName,
    } = body;

    if (!to || !evaluatorName || !competitionName || !inviteLink) {
      return NextResponse.json(
        { error: 'Missing required fields: to, evaluatorName, competitionName, inviteLink' },
        { status: 400 }
      );
    }

    const emailHtml = await render(
      EvaluatorInviteEmail({
        evaluatorName,
        competitionName,
        competitionType: competitionType || 'hackathon',
        inviteLink,
        expiryHours: 48,
        organizerName: organizerName || 'CryptX Team',
        logoUrl: 'https://cryptx.lk/logo.png',
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'CryptX Judging Platform <noreply@cryptx.lk>',
      to: [to],
      subject: `You've been invited to judge ${competitionName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
