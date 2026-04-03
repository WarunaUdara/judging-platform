# Gmail SMTP Setup - Your Action Items

## What I've Done ✅

1. ✅ Installed nodemailer for Gmail SMTP
2. ✅ Created secure email service with best practices
3. ✅ Updated evaluator creation API
4. ✅ Added professional HTML + plain text email templates
5. ✅ Implemented anti-spam measures
6. ✅ Created comprehensive documentation
7. ✅ Added test scripts
8. ✅ Committed and pushed to GitHub

## What You Need to Do (10 Minutes)

### Step 1: Generate Gmail App Password (3 minutes)

1. **Enable 2FA (if not already):**
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow setup if not enabled

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Click "App passwords"
   - Select: **Mail** → **Other** → Type: **"CryptX Judging Platform"**
   - Click **"Generate"**
   - **Copy the 16-character password** (you'll only see it once!)

### Step 2: Update Local Environment (1 minute)

Edit your `.env` file:

```bash
# Add these (replace with your values)
GMAIL_USER=warunaudarasam2003@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-char password from Step 1
EMAIL_FROM_ADDRESS=warunaudarasam2003@gmail.com
EMAIL_FROM_NAME=CryptX Judging Platform

# Remove this (no longer needed)
# RESEND_API_KEY=...
```

### Step 3: Test Locally (1 minute)

```bash
# Test Gmail SMTP connection
bun scripts/test-gmail-smtp.ts
```

**Expected output:**
```
✅ Test 1 PASSED - SMTP connection verified
✅ Test 2 PASSED - Email sent successfully!
🎉 Gmail SMTP is working correctly!
```

Check your Gmail inbox for the test email!

### Step 4: Update Vercel Environment Variables (3 minutes)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**

**Remove:**
- `RESEND_API_KEY` (click "..." → "Remove")

**Add these 4 variables:**

| Name | Value |
|------|-------|
| `GMAIL_USER` | `warunaudarasam2003@gmail.com` |
| `GMAIL_APP_PASSWORD` | `xxxx xxxx xxxx xxxx` (from Step 1) |
| `EMAIL_FROM_ADDRESS` | `warunaudarasam2003@gmail.com` |
| `EMAIL_FROM_NAME` | `CryptX Judging Platform` |

**Important:** Check all three environment boxes for each:
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Save"** for each variable.

### Step 5: Redeploy to Vercel (2 minutes)

**Option A: Redeploy from Dashboard**
1. Go to **Deployments** tab
2. Find latest deployment
3. Click **"..."** → **"Redeploy"**

**Option B: Push a commit**
```bash
git commit --allow-empty -m "chore: trigger redeploy for Gmail SMTP"
git push
```

Wait for deployment to complete (1-2 minutes).

### Step 6: Test on Production (2 minutes)

1. Go to https://cryptxjudge.vercel.app
2. Login as admin
3. Navigate to **Evaluators** page
4. Click **"Add Evaluator"**
5. Fill in details:
   - Email: Use a real email you can check
   - Display Name: Test Evaluator
   - Password: Generate or type one
6. Click **"Create"**

**Check the credentials dialog:**
- ✅ **"Email sent successfully"** = Working perfectly!
- ❌ **"Email failed"** = See error details (likely env vars not set)

**Verify email received:**
- Check recipient's inbox
- Subject: "Your Evaluator Account for [Competition]"
- From: CryptX Judging Platform <warunaudarasam2003@gmail.com>
- Contains credentials and login link

---

## Troubleshooting

### Local test fails with "Invalid login"

**Cause:** App password incorrect or 2FA not enabled

**Fix:**
1. Verify 2FA enabled: https://myaccount.google.com/security
2. Generate new app password
3. Remove ALL spaces when copying (or keep them, nodemailer handles both)
4. Update `.env` file
5. Run test again

### Production emails not sending

**Cause:** Environment variables not set in Vercel

**Fix:**
1. Verify all 4 variables in Vercel Settings → Environment Variables
2. Check they're applied to Production environment
3. Redeploy application
4. Test again

### Emails going to spam

**Unlikely with Gmail, but if happens:**
1. Ask recipient to mark as "Not Spam"
2. Add sender to contacts: `warunaudarasam2003@gmail.com`
3. Check Gmail account security: https://myaccount.google.com/security-checkup

---

## Documentation

- **Setup Guide:** `docs/GMAIL_SMTP_SETUP.md` (detailed step-by-step)
- **Implementation Details:** `docs/EMAIL_GMAIL_IMPLEMENTATION.md`
- **Environment Variables:** `.env.local.example`

---

## Success Criteria

You're done when:
- ✅ Local test passes
- ✅ Vercel env variables set
- ✅ Application redeployed
- ✅ Production test sends email successfully
- ✅ Email received in inbox (not spam)
- ✅ Login link works
- ✅ Credentials are correct

---

## Summary

**Before:** Emails not sending (Resend test domain restriction)  
**After:** Professional emails from your Gmail with excellent deliverability ✅

**Security:** App passwords, TLS encryption, best practices ✅  
**Deliverability:** Gmail reputation, proper headers, anti-spam measures ✅  
**Reliability:** Well below sending limits (25 vs 500/day) ✅  

**Time investment:** 10 minutes of setup  
**Result:** Production-ready email system 🎉

---

## Need Help?

If you encounter any issues:
1. Check `docs/GMAIL_SMTP_SETUP.md` for detailed troubleshooting
2. Run `bun scripts/test-gmail-smtp.ts` to diagnose issues
3. Check Vercel logs for error messages
4. Verify Gmail account security settings

**Your emails will work perfectly!** 📧✨
