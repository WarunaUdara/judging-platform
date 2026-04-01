import { test, expect } from '@playwright/test';

test.describe('Visual Design - Monochrome Theme', () => {
  test('should have correct background color (black)', async ({ page }) => {
    await page.goto('/');
    
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });

  test('should have correct text color (white)', async ({ page }) => {
    await page.goto('/');
    
    const body = page.locator('body');
    await expect(body).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('should have sharp edges on buttons (no border-radius)', async ({ page }) => {
    await page.goto('/');
    
    const ctaButton = page.getByRole('button', { name: /Get Started/i });
    const borderRadius = await ctaButton.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    
    // Border radius should be 0 or '0px'
    expect(['0px', '0']).toContain(borderRadius);
  });

  test('should have CTA button with purple background', async ({ page }) => {
    await page.goto('/');
    
    const ctaButton = page.getByRole('button', { name: /Get Started/i });
    await expect(ctaButton).toHaveCSS('background-color', 'rgb(139, 92, 246)');
  });

  test('features section should have 3-column grid on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    
    // Navigate to features section
    const featuresGrid = page.locator('#features .grid');
    await expect(featuresGrid).toHaveCSS('display', 'grid');
    
    const gridTemplateColumns = await featuresGrid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Should have 3 columns (values will be pixel-based)
    const columnCount = gridTemplateColumns.split(' ').length;
    expect(columnCount).toBe(3);
  });

  test('features section should stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const featuresGrid = page.locator('#features .grid');
    const gridTemplateColumns = await featuresGrid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Should have 1 column on mobile
    const columnCount = gridTemplateColumns.split(' ').length;
    expect(columnCount).toBe(1);
  });
});
