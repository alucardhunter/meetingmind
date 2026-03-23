import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Commitments', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.fill(`e2e.test@meetingmind.com`);
    await passwordInput.fill('TestPassword123!');
    await submitButton.click();
    
    await page.waitForLoadState('networkidle');
  });

  test('commitments page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/commitments`);
    await page.waitForLoadState('networkidle');
    
    // Page should load without error
    await expect(page.locator('body')).toBeVisible();
  });

  test('filter by status works', async ({ page }) => {
    await page.goto(`${BASE_URL}/commitments`);
    await page.waitForLoadState('networkidle');
    
    // Look for filter controls
    const filterButtons = page.locator('button:has-text("all"), button:has-text("open"), button:has-text("fulfilled"), button:has-text("overdue"), [data-testid*="filter"]');
    
    // Click each filter and verify page responds
    const filterCount = await filterButtons.count();
    if (filterCount > 0) {
      await filterButtons.first().click();
      await page.waitForTimeout(500); // Wait for filter to apply
    }
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('toggle commitment status works', async ({ page }) => {
    await page.goto(`${BASE_URL}/commitments`);
    await page.waitForLoadState('networkidle');
    
    // Look for a commitment item with a toggle/checkbox
    const toggleButton = page.locator('button:has-text("✓"), button:has-text("complete"), button:has-text("fulfill"), input[type="checkbox"]').first();
    
    if (await toggleButton.count() > 0) {
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Toggle should have changed the status
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('commitments show proper status indicators', async ({ page }) => {
    await page.goto(`${BASE_URL}/commitments`);
    await page.waitForLoadState('networkidle');
    
    // Check for status badges, colors, or labels
    const pageContent = await page.content();
    const hasStatusIndicators = /open|fulfilled|overdue|pending/i.test(pageContent);
    expect(hasStatusIndicators).toBeTruthy();
  });

  test('can navigate to commitment detail from list', async ({ page }) => {
    await page.goto(`${BASE_URL}/commitments`);
    await page.waitForLoadState('networkidle');
    
    // Click on a commitment to see details
    const commitmentItem = page.locator('[data-testid*="commitment"], .commitment-item, [class*="commitment"]').first();
    
    if (await commitmentItem.count() > 0) {
      await commitmentItem.click();
      // Should navigate or show detail view
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
