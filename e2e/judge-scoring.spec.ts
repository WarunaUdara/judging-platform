import { test, expect } from '@playwright/test';
import adminHelper from './helpers/adminHelper';

const EVALUATOR = {
  uid: 'evaluator-test-001',
  email: 'evaluator-test@example.com',
  displayName: 'Test Evaluator',
};

test.describe('Evaluator - Scoring Teams', () => {
  test.beforeAll(async () => {
    await adminHelper.ensureTestUser({
      uid: EVALUATOR.uid,
      email: EVALUATOR.email,
      displayName: EVALUATOR.displayName,
      role: 'evaluator',
      competitionIds: ['test-competition-001'],
    });
  });

  test('evaluator can access judge dashboard', async ({ page, context }) => {
    const { sessionCookie, expires } = await adminHelper.createSessionCookieFor(EVALUATOR.uid);

    await context.addCookies([
      {
        name: 'session',
        value: sessionCookie,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        expires,
      },
    ]);

    await page.goto('/judge/dashboard');
    
    // Should load the judge dashboard
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});