import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EvaluatorInviteEmailProps {
  evaluatorName: string;
  competitionName: string;
  competitionType: string;
  inviteLink: string;
  expiryHours: number;
  organizerName: string;
  logoUrl?: string;
}

export const EvaluatorInviteEmail = ({
  evaluatorName = 'Judge',
  competitionName = 'CryptX 2.0 Hackathon',
  competitionType = 'hackathon',
  inviteLink = 'https://cryptx.lk/invite/example-token',
  expiryHours = 48,
  organizerName = 'CryptX Team',
  logoUrl = 'https://cryptx.lk/logo.png',
}: EvaluatorInviteEmailProps) => {
  const previewText = `You've been invited to judge ${competitionName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoSection}>
              <Img
                src={logoUrl}
                width="120"
                height="40"
                alt="CryptX Logo"
                style={logo}
              />
            </Section>
          )}

          <Heading style={h1}>You've Been Invited to Judge!</Heading>

          <Text style={text}>Hi {evaluatorName},</Text>

          <Text style={text}>
            You have been invited by <strong>{organizerName}</strong> to serve as an evaluator
            for <strong>{competitionName}</strong>, a {competitionType} competition on the CryptX
            Judging Platform.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Competition Details</Text>
            <Text style={infoText}>
              <strong>Competition:</strong> {competitionName}
            </Text>
            <Text style={infoText}>
              <strong>Type:</strong> {competitionType.charAt(0).toUpperCase() + competitionType.slice(1)}
            </Text>
            <Text style={infoText}>
              <strong>Invited by:</strong> {organizerName}
            </Text>
          </Section>

          <Text style={text}>
            To accept this invitation and access the judging platform, please click the button below:
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteLink}>
              Accept Invitation & Sign In
            </Button>
          </Section>

          <Text style={smallText}>
            Or copy and paste this URL into your browser:
          </Text>
          <Text style={linkText}>
            <Link href={inviteLink} style={link}>
              {inviteLink}
            </Link>
          </Text>

          <Section style={warningBox}>
            <Text style={warningText}>
              ⏰ This invitation link will expire in <strong>{expiryHours} hours</strong>.
              Please accept it as soon as possible.
            </Text>
          </Section>

          <Text style={text}>
            After accepting the invitation, you'll be able to:
          </Text>
          <ul style={list}>
            <li style={listItem}>View assigned teams and their project details</li>
            <li style={listItem}>Score teams based on predefined evaluation criteria</li>
            <li style={listItem}>Track your evaluation progress</li>
            <li style={listItem}>View the live leaderboard (if enabled)</li>
          </ul>

          <Text style={footerText}>
            If you have any questions or did not expect this invitation, please contact{' '}
            {organizerName} directly.
          </Text>

          <Text style={footerText}>
            Best regards,
            <br />
            <strong>CryptX Platform Team</strong>
          </Text>

          <Section style={footer}>
            <Text style={footerSmall}>
              © {new Date().getFullYear()} CryptX. All rights reserved.
            </Text>
            <Text style={footerSmall}>
              <Link href="https://cryptx.lk" style={footerLink}>
                cryptx.lk
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default EvaluatorInviteEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const logoSection = {
  padding: '20px 40px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
};

const infoBox = {
  backgroundColor: '#f0f7ff',
  border: '1px solid #d1e3f8',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
};

const infoTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const infoText = {
  color: '#444',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '8px 0',
};

const buttonContainer = {
  padding: '27px 40px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  width: 'auto',
};

const smallText = {
  color: '#666',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '16px 0 4px 0',
  padding: '0 40px',
};

const linkText = {
  padding: '0 40px',
  margin: '0 0 16px 0',
  wordBreak: 'break-all' as const,
};

const link = {
  color: '#2563eb',
  fontSize: '13px',
  textDecoration: 'underline',
};

const warningBox = {
  backgroundColor: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '16px',
};

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const list = {
  color: '#444',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 40px 0 60px',
};

const listItem = {
  margin: '8px 0',
};

const footerText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '24px 0 8px 0',
  padding: '0 40px',
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  margin: '32px 40px 0 40px',
  padding: '20px 0 0 0',
  textAlign: 'center' as const,
};

const footerSmall = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '4px 0',
};

const footerLink = {
  color: '#9ca3af',
  textDecoration: 'underline',
};
