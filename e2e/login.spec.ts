import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display the login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check page elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    
    // Check for Google sign in button
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    
    // Check for email and password inputs
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    
    // Check for submit button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should navigate back to home when clicking logo', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('CryptX').click();
    await expect(page).toHaveURL('/');
  });

  test('should show email validation for invalid email', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in/i }).last();
    
    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    await submitButton.click();
    
    // HTML5 validation should prevent submission
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    // Login form should still be visible and usable
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
