# Quick Guide: Verify Domain in Resend

## You Must Verify a Domain to Send to Anyone

The test domain `onboarding@resend.dev` **only works for emails to your own account**.

## Option 1: Use Your Own Domain (Recommended)

If you own a domain like `cryptx.com`:

### Step 1: Add Domain in Resend
1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain: `cryptx.com` (or subdomain: `mail.cryptx.com`)

### Step 2: Add DNS Records
Resend will show you DNS records like:

```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBA...

Type: MX  
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

Add these in your domain registrar:
- **Namecheap**: Dashboard → Domain List → Manage → Advanced DNS
- **GoDaddy**: Domain Settings → DNS Management
- **Cloudflare**: Dashboard → DNS → Records
- **Google Domains**: My Domains → DNS

### Step 3: Wait for Verification
- Usually takes 5-30 minutes
- Resend will show "Verified" status when ready

### Step 4: Update Vercel Environment
```bash
EMAIL_FROM_ADDRESS=noreply@cryptx.com
```
Then redeploy.

---

## Option 2: Use Vercel Domain (Free)

Your Vercel app gives you a free domain: `cryptxjudge.vercel.app`

### Step 1: Add Vercel Domain in Resend
1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter: `cryptxjudge.vercel.app`

### Step 2: Add DNS Records in Vercel
1. Vercel Dashboard → Your Project → Settings → Domains
2. Click your domain → DNS Records
3. Add the records Resend provided

### Step 3: Update Vercel Environment
```bash
EMAIL_FROM_ADDRESS=noreply@cryptxjudge.vercel.app
```

---

## Option 3: Use Gmail SMTP (Alternative)

If you don't want to verify a domain, switch to Gmail:

### Requirements
- Gmail account
- Gmail App Password (not your regular password)

### Setup Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. App name: "CryptX Judging Platform"
3. Copy the generated password

### Install Nodemailer
```bash
bun add nodemailer
bun add -D @types/nodemailer
```

### Update .env
```bash
GMAIL_USER=warunaudarasam2003@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Update Vercel Environment Variables
Add `GMAIL_USER` and `GMAIL_APP_PASSWORD`

Let me know if you want me to implement Gmail SMTP instead of Resend.

---

## Quick Comparison

| Method | Setup Time | Cost | Deliverability | Best For |
|--------|------------|------|----------------|----------|
| **Own Domain** | 10-30 min | Free* | Excellent | Production |
| **Vercel Domain** | 10-30 min | Free | Good | Testing/MVP |
| **Gmail SMTP** | 5 min | Free | Good | Small scale |
| **Resend Test** | 0 min | Free | Only your email | Testing only |

*Assumes you already own a domain

---

## What to Do Right Now

**If you own a domain:**
→ Follow Option 1 (best for production)

**If you don't own a domain:**
→ Follow Option 2 (use Vercel domain)

**If you want quick solution:**
→ Follow Option 3 (Gmail SMTP) - I can help implement this

**For testing only:**
→ Use test evaluator email: `warunaudarasam2003@gmail.com` (your email)
