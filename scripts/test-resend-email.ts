/**
 * Test script to verify Resend email configuration
 * Run: bun scripts/test-resend-email.ts
 */

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS;

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in environment');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

async function testEmail() {
  console.log('🔍 Testing Resend Email Configuration\n');
  console.log('API Key:', RESEND_API_KEY!.substring(0, 10) + '...');
  console.log('From Address:', EMAIL_FROM_ADDRESS || 'Not set (will use onboarding@resend.dev)');
  console.log('');

  try {
    // Test 1: Using resend.dev test domain
    console.log('📧 Test 1: Sending with onboarding@resend.dev...');
    const result1 = await resend.emails.send({
      from: 'CryptX Test <onboarding@resend.dev>',
      to: 'delivered@resend.dev', // Resend test email
      subject: 'Test Email - Resend.dev Domain',
      html: '<p>This is a test email using the Resend test domain.</p>',
    });
    console.log('✅ Test 1 PASSED - Email ID:', result1.data?.id);
    console.log('');

    // Test 2: Using custom email if set
    if (EMAIL_FROM_ADDRESS) {
      console.log('📧 Test 2: Sending with custom email:', EMAIL_FROM_ADDRESS);
      try {
        const result2 = await resend.emails.send({
          from: `CryptX Test <${EMAIL_FROM_ADDRESS}>`,
          to: 'delivered@resend.dev',
          subject: 'Test Email - Custom Domain',
          html: '<p>This is a test email using a custom domain.</p>',
        });
        console.log('✅ Test 2 PASSED - Email ID:', result2.data?.id);
      } catch (error: any) {
        console.log('❌ Test 2 FAILED');
        console.log('Error:', error.message);
        console.log('');
        console.log('📋 This means you need to verify your domain in Resend:');
        console.log('1. Go to https://resend.com/domains');
        console.log('2. Click "Add Domain"');
        console.log('3. Enter the domain from your email:', EMAIL_FROM_ADDRESS.split('@')[1]);
        console.log('4. Add the DNS records Resend provides to your domain registrar');
        console.log('5. Wait for verification (usually takes a few minutes)');
        console.log('');
        console.log('OR use the test domain for now:');
        console.log('   Remove EMAIL_FROM_ADDRESS from .env or set it to: onboarding@resend.dev');
      }
    }
  } catch (error: any) {
    console.error('❌ Email test failed');
    console.error('Error:', error.message);
    console.error('Status:', error.statusCode);
    
    if (error.statusCode === 403 || error.statusCode === 401) {
      console.log('');
      console.log('📋 Your API key appears to be invalid or expired.');
      console.log('1. Go to https://resend.com/api-keys');
      console.log('2. Generate a new API key');
      console.log('3. Update RESEND_API_KEY in your .env file');
    }
  }
}

testEmail();
