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

const testUser = {
  name: "abc",
  email: "abc@gmail.com",
  password: "$2b$10$4JhdLvUZNDVpXjJ0n7RhmeEfLl6IEAEk/n.Ua6TsEhYXGhkB4D/P6",
  phone: "1234",
  address: "1234",
  answer: "football",
  dob: "2000-01-01T00:00:00.000Z",
};

const validAdmin = {
  email: 'admin@gmail.com',
  password: '1234',
};

const validUser = {
  email: 'abc@gmail.com',
  password: '1234',
};

test.describe('Admin Dashboard', () => {
  let createTestDB, connectTestDB, closeTestDB, clearTestDB, userModel;
  // Test DB Setup
  test.beforeAll(async () => {
    const mod = await import("../../../../tests/setupTestDB.js");
    ({ createTestDB, connectTestDB, closeTestDB, clearTestDB } = mod);
    const userMod = await import("../../../../models/userModel.js");
    userModel = userMod.default;
    await connectTestDB(await createTestDB());
  });

  test.beforeEach(async ({ page }) => {
    await userModel.create(testAdmin);
    await userModel.create(testUser);
    await page.goto('http://localhost:3000/login');
  }, 10000);

  test.afterEach(async () => {
    await clearTestDB();
  }, 10000);

  test.afterAll(async () => {
    await closeTestDB();
  });

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