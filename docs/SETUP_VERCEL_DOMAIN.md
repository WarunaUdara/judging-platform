# Setup Vercel Domain with Resend - Step by Step

Your Vercel app domain: **cryptxjudge.vercel.app**

This guide will help you verify this domain with Resend so you can send emails to anyone.

---

## Part 1: Add Domain in Resend (5 minutes)

### Step 1: Go to Resend Domains Page
1. Open https://resend.com/domains
2. Click **"Add Domain"** button (top right)

### Step 2: Enter Your Vercel Domain
In the input field, enter:
```
cryptxjudge.vercel.app
```

Click **"Add"** or **"Continue"**

### Step 3: Copy DNS Records
Resend will show you DNS records that look like this:

**Record 1 (SPF):**
```
Type: TXT
Name: @ (or leave empty)
Value: v=spf1 include:_spf.resend.com ~all
```

**Record 2 (DKIM):**
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (long string)
```

**Record 3 (Custom Domain - Optional):**
```
Type: CNAME
Name: resend
Value: resend.yourdomain.com
```

**Keep this Resend page open** - you'll need these values in the next steps.

---

## Part 2: Add DNS Records in Vercel (10 minutes)

### Step 1: Open Vercel DNS Settings
1. Go to https://vercel.com/dashboard
2. Click on your project: **cryptx-judging-platform** (or similar name)
3. Click **"Settings"** tab
4. Click **"Domains"** in left sidebar
5. Find your domain: **cryptxjudge.vercel.app**
6. Click on it to expand
7. Scroll down to find **"DNS Records"** section

### Step 2: Add SPF Record
Click **"Add Record"** and enter:

```
Type: TXT
Name: @ (or leave blank if not allowed)
Value: v=spf1 include:_spf.resend.com ~all
```

Click **"Save"**

### Step 3: Add DKIM Record
Click **"Add Record"** again and enter:

```
Type: TXT
Name: resend._domainkey
Value: [paste the long string from Resend]
```

**Important:** Copy the ENTIRE value from Resend, including `p=MIG...`

Click **"Save"**

### Step 4: Verify Records Added
You should now see both records in your Vercel DNS list:
- `@` (or blank) → TXT → `v=spf1...`
- `resend._domainkey` → TXT → `p=MIG...`

---

## Part 3: Verify Domain in Resend (Wait Time)

### Step 1: Wait for DNS Propagation
- DNS changes can take **5-30 minutes** to propagate
- Sometimes instant, sometimes longer
- Be patient!

### Step 2: Check Verification Status
1. Go back to https://resend.com/domains
2. Find **cryptxjudge.vercel.app** in the list
3. Look for status indicator:
   - 🟡 **Pending** = Still verifying, wait longer
   - 🟢 **Verified** = Ready to use! Continue to Part 4
   - 🔴 **Failed** = DNS records incorrect, check values

### Step 3: Force Re-check (if stuck on Pending)
If it's been 30+ minutes and still pending:
1. Click on the domain
2. Click **"Verify Domain"** or **"Re-check"** button
3. Wait a few more minutes

---

## Part 4: Update Your Application

Once domain shows **Verified** in Resend:

### Step 1: Update Vercel Environment Variable
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Find `EMAIL_FROM_ADDRESS`
3. Click **"Edit"**
4. Change value to:
   ```
   noreply@cryptxjudge.vercel.app
   ```
5. Click **"Save"**

**Important:** Make sure it's applied to **all environments** (Production, Preview, Development)

### Step 2: Redeploy Your Application
You **must** redeploy for env variable changes to take effect:

**Option A: Redeploy from Vercel Dashboard**
1. Go to your project → **Deployments** tab
2. Find latest deployment
3. Click **"..."** menu → **"Redeploy"**

**Option B: Push a new commit**
```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

### Step 3: Wait for Deployment
Wait for Vercel to finish deploying (usually 1-2 minutes)

---

## Part 5: Test Email Sending

### Step 1: Create Test Evaluator
1. Go to your production site: https://cryptxjudge.vercel.app
2. Login as admin
3. Go to **Evaluators** page
4. Click **"Add Evaluator"**
5. Fill in details with a **real email address you can check**
6. Click **"Create"**

### Step 2: Check the Credentials Dialog
After creating, you should see a dialog showing:
- ✅ **"Credentials email sent successfully"** = Success!
- ❌ **"Email failed"** = Something wrong (see error message)

### Step 3: Verify Email Delivered
1. Go to https://resend.com/emails
2. Find your email in the list
3. Status should be **"Delivered"**
4. Check recipient's inbox (and spam folder)

### Step 4: Check Email Received
The recipient should receive an email from:
```
From: CryptX Judging Platform <noreply@cryptxjudge.vercel.app>
Subject: Your Evaluator Account for [Competition Name]
```

---

## Troubleshooting

### DNS Records Not Verifying
**Problem:** Resend shows "Failed" or stuck on "Pending"

**Solution:**
1. Double-check the TXT record values are **exactly** as Resend provided
2. Make sure no extra spaces or line breaks in the values
3. Some DNS providers don't allow `@` as a name - try leaving it blank
4. Wait longer (can take up to 1 hour in rare cases)
5. Try removing and re-adding the records

### Vercel Doesn't Allow DNS Records on .vercel.app
**Problem:** Vercel says you can't add DNS records to `.vercel.app` domains

**Workaround Option 1: Use a Subdomain**
1. Add a custom domain in Vercel (e.g., `cryptx.yourdomain.com`)
2. Verify that domain with Resend instead
3. Use that domain for email sending

**Workaround Option 2: Use Gmail SMTP Instead**
If Vercel doesn't allow DNS records on their subdomains, let me know and I'll help you switch to Gmail SMTP which doesn't require domain verification.

### Email Still Not Sending After Verification
**Checklist:**
- [ ] Domain shows "Verified" in Resend dashboard
- [ ] Updated `EMAIL_FROM_ADDRESS` in Vercel env vars
- [ ] Redeployed application after changing env vars
- [ ] Using correct email format: `name@cryptxjudge.vercel.app`
- [ ] Checked Vercel logs for error messages
- [ ] Checked Resend dashboard for delivery status
- [ ] Checked recipient's spam folder

---

## Quick Reference

### Your Email Configuration
```bash
# Vercel Environment Variables
RESEND_API_KEY=re_[your-key]
EMAIL_FROM_ADDRESS=noreply@cryptxjudge.vercel.app
NEXT_PUBLIC_APP_URL=https://cryptxjudge.vercel.app
```

### Resend Dashboard Links
- Domains: https://resend.com/domains
- Emails Log: https://resend.com/emails
- API Keys: https://resend.com/api-keys

### Vercel Dashboard Links
- Your Project: https://vercel.com/dashboard → cryptx-judging-platform
- Settings: Settings → Environment Variables
- DNS: Settings → Domains → cryptxjudge.vercel.app

---

## Need Help?

If you get stuck:
1. Check Resend domain status at https://resend.com/domains
2. Check Vercel logs during email sending
3. Look at credentials dialog error message
4. Share screenshots of:
   - Resend domain verification status
   - Vercel DNS records
   - Error messages from credentials dialog
