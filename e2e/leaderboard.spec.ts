import { test, expect } from '@playwright/test';
import adminHelper from './helpers/adminHelper';

const SUPERADMIN = {
  uid: '87w0Ehi2ipSKAK0O9C4dbCJheoJ3',
  email: 'warunaudarasam2003@gmail.com',
  displayName: 'Waruna Udara',
};

test.describe('Leaderboard', () => {
  test.beforeAll(async () => {
    await adminHelper.ensureTestUser({
      uid: SUPERADMIN.uid,
      email: SUPERADMIN.email,
      displayName: SUPERADMIN.displayName,
      role: 'superadmin',
      competitionIds: [],
    });
  });

  test('admin can access leaderboard page', async ({ page, context }) => {
    const { sessionCookie, expires } = await adminHelper.createSessionCookieFor(SUPERADMIN.uid);

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

    await page.goto('/admin/leaderboard');
    
    // Should load the leaderboard page
    await expect(page.getByRole('heading', { name: /leaderboard/i })).toBeVisible();
  });
});