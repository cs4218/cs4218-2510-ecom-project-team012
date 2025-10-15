import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/login');
});

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

test('User should see toast with success message if they log in to a registered account', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validLogin.email);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validLogin.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.getByText('🙏Logged in successfully')).toBeVisible({ timeout: 30000 });
});

test('User should be redirected to Home page on successful login', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validLogin.email);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validLogin.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('User should see toast with failure message if they log in with the wrong email', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validLogin.wrongEmail);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validLogin.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.locator('div').filter({ hasText: /^Something went wrong$/ }).nth(2)).toBeVisible();
});

test('User should see toast with failure message if they log in with the wrong password', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validLogin.email);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validLogin.wrongPassword);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.locator('div').filter({ hasText: /^Something went wrong$/ }).nth(2)).toBeVisible();
});

test('User should see toast with failure message if they log in with unregistered account', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(unregisteredLogin.email);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(unregisteredLogin.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.locator('div').filter({ hasText: /^Something went wrong$/ }).nth(2)).toBeVisible();
});