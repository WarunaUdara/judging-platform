import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '@react-email/render';
import * as React from 'react';
import { Resend } from 'resend';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
interface BaseConfig {
  email: {
    from: string;
    subject: string;
  };
  images: {
    header: string;
    logo: string;
  };
  sender: {
    name: string;
    position: string;
  };
  recipients: Array<{
    email: string;
    name: string;
    role: string;
  }>;
}

interface WelcomeConfig extends BaseConfig {
  meeting: {
    date: string;
    time: string;
    platform: string;
    link: string;
  };
}

interface CrewWelcomeConfig extends BaseConfig {
  contactEmail?: string;
}

interface ChameeraConfig {
  email: {
    from: string;
    subject: string;
  };
  images: {
    header: string;
    logo: string;
  };
  sender: {
    name: string;
    position: string;
  };
  workshop: {
    date: string;
    time: string;
    platform: string;
    link: string;
  };
  judging: {
    date: string;
    time: string;
    venue: string;
  };
  replyToEmail?: string;
  proposalPdfUrl?: string;
  calendarInviteUrls: {
    workshop: string;
    judging: string;
  };
  recipients: Array<{
    email: string;
    name: string;
    to: string;
    cc?: string[];
    bcc?: string[];
  }>;
}

type EmailConfig = WelcomeConfig | CrewWelcomeConfig | ChameeraConfig;

export interface SendResult {
  email: string;
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Load config from JSON file
 */
function loadConfig(configPath: string): EmailConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(content) as EmailConfig;
}

/**
 * Validate config has all required fields
 */
function validateConfig(config: EmailConfig, templateName: string): void {
  const errors: string[] = [];

  if (!config.email?.from) errors.push('email.from is required');
  if (!config.images?.header) errors.push('images.header URL is required');
  if (!config.images?.logo) errors.push('images.logo URL is required');
  if (!config.sender?.name) errors.push('sender.name is required');
  if (!config.sender?.position) errors.push('sender.position is required');
  if (!config.recipients || config.recipients.length === 0) {
    errors.push('At least one recipient is required');
  }

  // Validate meeting fields for welcome template
  if (templateName === 'welcome') {
    const welcomeConfig = config as WelcomeConfig;
    if (!welcomeConfig.meeting?.date) errors.push('meeting.date is required');
    if (!welcomeConfig.meeting?.time) errors.push('meeting.time is required');
    if (!welcomeConfig.meeting?.link) errors.push('meeting.link is required');
  }

  // Validate chameera-specific fields
  if (templateName === 'chameera') {
    const chameeraConfig = config as ChameeraConfig;
    if (!chameeraConfig.workshop?.link)
      errors.push('workshop.link is required');

    if (!chameeraConfig.judging?.venue)
      errors.push('judging.venue is required');
    if (!chameeraConfig.calendarInviteUrls?.workshop)
      errors.push('calendarInviteUrls.workshop is required');
    if (chameeraConfig.calendarInviteUrls?.workshop?.includes('PASTE_'))
      errors.push(
        'calendarInviteUrls.workshop must be a real Google Calendar event URL',
      );
    if (!chameeraConfig.calendarInviteUrls?.judging)
      errors.push('calendarInviteUrls.judging is required');
    if (chameeraConfig.calendarInviteUrls?.judging?.includes('PASTE_'))
      errors.push(
        'calendarInviteUrls.judging must be a real Google Calendar event URL',
      );
    if (
      chameeraConfig.proposalPdfUrl &&
      chameeraConfig.proposalPdfUrl.includes('PASTE_')
    )
      errors.push('proposalPdfUrl must be a real Google Drive link');
    chameeraConfig.recipients?.forEach((r, i) => {
      if (!r.email) errors.push(`recipients[${i}].email is required`);
      if (!r.name) errors.push(`recipients[${i}].name is required`);
      if (!r.to) errors.push(`recipients[${i}].to is required`);
    });
  } else {
    config.recipients?.forEach((r, i) => {
      if (!r.email) errors.push(`recipients[${i}].email is required`);
      if (!r.name) errors.push(`recipients[${i}].name is required`);
      if (!(r as BaseConfig['recipients'][0]).role)
        errors.push(`recipients[${i}].role is required`);
    });
  }

  if (errors.length > 0) {
    console.error('\nConfig validation errors:');
    for (const e of errors) {
      console.error(`  - ${e}`);
    }
    console.error(`\nPlease fill in all required fields in the config file\n`);
    process.exit(1);
  }
}

/**
 * Dynamically import and render email template
 */
async function renderEmailTemplate(
  event: string,
  templateName: string,
  props: Record<string, any>,
): Promise<string> {
  const templatePath = path.join(
    __dirname,
    'emails',
    'events',
    event,
    `${templateName}.tsx`,
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  // Dynamic import of the template
  // Use relative path from __dirname (Bun/Node supports this)
  const relativePath = `./emails/events/${event}/${templateName}.tsx`;
  const templateModule = await import(relativePath);
  const TemplateComponent = templateModule.default;

  if (!TemplateComponent) {
    throw new Error(
      `Template component not found in ${templatePath}. Make sure the template exports a default component.`,
    );
  }

  const html = await render(React.createElement(TemplateComponent, props));
  return html;
}

/**
 * Send emails to all recipients
 */
async function sendEmails(
  apiKey: string,
  event: string,
  templateName: string,
  config: EmailConfig,
  options?: {
    delayMs?: number;
    onProgress?: (result: SendResult, index: number, total: number) => void;
  },
): Promise<SendResult[]> {
  const resend = new Resend(apiKey);
  const results: SendResult[] = [];
  const delayMs = options?.delayMs ?? 200;

  for (let i = 0; i < config.recipients.length; i++) {
    const recipient = config.recipients[i]!;

    // Chameera template has its own send path (different recipient shape + props)
    if (templateName === 'chameera') {
      const chameeraConfig = config as ChameeraConfig;
      const chameeraRecipient = recipient as ChameeraConfig['recipients'][0];

      const props: Record<string, any> = {
        name: chameeraRecipient.name,
        workshopDate: chameeraConfig.workshop.date,
        workshopTime: chameeraConfig.workshop.time,
        workshopPlatform: chameeraConfig.workshop.platform || 'TBA',
        workshopLink: chameeraConfig.workshop.link,
        workshopCalendarUrl: chameeraConfig.calendarInviteUrls.workshop,
        judgingDate: chameeraConfig.judging.date,
        judgingTime: chameeraConfig.judging.time,
        judgingVenue: chameeraConfig.judging.venue,
        judgingCalendarUrl: chameeraConfig.calendarInviteUrls.judging,
        senderName: chameeraConfig.sender.name,
        senderPosition: chameeraConfig.sender.position,
        headerImageUrl: chameeraConfig.images.header,
        logoImageUrl: chameeraConfig.images.logo,
        replyToEmail: chameeraConfig.replyToEmail,
        proposalPdfUrl: chameeraConfig.proposalPdfUrl,
        to: chameeraRecipient.to,
        cc: chameeraRecipient.cc,
        bcc: chameeraRecipient.bcc,
      };

      const html = await renderEmailTemplate(event, templateName, props);

      try {
        const { data, error } = await resend.emails.send({
          from: chameeraConfig.email.from,
          to: chameeraRecipient.to,
          ...(chameeraRecipient.cc?.length ? { cc: chameeraRecipient.cc } : {}),
          ...(chameeraRecipient.bcc?.length
            ? { bcc: chameeraRecipient.bcc }
            : {}),
          subject: chameeraConfig.email.subject,
          html,
        });

        const result: SendResult = error
          ? {
              email: chameeraRecipient.to,
              success: false,
              error: error.message,
            }
          : { email: chameeraRecipient.to, success: true, id: data?.id };

        results.push(result);
        if (options?.onProgress) {
          options.onProgress(result, i + 1, config.recipients.length);
        }
      } catch (err) {
        const result: SendResult = {
          email: chameeraRecipient.to,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
        results.push(result);
        if (options?.onProgress) {
          options.onProgress(result, i + 1, config.recipients.length);
        }
      }

      if (i < config.recipients.length - 1 && delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      continue;
    }

    // Prepare props based on template type
    const props: Record<string, any> = {
      name: recipient.name,
      role: (recipient as BaseConfig['recipients'][0]).role,
      senderName: config.sender.name,
      senderPosition: config.sender.position,
      headerImageUrl: config.images.header,
      logoImageUrl: config.images.logo,
    };

    // Add meeting props for welcome template
    if (templateName === 'welcome') {
      const welcomeConfig = config as WelcomeConfig;
      props.meetingDate = welcomeConfig.meeting.date;
      props.meetingTime = welcomeConfig.meeting.time;
      props.meetingPlatform = welcomeConfig.meeting.platform || 'Google Meet';
      props.meetingLink = welcomeConfig.meeting.link;
    }

    // Add contactEmail for crew-welcome template
    if (templateName === 'crew-welcome') {
      const crewConfig = config as CrewWelcomeConfig;
      props.contactEmail = crewConfig.contactEmail;
    }

    // Render HTML
    const html = await renderEmailTemplate(event, templateName, props);

    try {
      const { data, error } = await resend.emails.send({
        from: config.email.from,
        to: recipient.email,
        subject:
          config.email.subject ||
          `Congratulations! You've been selected for CryptX 2.0`,
        html,
      });

      const result: SendResult = error
        ? { email: recipient.email, success: false, error: error.message }
        : { email: recipient.email, success: true, id: data?.id };

      results.push(result);

      if (options?.onProgress) {
        options.onProgress(result, i + 1, config.recipients.length);
      }
    } catch (err) {
      const result: SendResult = {
        email: recipient.email,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
      results.push(result);

      if (options?.onProgress) {
        options.onProgress(result, i + 1, config.recipients.length);
      }
    }

    // Delay between emails (except for the last one)
    if (i < config.recipients.length - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Print summary of send results
 */
function printSummary(results: SendResult[]): void {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log('\n========== EMAIL SEND SUMMARY ==========');
  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed emails:');
    failed.forEach((r) => {
      console.log(`  - ${r.email}: ${r.error}`);
    });
  }

  console.log('==========================================\n');
}

// ============================================================
// MAIN EXECUTION
// ============================================================

async function main() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('Error: RESEND_API_KEY environment variable is not set');
    console.error(
      'Run with: RESEND_API_KEY=re_xxx bun run send:{event}:{template}',
    );
    process.exit(1);
  }

  // Get event and template from command line args or environment
  const event = process.env.EMAIL_EVENT || process.argv[2];
  const templateName = process.env.EMAIL_TEMPLATE || process.argv[3];

  if (!event || !templateName) {
    console.error('Error: Event and template name are required');
    console.error(
      'Usage: EMAIL_EVENT={event} EMAIL_TEMPLATE={template} bun run send.ts',
    );
    console.error('   or: bun run send.ts {event} {template}');
    console.error('Example: bun run send.ts cryptx welcome');
    process.exit(1);
  }

  // Build config file path
  const configPath = path.join(
    __dirname,
    'static',
    'events',
    event,
    'configs',
    `${templateName}-config.json`,
  );

  // Load and validate config
  console.log(`Loading config from ${path.relative(__dirname, configPath)}...`);
  const config = loadConfig(configPath);
  validateConfig(config, templateName);

  console.log(
    `\nSending ${config.recipients.length} ${event}/${templateName} emails...\n`,
  );

  const results = await sendEmails(apiKey, event, templateName, config, {
    delayMs: 200,
    onProgress: (result, index, total) => {
      const status = result.success ? '✓' : '✗';
      console.log(`[${index}/${total}] ${status} ${result.email}`);
    },
  });

  printSummary(results);
}

main().catch(console.error);
