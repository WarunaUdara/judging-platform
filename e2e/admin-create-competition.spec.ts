import { test, expect } from '@playwright/test';
import adminHelper from './helpers/adminHelper';

const SUPERADMIN = {
  uid: '87w0Ehi2ipSKAK0O9C4dbCJheoJ3',
  email: 'warunaudarasam2003@gmail.com',
  displayName: 'Waruna Udara',
};

test.describe('Admin - Create Competition', () => {
  test.beforeAll(async () => {
    // Ensure superadmin exists and has proper role
    await adminHelper.ensureTestUser({
      uid: SUPERADMIN.uid,
      email: SUPERADMIN.email,
      displayName: SUPERADMIN.displayName,
      role: 'superadmin',
      competitionIds: [],
    });
  });

  test('superadmin can create a competition', async ({ page, context }) => {
    // Create session cookie for the superadmin and set it in the browser
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

    await page.goto('/admin/competitions/new');

    // Fill basic info
    await page.getByLabel('Competition Name').fill('E2E Test Competition');
    await page.getByLabel('Description').fill('Created by automated E2E test');

    // Submit
    await page.getByRole('button', { name: /create competition/i }).click();

    // Expect to be redirected to competition page
    await expect(page).toHaveURL(/\/admin\/competitions\/[A-Za-z0-9_-]+/);
  });
});
