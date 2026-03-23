import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Theme Toggle', () => {
  test('theme toggle button exists on dashboard', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: /email/i }).fill('e2e.test@meetingmind.com');
    await page.locator('input[type="password"]').fill('TestPassword123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {});
    
    // Look for theme toggle button with aria-label containing "Switch to"
    const themeToggle = page.locator('button[aria-label*="Switch to"]');
    await expect(themeToggle).toBeVisible({ timeout: 5000 });
  });

  test('theme toggle works', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: /email/i }).fill('e2e.test@meetingmind.com');
    await page.locator('input[type="password"]').fill('TestPassword123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {});
    
    // Get initial theme state
    const getTheme = async () => {
      return page.evaluate(() => {
        const html = document.documentElement;
        return (html.classList.contains('dark') || localStorage.getItem('meetingmind-theme') === 'dark') ? 'dark' : 'light';
      });
    };
    
    const initialTheme = await getTheme();
    
    // Click toggle
    const themeToggle = page.locator('button[aria-label*="Switch to"]');
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Theme should change
    const newTheme = await getTheme();
    expect(newTheme).not.toBe(initialTheme);
  });

  test('theme persists on page reload', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: /email/i }).fill('e2e.test@meetingmind.com');
    await page.locator('input[type="password"]').fill('TestPassword123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {});
    
    // Get current theme
    const getTheme = async () => {
      return page.evaluate(() => {
        const html = document.documentElement;
        return (html.classList.contains('dark') || localStorage.getItem('meetingmind-theme') === 'dark') ? 'dark' : 'light';
      });
    };
    
    const themeToggle = page.locator('button[aria-label*="Switch to"]');
    await themeToggle.click();
    const expectedTheme = await getTheme();
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Theme should persist
    const persistedTheme = await getTheme();
    expect(persistedTheme).toBe(expectedTheme);
  });

  test('theme applies correctly to page', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: /email/i }).fill('e2e.test@meetingmind.com');
    await page.locator('input[type="password"]').fill('TestPassword123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {});
    
    // Click theme toggle
    const themeToggle = page.locator('button[aria-label*="Switch to"]');
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Check that dark class is on html element
    const hasDarkClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    expect(hasDarkClass).toBeTruthy();
  });

  test('theme toggle accessible', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: /email/i }).fill('e2e.test@meetingmind.com');
    await page.locator('input[type="password"]').fill('TestPassword123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {});
    
    // Theme toggle should have proper aria-label
    const themeToggle = page.locator('button[aria-label*="Switch to"]');
    await expect(themeToggle).toBeAttached();
  });
});
