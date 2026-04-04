# CryptX Judging Platform

An open-source hackathon judging platform built with Next.js 16 and Supabase.

## Features

- Multi-competition support with configurable scoring criteria
- Weighted criterion scoring
- Role-based access control (superadmin, organizer, evaluator, pending)
- Invitation-based onboarding
- Live leaderboard support via Supabase-backed cache and realtime subscriptions
- Event timer pages

## Tech Stack

- Frontend: Next.js 16 (App Router), TypeScript, Tailwind CSS
- Backend: Supabase (Postgres, Auth, Realtime)
- Hosting: Vercel-compatible

## Quick Start

### Prerequisites

- Node.js 20+ or Bun
- Supabase project

### 1) Install dependencies

```bash
bun install
```

### 2) Configure environment

```bash
cp .env.local.example .env.local
```

Required values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3) Apply database migration

Apply SQL files in `supabase/migrations/` to your Supabase project.

### 4) Run development server

```bash
bun run dev
```

## Migration Status

Firebase dependencies and Firebase configuration files have been removed from the runtime.

Some app screens and API routes are temporarily stubbed while Supabase feature parity is completed.

## Project Structure

```text
app/
components/
lib/
supabase/
tests/
```
