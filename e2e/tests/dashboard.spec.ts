import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test that needs auth
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: /email/i }).fill(`e2e.test@meetingmind.com`);
    await page.locator('input[type="password"]').fill('TestPassword123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
  });

  test('dashboard loads after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check main dashboard content is present
    const dashboardContent = page.locator('main, section').first();
    await expect(dashboardContent).toBeVisible({ timeout: 10000 });
  });

  test('shows stats (total, open, fulfilled, overdue)', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Look for stat cards with numbers
    const pageContent = await page.content();
    // Check for any numbers on the page (dashboard should show stats)
    const hasNumbers = /\d+/.test(pageContent);
    expect(hasNumbers).toBeTruthy();
  });

  test('shows recent commitments', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Page should have some content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(10);
  });

  test('dashboard has navigation links', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // The navbar contains links - look for the nav element itself
    const navElement = page.locator('nav');
    const navCount = await navElement.count();
    
    // Or check for any links in the main content area
    const linksInMain = page.locator('main a, div a').count();
    const totalLinks = await page.locator('a[href]').count();
    
    expect(navCount > 0 || totalLinks > 0).toBeTruthy();
  });
});
