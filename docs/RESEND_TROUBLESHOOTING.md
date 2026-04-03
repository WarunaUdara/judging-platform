# Resend Email Troubleshooting - Production Issues

## Issue: Emails Not Being Received on Vercel

You've set up:
- ✅ Resend API key in Vercel environment variables
- ✅ `EMAIL_FROM_ADDRESS=onboarding@resend.dev`
- ❌ Emails still not being received

## Step-by-Step Debugging

### 1. Verify Resend Console Configuration

#### Go to https://resend.com/api-keys

Check your API key:

| What to Check | Expected Value | How to Fix |
|---------------|----------------|------------|
| **Status** | Active (green) | If inactive, generate a new key |
| **Permission** | "Full Access" or "Sending Access" | Delete and create new key with correct permissions |
| **Domain** | "All domains" OR includes `resend.dev` | Edit key settings to allow all domains |

#### Go to https://resend.com/emails

This is the **MOST IMPORTANT** step:

1. **Try to create an evaluator** on your Vercel-hosted site
2. **Immediately check** https://resend.com/emails
3. **What do you see?**

**If you see NOTHING:**
- ❌ Your API key is not working
- ❌ The API request is not reaching Resend
- **Solution**: Generate a new API key and update Vercel env

**If you see emails with status:**
- ✅ **Delivered** = Email sent successfully! Check recipient's **spam folder**
- ⚠️ **Queued** = Still processing, wait a few minutes
- ❌ **Bounced** = Invalid recipient email address
- ❌ **Failed** = Click to see error details

### 2. Verify Vercel Environment Variables

Go to your Vercel project → Settings → Environment Variables

Verify these exact values:

```bash
RESEND_API_KEY=re_YourActualKey
EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

**Common mistakes:**
- ❌ Extra spaces before/after the key
- ❌ Using old/expired API key
- ❌ Not redeploying after adding env variables

**After adding/updating env variables:**
```bash
# You MUST redeploy for changes to take effect
git push  # or click "Redeploy" in Vercel dashboard
```

### 3. Check Application Logs

In Vercel dashboard → Your project → Logs

When you create an evaluator, look for:

**Success logs:**
```
Attempting to send email from: CryptX Judging Platform <onboarding@resend.dev> to: user@example.com
✅ Email sent successfully. ID: abc123...
```

**Error logs:**
```
❌ Failed to send credentials email
Error details: { message: "...", statusCode: 403, name: "..." }
```

**Common errors and solutions:**

| Error | Meaning | Solution |
|-------|---------|----------|
| `401 Unauthorized` | Invalid API key | Generate new key in Resend console |
| `403 Forbidden` | Domain not verified | Use `onboarding@resend.dev` or verify your domain |
| `422 Validation` | Invalid email format | Check recipient email is valid |
| `429 Rate Limit` | Too many requests | Wait or upgrade Resend plan |

### 4. Test Locally First

Update your local `.env`:

```bash
# Use your PRODUCTION Resend key
RESEND_API_KEY=re_YourProductionKey
EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

Run locally:
```bash
bun dev
```

Create an evaluator and check:
1. Terminal logs for error messages
2. Browser Network tab for API response
3. Resend dashboard for email status

### 5. Use the New Credentials Dialog

After deploying the latest code, when you create an evaluator:

1. A dialog will appear showing:
   - ✅ Email sent successfully
   - OR ❌ Email failed with **exact error message**
   - The credentials to copy manually

2. The dialog includes a link to check Resend dashboard

This helps you see exactly what's happening in production.

## Common Root Causes

### 1. API Key Not Set in Vercel (Most Common)

**Symptom:** No emails appear in Resend dashboard

**Solution:**
```bash
# In Vercel dashboard
Settings → Environment Variables → Add:
RESEND_API_KEY=re_YourKey
EMAIL_FROM_ADDRESS=onboarding@resend.dev

# Then redeploy
```

### 2. Using Expired/Test API Key

**Symptom:** Local tests work, production fails

**Solution:**
- Go to https://resend.com/api-keys
- Delete old keys
- Generate new "Production" key
- Update Vercel env

### 3. Emails Going to Spam

**Symptom:** Emails appear as "Delivered" in Resend but recipient doesn't see them

**Solution:**
- Check recipient's spam/junk folder
- Resend test domain (`onboarding@resend.dev`) often goes to spam
- For production, verify your own domain

### 4. Domain Not Verified

**Symptom:** Error: "Domain not verified" or "403 Forbidden"

**Solution:**
- Use `EMAIL_FROM_ADDRESS=onboarding@resend.dev` (works immediately)
- OR verify your domain at https://resend.com/domains

### 5. Rate Limits (Free Plan)

**Symptom:** Works for first few emails, then fails

**Solution:**
- Resend free plan: 100 emails/day, 3,000/month
- Check limits at https://resend.com/pricing
- Upgrade if needed

## Quick Checklist

- [ ] API key is active in https://resend.com/api-keys
- [ ] `RESEND_API_KEY` set in Vercel environment variables
- [ ] `EMAIL_FROM_ADDRESS=onboarding@resend.dev` in Vercel
- [ ] Redeployed after setting environment variables
- [ ] Created test evaluator on production
- [ ] Checked https://resend.com/emails for logs
- [ ] Checked Vercel logs for error messages
- [ ] Checked recipient's spam folder
- [ ] Not hitting rate limits (100/day on free plan)

## Still Not Working?

### Generate Fresh API Key

1. Go to https://resend.com/api-keys
2. Delete ALL existing keys
3. Click "Create API Key"
4. Name: "Production"
5. Permission: "Full Access"
6. Domain: "All domains"
7. Copy the key
8. Update Vercel: Settings → Environment Variables → Edit `RESEND_API_KEY`
9. Redeploy your app
10. Test again

### Verify Account Status

Go to https://resend.com/settings

Check:
- Account is verified (not pending verification)
- No billing issues
- No service outages

### Test with Resend's Test Email

In Resend dashboard, try their built-in email test:
1. Go to https://resend.com/emails
2. Click "Send Test Email"
3. Send to `delivered@resend.dev`
4. If this fails, your Resend account has issues

### Contact Resend Support

If everything above fails:
1. Go to https://resend.com/support
2. Provide:
   - Your API key prefix (e.g., `re_DW5h6o...`)
   - Error messages from Vercel logs
   - Screenshots of Resend dashboard

## What the New Code Does

The latest deployment adds:

1. **Credentials Dialog** - Shows you:
   - If email was sent successfully
   - The exact error if it failed
   - Credentials to copy manually
   - Link to check Resend dashboard

2. **Better Error Logging** - In Vercel logs you'll see:
   - Exact error message from Resend
   - Status code (401, 403, 422, etc.)
   - Which email address it tried to send from/to

3. **Clipboard Copy** - One-click copy credentials to share manually

This makes it much easier to debug production issues!
