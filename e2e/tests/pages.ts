import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"], input[name="email"]').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.submitButton = page.locator('button[type="submit"]').first();
    this.errorMessage = page.locator('text=/error|invalid|failed/i').first();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async goto() {
    await this.page.goto('/login');
  }
}

export class DashboardPage {
  readonly page: Page;
  readonly statsCards: Locator;
  readonly recentCommitments: Locator;
  readonly meetingsLink: Locator;
  readonly commitmentsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.statsCards = page.locator('[data-testid*="stat"], .stat, .stats');
    this.recentCommitments = page.locator('[data-testid*="commitment"], .commitment');
    this.meetingsLink = page.locator('a[href*="meetings"]').first();
    this.commitmentsLink = page.locator('a[href*="commitments"]').first();
  }

  async goto() {
    await this.page.goto('/dashboard');
  }
}

export class MeetingsPage {
  readonly page: Page;
  readonly newMeetingButton: Locator;
  readonly meetingList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newMeetingButton = page.locator('a[href*="/meetings/new"], button:has-text("new")').first();
    this.meetingList = page.locator('[data-testid*="meeting"], .meeting');
  }

  async goto() {
    await this.page.goto('/meetings');
  }

  async gotoNew() {
    await this.page.goto('/meetings/new');
  }
}

export class CommitmentsPage {
  readonly page: Page;
  readonly filterButtons: Locator;
  readonly commitmentList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterButtons = page.locator('button:has-text("all"), button:has-text("open"), button:has-text("fulfilled"), button:has-text("overdue")');
    this.commitmentList = page.locator('[data-testid*="commitment"], .commitment-item');
  }

  async goto() {
    await this.page.goto('/commitments');
  }
}

export class ThemeHelper {
  static async getCurrentTheme(page: Page): Promise<'light' | 'dark'> {
    return page.evaluate(() => {
      const html = document.documentElement;
      return (html.classList.contains('dark') || localStorage.getItem('meetingmind-theme') === 'dark') ? 'dark' : 'light';
    });
  }

  static async toggle(page: Page) {
    const toggle = page.locator('[data-testid*="theme"], button:has-text("theme"), [class*="theme"], button:has-text("🌙"), button:has-text("☀️")').first();
    await toggle.click();
    await page.waitForTimeout(500);
  }
}
