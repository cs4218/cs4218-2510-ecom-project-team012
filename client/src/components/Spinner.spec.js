/*
  Spinner Component E2E Tests (hardened)
  - Unauthenticated visit to a protected route should show <Spinner /> countdown
  - After countdown, user is redirected away from the protected path
  - Final location can be /login OR / (some apps send to home); accept either
  - Intercepts categories (since Header mounts on the page)
*/

import { test, expect } from '@playwright/test';

const CATEGORY_API = '**/api/**/get-category';

const mockCategories = [
  { _id: 'c1', name: 'Electronics', slug: 'electronics' },
];

async function interceptCategories(page) {
  await page.route(CATEGORY_API, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, category: mockCategories }),
    });
  });
}

async function seedUnauth(page) {
  // Ensure the app boots without auth before navigation
  await page.addInitScript(() => {
    localStorage.removeItem('auth');
    localStorage.removeItem('cart');
  });
}

test.describe('Spinner redirect on protected route (unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await interceptCategories(page);
    await seedUnauth(page);
  });

  test('shows countdown and redirects away from protected route', async ({ page }) => {
    const protectedPath = '/dashboard/user'; // adjust if your protected path differs
    await page.goto(protectedPath);

    // Spinner text from Spinner.js
    const countdown = page.getByText(/redirecting to you in \d+ second/i);
    await expect(countdown).toBeVisible();

    // Spinner UI present
    await expect(page.locator('.spinner-border[role="status"]')).toBeVisible();

    // Wait until we leave the protected path
    await page.waitForFunction(
      p => window.location.pathname !== p,
      protectedPath,
      { timeout: 8000 }
    );

    // Accept either "/login" OR "/" as final route, depending on your guard
    const finalURL = page.url();
    expect(
      /\/login($|\?)/.test(finalURL) || /http:\/\/localhost:3000\/($|\?)/.test(finalURL),
      `Expected redirect to "/login" OR home "/", but got "${finalURL}"`
    ).toBeTruthy();
  });
});
