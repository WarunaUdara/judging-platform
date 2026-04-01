import { test, expect } from '@playwright/test';

/**
 * End-to-End Test for CryptX Judging Platform MVP
 * Tests the complete flow: Admin creates competition → Evaluator scores teams → Leaderboard updates
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test credentials (created by mvp-seed.ts)
const ADMIN_EMAIL = 'admin@cryptx.lk';
const ADMIN_PASSWORD = 'Admin123!';
const JUDGE_EMAIL = 'judge1@cryptx.lk';
const JUDGE_PASSWORD = 'Judge123!';

test.describe('CryptX MVP End-to-End Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for Firebase operations
    test.setTimeout(60000);
  });

  test('Admin can login and view competition', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Login with email/password
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/);
    
    // Should see competition
    await expect(page.locator('text=CryptX 2.0 Hackathon')).toBeVisible();
  });

  test('Evaluator can login and see teams', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Login as evaluator
    await page.fill('input[type="email"]', JUDGE_EMAIL);
    await page.fill('input[type="password"]', JUDGE_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Should redirect to judge dashboard
    await expect(page).toHaveURL(/\/judge\/dashboard/);
    
    // Should see teams
    await expect(page.locator('text=CodeCrafters')).toBeVisible();
    await expect(page.locator('text=HealthTech Innovators')).toBeVisible();
  });

  test('Evaluator can score a team', async ({ page }) => {
    // Login as evaluator
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', JUDGE_EMAIL);
    await page.fill('input[type="password"]', JUDGE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/judge\/dashboard/);
    
    // Click on first team
    await page.click('text=CodeCrafters');
    
    // Should be on scoring page
    await expect(page).toHaveURL(/\/judge\/teams\/.+/);
    
    // Fill in scores for each criterion (8 criteria)
    const scores = [8, 9, 7, 8, 7, 9, 8, 8]; // Out of 10
    
    for (let i = 0; i < scores.length; i++) {
      const scoreInput = page.locator(`input[type="number"]`).nth(i);
      await scoreInput.fill(scores[i].toString());
    }
    
    // Add a remark
    await page.fill('textarea', 'Excellent project with strong technical implementation');
    
    // Submit score
    await page.click('text=Submit Score');
    
    // Confirm submission
    await page.click('text=Confirm');
    
    // Should see success message
    await expect(page.locator('text=Score submitted successfully')).toBeVisible();
    
    // Should redirect back to dashboard
    await page.waitForURL(/\/judge\/dashboard/);
    
    // Team card should show "Submitted" status
    await expect(page.locator('text=Submitted')).toBeVisible();
  });

  test('Admin can view scorecards matrix', async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
    
    // Navigate to competition
    await page.click('text=CryptX 2.0 Hackathon');
    
    // Click Scorecards tab
    await page.click('text=Scorecards');
    
    // Should see matrix view
    await expect(page.locator('text=CodeCrafters')).toBeVisible();
    await expect(page.locator('text=Judge One')).toBeVisible();
  });

  test('Leaderboard updates in real-time', async ({ page, context }) => {
    // Open two pages: Admin viewing leaderboard + Evaluator scoring
    const adminPage = await context.newPage();
    const evaluatorPage = page;
    
    // Admin: Login and go to leaderboard
    await adminPage.goto(`${BASE_URL}/login`);
    await adminPage.fill('input[type="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[type="password"]', ADMIN_PASSWORD);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL(/\/admin/);
    await adminPage.click('text=CryptX 2.0 Hackathon');
    await adminPage.click('text=Leaderboard');
    
    // Evaluator: Login
    await evaluatorPage.goto(`${BASE_URL}/login`);
    await evaluatorPage.fill('input[type="email"]', 'judge2@cryptx.lk');
    await evaluatorPage.fill('input[type="password"]', JUDGE_PASSWORD);
    await evaluatorPage.click('button[type="submit"]');
    await evaluatorPage.waitForURL(/\/judge\/dashboard/);
    
    // Evaluator: Score a team
    await evaluatorPage.click('text=HealthTech Innovators');
    await evaluatorPage.waitForURL(/\/judge\/teams\/.+/);
    
    // Fill scores
    const scores = [9, 8, 8, 9, 7, 8, 9, 8];
    for (let i = 0; i < scores.length; i++) {
      await evaluatorPage.locator(`input[type="number"]`).nth(i).fill(scores[i].toString());
    }
    
    // Submit
    await evaluatorPage.click('text=Submit Score');
    await evaluatorPage.click('text=Confirm');
    
    // Wait for submission
    await evaluatorPage.waitForTimeout(2000);
    
    // Admin leaderboard should update automatically
    await adminPage.waitForTimeout(3000); // Wait for realtime update
    await expect(adminPage.locator('text=HealthTech Innovators')).toBeVisible();
  });

  test('Admin can export scores', async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
    
    // Navigate to competition
    await page.click('text=CryptX 2.0 Hackathon');
    
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export Scores');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('scores');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('Admin can export leaderboard', async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
    
    // Navigate to competition leaderboard
    await page.click('text=CryptX 2.0 Hackathon');
    await page.click('text=Leaderboard');
    
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export Leaderboard');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('leaderboard');
    expect(download.suggestedFilename()).toContain('.csv');
  });
});

test.describe('Authentication & Authorization', () => {
  test('Unauthenticated user redirects to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('Evaluator cannot access admin panel', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', JUDGE_EMAIL);
    await page.fill('input[type="password"]', JUDGE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/judge\/dashboard/);
    
    // Try to access admin
    await page.goto(`${BASE_URL}/admin`);
    
    // Should be redirected or see error
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain('/admin');
  });
});
