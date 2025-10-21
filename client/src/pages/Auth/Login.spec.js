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

test.describe.configure({ mode: "serial" });

const validLogin = {
  email: "abc@gmail.com",
  password: "1234",
  wrongEmail: "abcd@gmail.com",
  wrongPassword: "123",
};

const unregisteredLogin = {
  email: "def@gmail.com",
  password: "1234",
};

test.describe("Login Page", () => {
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
    await page.goto("http://localhost:3000/login");
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
      page.getByRole("heading", { name: "LOGIN FORM" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Enter Your Password" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Forgot Password" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "LOGIN" })).toBeVisible();
  });

  test("should redirect user to Home page on successful login", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(validLogin.email);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(validLogin.password);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("should remain on login page if they log in with the wrong email", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(validLogin.wrongEmail);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(validLogin.password);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("should remain on login page if they log in with the wrong password", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(validLogin.email);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(validLogin.wrongPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(
      page
        .locator("div")
        .filter({ hasText: /^Something went wrong$/ })
        .nth(2)
    ).toBeVisible();
  });

  test("should remain on login page if they log in with unregistered account", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(unregisteredLogin.email);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(unregisteredLogin.password);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("should remain on login page if user entered invalid credentials", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(unregisteredLogin.email);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(unregisteredLogin.password);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("should remain on login page if user is missing email", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(validLogin.password);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("should remain on login page if user is missing password", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(validLogin.email);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });
});
