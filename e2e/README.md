E2E Test Helpers
================

This folder contains Playwright E2E tests and admin helpers used for automated
test setup. The helpers require Firebase Admin credentials to create test users
and mint session cookies.

Before running the E2E tests locally, create a file at `e2e/.env` with the
following variables (do NOT commit this file):

FIREBASE_API_KEY=your-firebase-web-api-key
FIREBASE_ADMIN_PROJECT_ID=your-firebase-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-client-email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

How it works:
- `e2e/helpers/adminHelper.ts` uses the Admin SDK to ensure a test user exists
  and to mint a session cookie that Playwright sets in the browser context.
- The tests then run authenticated flows as that user.

Security:
- Never commit service account keys or API keys. Keep them in a local env file
  or CI secrets.
