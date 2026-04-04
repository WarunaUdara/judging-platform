import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check header
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('header').getByText('CryptX')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    
    // Check hero section
    await expect(page.getByText('Hackathon Judging Platform')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Score. Rank. Decide.' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
    
    // Check features section - use headings for specificity
    await expect(page.getByRole('heading', { name: 'Multi-Competition' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Weighted Scoring' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Live Leaderboard' })).toBeVisible();
    
    // Check tech stack section exists
    await expect(page.locator('text=Built with')).toBeVisible();
    
    // Check footer is in the DOM (scroll to make visible if needed)
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
  });

  test('should navigate to login page when clicking Sign In', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to login page when clicking Get Started', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Get Started/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Header should still be visible
    await expect(page.locator('header')).toBeVisible();
    
    // Hero section should be visible
    await expect(page.getByRole('heading', { name: 'Score. Rank. Decide.' })).toBeVisible();
    
    // CTA button should be visible
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
  });
});
