import { render } from '@react-email/render';
import * as React from 'react';
import { CryptXChameeraEmail } from './emails/events/cryptx/chameera';
import { CryptXCrewWelcomeEmail } from './emails/events/cryptx/crew-welcome';
import { CryptXWelcomeEmail } from './emails/events/cryptx/welcome';

export interface CryptXWelcomeData {
  name: string;
  role: string;
  meetingDate: string;
  meetingTime: string;
  meetingPlatform: string;
  meetingLink: string;
  senderName: string;
  senderPosition: string;
  headerImageUrl: string;
  logoImageUrl: string;
}

/**
 * Renders the CryptX Welcome email to HTML
 */
export async function renderCryptXWelcomeEmail(
  data: CryptXWelcomeData,
): Promise<string> {
  const html = await render(
    React.createElement(CryptXWelcomeEmail, {
      name: data.name,
      role: data.role,
      meetingDate: data.meetingDate,
      meetingTime: data.meetingTime,
      meetingPlatform: data.meetingPlatform,
      meetingLink: data.meetingLink,
      senderName: data.senderName,
      senderPosition: data.senderPosition,
      headerImageUrl: data.headerImageUrl,
      logoImageUrl: data.logoImageUrl,
    }),
  );
  return html;
}

export { CryptXChameeraEmail } from './emails/events/cryptx/chameera';
export { CryptXCrewWelcomeEmail } from './emails/events/cryptx/crew-welcome';
// Re-export the email components
export { CryptXWelcomeEmail } from './emails/events/cryptx/welcome';

export interface CryptXCrewWelcomeData {
  name: string;
  role: string;
  senderName: string;
  senderPosition: string;
  headerImageUrl: string;
  logoImageUrl: string;
  contactEmail?: string;
}

/**
 * Renders the CryptX Crew Welcome email to HTML
 */
export async function renderCryptXCrewWelcomeEmail(
  data: CryptXCrewWelcomeData,
): Promise<string> {
  const html = await render(
    React.createElement(CryptXCrewWelcomeEmail, {
      name: data.name,
      role: data.role,
      senderName: data.senderName,
      senderPosition: data.senderPosition,
      headerImageUrl: data.headerImageUrl,
      logoImageUrl: data.logoImageUrl,
      contactEmail: data.contactEmail,
    }),
  );
  return html;
}

export interface CryptXChameeraData {
  name: string;
  workshopDate: string;
  workshopTime: string;
  workshopPlatform: string;
  workshopLink: string;
  workshopCalendarUrl: string;
  judgingDate: string;
  judgingTime: string;
  judgingVenue: string;
  judgingCalendarUrl: string;
  senderName: string;
  senderPosition: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  headerImageUrl: string;
  logoImageUrl: string;
  replyToEmail?: string;
  proposalPdfUrl?: string;
}

/**
 * Renders the CryptX Chameera invitation email to HTML
 */
export async function renderCryptXChameeraEmail(
  data: CryptXChameeraData,
): Promise<string> {
  const html = await render(
    React.createElement(CryptXChameeraEmail, {
      name: data.name,
      workshopDate: data.workshopDate,
      workshopTime: data.workshopTime,
      workshopPlatform: data.workshopPlatform,
      workshopLink: data.workshopLink,
      workshopCalendarUrl: data.workshopCalendarUrl,
      judgingDate: data.judgingDate,
      judgingTime: data.judgingTime,
      judgingVenue: data.judgingVenue,
      judgingCalendarUrl: data.judgingCalendarUrl,
      senderName: data.senderName,
      senderPosition: data.senderPosition,
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      headerImageUrl: data.headerImageUrl,
      logoImageUrl: data.logoImageUrl,
      replyToEmail: data.replyToEmail,
      proposalPdfUrl: data.proposalPdfUrl,
    }),
  );
  return html;
}
