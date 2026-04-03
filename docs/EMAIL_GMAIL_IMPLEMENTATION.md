# Email Configuration - Gmail SMTP Implementation ✅

## Overview

The CryptX Judging Platform now uses **Gmail SMTP** for sending evaluator credential emails. This provides:

✅ **Immediate setup** - No domain verification needed  
✅ **Excellent deliverability** - Gmail's reputation  
✅ **Security** - App passwords, TLS encryption  
✅ **Best practices** - HTML + plain text, proper headers  

---

## Quick Start (5 Minutes)

### 1. Generate Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Click "App passwords"
3. Select **"Mail"** → **"Other"** → Type: **"CryptX Judging Platform"**
4. Copy the 16-character password

**Note:** Requires 2FA enabled. See [docs/GMAIL_SMTP_SETUP.md](./GMAIL_SMTP_SETUP.md) for detailed instructions.

### 2. Add Environment Variables

**Local (.env file):**
```bash
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM_ADDRESS=your-email@gmail.com
EMAIL_FROM_NAME=CryptX Judging Platform
```

**Production (Vercel):**
1. Settings → Environment Variables
2. Add all 4 variables above
3. Apply to: Production, Preview, Development
4. Redeploy

### 3. Test

```bash
# Local test
bun scripts/test-gmail-smtp.ts

# Production test
# Create an evaluator - check credentials dialog for status
```

---

## What Changed

### Before (Resend)
- ❌ Required domain verification
- ❌ Test domain only worked for sender's email
- ❌ Couldn't send to evaluators
- ❌ Complex DNS setup

### After (Gmail SMTP)
- ✅ Works immediately
- ✅ Sends to anyone
- ✅ Gmail's excellent deliverability
- ✅ No DNS configuration needed

---

## Files Changed

| File | Purpose |
|------|---------|
| `lib/email/gmail.ts` | Gmail SMTP service with security best practices |
| `app/api/evaluators/create/route.ts` | Updated to use Gmail instead of Resend |
| `scripts/test-gmail-smtp.ts` | Test Gmail SMTP configuration |
| `docs/GMAIL_SMTP_SETUP.md` | Complete setup guide |
| `.env.local.example` | Updated with Gmail variables |

---

## Security & Best Practices Implemented

### Email Security
✅ **App Password** - Not using actual Gmail password  
✅ **TLS Encryption** - STARTTLS on port 587  
✅ **Environment variables** - Secrets not in code  
✅ **Connection pooling** - Efficient resource usage  

### Deliverability Best Practices
✅ **HTML + Plain text** - Both versions included  
✅ **Professional headers** - X-Mailer, X-Priority, etc.  
✅ **Proper sender format** - "Display Name <email>"  
✅ **SPF/DKIM** - Gmail handles automatically  
✅ **Low volume** - 25 emails total (well below 500/day limit)  

### Anti-Spam Measures
✅ **Professional template** - Clear subject, proper formatting  
✅ **Unsubscribe header** - Industry best practice  
✅ **Security notice** - Prompts password change  
✅ **Getting started guide** - Reduces confusion  
✅ **Gmail reputation** - Established sender  

---

## Testing

### Local Testing

```bash
# Prerequisites: Add Gmail credentials to .env
bun scripts/test-gmail-smtp.ts
```

**Expected output:**
```
🔍 Testing Gmail SMTP Configuration

📋 Environment Variables:
  GMAIL_USER: ✅ SET
  GMAIL_APP_PASSWORD: ✅ SET (hidden)
  EMAIL_FROM_ADDRESS: your-email@gmail.com
  EMAIL_FROM_NAME: CryptX Judging Platform

🔌 Test 1: Verifying SMTP connection...
✅ Test 1 PASSED - SMTP connection verified

📧 Test 2: Sending test email...
✅ Test 2 PASSED - Email sent successfully!

🎉 Gmail SMTP is working correctly!
```

### Production Testing

1. Deploy to Vercel with env variables
2. Login as admin
3. Create evaluator with real email
4. Check credentials dialog:
   - ✅ **"Email sent successfully"** = Working!
   - ❌ **"Email failed"** = Check error details
5. Verify email received (check spam folder too)

---

## Troubleshooting

### "Invalid login" Error

**Cause:** Wrong app password or 2FA not enabled

**Solution:**
1. Enable 2FA: https://myaccount.google.com/security
2. Generate new app password: https://myaccount.google.com/apppasswords
3. Remove ALL spaces from app password when setting in Vercel
4. Redeploy

### "Connection timeout" Error

**Cause:** Network/firewall blocking SMTP port 587

**Solution:**
- Check firewall allows outbound port 587
- Verify internet connection
- Try from different network

### Emails Going to Spam

**Unlikely with Gmail, but if happens:**

**Solutions:**
1. Ask recipient to mark as "Not Spam"
2. Add sender to contacts
3. Check Gmail account for security alerts
4. Verify sending volume is low (<25 emails)

### "Daily limit exceeded"

**Cause:** Sent >500 emails in 24 hours

**Solution:**
- Wait 24 hours
- Your use case (25 emails) is well below limit
- Check for unauthorized usage

---

## Gmail Sending Limits

| Limit | Value | Your Usage |
|-------|-------|------------|
| **Daily emails** | 500/day | ~25 total |
| **Safety margin** | - | 95% below limit ✅ |
| **Rate limiting** | Built-in | Automatic |
| **Burst protection** | Built-in | Automatic |

**Verdict:** Well within safe limits ✅

---

## Email Template Preview

**Subject:** Your Evaluator Account for [Competition Name]

**From:** CryptX Judging Platform <your-email@gmail.com>

**Content:**
- Professional welcome header
- Competition name
- Credentials in formatted box
- Security warning
- "Login to Platform" button
- Getting started steps
- Footer with contact info

**Versions:**
- HTML (styled, professional)
- Plain text (fallback for text clients)

---

## Monitoring

### Check Email Delivery

**Gmail Sent Folder:**
- Check Sent folder for all sent emails
- Verify no bounce messages

**Application Logs:**
- Vercel: Dashboard → Logs
- Look for: `✅ Email sent successfully`
- Errors: `❌ Failed to send email`

**Credentials Dialog:**
- Shows real-time success/failure
- Displays error messages
- Provides clipboard copy for manual sharing

### Gmail Account Security

**Monitor regularly:**
- Security checkup: https://myaccount.google.com/security-checkup
- Recent activity: https://myaccount.google.com/notifications
- App passwords: https://myaccount.google.com/apppasswords

**Warning signs:**
- Unexpected security alerts
- Bounce messages
- Account locked warnings

---

## Migration from Resend

### Environment Variables to Remove

```bash
# Remove from Vercel environment variables:
RESEND_API_KEY=...
```

### Environment Variables to Add

```bash
# Add to Vercel environment variables:
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM_ADDRESS=your-email@gmail.com
EMAIL_FROM_NAME=CryptX Judging Platform
```

### Code Changes (Already Done)

- ✅ Removed Resend dependency usage
- ✅ Added nodemailer
- ✅ Created Gmail email service
- ✅ Updated evaluator creation API
- ✅ Added test scripts
- ✅ Updated documentation

---

## Support Resources

- **Setup Guide:** [docs/GMAIL_SMTP_SETUP.md](./GMAIL_SMTP_SETUP.md)
- **Gmail Help:** https://support.google.com/mail
- **App Passwords:** https://support.google.com/accounts/answer/185833
- **2FA Help:** https://support.google.com/accounts/answer/185839
- **Sending Limits:** https://support.google.com/a/answer/166852

---

## Next Steps for User

1. ✅ Generate Gmail App Password ([Guide](./GMAIL_SMTP_SETUP.md#step-2-generate-app-password))
2. ✅ Add environment variables to Vercel
3. ✅ Redeploy application
4. ✅ Test email sending
5. ✅ Verify deliverability

**Estimated time:** 5-10 minutes

---

## Production Checklist

Before going live:

- [ ] Gmail App Password generated
- [ ] Environment variables added in Vercel
- [ ] Application redeployed
- [ ] Test email sent successfully
- [ ] Email received (not in spam)
- [ ] Credentials dialog shows success
- [ ] Login link works
- [ ] Gmail account secure (2FA enabled)
- [ ] Monitoring in place

---

## Summary

✅ **Secure** - App passwords, TLS encryption, no hardcoded secrets  
✅ **Reliable** - Gmail's excellent deliverability  
✅ **Compliant** - Follows email best practices  
✅ **Tested** - Built-in test scripts  
✅ **Documented** - Comprehensive guides  
✅ **Production-ready** - Used by thousands of applications  

**Your evaluators will receive professional, secure credential emails!** 🎉
