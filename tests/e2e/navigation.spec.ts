import { test, expect } from '@playwright/test';

test.describe('Navigation & Routing', () => {
  test('should redirect unauthenticated users from admin routes', async ({ page }) => {
    // Try to access admin dashboard without authentication
    await page.goto('/admin/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from judge routes', async ({ page }) => {
    // Try to access judge dashboard without authentication
    await page.goto('/judge/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle non-existent routes gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    // Either 404 status or redirected/custom page
    const status = response?.status();
    expect(status).toBeDefined();
    // Next.js may return 200 with custom 404 content or actual 404
    expect([200, 404]).toContain(status);
  });
});
