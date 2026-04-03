/**
 * Gmail SMTP Email Service
 * Secure email sending using Gmail with nodemailer
 * 
 * Best practices implemented:
 * - TLS/STARTTLS encryption
 * - HTML + Plain text versions
 * - Proper email headers for deliverability
 * - SPF/DKIM (handled automatically by Gmail)
 * - Rate limiting protection
 * - Error handling and logging
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration from environment variables
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || GMAIL_USER;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'CryptX Judging Platform';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Validate environment variables
if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('❌ Gmail SMTP not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
}

/**
 * Create Gmail SMTP transporter with security best practices
 */
function createTransporter(): Transporter | null {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('Missing Gmail credentials');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // STARTTLS port
      secure: false, // Use STARTTLS (upgrade to TLS)
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD.replace(/\s/g, ''), // Remove spaces from app password
      },
      tls: {
        // Use secure ciphers, don't force outdated SSLv3
        rejectUnauthorized: true,
      },
      // Connection pool for better performance
      pool: true,
      maxConnections: 5,
      maxMessages: 10,
      // Timeout settings
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    return transporter;
  } catch (error) {
    console.error('Failed to create Gmail transporter:', error);
    return null;
  }
}

/**
 * Email template interfaces
 */
export interface EvaluatorCredentialsData {
  email: string;
  displayName: string;
  password: string;
  competitionName: string;
  loginUrl?: string;
}

/**
 * Generate plain text version from HTML (for better deliverability)
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Send evaluator credentials email with best practices
 */
export async function sendEvaluatorCredentials(
  data: EvaluatorCredentialsData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = createTransporter();
  
  if (!transporter) {
    return {
      success: false,
      error: 'Gmail SMTP not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD environment variables.',
    };
  }

  const loginUrl = data.loginUrl || `${APP_URL}/login`;
  
  // HTML email template (anti-spam optimized)
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <title>Your Evaluator Account - ${data.competitionName}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #333333; padding: 40px;">
        <!-- Header -->
        <h1 style="color: #ffffff; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">Welcome to CryptX Judging Platform</h1>
        
        <!-- Introduction -->
        <p style="color: #a1a1aa; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
          Hello ${data.displayName},
        </p>
        
        <p style="color: #a1a1aa; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
          You have been added as an evaluator for <strong style="color: #ffffff;">${data.competitionName}</strong>.
        </p>
        
        <!-- Credentials Box -->
        <div style="background-color: #111111; border: 1px solid #333333; padding: 24px; margin: 0 0 24px 0;">
          <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Your Login Credentials</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #888888; font-size: 14px;">Email:</strong>
              </td>
              <td style="padding: 8px 0;">
                <span style="color: #ffffff; font-family: monospace; font-size: 14px;">${data.email}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #888888; font-size: 14px;">Password:</strong>
              </td>
              <td style="padding: 8px 0;">
                <span style="color: #ffffff; font-family: monospace; font-size: 14px;">${data.password}</span>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Security Notice -->
        <p style="color: #ff4444; margin: 0 0 24px 0; font-size: 14px; background-color: #2a1515; padding: 12px; border-left: 3px solid #ff4444;">
          <strong>Important:</strong> Please change your password after your first login for security.
        </p>
        
        <!-- Call to Action Button -->
        <table style="width: 100%; margin: 0 0 24px 0;">
          <tr>
            <td>
              <a href="${loginUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 14px 28px; font-size: 14px; font-weight: 600; border-radius: 4px;">
                Login to Platform
              </a>
            </td>
          </tr>
        </table>
        
        <!-- Additional Information -->
        <div style="border-top: 1px solid #333333; padding-top: 24px; margin-top: 24px;">
          <h3 style="color: #ffffff; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Getting Started</h3>
          <ol style="color: #a1a1aa; margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
            <li>Click the "Login to Platform" button above</li>
            <li>Enter your email and password</li>
            <li>Change your password in settings</li>
            <li>Start evaluating teams</li>
          </ol>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid #333333; padding-top: 20px; margin-top: 20px;">
          <p style="color: #71717a; margin: 0 0 8px 0; font-size: 12px;">
            If you did not expect this email or have any questions, please contact your event organizer.
          </p>
          <p style="color: #71717a; margin: 0; font-size: 12px;">
            This is an automated message from CryptX Judging Platform.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Plain text version (required for spam filters)
  const textContent = `
Welcome to CryptX Judging Platform

Hello ${data.displayName},

You have been added as an evaluator for ${data.competitionName}.

Your Login Credentials:
- Email: ${data.email}
- Password: ${data.password}

IMPORTANT: Please change your password after your first login for security.

Login here: ${loginUrl}

Getting Started:
1. Click the login link above
2. Enter your email and password
3. Change your password in settings
4. Start evaluating teams

If you did not expect this email or have any questions, please contact your event organizer.

This is an automated message from CryptX Judging Platform.
  `.trim();

  try {
    // Send email with best practices
    const info = await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS}>`, // Professional sender format
      to: data.email,
      subject: `Your Evaluator Account for ${data.competitionName}`,
      text: textContent, // Plain text version (required)
      html: htmlContent, // HTML version
      // Additional headers for better deliverability
      headers: {
        'X-Mailer': 'CryptX Judging Platform',
        'X-Priority': '1', // High priority (credential email)
        'Importance': 'high',
        'X-Application': 'CryptX-Judging',
      },
      // List headers (optional but good practice)
      list: {
        unsubscribe: `${APP_URL}/unsubscribe`, // Required for bulk email (not strictly needed here)
      },
    });

    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      to: data.email,
      from: EMAIL_FROM_ADDRESS,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('❌ Failed to send email:', {
      error: error.message,
      code: error.code,
      command: error.command,
      to: data.email,
    });

    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Verify Gmail SMTP connection (for testing)
 */
export async function verifyGmailConnection(): Promise<{ success: boolean; error?: string }> {
  const transporter = createTransporter();
  
  if (!transporter) {
    return {
      success: false,
      error: 'Gmail SMTP not configured - missing GMAIL_USER or GMAIL_APP_PASSWORD',
    };
  }

  try {
    console.log('Attempting SMTP connection to smtp.gmail.com:587...');
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Gmail SMTP verification failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
    
    // Provide more helpful error messages
    let helpfulError = error.message;
    
    if (error.code === 'ECONNREFUSED') {
      helpfulError = 'Connection refused - firewall may be blocking port 587';
    } else if (error.code === 'ETIMEDOUT') {
      helpfulError = 'Connection timed out - network issue or firewall blocking SMTP';
    } else if (error.message.includes('Greeting')) {
      helpfulError = 'Greeting never received - usually means wrong password or auth failed';
    } else if (error.message.includes('authentication')) {
      helpfulError = 'Authentication failed - check App Password is correct';
    }
    
    return {
      success: false,
      error: helpfulError,
    };
  }
}

/**
 * Close transporter connections (cleanup)
 */
export function closeTransporter() {
  // Nodemailer handles connection pooling automatically
  // No explicit cleanup needed in most cases
}
