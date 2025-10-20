import { test, expect } from "@playwright/test";

const testUser1 = {
  email: "cs4218@test.com",
  password: "cs4218@test.com",
};

test("Load Dashboard (Login -> Homepage -> PrivateRoute -> Dashboard.js + components/UserMenu.js -> Profile.js + Orders.js)", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/login");

  // simulate authenticated user by saving to localStorage
  await page.getByPlaceholder("Enter Your Email").fill(testUser1.email);
  await page.getByPlaceholder("Enter Your Password").fill(testUser1.password);
  await page.getByRole("button", { name: /login/i }).click();

  // ✅ Wait for redirect to home page or dashboard nav
  await page.waitForURL("**/"); // adjust to whatever route login redirects to

  // navigate to dashboard
  await page.goto("http://localhost:3000/dashboard/user");

  // wait for main dashboard to load
  const main = page.getByRole("main");
  await expect(main).toBeVisible();

  const profileLink = page.getByRole("link", { name: /^profile$/i });
  await expect(profileLink).toBeVisible();
  const ordersLink = page.getByRole("link", { name: /orders/i });
  await expect(ordersLink).toBeVisible();

  // navigate to profile page
  await profileLink.click();
  await page.waitForURL("**/dashboard/user/profile");
  await expect(
    page.getByRole("heading", { name: /user profile/i })
  ).toBeVisible();

  // navigate to orders page
  await ordersLink.click();
  await page.waitForURL("**/dashboard/user/orders");
  await expect(
    page.getByRole("heading", { name: /all orders/i })
  ).toBeVisible();
});

test("Redirect unauthenticated user from dashboard to home page", async ({
  browser,
}) => {
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/dashboard/user");
  await page.waitForURL("**/");
  expect(page.url()).toBe("http://localhost:3000/");
});
