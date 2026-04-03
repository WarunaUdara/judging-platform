# Email Configuration Guide

## Current Setup

Your Resend integration is **working correctly**! The test script confirms emails are being sent.

## Why Emails Might Not Be Received

Even though Resend is sending emails successfully, recipients might not receive them because:

### 1. **Gmail Blocking** (Most Likely Issue)
- Gmail blocks emails sent "from" Gmail addresses via third-party services
- Your `EMAIL_FROM_ADDRESS=warunaudarasam2003@gmail.com` will be **rejected by Gmail**
- Solution: Use a different email or domain

### 2. **Spam Folder**
- Check recipient's spam/junk folder
- Test domain emails (`onboarding@resend.dev`) often go to spam

### 3. **Test Environment**
- Resend free tier may have delivery restrictions

## Recommended Solutions

### Option 1: Use Resend Test Domain (Immediate Fix)
**Best for testing and MVP**

1. Update `.env`:
```bash
# Remove or comment out EMAIL_FROM_ADDRESS
# EMAIL_FROM_ADDRESS=warunaudarasam2003@gmail.com

# Or explicitly set to test domain
EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

2. Restart your dev server
3. Emails will send from `onboarding@resend.dev`
4. **Note**: May go to spam, but will be delivered

### Option 2: Verify Your Own Domain (Production Ready)
**Best for production deployment**

If you own a domain (e.g., `yourdomain.com` or `cryptx.com`):

1. **Add Domain in Resend**
   - Go to https://resend.com/domains
   - Click "Add Domain"
   - Enter your domain

2. **Add DNS Records**
   Resend will provide DNS records like:
   ```
   Type: TXT
   Name: _resend
   Value: [provided by Resend]
   ```
   Add these in your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)

3. **Wait for Verification**
   - Usually takes 5-30 minutes
   - Resend will show "Verified" status

4. **Update .env**
   ```bash
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   ```

### Option 3: Use a Free Temporary Domain
**For testing without own domain**

Services like **Vercel** give you free domains:
1. Deploy to Vercel (e.g., `cryptx-judging.vercel.app`)
2. Use that domain with Resend
3. Set `EMAIL_FROM_ADDRESS=noreply@cryptx-judging.vercel.app`

### Option 4: Keep Gmail but Accept Limitations
**Current setup works for non-Gmail recipients**

Your current setup will work for sending to:
- ✅ Non-Gmail addresses (Outlook, Yahoo, custom domains)
- ❌ Gmail addresses (will be blocked)

## Testing Email Delivery

### Test with Different Recipients
```bash
# Run the test script
bun scripts/test-resend-email.ts
```

### Check Resend Dashboard
1. Go to https://resend.com/emails
2. See all sent emails and their delivery status
3. Check for bounces or failures

### Test in App
1. Start dev server: `bun dev`
2. Create an evaluator with a **non-Gmail** test email
3. Check that email's inbox (and spam folder)

## Current Configuration Status

- ✅ Resend API Key: Working
- ⚠️  Email From Address: `warunaudarasam2003@gmail.com` (may be blocked by Gmail)
- ✅ Email Template: Professional HTML design
- ✅ Email Sending Logic: Correct implementation

## Quick Fix (Recommended for Now)

Update your `.env` file:

```bash
# Use Resend test domain (works immediately)
EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

Then restart your dev server:
```bash
# Stop current server (Ctrl+C)
bun dev
```

This will work immediately and deliver emails (check spam folder).

## Production Checklist

Before going to production:
- [ ] Verify your own domain in Resend
- [ ] Update `EMAIL_FROM_ADDRESS` to your verified domain
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production URL
- [ ] Test email delivery to Gmail, Outlook, Yahoo
- [ ] Check spam score using mail-tester.com
- [ ] Monitor Resend dashboard for bounces

---

**Need Help?** 
- Resend Docs: https://resend.com/docs
- Resend Support: https://resend.com/support
