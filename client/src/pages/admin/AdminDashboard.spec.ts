import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard/admin');
});

const validAdmin = {
  email: 'admin@gmail.com',
  password: '1234',
};

const validUser = {
  email: 'abc@gmail.com',
  password: '1234',
};

test.describe('Admin Dashboard', () => {
  test('should allow admin user to view admin dashboard', async ({ page }) => {
    // Login as admin user
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validAdmin.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validAdmin.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'admin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();

    await expect(page).toHaveURL(/.*\/dashboard\/admin/);
  });

    test('should not allow normal user to view admin dashboard', async ({ page }) => {
    // Login as normal user
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validUser.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validUser.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'abc' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();

    await expect(page).toHaveURL(/.*\/dashboard\/user/);
  });
});