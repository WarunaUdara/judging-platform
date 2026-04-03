# CryptX Judging Platform

A production-ready, open-source hackathon judging platform built with Next.js 16 and Firebase. Supports multiple competitions, team management, weighted scoring criteria, and real-time leaderboards.

## Features

- **Multi-competition support** with configurable team sizes and scoring criteria
- **Weighted criteria-based scoring** (weights must sum to 100%)
- **Pre-configured templates** including CryptX Hackathon (8 criteria)
- **CSV/JSON team imports** with validation
- **Real-time leaderboard** via Firebase Realtime Database
- **Role-based access control** (Superadmin, Organizer, Evaluator)
- **Draft score saving** (configurable per competition)
- **Audit logging** for all administrative actions
- **Event timer** with fullscreen display for hackathon countdowns
- **PWA support** with offline capabilities

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Realtime Database, Auth) on Spark (free) plan
- **Hosting**: Vercel (serverless API routes)
- **Forms**: react-hook-form + zod
- **State**: React Context + SWR

## Quick Start

### Prerequisites

- Node.js 20+ (or Bun)
- Firebase project (free Spark plan works)
- Vercel account (free tier)

### 1. Clone and Install

```bash
git clone https://github.com/your-org/cryptx-judging-platform.git
cd cryptx-judging-platform
bun install  # or npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (disable Analytics for simplicity)
3. Enable services:
   - **Authentication**: Email/Password + Google provider
   - **Firestore**: Production mode
   - **Realtime Database**: Locked mode
4. Register a web app and copy the config
5. Generate service account key: Project Settings -> Service Accounts -> Generate new private key

### 3. Environment Configuration

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase credentials:
- Client SDK keys (NEXT_PUBLIC_*)
- Admin SDK keys (FIREBASE_ADMIN_*)
- App URL

### 4. Deploy Firebase Rules

```bash
firebase login
firebase init  # Select Firestore and Realtime Database
firebase deploy --only firestore:rules,database
```

### 5. Create Superadmin

```bash
# Start dev server
bun run dev

# Visit http://localhost:3000/login and sign in with Google

# Run superadmin script
SEED_SUPERADMIN_EMAIL=your-email@example.com bun scripts/seed-database.ts
```

### 6. Run Development Server

```bash
bun run dev
```

Visit http://localhost:3000

## Production Deployment (Vercel)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Add your Vercel domain to Firebase Auth authorized domains

## Admin Workflow

### Creating Evaluators

1. Go to Admin -> Evaluators
2. Click "Create Evaluator"
3. Fill in name, email, password
4. Select competitions to assign
5. Copy the credentials shown in the dialog
6. Manually set up the evaluator's device with these credentials

### Managing Teams

1. Go to Admin -> Teams
2. Import teams via CSV or add manually
3. Assign teams to competitions

### Running a Competition

1. Create competition with scoring criteria (must sum to 100%)
2. Add teams and evaluators
3. Set status to "Active" or "Scoring"
4. Evaluators score teams
5. View real-time leaderboard
6. Export results when complete

## Scoring System

```
Weighted Score = Sum of (score / maxScore * weight) for each criterion
Team Final Score = Average of all evaluator weighted scores
Rank = Sorted by final score (descending)
```

Note: Criteria weights must total 100%, but individual criterion max scores can vary.

## API Routes

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/session` | POST | Public | Create session |
| `/api/auth/set-claims` | POST | Superadmin | Set custom claims |
| `/api/evaluators/create` | POST | Admin | Create evaluator |
| `/api/competitions` | POST | Admin | Create competition |
| `/api/competitions/[id]/status` | PATCH | Admin | Update status |
| `/api/teams/import` | POST | Admin | Import teams |
| `/api/scores/submit` | POST | Evaluator | Submit scores |
| `/api/scores/save` | POST | Evaluator | Save draft |

## Scripts

```bash
# Seed test data
bun scripts/seed-database.ts

# Clean database (keeps superadmin)
SEED_SUPERADMIN_EMAIL=admin@example.com bun scripts/clean-database.ts

# Update superadmin
bun scripts/update-superadmin.ts
```

## Project Structure

```
app/
├── admin/          # Admin panel pages
├── judge/          # Evaluator panel pages
├── api/            # API routes
├── (timer)/        # Event timer pages
components/
├── ui/             # Reusable UI components
├── timer/          # Timer components
lib/
├── firebase/       # Firebase client & admin SDK
├── hooks/          # Custom React hooks
├── types.ts        # TypeScript types
├── utils/          # Utility functions
```

## Security

- All API routes validate authentication and authorization
- Firestore security rules enforce role-based access
- Environment variables never exposed to client
- No email/password stored in code

## License

MIT License - Free for personal and commercial use.

## Support

Originally built for CryptX (https://cryptx.lk/)

For issues and feature requests, please open a GitHub issue.
