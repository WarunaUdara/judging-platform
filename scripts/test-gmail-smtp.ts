/**
 * Test script to verify Gmail SMTP configuration
 * Run: bun scripts/test-gmail-smtp.ts
 */

import { sendEvaluatorCredentials, verifyGmailConnection } from '../lib/email/gmail';

async function testGmailSMTP() {
  console.log('🔍 Testing Gmail SMTP Configuration\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('  GMAIL_USER:', process.env.GMAIL_USER || '❌ NOT SET');
  console.log('  GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('  EMAIL_FROM_ADDRESS:', process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER || '❌ NOT SET');
  console.log('  EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || 'CryptX Judging Platform');
  console.log('');

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Gmail SMTP not configured!');
    console.error('');
    console.error('Setup instructions:');
    console.error('1. Enable 2FA on your Gmail account');
    console.error('2. Generate App Password: https://myaccount.google.com/apppasswords');
    console.error('3. Add to .env file:');
    console.error('   GMAIL_USER=your-email@gmail.com');
    console.error('   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx');
    console.error('');
    console.error('See docs/GMAIL_SMTP_SETUP.md for detailed instructions.');
    process.exit(1);
  }

  // Test 1: Verify connection
  console.log('🔌 Test 1: Verifying SMTP connection...');
  const connectionTest = await verifyGmailConnection();
  
  if (connectionTest.success) {
    console.log('✅ Test 1 PASSED - SMTP connection verified\n');
  } else {
    console.error('❌ Test 1 FAILED -', connectionTest.error);
    console.error('');
    console.error('Common issues:');
    console.error('1. App password is incorrect');
    console.error('2. 2FA not enabled on Gmail');
    console.error('3. Network/firewall blocking SMTP (port 587)');
    console.error('');
    process.exit(1);
  }

  // Test 2: Send test email
  console.log('📧 Test 2: Sending test email...');
  console.log('   To:', process.env.GMAIL_USER);
  console.log('');

  const emailTest = await sendEvaluatorCredentials({
    email: process.env.GMAIL_USER!,
    displayName: 'Test Evaluator',
    password: 'TestPass123!',
    competitionName: 'Test Competition',
  });

  if (emailTest.success) {
    console.log('✅ Test 2 PASSED - Email sent successfully!');
    console.log('   Message ID:', emailTest.messageId);
    console.log('');
    console.log('📬 Check your inbox:', process.env.GMAIL_USER);
    console.log('   Subject: "Your Evaluator Account for Test Competition"');
    console.log('   Note: This is a test email, credentials are not real');
    console.log('');
    console.log('🎉 Gmail SMTP is working correctly!');
  } else {
    console.error('❌ Test 2 FAILED -', emailTest.error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check if App Password is correct (no spaces when setting)');
    console.error('2. Verify Gmail account is in good standing');
    console.error('3. Check for any Gmail security alerts');
    console.error('4. Review error message above for specific issue');
    console.error('');
    process.exit(1);
  }
}

// Run tests
testGmailSMTP().catch((error) => {
  console.error('');
  console.error('💥 Unexpected error:', error.message);
  console.error('');
  process.exit(1);
});
