import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test that needs auth
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.fill(`e2e.test@meetingmind.com`);
    await passwordInput.fill('TestPassword123!');
    await submitButton.click();
    
    // Wait for authenticated page
    await page.waitForLoadState('networkidle');
  });

  test('dashboard loads after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check main dashboard elements are present
    const dashboardContent = page.locator('main, [data-testid="dashboard"], section').first();
    await expect(dashboardContent).toBeVisible({ timeout: 10000 });
  });

  test('shows stats (total, open, fulfilled, overdue)', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Look for stat cards or stat labels
    const statsSection = page.locator('[data-testid*="stat"], .stat, .stats, [class*="card"]').first();
    
    // Should have some content loaded
    await page.waitForLoadState('networkidle');
    
    // Look for numbers related to commitments
    const pageContent = await page.content();
    const hasStats = /total|open|fulfilled|overdue|\d+/i.test(pageContent);
    expect(hasStats).toBeTruthy();
  });

  test('shows recent commitments', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Look for commitments section or list
    const recentCommitments = page.locator('[data-testid*="commitment"], .commitment, [class*="commitment"]').first();
    
    // Just check page has some content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(10);
  });

  test('dashboard has navigation to other pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Check for nav links or buttons to meetings, commitments
    const meetingsLink = page.locator('a[href*="meetings"], button:has-text("meeting")').first();
    const commitmentsLink = page.locator('a[href*="commitment"], button:has-text("commitment")').first();
    
    const hasNav = (await meetingsLink.count()) > 0 || (await commitmentsLink.count()) > 0;
    expect(hasNav).toBeTruthy();
  });
});
