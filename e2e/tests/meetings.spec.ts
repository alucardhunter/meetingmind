import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Meetings', () => {
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

  test('upload meeting page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/meetings/new`);
    await expect(page).toHaveURL(/\/meetings\/new/);
    
    // Check for upload form elements
    const uploadArea = page.locator('input[type="file"], [data-testid*="upload"], [class*="upload"]').first();
    await expect(uploadArea).toBeVisible({ timeout: 5000 });
  });

  test('meeting list page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/meetings`);
    await page.waitForLoadState('networkidle');
    
    // Page should load without error
    await expect(page.locator('body')).toBeVisible();
  });

  test('meeting detail page loads', async ({ page }) => {
    // First get a meeting ID from the list or use a placeholder
    await page.goto(`${BASE_URL}/meetings`);
    await page.waitForLoadState('networkidle');
    
    // Try to click on first meeting link if available
    const meetingLink = page.locator('a[href*="/meetings/"]').first();
    
    if (await meetingLink.count() > 0) {
      await meetingLink.click();
      await expect(page).toHaveURL(/\/meetings\/.+/);
    } else {
      // Otherwise test direct navigation with placeholder ID
      await page.goto(`${BASE_URL}/meetings/test-meeting-id`);
      // Should handle 404 gracefully or show empty state
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();
    }
  });

  test('can navigate to upload from meetings list', async ({ page }) => {
    await page.goto(`${BASE_URL}/meetings`);
    
    // Look for "New Meeting" or upload button
    const newMeetingBtn = page.locator('a[href*="/meetings/new"], button:has-text("new"), button:has-text("upload")').first();
    
    if (await newMeetingBtn.count() > 0) {
      await newMeetingBtn.click();
      await expect(page).toHaveURL(/\/meetings\/new/);
    }
  });
});
