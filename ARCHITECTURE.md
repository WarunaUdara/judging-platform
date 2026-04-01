# System Architecture & Technical Overview

This document provides a comprehensive overview of the architecture, design patterns, and data flows of the Judging Platform.

## 1. High-Level Overview

The Judging Platform is a web-based application designed to manage hackathons, designathons, and custom competitions. It handles competition lifecycle management, bulk team imports, role-based access control (RBAC), real-time scoring, and live leaderboards.

The application follows a standard modern **Next.js App Router** architecture, leveraging **Firebase** for backend services (Database, Auth, Serverless execution).

## 2. Tech Stack Setup

- **Framework**: Next.js 16.2.1 (App Router, Turbopack, React 18+)
- **Language**: TypeScript throughout both frontend and backend scripts
- **Database**: Firebase Firestore (NoSQL Document Database)
- **Authentication**: Firebase Authentication + Custom Claims
- **Styling**: Tailwind CSS, Radix UI primitives, Lucide React (Icons)
- **Testing**: Playwright (E2E testing)
- **Hosting/Deployment**: Vercel (Next.js App) + Firebase (Rules & Indexes)

## 3. Core Architecture

The system employs a layered architecture separating concerns between the client interface, server-side APIs, and the database tier.

### 3.1. Client Layer (Frontend)

- Utilizes **React Server Components (RSC)** where possible for performance and SEO.
- **Client Components** (`"use client"`) are selectively used for stateful, interactive UIs (e.g., forms, dialogs, dynamic tables).
- **Theming**: A strict dark mode theme is globally enforced via Tailwind (`#0a0a0a` backgrounds, `#333333` borders).

### 3.2. Server Layer (Next.js Backend)

- **API Routes (`app/api/*`)**: REST-like endpoints serving frontend needs. These handle operations that require elevated privileges, like minting custom session cookies, securely parsing CSV files, calculating score weightings, or batch writing to Firestore via the Firebase Admin SDK.
- **Server Actions / Route Handlers**: Securely manage validation, authorization bounds, and data sanitization before interacting with Firestore.

### 3.3. Database Layer (Firebase Firestore)

Data is managed in NoSQL collections. Heavy reliance on client-side Firestore SDKs (`onSnapshot`, `getDocs`, `updateDoc`) allows real-time UI updates (like the Leaderboard), while the `firebase-admin` SDK handles sensitive logic on the server.

## 4. Directory Structure

```text
├── app/                  # Next.js App Router (Pages, Layouts, API routes)
│   ├── admin/            # Admin Dashboard (Competitions, Teams, Evaluators)
│   ├── api/              # Server-side API endpoints (Auth, Scoring, Imports)
│   └── judge/            # Evaluator Dashboard (Scorecards, Team assignments)
├── components/           # Reusable React components (UI library, Auth-provider)
├── e2e/                  # Playwright End-to-End tests
├── lib/                  # Shared utilities, integrations, and definitions
│   ├── firebase/         # Firebase Client & Admin SDK initializations
│   ├── hooks/            # Custom React Hooks (e.g., useLeaderboard)
│   ├── types.ts          # Global TypeScript interfaces & enums
│   └── utils/            # Helper functions (Auth, Styling, Scoring algorithms)
├── public/               # Static assets
└── scripts/              # Maintenance/Admin scripts (DB seeding, Claim setting)
```

## 5. Data Model (Firestore)

The platform structures data into several root-level collections:

- **`users`**: Extended user profiles tied to Firebase Auth UID. Defines `role` (`superadmin`, `organizer`, `evaluator`).
- **`competitions`**: The core resource. Contains settings like team size limits, domains, and `scoringConfig` (visibility, rescoring rules).
- **`teams`**: Projects/Teams participating in a specific competition (`competitionId`).
- **`evaluators`**: Links users with the `evaluator` role to specific competitions and assigns them to certain teams.
- **`scorecards`**: A record mapping an evaluator to a team. Contains specific scores and remarks mapped to criteria.
- **`invitations`**: Short-lived, secure tokens mapping email addresses to targeted roles and competition grants.

## 6. Authentication & Authorization (RBAC)

The app maintains strict access separation between **Admins** and **Judges**.

1. **Firebase Auth**: Users log in via standard Firebase Auth.
2. **Session Cookies & Custom Claims**: For robust server-side rendering, physical session cookies are created (`/api/auth/session`). The platform applies Firebase Custom Claims onto user tokens (`role: 'superadmin' | 'organizer' | 'evaluator'`).
3. **Route Protection**:
   - `lib/utils/auth.ts`: Middleware/functions verify claims. If a Firebase Auth token claim is stale ("pending" vs actual DB value), the Server checks the `users` document directly and mints an updated session.
   - UI bounds gracefully degrade (Evaluators cannot access `/admin`, Admins don't have scoring interfaces).
4. **Firestore Rules**: `firestore.rules` mirror the RBAC logic to prevent direct DB manipulation by malicious actors.

## 7. Key Workflows

### 7.1. Bulk Team Import

1. Admin navigates to `/admin/teams` and uploads a CSV (`dummy_teams.csv`).
2. Client parses CSV. It cross-references existing teams to prevent duplicates.
3. Users can dynamically _Edit_ or _Remove_ items in the import preview window.
4. Client requests `/api/teams/import`.
5. Server chunks the writes using `Admin DB Batch` processing, assigning metadata like `importedAt`.

### 7.2. Evaluation & Scoring

1. **Assignment**: Evaluators are invited and assigned to specific `teamId`s via the admin panel.
2. **Dashboard**: Judges view assigned teams mapped against dynamic UI criteria (e.g., "Impact", "Technical Complexity").
3. **Submission**: Submitting triggers `/api/scores/submit`. The server computes the mathematical weights (Raw Score \* Criterion Weight) and ensures all required categories are filled before committing the `Scorecard` document and sealing it (if `allowRescoring` is falsely configured).

### 7.3. Real-Time Leaderboard

1. Uses a `useLeaderboard` generic React Hook.
2. Queries `Scorecards` and caches the aggregated `averageWeightedScore` and `rank` natively.
3. Automatically re-ranks and triggers framer-motion/CSS transitions when underlying Firestore hooks hear a new score event. Controls exist in `scoringConfig` to blank out the leaderboard from participants until the competition is officially `closed`.
