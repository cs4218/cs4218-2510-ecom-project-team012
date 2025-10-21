import { test, expect } from "@playwright/test";

const testUser = {
  name: "abc",
  email: "abc@gmail.com",
  password: "$2b$10$4JhdLvUZNDVpXjJ0n7RhmeEfLl6IEAEk/n.Ua6TsEhYXGhkB4D/P6",
  phone: "1234",
  address: "1234",
  answer: "football",
  dob: "2000-01-01T00:00:00.000Z",
};

test.describe.configure({ mode: "parallel" });

const validUser = {
  email: "abc@gmail.com",
  newPassword: "123456",
  mismatchedPassword: "12345",
  answer: "football",
  wrongAnswer: "basketball",
};

const invalidUser = {
  email: "def@gmail.com",
  password: "1234",
};

test.describe("Forgot Password", () => {
  let createTestDB, connectTestDB, closeTestDB, clearTestDB, userModel;
  // Test DB setup
  test.beforeAll(async () => {
    const mod = await import("../../../../tests/setupTestDB.js");
    ({ createTestDB, connectTestDB, closeTestDB, clearTestDB } = mod);
    const userMod = await import("../../../../models/userModel.js");
    userModel = userMod.default;
    await connectTestDB(await createTestDB());
  });

  test.beforeEach(async ({ page }) => {
    await userModel.create(testUser);
    await page.goto("http://localhost:3000/forgot-password");
  }, 10000);

  // Test DB teardown
  test.afterEach(async () => {
    await clearTestDB();
  }, 10000);

  test.afterAll(async () => {
    await closeTestDB();
  });

  test("should have all necessary elements", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "FORGOT PASSWORD" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "What is your favorite sport?" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Enter Your New Password" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Confirm Your New Password" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "RESET PASSWORD" })
    ).toBeVisible();
  });

  test("should redirect user to Login Page on successful reset", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(validUser.email);
    await page
      .getByRole("textbox", { name: "What is your favorite sport?" })
      .fill(validUser.answer);
    await page
      .getByRole("textbox", { name: "Enter Your New Password" })
      .fill(validUser.newPassword);
    await page
      .getByRole("textbox", { name: "Confirm Your New Password" })
      .fill(validUser.newPassword);
    await page.getByRole("button", { name: "RESET PASSWORD" }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("should remain on forgot password page if security answer is incorrect", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(validUser.email);
    await page
      .getByRole("textbox", { name: "What is your favorite sport?" })
      .fill(validUser.wrongAnswer);
    await page
      .getByRole("textbox", { name: "Enter Your New Password" })
      .fill(validUser.newPassword);
    await page
      .getByRole("textbox", { name: "Confirm Your New Password" })
      .fill(validUser.newPassword);
    await page.getByRole("button", { name: "RESET PASSWORD" }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });

  test("should remain on forgot password page if new password and confirm password do not match", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(validUser.email);
    await page
      .getByRole("textbox", { name: "What is your favorite sport?" })
      .fill(validUser.answer);
    await page
      .getByRole("textbox", { name: "Enter Your New Password" })
      .fill(validUser.newPassword);
    await page
      .getByRole("textbox", { name: "Confirm Your New Password" })
      .fill(validUser.mismatchedPassword);
    await page.getByRole("button", { name: "RESET PASSWORD" }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });

  test("should remain on forgot password page if email is not registered", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(invalidUser.email);
    await page
      .getByRole("textbox", { name: "What is your favorite sport?" })
      .fill(validUser.answer);
    await page
      .getByRole("textbox", { name: "Enter Your New Password" })
      .fill(validUser.newPassword);
    await page
      .getByRole("textbox", { name: "Confirm Your New Password" })
      .fill(validUser.newPassword);
    await page.getByRole("button", { name: "RESET PASSWORD" }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });

  test("should remain on forgot password page if user is missing email", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "What is your favorite sport?" })
      .fill(validUser.answer);
    await page
      .getByRole("textbox", { name: "Enter Your New Password" })
      .fill(validUser.newPassword);
    await page
      .getByRole("textbox", { name: "Confirm Your New Password" })
      .fill(validUser.newPassword);
    await page.getByRole("button", { name: "RESET PASSWORD" }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });

  test("should remain on forgot password page if user is missing security answer", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(validUser.email);
    await page
      .getByRole("textbox", { name: "Enter Your New Password" })
      .fill(validUser.newPassword);
    await page
      .getByRole("textbox", { name: "Confirm Your New Password" })
      .fill(validUser.newPassword);
    await page.getByRole("button", { name: "RESET PASSWORD" }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });

  test("should remain on forgot password page if user is missing new password", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(validUser.email);
    await page
      .getByRole("textbox", { name: "What is your favorite sport?" })
      .fill(validUser.answer);
    await page
      .getByRole("textbox", { name: "Confirm Your New Password" })
      .fill(validUser.newPassword);
    await page.getByRole("button", { name: "RESET PASSWORD" }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });

  test("should remain on forgot password page if user is missing confirm password", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(validUser.email);
    await page
      .getByRole("textbox", { name: "What is your favorite sport?" })
      .fill(validUser.answer);
    await page
      .getByRole("textbox", { name: "Enter Your New Password" })
      .fill(validUser.newPassword);
    await page.getByRole("button", { name: "RESET PASSWORD" }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });
});
