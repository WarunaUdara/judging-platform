# CryptX Judging Platform

A full-stack multi-competition hackathon judging and evaluation platform built for CryptX (https://cryptx.lk/), supporting multiple competitions, evaluators, weighted scoring, and real-time leaderboards.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Realtime Database, Auth) on Spark (free) plan
- **Hosting**: Vercel (serverless API routes replace Cloud Functions)
- **Forms**: react-hook-form + zod
- **State**: React Context + SWR
- **CSV/JSON**: papaparse

## Critical Architecture Note

This platform runs entirely on Firebase's **free Spark plan**, which does not include Cloud Functions. All server-side logic (leaderboard recalculation, custom claims management, invite validation) runs in **Next.js API routes** deployed on Vercel.

## Features

- Multi-competition support with configurable team sizes
- Weighted criteria-based scoring (weights must sum to 100%)
- CryptX Hackathon template with 8 pre-configured criteria
- CSV and JSON team imports with validation
- Invite-based evaluator onboarding (manual link sharing)
- Real-time leaderboard via Firebase Realtime Database
- Draft score saving (configurable per competition)
- Role-based access control (superadmin, organizer, evaluator)
- Audit logging for all actions

## Project Status

### ✅ Completed (Core Backend)

- Firebase SDK setup (client + admin)
- Environment configuration
- Security rules (Firestore + Realtime Database)
- Firestore indexes
- Authentication middleware
- TypeScript type definitions
- Scoring utility functions
- Real-time leaderboard hook
- **All core API routes**:
  - Auth (session, set-claims)
  - Invitations (create, accept)
  - Competitions (create, update status)
  - Teams (import)
  - Scores (submit, save) with automatic leaderboard recalculation
- **Scripts**:
  - `scripts/setAdmin.ts` - Bootstrap first superadmin
  - `scripts/seed.ts` - Create competition with criteria template

### 🚧 Pending (Frontend UI)

- Public pages (landing, login, invite acceptance)
- Admin panel (dashboard, competitions, teams, evaluators, scorecards, leaderboard)
- Evaluator panel (dashboard, scoring form, leaderboard)
- UI components and styling

## Quick Start

### 1. Prerequisites

- Node.js 20+ and Bun installed
- Firebase project created (free Spark plan)
- Vercel account (free tier)

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (disable Analytics)
3. Enable services:
   - **Authentication**: Email/Password + Google provider
   - **Firestore**: Production mode, region `asia-south1` (Mumbai)
   - **Realtime Database**: Locked mode, region `asia-southeast1` (Singapore)
4. Register a web app and copy the config
5. Generate service account key: Project Settings → Service Accounts → Generate new private key

### 3. Local Setup

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Firebase credentials
```

### 4. Deploy Firebase Rules

```bash
firebase login
firebase init
firebase deploy --only firestore:rules,firestore:indexes,database
```

### 5. Create Superadmin

```bash
# 1. Start dev server
bun run dev

# 2. Visit http://localhost:3000/login and create account

# 3. Run setAdmin script
bun scripts/setAdmin.ts your-email@example.com cryptx

# 4. Sign out and back in
```

### 6. Seed Competition (Optional)

```bash
bun scripts/seed.ts your-email@example.com
```

### 7. Run with Emulators

```bash
# Terminal 1: Emulators
firebase emulators:start

# Terminal 2: Dev server  
bun run dev
```

## API Routes

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/session` | POST | Public | Create session cookie |
| `/api/auth/set-claims` | POST | Superadmin | Set custom claims |
| `/api/invitations/create` | POST | Admin | Generate invite link |
| `/api/invite/accept` | POST | Auth | Accept invitation |
| `/api/competitions` | POST | Admin | Create competition |
| `/api/competitions/[id]/status` | PATCH | Admin | Update status |
| `/api/teams/import` | POST | Admin | Import teams (CSV/JSON) |
| `/api/scores/submit` | POST | Evaluator | Submit + update leaderboard |
| `/api/scores/save` | POST | Evaluator | Save draft |

## Deployment

1. Push to GitHub
2. Import in Vercel
3. Add all environment variables
4. Add Vercel domain to Firebase authorized domains

## Scoring Algorithm

```
Weighted Score = Σ(score / maxScore * weight)
Team Average = Mean of all evaluator scores
Rank = Sorted by average (descending)
```

## Support

Built for CryptX - https://cryptx.lk/

---

MIT License
