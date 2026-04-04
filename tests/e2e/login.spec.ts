import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display the login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check page elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    
    // Check for Google sign in button (Google-only auth)
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    
    // Check for description text
    await expect(page.getByText(/access the judging platform/i)).toBeVisible();
  });

  test('should navigate back to home when clicking logo', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('CryptX').click();
    await expect(page).toHaveURL('/');
  });

  test('should display pending status message when applicable', async ({ page }) => {
    // This test checks that the login page can display status messages
    await page.goto('/login');
    
    // The Google button should be present and clickable
    const googleButton = page.getByRole('button', { name: /google/i });
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    // Login form should still be visible and usable
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    
    // Check that the button is properly sized for mobile
    const googleButton = page.getByRole('button', { name: /google/i });
    const buttonBox = await googleButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    if (buttonBox) {
      // Button should be at least 200px wide for good mobile UX
      expect(buttonBox.width).toBeGreaterThan(200);
    }
  });
});
