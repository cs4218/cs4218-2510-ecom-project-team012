import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const testAdmin = {
  "name": "admin",
  "email": "admin@gmail.com",
  "password": "$2b$10$DO5mJ/I0YvLRnuFdRQO1M.v667Zl0/0i5YTJ3/IGEIKNRzirWwVjO",
  "phone": "1234",
  "address": "123",
  "answer": "basketball",
  "dob": "2025-10-20T00:00:00.000Z",
  "role": 1
};

const validAdmin = {
  email: 'admin@gmail.com',
  password: '1234',
};

test.describe('Admin Menu', () => {
  let createTestDB, connectTestDB, closeTestDB, clearTestDB, userModel;
  // Test DB Setup
  test.beforeAll(async () => {
    const mod = await import("../../../tests/setupTestDB.js");
    ({ createTestDB, connectTestDB, closeTestDB, clearTestDB } = mod);
    const userMod = await import("../../../models/userModel.js");
    userModel = userMod.default;
    await connectTestDB(await createTestDB());
  });

  test.beforeEach(async ({ page }) => {
    await userModel.create(testAdmin);
    await page.goto('http://localhost:3000/login');
  }, 10000);

  test.afterEach(async () => {
    await clearTestDB();
  }, 10000);

  test.afterAll(async () => {
    await closeTestDB();
  });

  test('should allow admin user to view admin menu', async ({ page }) => {
    // Login as admin user
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validAdmin.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validAdmin.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'admin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();

    await expect(page.getByTestId('admin-menu')).toBeVisible();
  });

  // test to check that normal user cannot view admin menu implicitly tested in AdminDashboard.spec.js
  // since admin menu is in the admin dashboard page
  test('should allow admin user to navigate to create category page', async ({ page }) => {
    // Login as admin user
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validAdmin.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validAdmin.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'admin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();

    await page.getByRole('link', { name: 'Create Category' }).click();

    await expect(page.getByRole('heading', { name: 'Manage Category' })).toBeVisible();
  });

  test('should allow admin user to navigate to create product page', async ({ page }) => {
    // Login as admin user
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validAdmin.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validAdmin.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'admin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();

    await page.getByRole('link', { name: 'Create Product' }).click();

    await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible();
  });

  test('should allow admin user to navigate to products page', async ({ page }) => {
    // Login as admin user
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validAdmin.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validAdmin.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'admin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();

    await page.getByRole('link', { name: 'Products' }).click();

    await expect(page.getByRole('heading', { name: 'All Products List' })).toBeVisible();
  });

  test('should allow admin user to navigate to orders page', async ({ page }) => {
    // Login as admin user
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validAdmin.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validAdmin.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'admin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();

    await page.getByRole('link', { name: 'Orders' }).click();

    await expect(page.getByRole('heading', { name: 'All Orders' })).toBeVisible();
  });
});