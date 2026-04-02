# CryptX MVP Quick Start Guide

## Prerequisites
- Bun installed
- Firebase project created (or use emulators)
- Environment variables configured in `.env`

## Step 1: Install Dependencies
```bash
bun install
```

## Step 2: Configure Firebase

### Option A: Use Firebase Emulators (Recommended for Testing)
```bash
# Start emulators
bun firebase emulators:start
```

### Option B: Use Production Firebase
Make sure your `.env` has all Firebase credentials set.

## Step 3: Seed Test Data
```bash
bun run scripts/mvp-seed.ts
```

This creates:
- 1 Admin account
- 3 Evaluator accounts
- 1 Competition (CryptX 2.0 Hackathon) with 8 criteria
- 5 Teams ready for evaluation

## Step 4: Deploy Firestore Rules
```bash
# Install firebase-tools if not installed
bun add -D firebase-tools

# Deploy rules
bunx firebase deploy --only firestore:rules
```

## Step 5: Start Development Server
```bash
bun dev
```

## Step 6: Test the Platform

### Login Credentials

**Admin:**
- Email: `admin@cryptx.lk`
- Password: `Admin123!`
- URL: http://localhost:3000/admin

**Evaluators:**
- Email: `judge1@cryptx.lk`, `judge2@cryptx.lk`, `judge3@cryptx.lk`
- Password: `Judge123!`
- URL: http://localhost:3000/judge/dashboard

## Step 7: Run E2E Tests
```bash
# Run all tests
bun test:e2e

# Run tests with UI
bun test:e2e:ui

# View test report
bun test:e2e:report
```

## Complete User Flows to Test

### As Admin:
1. Login at `/login`
2. View dashboard at `/admin`
3. Click on "CryptX 2.0 Hackathon"
4. Navigate through tabs:
   - **Overview**: See competition details
   - **Criteria**: View 8 evaluation criteria (weights sum to 100%)
   - **Teams**: See 5 teams
   - **Evaluators**: See 3 judges
   - **Leaderboard**: View real-time rankings
5. Export scores: Click "Export Scores" button
6. Export leaderboard: Click "Export Leaderboard" button

### As Evaluator:
1. Login at `/login`
2. View dashboard at `/judge/dashboard`
3. See 5 teams in "Not Started" status
4. Click on "CodeCrafters" team
5. Fill in scores for all 8 criteria (0-10 scale)
6. Add remarks for each criterion
7. See live preview of total weighted score
8. Click "Submit Score"
9. Confirm submission
10. Return to dashboard - team now shows "Submitted"
11. View leaderboard at `/judge/leaderboard`

### Real-Time Leaderboard Test:
1. Open two browser windows
2. Window 1: Login as admin, go to leaderboard
3. Window 2: Login as judge2, score a team
4. Window 1: Watch leaderboard update automatically (no refresh needed)

## Testing Scorecard Matrix

1. Login as admin
2. Go to competition detail page
3. Click "Scorecards" tab
4. See matrix:
   - Rows = Teams
   - Columns = Evaluators
   - Cells = Scoring status (○ not started, ◐ draft, ● submitted)

## Troubleshooting

### "Missing or insufficient permissions" error

**Cause**: Firestore rules not deployed or custom claims not set

**Fix**:
```bash
# Deploy rules
bunx firebase deploy --only firestore:rules

# Re-run seed script to set custom claims
bun run scripts/mvp-seed.ts
```

### User logged in but sees blank page

**Cause**: Custom claims not refreshed in browser

**Fix**:
1. Logout
2. Close all browser tabs
3. Login again

### Leaderboard not updating

**Cause**: Realtime Database rules or connection issue

**Fix**:
```bash
# Deploy database rules
bunx firebase deploy --only database
```

Check browser console for websocket errors.

### Tests failing

**Cause**: Seed data not created or wrong URL

**Fix**:
```bash
# Make sure seed data exists
bun run scripts/mvp-seed.ts

# Set correct BASE_URL in e2e/mvp-flow.spec.ts
# Or set environment variable:
BASE_URL=http://localhost:3000 bun test:e2e
```

## API Endpoints Reference

All API routes require authentication (session cookie).

### Authentication
- `POST /api/auth/session` - Login (exchange ID token for session cookie)
- `DELETE /api/auth/session` - Logout
- `POST /api/auth/set-claims` - Set custom claims (admin only)

### Competitions
- `POST /api/competitions` - Create competition (admin)
- `PATCH /api/competitions/[id]/status` - Update status (admin)
- `GET /api/competitions/[id]/export/scores` - Export scores CSV (admin)
- `GET /api/competitions/[id]/export/leaderboard` - Export leaderboard CSV (admin)

### Teams
- `POST /api/teams/import` - Bulk import teams (admin)

### Invitations
- `POST /api/invitations/create` - Create invite link (admin)
- `POST /api/invite/accept` - Accept invitation (any authenticated user)

### Scores
- `POST /api/scores/save` - Save draft score (evaluator)
- `POST /api/scores/submit` - Submit final score (evaluator)

### Email
- `POST /api/email/send-invite` - Send invite email via Resend (admin)

## Production Deployment Checklist

- [ ] Create Firebase production project
- [ ] Deploy Firestore security rules
- [ ] Deploy Firestore indexes
- [ ] Deploy Realtime Database rules
- [ ] Set all environment variables in Vercel
- [ ] Add Resend API key to Vercel secrets
- [ ] Add Firebase service account JSON to Vercel
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Run seed script on production: `bun run scripts/mvp-seed.ts`
- [ ] Create real admin account
- [ ] Test complete flow end-to-end
- [ ] Monitor Firebase quota usage

## Environment Variables Required

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

NEXT_PUBLIC_RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs (terminal where `bun dev` is running)
3. Verify Firestore rules are deployed
4. Verify custom claims are set (check user doc in Firestore)
5. Clear browser cookies and try again

---

**Ready to use!** All essential MVP features are implemented and tested.
