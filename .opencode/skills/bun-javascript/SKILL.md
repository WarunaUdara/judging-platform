---
name: bun-javascript
description: Bun runtime best practices for CryptX Judging Platform - package management, scripting, and tooling
license: MIT
compatibility: opencode
metadata:
  audience: developers
  runtime: bun
---

## What I do

Provide Bun-specific guidance for this project.

## Project Commands

```bash
# Development
bun run dev           # Start Next.js dev server
bun run build         # Production build
bun run lint          # Run linter
bunx tsc --noEmit     # Type check

# Testing
bunx playwright test  # Run e2e tests

# Firebase
bun run firestore:deploy  # Deploy rules (if firebase-tools available)
```

## Bun vs npm Differences

- Use `bun` instead of `npm` for all commands
- Use `bunx` instead of `npx` for one-off scripts
- Bun uses `bun.lockb` (binary lockfile) - commit it
- Install: `bun add <package>` not `npm install`
- Dev install: `bun add -d <package>` not `npm install -D`

## Bun Scripts in package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## Common Issues

- Bun has stricter TSX handling than Node
- Some Node-specific packages may not work
- Use `bun install` for fastest installs