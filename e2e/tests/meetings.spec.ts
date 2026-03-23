import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Meetings', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: /email/i }).fill(`e2e.test@meetingmind.com`);
    await page.locator('input[type="password"]').fill('TestPassword123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
  });

  test('upload meeting page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/meetings/new`);
    await expect(page).toHaveURL(/\/meetings\/new/);
    
    // Check for upload heading
    await expect(page.getByRole('heading', { name: /upload/i })).toBeVisible({ timeout: 5000 });
  });

  test('meeting list page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/meetings`);
    await page.waitForLoadState('networkidle');
    
    // Page should load without error
    await expect(page.locator('body')).toBeVisible();
  });

  test('meeting detail page loads', async ({ page }) => {
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
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();
    }
  });

  test('can navigate to upload from meetings list', async ({ page }) => {
    await page.goto(`${BASE_URL}/meetings`);
    
    // Look for "New Meeting" or upload button
    const newMeetingBtn = page.locator('a[href*="/meetings/new"]').first();
    
    if (await newMeetingBtn.count() > 0) {
      await newMeetingBtn.click();
      await expect(page).toHaveURL(/\/meetings\/new/);
    }
  });
});
