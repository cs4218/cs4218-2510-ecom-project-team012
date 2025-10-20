import { test, expect } from '@playwright/test';
import {
  createTestDB,
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "../../../../tests/setupTestDB.js";
import { seedTestData } from "../../../../tests/seedTestData.js";
import {
  resetSeedDatabase,
  seedUserData,
} from "../../setupSeedDataRoutes.js";

const testUser = {
  _id: "68cbb3c2c3b189d7acade305",
  name: "abc",
  email: "abc@gmail.com",
  password: "$2b$10$4JhdLvUZNDVpXjJ0n7RhmeEfLl6IEAEk/n.Ua6TsEhYXGhkB4D/P6",
  phone: "1234",
  address: "1234",
  answer: "football",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 0,
  createdAt: new Date("2025-09-18T07:24:50.465Z"),
  updatedAt: new Date("2025-09-18T07:24:50.465Z"),
  __v: 0
};

test.describe.configure({ mode: 'serial' });

// Test DB setup
// test.beforeAll(async () => {

// });

test.beforeEach(async ({ page }) => {
  await resetSeedDatabase();
  await seedUserData([testUser]);
  await page.goto('http://localhost:3000/login');
});

// Test DB teardown
// test.afterEach(async () => await clearTestDB());
// test.afterAll(async () => await closeTestDB());

const validLogin = {
  email: 'abc@gmail.com',
  password: '1234',
  wrongEmail: 'abcd@gmail.com',
  wrongPassword: '123',
}

const unregisteredLogin = {
  email: 'def@gmail.com',
  password: '1234',
}

test.describe('Login Page', () => {
  test('should have all necessary elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Forgot Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible();
  });

  // test('should log user in and display toast with success message if they log in to a registered account', async ({ page }) => {
  //   await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validLogin.email);
  //   await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validLogin.password);
  //   await page.getByRole('button', { name: 'LOGIN' }).click();
  //   await expect(page.getByText('🙏Logged in successfully')).toBeVisible({timeout: 10000});
  // });

  // test('should redirect user to Home page on successful login', async ({ page }) => {
  //   await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validLogin.email);
  //   await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validLogin.password);
  //   await page.getByRole('button', { name: 'LOGIN' }).click();
  //   await expect(page).toHaveURL(/\/$/);
  // });

  // test('should not log user in, displays toast with failure message instead if they log in with the wrong email', async ({ page }) => {
  //   await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validLogin.wrongEmail);
  //   await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validLogin.password);
  //   await page.getByRole('button', { name: 'LOGIN' }).click();
  //   await expect(page.locator('div').filter({ hasText: /^Something went wrong$/ }).nth(2)).toBeVisible();
  // });

  // test('should not log user in, displays toast with failure message instead if they log in with the wrong password', async ({ page }) => {
  //   await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validLogin.email);
  //   await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validLogin.wrongPassword);
  //   await page.getByRole('button', { name: 'LOGIN' }).click();
  //   await expect(page.locator('div').filter({ hasText: /^Something went wrong$/ }).nth(2)).toBeVisible();
  // });

  // test('should not log user in, displays toast with failure message instead if they log in with unregistered account', async ({ page }) => {
  //   await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(unregisteredLogin.email);
  //   await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(unregisteredLogin.password);
  //   await page.getByRole('button', { name: 'LOGIN' }).click();
  //   await expect(page.locator('div').filter({ hasText: /^Something went wrong$/ }).nth(2)).toBeVisible();
  // });

  // test('should remain on login page if user entered invalid credentials', async ({ page }) => {
  //   await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(unregisteredLogin.email);
  //   await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(unregisteredLogin.password);
  //   await page.getByRole('button', { name: 'LOGIN' }).click();
  //   await expect(page).toHaveURL(/.*\/login/);
  // });

  // test('should remain on login page if user is missing email', async ({ page }) => {
  //   await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validLogin.password);
  //   await page.getByRole('button', { name: 'LOGIN' }).click();
  //   await expect(page).toHaveURL(/.*\/login/);
  // });

  // test('should remain on login page if user is missing password', async ({ page }) => {
  //   await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validLogin.email);
  //   await page.getByRole('button', { name: 'LOGIN' }).click();
  //   await expect(page).toHaveURL(/.*\/login/);
  // });
});