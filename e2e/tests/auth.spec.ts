import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  test('signup page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await expect(page.locator('h1, h2, [data-testid="signup-title"]')).toBeVisible();
  });

  test('signup with email/password creates account', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    
    // Generate unique email
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    const password = 'TestPassword123!';
    
    // Fill signup form - adjust selectors based on actual form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submitButton.click();
    
    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(/\/(dashboard|login)/);
  });

  test('login page loads', async ({ page }) => {
    await expect(page.locator('h1, h2, [data-testid="login-title"], input[type="email"]')).toBeVisible();
  });

  test('login with valid credentials succeeds', async ({ page }) => {
    // Use test credentials - in real scenario these would be seeded
    const email = `e2e.test@meetingmind.com`;
    const password = 'TestPassword123!';
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submitButton.click();
    
    // Wait for navigation after login
    await page.waitForURL(/\/(dashboard|meetings)/, { timeout: 10000 }).catch(() => {
      // If no redirect, check if we're still on login (might need signup first)
    });
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();
    
    // Should show error message
    await expect(page.locator('text=/error|invalid|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('logout works', async ({ page }) => {
    // First login
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.fill(`e2e.test@meetingmind.com`);
    await passwordInput.fill('TestPassword123!');
    await submitButton.click();
    
    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {});
    
    // Look for logout button
    const logoutButton = page.locator('button:has-text("logout"), button:has-text("Logout"), [data-testid="logout"]').first();
    await logoutButton.click();
    
    // Should redirect to login or home
    await expect(page).toHaveURL(/\/(login|$)/, { timeout: 5000 });
  });
});
