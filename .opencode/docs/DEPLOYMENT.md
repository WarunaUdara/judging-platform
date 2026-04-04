# Deployment Guide - CryptX Judging Platform

## Prerequisites

1. Firebase project created
2. Vercel account connected to GitHub
3. Environment variables configured
4. Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Deploy Firestore Security Rules

```bash
# Login to Firebase
firebase login

# Deploy Firestore and RTDB rules
firebase deploy --only firestore:rules,database
```

## Step 2: Fix Existing User Data (One-time Migration)

Run this script to add missing `orgId` to existing users:

```bash
bun scripts/fix-missing-orgid.ts
```

This will:
- Add `orgId: 'default'` to all user documents in Firestore
- Update custom claims in Firebase Auth

## Step 3: Verify Environment Variables

Ensure these are set in Vercel:

### Firebase Config (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
```

### Firebase Admin SDK (Private)
```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_DATABASE_URL=
```

### Resend (Email)
```
RESEND_API_KEY=
```

### App Config
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

## Step 4: Deploy to Vercel

```bash
# From your GitHub repo, Vercel will auto-deploy
# Or manually:
vercel --prod
```

## Step 5: Verify Deployment

1. **Test Admin Login**
   - Login as superadmin
   - Navigate to Admin > Evaluators
   - Verify evaluators list loads without "Missing permissions" error

2. **Test Judge Login**
   - Login as evaluator
   - Navigate to Judge Dashboard
   - Verify competitions show up
   - Verify teams can be scored

3. **Test Leaderboard**
   - Submit some scores as a judge
   - Navigate to Admin > Leaderboard or Judge > Leaderboard
   - Verify real-time updates work

## Common Issues & Fixes

### Issue: "Missing or insufficient permissions"

**Cause:** Firestore security rules not deployed or custom claims missing

**Fix:**
```bash
firebase deploy --only firestore:rules
bun scripts/fix-missing-orgid.ts
```

### Issue: Judge dashboard shows "No competitions"

**Cause:** User's `competitionIds` array is empty or incorrect

**Fix:**
1. Check Firestore user document
2. Ensure `competitionIds` array contains correct competition ID
3. Re-create evaluator or re-accept invite

### Issue: Evaluators not loading in admin panel

**Cause:** Firestore rules blocking read access to `/competitions/{id}/evaluators`

**Fix:**
- Verify rules allow `isAdminFor(cid) || isEvaluatorFor(cid)` to read evaluators
- Rules were updated in latest commit

## Production Best Practices

1. **Security Rules**
   - Never allow public write access
   - Always validate custom claims in rules
   - Deploy rules before deploying app code

2. **User Management**
   - Always set `orgId` when creating users
   - Always set `competitionIds` array
   - Use migration scripts for bulk updates

3. **Monitoring**
   - Check Firebase Console for quota limits
   - Monitor Vercel logs for errors
   - Set up alerts for failed API calls

4. **Data Backup**
   - Export Firestore data regularly
   - Keep audit logs for compliance
   - Version control all rules files

## Rollback Procedure

If deployment fails:

```bash
# Rollback Firestore rules
firebase deploy --only firestore:rules --version <previous-version>

# Rollback Vercel deployment
vercel rollback
```

## Support

For issues, check:
1. Vercel deployment logs
2. Firebase Console > Firestore Rules playground
3. Browser console for client-side errors
4. API logs in Vercel Functions
