---
name: nextjs-frontend
description: Next.js 16 frontend development conventions, component patterns, and TypeScript best practices for this project
license: MIT
compatibility: opencode
metadata:
  audience: frontend-developers
  framework: nextjs
---

## What I do

Provide Next.js 16 frontend development guidance specific to this project.

## Project Structure

```
app/
├── api/           # API routes (server-side)
├── admin/         # Admin panel pages
├── judge/         # Judge/evaluator panel pages
├── login/         # Authentication
├── invite/        # Invitation acceptance
components/
├── ui/            # shadcn/ui components
├── auth-provider.tsx
├── error-boundary.tsx
lib/
├── firebase/      # Firebase client & admin SDK
├── hooks/         # Custom React hooks
├── types.ts       # TypeScript type definitions
├── utils/         # Utility functions
```

## Component Conventions

- Use `'use client'` for client-side components
- Follow existing patterns in `app/admin/layout.tsx`
- Use `useAuth` hook for authentication
- Use Firebase client SDK for read operations
- Use API routes for write operations (they use admin SDK)

## TypeScript

- Use types from `lib/types.ts`
- Avoid `any` - prefer proper types
- Use proper TypeScript strict mode

## Styling

- Use Tailwind CSS (matching project style)
- Use shadcn/ui components (`Button`, `Card`, `Input`)
- Follow monochrome theme (black background, white text)

## State Management

- Use `useState` for local state
- Use `useEffect` for side effects
- Use React Query patterns via API routes

## Error Handling

- Use `ErrorBoundary` component from `components/error-boundary.tsx`
- Show loading states
- Handle permission errors gracefully