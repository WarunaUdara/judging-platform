---
name: security-best-practices
description: Comprehensive security hardening for web applications covering HTTPS, input validation, authentication, and OWASP Top 10 vulnerabilities
license: MIT
compatibility: opencode
metadata:
  audience: developers
  security: web-hardening
---

## What I do

Apply security best practices for Next.js/Firebase applications following OWASP Top 10.

## Required Security Rules

### HTTPS & Headers
- Use HTTPS in production (Vercel handles this)
- Add security headers via Next.js configuration

### Input Validation
- Validate all user input in API routes
- Use Zod for schema validation (already in project)

### Rate Limiting
- Add rate limiting to sensitive API routes
- Limit: 100 req/15min general, 5 req/15min auth

### Secret Management
- All secrets in environment variables
- Never hardcode in code
- .env files must be gitignored

### Firebase Security Rules
- Use Firestore security rules for data access
- Validate roles in both client and server

## OWASP Top 10 Checklist

- [x] A01: Broken Access Control - RBAC in auth.ts, Firestore rules
- [x] A02: Cryptographic Failures - HTTPS via Vercel
- [x] A03: Injection - Parameterized Firestore queries (default)
- [ ] A04: Insecure Design - Document in SPEC.md
- [x] A05: Security Misconfiguration - Default configs checked
- [ ] A06: Vulnerable Components - Run npm audit
- [x] A07: Authentication Failures - Firebase Auth + session cookies
- [x] A08: Data Integrity Failures - Firestore rules validate
- [ ] A09: Logging Failures - Add audit logging
- [ ] A10: SSRF - Validate all external URLs

## Implementation for This Project

### Add Rate Limiting to API Routes
```typescript
// For sensitive routes like /api/auth/*
```

### Environment Variables Check
Ensure all required env vars are set:
- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_CLIENT_EMAIL  
- FIREBASE_ADMIN_PRIVATE_KEY
- NEXT_PUBLIC_FIREBASE_* (public)

### Firebase Rules
Current rules check:
- Role from Firestore document
- Competition ID access control
- User-specific data access

## Prohibited Items

- Never use eval() in code
- Never use direct innerHTML (use textContent)
- Never commit secrets or .env files
- Never disable security headers