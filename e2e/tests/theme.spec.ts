import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Theme Toggle', () => {
  test('theme toggle button exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Look for theme toggle button/switch
    const themeToggle = page.locator('[data-testid*="theme"], button:has-text("theme"), [class*="theme"], [aria-label*="theme"], button:has-text("🌙"), button:has-text("☀️")').first();
    
    await expect(themeToggle).toBeVisible({ timeout: 5000 });
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Find theme toggle
    const themeToggle = page.locator('[data-testid*="theme"], button:has-text("theme"), [class*="theme"], [aria-label*="theme"], button:has-text("🌙"), button:has-text("☀️")').first();
    
    // Get initial theme state (check html class or localStorage)
    const getTheme = async () => {
      const isDark = await page.evaluate(() => {
        const html = document.documentElement;
        return html.classList.contains('dark') || localStorage.getItem('meetingmind-theme') === 'dark';
      });
      return isDark ? 'dark' : 'light';
    };
    
    const initialTheme = await getTheme();
    
    // Click toggle
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Theme should change
    const newTheme = await getTheme();
    expect(newTheme).not.toBe(initialTheme);
  });

  test('theme persists on page reload', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Find and click theme toggle
    const themeToggle = page.locator('[data-testid*="theme"], button:has-text("theme"), [class*="theme"], [aria-label*="theme"], button:has-text("🌙"), button:has-text("☀️")').first();
    
    // Get current theme
    const getTheme = async () => {
      return page.evaluate(() => {
        const html = document.documentElement;
        return html.classList.contains('dark') || localStorage.getItem('meetingmind-theme') === 'dark' ? 'dark' : 'light';
      });
    };
    
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
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Find and click theme toggle to dark
    const themeToggle = page.locator('[data-testid*="theme"], button:has-text("theme"), [class*="theme"], [aria-label*="theme"], button:has-text("🌙"), button:has-text("☀️")').first();
    
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Check that dark class is on html element
    const hasDarkClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    expect(hasDarkClass).toBeTruthy();
  });

  test('theme toggle accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Theme toggle should be accessible (button or proper role)
    const themeToggle = page.locator('button:has-text("theme"), [role="switch"][aria-label*="theme"], [aria-label*="theme toggle"]').first();
    
    await expect(themeToggle).toBeAttached();
  });
});
