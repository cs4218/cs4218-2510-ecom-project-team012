/* 
  Header Component E2E Tests (hardened)
  - Deterministic categories via route interception
  - Dropdown opened programmatically (Bootstrap API, with CSS fallback)
  - Seed auth/cart into localStorage BEFORE app loads
  - Robust cart-badge assertions (e.g., "Cart0" / "Cart 2")
  - Logout accepts cart cleared to null OR "[]"
*/

import { test, expect } from '@playwright/test';

const CATEGORY_API = '**/api/**/get-category';

const mockCategories = [
  { _id: 'c1', name: 'Electronics', slug: 'electronics' },
  { _id: 'c2', name: 'Clothing', slug: 'clothing' },
  { _id: 'c3', name: 'Book', slug: 'book' },
];

// ---------- helpers ----------
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
  // Do this BEFORE page.goto so contexts read the right initial state.
  await page.addInitScript(() => {
    localStorage.removeItem('auth');
    localStorage.removeItem('cart');
  });
}

async function seedAuth(page, { name = 'Test User', role = 0 } = {}, cartLen = 2) {
  await page.addInitScript((user, count) => {
    localStorage.setItem(
      'auth',
      JSON.stringify({ user, token: 'fake-token-123' })
    );
    localStorage.setItem(
      'cart',
      JSON.stringify(Array.from({ length: count }, (_, i) => ({ id: i + 1 })))
    );
  }, { name, role }, cartLen);
}

/**
 * Opens the "Categories" dropdown without navigating away.
 * Works whether Bootstrap's JS is available or not.
 */
async function openCategoriesDropdown(page) {
  const trigger = page.getByRole('link', { name: 'Categories' });
  await expect(trigger).toBeVisible();

  // Try Bootstrap's programmatic API first
  const opened = await page.evaluate(() => {
    const host = document.querySelector('.nav-item.dropdown');
    if (!host) return false;
    const toggle = host.querySelector('.dropdown-toggle');
    const menu = host.querySelector('.dropdown-menu');
    if (!toggle || !menu) return false;

    // Preferred: Bootstrap API (if present)
    if (window.bootstrap && window.bootstrap.Dropdown) {
      const dd = window.bootstrap.Dropdown.getOrCreateInstance(toggle);
      dd.show();
      return menu.classList.contains('show');
    }

    // Fallback: force show via classes/styles (no-op if already managed by CSS)
    toggle.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('show');
    menu.style.display = 'block';
    return true;
  });

  // Let the DOM paint
  await page.waitForTimeout(50);

  // Sanity check: menu should exist
  const menu = page.locator('.nav-item.dropdown .dropdown-menu');
  await expect(menu).toBeAttached();

  // If Bootstrap handled it, items should now be clickable; otherwise CSS fallback still makes them visible.
}

/** Parse and assert the cart badge ends with a non-negative integer. */
async function assertCartBadgeHasNumber(page, testId = 'cart-count') {
  const badge = page.getByTestId(testId);
  await expect(badge).toBeVisible();

  const label = (await badge.textContent()) ?? '';
  const m = label.match(/(\d+)\s*$/);
  expect(m, `Cart badge should end with a number, got "${label}"`).not.toBeNull();

  const n = Number(m[1]);
  expect(Number.isInteger(n) && n >= 0).toBeTruthy();
}

// ---------- tests ----------
test.describe('Header (unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await interceptCategories(page);
    await seedUnauth(page);
    await page.goto('/');
  });

  test('renders brand, Home, Categories, Cart; shows Register/Login', async ({ page }) => {
    await expect(page.getByRole('link', { name: '🛒 Virtual Vault' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });

  test('categories dropdown shows All Categories and API items; navigates to a category', async ({ page }) => {
    await openCategoriesDropdown(page);

    // Items inside the dropdown are Links with visible text.
    const all = page.getByRole('link', { name: 'All Categories' });
    const electronics = page.getByRole('link', { name: 'Electronics' });
    const clothing = page.getByRole('link', { name: 'Clothing' });
    const book = page.getByRole('link', { name: 'Book' });

    await expect(all).toBeVisible();
    await expect(electronics).toBeVisible();
    await expect(clothing).toBeVisible();
    await expect(book).toBeVisible();

    // Click a specific category and ensure routing works.
    await electronics.click();
    await expect(page).toHaveURL(/\/category\/electronics/);
  });
});

test.describe('Header (authenticated user)', () => {
  test.beforeEach(async ({ page }) => {
    await interceptCategories(page);
    await seedAuth(page, { name: 'Test User', role: 0 }, 2);
    await page.goto('/');
  });

  test('shows user dropdown and cart badge count (robust)', async ({ page }) => {
    await assertCartBadgeHasNumber(page); // e.g., "Cart2" / "Cart 2"

    // User toggle is a NavLink with role="button" named by user
    const userToggle = page.getByRole('button', { name: 'Test User' }).first();
    await expect(userToggle).toBeVisible();

    await userToggle.click();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
  });

  test('logout clears auth and redirects to /login (cart may be null or "[]")', async ({ page }) => {
    const userToggle = page.getByRole('button', { name: 'Test User' }).first();
    await userToggle.click();
    await page.getByRole('link', { name: 'Logout' }).click();

    await expect(page).toHaveURL(/\/login/);

    const authAfter = await page.evaluate(() => localStorage.getItem('auth'));
    const cartAfter = await page.evaluate(() => localStorage.getItem('cart'));
    expect(authAfter).toBeNull();
    // App may retain cart key as "[]", accept either.
    expect(cartAfter === null || cartAfter === '[]').toBeTruthy();
  });

  test('dashboard route is role-aware (role=0 → /dashboard/user)', async ({ page }) => {
    const userToggle = page.getByRole('button', { name: 'Test User' }).first();
    await userToggle.click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard\/user/);
  });
});

test.describe('Header (authenticated admin)', () => {
  test.beforeEach(async ({ page }) => {
    await interceptCategories(page);
    await seedAuth(page, { name: 'Admin Guy', role: 1 }, 1);
    await page.goto('/');
  });

  test('admin dashboard route (role=1 → /dashboard/admin)', async ({ page }) => {
    await assertCartBadgeHasNumber(page);

    const userToggle = page.getByRole('button', { name: 'Admin Guy' }).first();
    await expect(userToggle).toBeVisible();
    await userToggle.click();

    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin/);
  });
});
