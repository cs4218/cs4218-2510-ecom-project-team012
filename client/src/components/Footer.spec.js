/* 
  Footer Component E2E Test
  This test checks:
  1. Footer visibility and static text
  2. Presence and correctness of navigation links
  3. Navigation behaviour when links are clicked
*/

import { test, expect } from '@playwright/test';

test.describe('Footer Component E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('footer should be visible with correct text', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('All Rights Reserved');
    await expect(footer).toContainText('TestingComp');
  });

  test('footer should contain all three navigation links', async ({ page }) => {
    const footer = page.locator('.footer');
    const aboutLink = footer.getByRole('link', { name: 'About' });
    const contactLink = footer.getByRole('link', { name: 'Contact' });
    const policyLink = footer.getByRole('link', { name: 'Privacy Policy' });

    await expect(aboutLink).toBeVisible();
    await expect(contactLink).toBeVisible();
    await expect(policyLink).toBeVisible();

    await expect(aboutLink).toHaveAttribute('href', '/about');
    await expect(contactLink).toHaveAttribute('href', '/contact');
    await expect(policyLink).toHaveAttribute('href', '/policy');
  });

  test('clicking About link should navigate to /about', async ({ page }) => {
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/.*about/);
  });

  test('clicking Contact link should navigate to /contact', async ({ page }) => {
    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL(/.*contact/);
  });

  test('clicking Privacy Policy link should navigate to /policy', async ({ page }) => {
    await page.getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page).toHaveURL(/.*policy/);
  });
});
