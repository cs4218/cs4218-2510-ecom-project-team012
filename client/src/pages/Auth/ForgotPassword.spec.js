import { test, expect } from '@playwright/test';
import {
  createTestDB,
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "../../../../tests/setupTestDB.js";
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

test.describe.configure({ mode: 'parallel' });

const validUser = {
  email: 'abc@gmail.com',
  newPassword: '123456',
  mismatchedPassword: '12345',
  answer: 'football',
  wrongAnswer: 'basketball',
}

const invalidUser = {
  email: 'def@gmail.com',
  password: '1234',
}

test.describe('Forgot Password', () => {
  // Test DB setup
  test.beforeAll(async () => {
    await resetSeedDatabase();
  });

  test.beforeEach(async ({ page }) => {
    await seedUserData([testUser]);
    await page.goto('http://localhost:3000/forgot-password');
  });

  // Test DB teardown
  test.afterEach(async () => await resetSeedDatabase());

  test('should have all necessary elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'FORGOT PASSWORD' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'What is your favorite sport?' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your New Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm Your New Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'RESET PASSWORD' })).toBeVisible();
  });

  test('should display toast with success message if reset was successful', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validUser.email);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validUser.answer);
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('textbox', { name: 'Confirm Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page.locator('div').filter({ hasText: /^Password reset successfully\. Please log in again\.$/ }).nth(2)).toBeVisible();
  });

  test('should redirect user to Login Page on successful reset', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validUser.email);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validUser.answer);
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('textbox', { name: 'Confirm Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should display toast with failure message if security answer is incorrect', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validUser.email);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validUser.wrongAnswer);
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('textbox', { name: 'Confirm Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page.locator('div').filter({ hasText: /^Something went wrong$/ }).nth(2)).toBeVisible();
  });

  test('should display toast with failure message if new password and confirm password do not match', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validUser.email);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validUser.answer);
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('textbox', { name: 'Confirm Your New Password' }).fill(validUser.mismatchedPassword);
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page.locator('div').filter({ hasText: /^New password and confirmed password do not match$/ }).nth(2)).toBeVisible();
  });
  
  test('should display toast with failure message if email is not registered', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(invalidUser.email);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validUser.answer);
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('textbox', { name: 'Confirm Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page.locator('div').filter({ hasText: /^Something went wrong$/ }).nth(2)).toBeVisible();
  });

  test('should remain on forgot password page if user is missing email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validUser.answer);
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('textbox', { name: 'Confirm Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });

  test('should remain on forgot password page if user is missing security answer', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validUser.email);
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('textbox', { name: 'Confirm Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });

  test('should remain on forgot password page if user is missing new password', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validUser.email);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validUser.answer);
    await page.getByRole('textbox', { name: 'Confirm Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });

  test('should remain on forgot password page if user is missing confirm password', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validUser.email);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validUser.answer);
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill(validUser.newPassword);
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });
});