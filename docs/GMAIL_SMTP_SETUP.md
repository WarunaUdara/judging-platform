# Gmail SMTP Setup Guide - Secure Email Sending

## Prerequisites

✅ Gmail account: `warunaudarasam2003@gmail.com`  
✅ Two-Factor Authentication (2FA) must be enabled

---

## Step 1: Enable Two-Factor Authentication (if not already enabled)

### Check if 2FA is Enabled
1. Go to https://myaccount.google.com/security
2. Look for **"2-Step Verification"** section
3. If it says **"On"** → Skip to Step 2
4. If it says **"Off"** → Continue below

### Enable 2FA
1. Click **"2-Step Verification"**
2. Click **"Get Started"**
3. Follow the prompts:
   - Verify your phone number
   - Receive and enter verification code
   - Complete setup
4. 2FA is now enabled ✅

---

## Step 2: Generate App Password

### What is an App Password?
- A 16-character password for apps to access your Gmail
- More secure than using your actual Gmail password
- Can be revoked without changing your Gmail password

### Generate the Password
1. Go to https://myaccount.google.com/apppasswords
2. **If link doesn't work:** Go to https://myaccount.google.com → Security → 2-Step Verification → App passwords
3. Click **"App passwords"** (at the bottom)
4. You may need to sign in again

5. **Select app:**
   - Choose **"Mail"**

6. **Select device:**
   - Choose **"Other (Custom name)"**
   - Type: **"CryptX Judging Platform"**

7. Click **"Generate"**

8. **Copy the 16-character password** that appears
   - Format: `xxxx xxxx xxxx xxxx` (with spaces)
   - **Important:** You'll only see this once!
   - Keep it safe - you'll add it to Vercel

---

## Step 3: Update Environment Variables

### Local Development (.env file)

Update your `.env` file:

```bash
# Gmail SMTP Configuration
GMAIL_USER=warunaudarasam2003@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM_ADDRESS=warunaudarasam2003@gmail.com
EMAIL_FROM_NAME=CryptX Judging Platform

# App URL
NEXT_PUBLIC_APP_URL=https://cryptxjudge.vercel.app

# Remove these (no longer needed)
# RESEND_API_KEY=...
```

**Important:** Replace `xxxx xxxx xxxx xxxx` with your actual app password

### Production (Vercel Environment Variables)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**

4. **Delete old variable:**
   - Find `RESEND_API_KEY`
   - Click **"..."** → **"Remove"**

5. **Add new variables:**

| Name | Value | Environments |
|------|-------|--------------|
| `GMAIL_USER` | `warunaudarasam2003@gmail.com` | Production, Preview, Development |
| `GMAIL_APP_PASSWORD` | `xxxx xxxx xxxx xxxx` | Production, Preview, Development |
| `EMAIL_FROM_ADDRESS` | `warunaudarasam2003@gmail.com` | Production, Preview, Development |
| `EMAIL_FROM_NAME` | `CryptX Judging Platform` | Production, Preview, Development |

**Important:** Check all three environment boxes for each variable

6. Click **"Save"** for each variable

---

## Step 4: Redeploy Application

After adding environment variables:

**Option A: Redeploy from Vercel**
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

**Option B: Push new commit**
```bash
git commit --allow-empty -m "chore: trigger redeploy for Gmail SMTP"
git push
```

Wait for deployment to complete (1-2 minutes)

---

## Step 5: Test Email Sending

### Create Test Evaluator
1. Go to https://cryptxjudge.vercel.app
2. Login as admin
3. Navigate to **Evaluators** page
4. Click **"Add Evaluator"**
5. Fill in details:
   - **Email:** Use a real email you can check
   - **Display Name:** Test Evaluator
   - **Password:** Generate or type one
6. Click **"Create"**

### Check Results
A dialog will appear showing:
- ✅ **"Credentials email sent successfully"** = Success!
- ❌ **"Email failed"** = See error details in dialog

### Verify Email Received
1. Check recipient's inbox
2. Look for email from **"CryptX Judging Platform <warunaudarasam2003@gmail.com>"**
3. Subject: **"Your Evaluator Account for [Competition Name]"**

**If email not in inbox:** Check spam/junk folder

---

## Security Best Practices

### ✅ What We're Doing Right
1. **Using App Password** - Not your actual Gmail password
2. **Environment variables** - Secrets not in code
3. **HTTPS/TLS** - Encrypted email transmission
4. **Professional email template** - Reduces spam score
5. **SPF/DKIM** - Gmail handles this automatically
6. **Rate limiting** - Gmail's built-in protection

### 🔒 Additional Security Tips
1. **Never commit .env file** - Already in `.gitignore`
2. **Revoke app passwords** - If compromised, revoke at https://myaccount.google.com/apppasswords
3. **Monitor Gmail activity** - Check https://myaccount.google.com/notifications
4. **Use strong display name** - "CryptX Judging Platform" (not suspicious)

---

## Email Deliverability Best Practices

### Why Your Emails Won't Be Flagged as Spam

1. **Sending from verified Gmail** ✅
   - Gmail has excellent reputation
   - SPF and DKIM automatically configured
   - Authenticated sender

2. **Professional email content** ✅
   - Clear subject line
   - Plain text + HTML versions
   - No spam trigger words
   - Proper unsubscribe information

3. **Low volume sending** ✅
   - Only 25 emails total
   - Well below Gmail's 500/day limit
   - No bulk mailing patterns

4. **Proper email headers** ✅
   - Correct From/To addresses
   - Reply-To configured
   - Message-ID present

### Gmail Sending Limits
- **Daily limit:** 500 emails/day
- **Your usage:** ~25 emails total
- **Safety margin:** 95% below limit ✅

---

## Troubleshooting

### "Invalid login" or "Username and password not accepted"
**Cause:** Wrong app password or 2FA not enabled

**Solution:**
1. Verify 2FA is enabled: https://myaccount.google.com/security
2. Generate new app password: https://myaccount.google.com/apppasswords
3. Copy password **exactly** (include spaces or remove all spaces)
4. Update Vercel environment variables
5. Redeploy

### "Less secure app access"
**Cause:** Old Gmail security setting (deprecated)

**Solution:**
- Use App Password (not regular password)
- App passwords work even if "Less secure apps" is off
- This is the modern, secure way

### Emails going to spam
**Unlikely with Gmail, but if it happens:**

**Check:**
1. Email has proper subject line ✅
2. Contains unsubscribe option ✅
3. Not sent in bulk ✅
4. Gmail account in good standing

**Fix:**
1. Ask recipients to mark as "Not Spam"
2. Add sender to contacts: `warunaudarasam2003@gmail.com`
3. Check Gmail account for suspicious activity alerts

### "Daily sending limit exceeded"
**Cause:** Sent more than 500 emails in 24 hours

**Solution:**
- Wait 24 hours for limit to reset
- Your use case (25 emails) is well below this
- Monitor Gmail quota at https://myaccount.google.com

---

## Environment Variables Summary

### Required Variables

```bash
# Gmail SMTP (Required)
GMAIL_USER=warunaudarasam2003@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Email Display (Required)
EMAIL_FROM_ADDRESS=warunaudarasam2003@gmail.com
EMAIL_FROM_NAME=CryptX Judging Platform

# Application URL (Required)
NEXT_PUBLIC_APP_URL=https://cryptxjudge.vercel.app

# Firebase (Keep existing)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... (other Firebase variables)
```

### Removed Variables

```bash
# Remove these (no longer needed)
RESEND_API_KEY=...
```

---

## Testing Checklist

Before considering setup complete:

- [ ] 2FA enabled on Gmail
- [ ] App password generated
- [ ] Environment variables added in Vercel
- [ ] Application redeployed
- [ ] Test evaluator created successfully
- [ ] Credentials dialog shows success
- [ ] Email received in recipient inbox
- [ ] Email not in spam folder
- [ ] Login link in email works
- [ ] Credentials in email are correct

---

## Gmail Account Monitoring

### Keep Your Account Secure

**Check regularly:**
1. **Security checkup:** https://myaccount.google.com/security-checkup
2. **Recent activity:** https://myaccount.google.com/notifications
3. **App passwords:** https://myaccount.google.com/apppasswords

**Signs of issues:**
- Unexpected security alerts
- Bounce messages
- Emails not being delivered
- Account locked warnings

**If issues occur:**
1. Revoke app password
2. Generate new one
3. Update Vercel environment variables
4. Check Gmail security settings

---

## Support Resources

- **Gmail Help:** https://support.google.com/mail
- **App Passwords Help:** https://support.google.com/accounts/answer/185833
- **2FA Help:** https://support.google.com/accounts/answer/185839
- **Gmail Sending Limits:** https://support.google.com/a/answer/166852

---

## Next Steps

1. ✅ Follow Step 1-2 to generate app password
2. ✅ Add environment variables to Vercel (Step 3)
3. ✅ Redeploy application (Step 4)
4. ✅ Test email sending (Step 5)
5. ✅ Verify deliverability

Once complete, your platform will send professional emails from your Gmail with zero spam risk! 🎉
