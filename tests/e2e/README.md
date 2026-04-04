E2E Test Notes
==============

The previous Firebase-based admin helper flow has been removed.

When adding E2E authenticated scenarios for Supabase, prefer one of these:

1. Use a dedicated Supabase test project and seed known users in `auth.users`.
2. Authenticate through the real login flow in Playwright.

Keep secrets in `tests/e2e/.env` and never commit them.
