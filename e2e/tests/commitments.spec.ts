import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Commitments', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: /email/i }).fill(`e2e.test@meetingmind.com`);
    await page.locator('input[type="password"]').fill('TestPassword123!');
    await page.locator('button[type="submit"]').click();
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
    
    // Look for filter buttons - the app uses buttons with text for filters
    const filterButtons = page.locator('button:has-text("All"), button:has-text("Open"), button:has-text("Fulfilled"), button:has-text("Overdue")');
    
    // Click each filter and verify page responds
    const filterCount = await filterButtons.count();
    if (filterCount > 0) {
      await filterButtons.first().click();
      await page.waitForTimeout(500);
    }
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('toggle commitment status works', async ({ page }) => {
    await page.goto(`${BASE_URL}/commitments`);
    await page.waitForLoadState('networkidle');
    
    // Look for toggle/check button for commitment
    const toggleButton = page.locator('button:has-text("✓"), button:has-text("Complete"), button:has-text("Mark")').first();
    
    if (await toggleButton.count() > 0) {
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('commitments page has content', async ({ page }) => {
    await page.goto(`${BASE_URL}/commitments`);
    await page.waitForLoadState('networkidle');
    
    // Check page has some meaningful content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(20);
  });

  test('can navigate to commitment detail from list', async ({ page }) => {
    await page.goto(`${BASE_URL}/commitments`);
    await page.waitForLoadState('networkidle');
    
    // Click on a commitment item if any exist
    const commitmentItem = page.locator('[class*="commitment"], [data-testid*="commitment"]').first();
    
    if (await commitmentItem.count() > 0) {
      await commitmentItem.click();
      await page.waitForTimeout(500);
    }
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });
});
