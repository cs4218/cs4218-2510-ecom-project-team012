import { test, expect } from '@playwright/test';
import {
  createTestDB,
  connectTestDB,
  closeTestDB,
  clearTestDB,
} from "../../../../tests/setupTestDB.js"
import userModel from "../../../../models/userModel.js";

const testUser = {
  name: "abc",
  email: "abc@gmail.com",
  password: "$2b$10$4JhdLvUZNDVpXjJ0n7RhmeEfLl6IEAEk/n.Ua6TsEhYXGhkB4D/P6",
  phone: "1234",
  address: "1234",
  answer: "football",
  dob: "2000-01-01T00:00:00.000Z",
};

test.describe.configure({ mode: 'parallel' });

const validRegister = {
  name: 'abcd',
  email: 'abcd@gmail.com',
  password: '12345',
  phoneNumber: '1234',
  address: '123 street',
  dateOfBirth: '2025-10-19',
  favoriteSport: 'football',
}

const existingRegister = {
  name: 'abc',
  email: 'abc@gmail.com',
  password: '1234',
  phoneNumber: '123',
  address: '12 street',
  dateOfBirth: '2025-10-19',
  favoriteSport: 'football',
}

test.describe('Register Page', () => {
  // Test DB setup
  test.beforeAll(async () => {
    await connectTestDB(await createTestDB());
  });

  test.beforeEach(async ({ page }) => {
    await userModel.create(testUser);
    await page.goto('http://localhost:3000/register');
  }, 10000);

  // Test DB teardown
  test.afterEach(async () => {
    await clearTestDB();
  },  10000);

  test.afterAll(async () => {
    await closeTestDB();
  });

  test('should have all necessary elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Phone Number' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Date of Birth')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'What is your favorite sport?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'REGISTER' })).toBeVisible();
  });

  test('should redirect user to Login Page on successful registration', async ({ page }) => {
    test.setTimeout(20000);
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(validRegister.name);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validRegister.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validRegister.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone Number' }).fill(validRegister.phoneNumber);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(validRegister.address);
    await page.getByPlaceholder('Enter Your Date of Birth').fill(validRegister.dateOfBirth);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validRegister.favoriteSport);
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should remain on register page if email is already registered', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(existingRegister.name);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(existingRegister.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(existingRegister.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone Number' }).fill(existingRegister.phoneNumber);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(existingRegister.address);
    await page.getByPlaceholder('Enter Your Date of Birth').fill(existingRegister.dateOfBirth);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(existingRegister.favoriteSport);
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('should remain on register page if user is missing name', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validRegister.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validRegister.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone Number' }).fill(validRegister.phoneNumber);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(validRegister.address);
    await page.getByPlaceholder('Enter Your Date of Birth').fill(validRegister.dateOfBirth);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validRegister.favoriteSport);
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('should remain on register page if user is missing email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(validRegister.name);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validRegister.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone Number' }).fill(validRegister.phoneNumber);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(validRegister.address);
    await page.getByPlaceholder('Enter Your Date of Birth').fill(validRegister.dateOfBirth);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validRegister.favoriteSport);
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('should remain on register page if user is missing password', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(validRegister.name);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validRegister.email);
    await page.getByRole('textbox', { name: 'Enter Your Phone Number' }).fill(validRegister.phoneNumber);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(validRegister.address);
    await page.getByPlaceholder('Enter Your Date of Birth').fill(validRegister.dateOfBirth);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validRegister.favoriteSport);
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('should remain on register page if user is missing phone number', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(validRegister.name);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validRegister.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validRegister.password);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(validRegister.address);
    await page.getByPlaceholder('Enter Your Date of Birth').fill(validRegister.dateOfBirth);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validRegister.favoriteSport);
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('should remain on register page if user is missing address', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(validRegister.name);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validRegister.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validRegister.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone Number' }).fill(validRegister.phoneNumber);
    await page.getByPlaceholder('Enter Your Date of Birth').fill(validRegister.dateOfBirth);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validRegister.favoriteSport);
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await expect(page).toHaveURL(/.*\/register/);
  });


  test('should remain on register page if user is missing date of birth', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(validRegister.name);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validRegister.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validRegister.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone Number' }).fill(validRegister.phoneNumber);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(validRegister.address);
    await page.getByRole('textbox', { name: 'What is your favorite sport?' }).fill(validRegister.favoriteSport);
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('should remain on register page if user is missing answer to security question', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(validRegister.name);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(validRegister.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(validRegister.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone Number' }).fill(validRegister.phoneNumber);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(validRegister.address);
    await page.getByPlaceholder('Enter Your Date of Birth').fill(validRegister.dateOfBirth);
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await expect(page).toHaveURL(/.*\/register/);
  });
});