import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/forgot-password');
});

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