# CryptX Judging Platform - Project Memory

> **Purpose**: Single source of truth for AI agent sessions. Contains key decisions, rules, and context that must persist across sessions.

---

## Project Overview

**Name**: CryptX Judging Platform  
**Type**: Multi-competition hackathon judging and evaluation platform  
**Stack**: Next.js 16.2.1 (Turbopack) + Firebase (Spark plan) + Vercel  
**Repository**: https://github.com/WarunaUdara/judging-platform.git

---

## Critical Constraints

### Firebase Spark Plan (Free Tier)
- **NO Cloud Functions** - All server logic runs in Next.js API routes
- **NO Firebase Extensions** - Must implement everything manually
- Direct Firebase connection (no emulators in production)
- Firestore + Realtime Database + Authentication only

### Deployment
- **Platform**: Vercel
- **Local URL**: http://localhost:3000
- **Environment**: `.env` file (never commit to git)

---

## Design System - STRICT RULES

### Color Palette (Monochrome ONLY)
```
Background:     #000000 (pure black)
Foreground:     #FFFFFF (pure white)
Card:           #0A0A0A
Border:         #333333
Muted Text:     #A1A1AA
Silver:         #C0C0C0
Silver Muted:   #71717A

CTA Button:     #8B5CF6 (vibrant purple)
CTA Hover:      #7C3AED
```

### Shape Rules
- **NO rounded corners** - All corners must be square (border-radius: 0)
- **Sharp edges** - Box-shaped theme with line borders
- **Minimal UI** - Inspired by Next.js official website

### Typography
- Headings: Pure white (#FFFFFF), font-weight: 600
- Body: Light grey (#A1A1AA)
- Font: Inter (variable font)

### Button Variants
| Variant | Background | Border | Text |
|---------|------------|--------|------|
| default | white | white | black |
| secondary | #171717 | #333333 | white |
| outline | transparent | #333333 | white |
| ghost | transparent | transparent | white |
| destructive | transparent | #ff4444 | #ff4444 |
| cta | #8B5CF6 | #8B5CF6 | white |

### Responsive Design
- Must be fully responsive to mobile devices
- 3-column grid on desktop, single column on mobile
- Container max-width: 1200px

---

## Git Workflow

### Commit Strategy
- **Push every small modular change** to increase commit count
- Use conventional commit messages:
  - `feat:` new feature
  - `fix:` bug fix
  - `style:` UI/styling changes
  - `refactor:` code refactoring
  - `test:` adding tests
  - `docs:` documentation

### Branch
- Main branch: `main`
- Push directly to main for this project

---

## Package Manager

**Use Bun exclusively** (not npm or yarn)
```bash
bun install          # Install dependencies
bun run dev          # Start dev server
bun run build        # Build for production
bun run test:e2e     # Run Playwright tests
bunx <package>       # Run package binaries
```

---

## Architecture

### Directory Structure
```
/app
  /api              # Next.js API routes (server-side logic)
    /auth           # Authentication endpoints
    /competitions   # Competition CRUD
    /teams          # Team management
    /scores         # Scoring endpoints
    /invite         # Invitation system
  /admin            # Admin dashboard pages
  /judge            # Evaluator pages
  /login            # Authentication page
  /invite/[token]   # Invitation acceptance

/components
  /ui               # Reusable UI components (button, input, card, etc.)
  auth-provider.tsx # Auth context provider

/lib
  /firebase         # Firebase client and admin SDK
  /types            # TypeScript types
  /utils            # Utility functions
```

### User Roles
1. **superadmin** - Full platform access
2. **organizer** - Manage specific competitions
3. **evaluator** - Score teams in assigned competitions

### Authentication Flow
1. User signs in via Google or Email/Password
2. Firebase returns ID token
3. Client sends ID token to `/api/auth/session`
4. Server creates session cookie (14 days)
5. Middleware checks session cookie for protected routes

---

## Firebase Configuration

### Collections (Firestore)
- `competitions` - Competition data
- `teams` - Team information
- `scores` - Evaluation scores
- `invitations` - Evaluator invitations

### Realtime Database
- `/leaderboards/{competitionId}` - Live leaderboard data

### Security Rules
- Role-based access control via custom claims
- Evaluators can only access assigned competitions

---

## Testing

### E2E Tests (Playwright)
```bash
bun run test:e2e        # Run all tests
bun run test:e2e:ui     # Interactive UI mode
bun run test:e2e:report # View test report
```

### Test Files
- `e2e/landing.spec.ts` - Landing page tests
- `e2e/login.spec.ts` - Login functionality
- `e2e/navigation.spec.ts` - Route protection
- `e2e/visual.spec.ts` - Design compliance

---

## Known Issues & Solutions

### Firebase Emulator Connections
- **Issue**: Client tried connecting to emulators in development
- **Solution**: Removed emulator connections from `lib/firebase/client.ts`

### Tailwind v4 Syntax
- **Issue**: Using deprecated `@tailwind` directives
- **Solution**: Use `@import "tailwindcss"` and `@theme` block in globals.css

### AuthProvider
- **Issue**: Root layout missing auth context
- **Solution**: Wrap children with `<AuthProvider>` in `app/layout.tsx`

---

## Environment Variables

```env
# Firebase Client (NEXT_PUBLIC_ prefix = exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=

# Firebase Admin (server-side only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Development Device

- **Test Device**: Google Pixel 7 Pro (ADB ID: 36121FDH3001MJ)
- **Editor**: VSCode (no Android Studio)
- **Platform**: macOS arm64 (Apple Silicon)

---

## Code Style

- No emojis in code, comments, or commit messages
- No unnecessary blank lines
- Explicit types (no `var`/`dynamic`)
- Early returns over deep nesting
- Comments explain *why*, not *what*

---

## Security Defaults

- Never hardcode secrets, passwords, or API keys
- Use parameterized queries (no string interpolation for SQL)
- Never include error.message or stack traces in HTTP responses
- Use `flutter_secure_storage` for sensitive data (if Flutter)

---

## Quick Reference Commands

```bash
# Development
bun run dev

# Build
bun run build

# Testing
bun run test:e2e

# Git
git add . && git commit -m "type: description" && git push origin main
```

---

## Session Handoff Checklist

When starting a new session, the AI should:
1. Read this PROJECT_MEMORY.md file first
2. Check `git status` for uncommitted changes
3. Run `bun run build` to verify no errors
4. Run `bun run test:e2e` to verify tests pass
5. Review recent commits with `git log -5 --oneline`

---

*Last Updated: Session Date - Production Readiness Phase*
