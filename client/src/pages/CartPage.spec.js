import { test, expect } from "@playwright/test";

const testUser1 = {
  name: "CS 4218 Test Account",
  email: "cs4218@test.com",
  password: "cs4218@test.com",
  address: "1 Computing Drive",
};

test.describe.configure({ mode: "serial" });

test.describe("Cart Page UI Testing", () => {
  test.describe("Handle Unauthenticated User with no items in cart", () => {
    test("Load Cart Page with guest greeting and prompt to login with no items in cart", async ({
      page,
    }) => {
      await page.goto("http://localhost:3000/cart");

      // Assert navigation to cart page
      await page.waitForURL("**/cart");
      const main = page.getByRole("main");
      await expect(main).toBeVisible();

      await expect(main).toContainText(/hello guest/i);
      await expect(main).toContainText(/your cart is empty/i);
      await expect(main).toContainText(/please login to checkout/i);
      await expect(main).toContainText(/\$0\.00/i);

      // ensure no payment button is visible
      const payButton = page.getByRole("button", { name: /pay/i });
      await expect(payButton).not.toBeVisible();
    });
  });

  test.describe("Handle Unauthenticated User with Cart Items", () => {
    test.beforeEach(async ({ page }) => {
      // Clear localStorage before each test
      await page.goto("http://localhost:3000");
      await page.evaluate(() => localStorage.clear());

      // Add items to cart in localStorage
      await page.goto("http://localhost:3000/product/smartphone");
      // Add first product (twice)
      await page.getByRole("button", { name: /Add to Cart/i }).click();
      await page.getByRole("button", { name: /Add to Cart/i }).click();
      // Add second product
      await page.goto("http://localhost:3000/product/laptop");
      await page.getByRole("button", { name: /Add to Cart/i }).click();

      // Navigate to cart page
      await page.goto("http://localhost:3000/cart");
    });

    test("Load Cart Page with items in cart", async ({ page }) => {
      // Assert navigation to cart page
      await page.waitForURL("**/cart");
      const main = page.getByRole("main");
      await expect(main).toBeVisible();

      await expect(main).toContainText(/hello guest/i);
      await expect(main).toContainText(/you have 3 items in your cart/i);
      await expect(main).toContainText(/laptop/i);
      await expect(main).toContainText(/smartphone/i);
      await expect(main).toContainText(/\$3\,499\.97/i);
      await expect(main).toContainText(/please login to checkout/i);

      // ensure no payment button is visible
      const payButton = page.getByRole("button", { name: /pay/i });
      await expect(payButton).not.toBeVisible();
    });

    test("Remove item from cart", async ({ page }) => {
      // Remove one smartphone from cart
      const removeButtons = page.getByRole("button", { name: /remove/i });
      await removeButtons.nth(0).click(); // remove first smartphone

      // Check updated cart contents
      const main = page.getByRole("main");
      await expect(main).toContainText(/you have 2 items in your cart/i);
      await expect(main).toContainText(/laptop/i);
      await expect(main).toContainText(/smartphone/i);
      await expect(main).toContainText(/\$2\,499\.98/i); // updated total price
    });

    test("Login from Cart Page and verify cart contents persist", async ({
      page,
    }) => {
      // Click on login link
      const loginLink = page.getByRole("link", { name: /login/i });
      await loginLink.click();

      // Perform login
      await page.waitForURL("**/login");
      await page.getByPlaceholder("Enter Your Email").fill(testUser1.email);
      await page
        .getByPlaceholder("Enter Your Password")
        .fill(testUser1.password);
      await page.getByRole("button", { name: /login/i }).click();

      // Wait for redirection back to home page
      await page.waitForURL("**/");

      // Navigate back to cart page
      await page.goto("http://localhost:3000/cart");
      await page.waitForURL("**/cart");
      const main = page.getByRole("main");
      await expect(main).toBeVisible();

      // Verify cart contents persist
      await expect(main).toContainText(
        new RegExp(`hello  ${testUser1.name}`, "i")
      );
      await expect(main).toContainText(/you have 3 items in your cart/i);
      await expect(main).toContainText(/laptop/i);
      await expect(main).toContainText(/smartphone/i);
      await expect(main).toContainText(/\$3\,499\.97/i);
    });

    test("Refresh Cart Page and verify cart contents persist for unauthenticated user", async ({
      page,
    }) => {
      // Refresh the cart page
      await page.reload();
      await page.waitForURL("**/cart");
      const main = page.getByRole("main");
      await expect(main).toBeVisible();

      // Verify cart contents persist
      await expect(main).toContainText(/hello guest/i);
      await expect(main).toContainText(/you have 3 items in your cart/i);
      await expect(main).toContainText(/laptop/i);
      await expect(main).toContainText(/smartphone/i);
      await expect(main).toContainText(/\$3\,499\.97/i);
    });
  });

  test.describe("Handle Authenticated User with Cart Items", () => {
    test.beforeEach(async ({ page }) => {
      // Clear localStorage before each test
      await page.goto("http://localhost:3000");
      await page.evaluate(() => localStorage.clear());

      // Perform login
      await page.goto("http://localhost:3000/login");
      await page.getByPlaceholder("Enter Your Email").fill(testUser1.email);
      await page
        .getByPlaceholder("Enter Your Password")
        .fill(testUser1.password);
      await page.getByRole("button", { name: /login/i }).click();

      // Wait for redirection back to home page
      await page.waitForURL("**/");

      // Add items to cart
      await page.goto("http://localhost:3000/product/smartphone");
      // Add first product (twice)
      await page.getByRole("button", { name: /Add to Cart/i }).click();
      await page.getByRole("button", { name: /Add to Cart/i }).click();
      // Add second product
      await page.goto("http://localhost:3000/product/laptop");
      await page.getByRole("button", { name: /Add to Cart/i }).click();

      // Navigate to cart page
      await page.goto("http://localhost:3000/cart");
    });

    test("Load Cart Page with items in cart for authenticated user", async ({
      page,
    }) => {
      // Assert navigation to cart page
      await page.waitForURL("**/cart");
      const main = page.getByRole("main");
      await expect(main).toBeVisible();

      await expect(main).toContainText(
        new RegExp(`hello  ${testUser1.name}`, "i")
      );
      await expect(main).toContainText(/you have 3 items in your cart/i);
      await expect(main).toContainText(/laptop/i);
      await expect(main).toContainText(/smartphone/i);
      await expect(main).toContainText(/\$3\,499\.97/i);

      // ensure address prompt is visible
      await expect(main).toContainText(/current address/i);
      await expect(main).toContainText(new RegExp(`${testUser1.address}`, "i"));

      // ensure payment button is visible
      const payButton = page.getByRole("button", { name: /payment/i });
      await expect(payButton).toBeVisible();
    });

    test("Able to remove item from cart", async ({ page }) => {
      // Remove one smartphone from cart
      const removeButtons = page.getByRole("button", { name: /remove/i });
      await removeButtons.nth(0).click(); // remove first smartphone

      // Check updated cart contents
      const main = page.getByRole("main");
      await expect(main).toContainText(/you have 2 items in your cart/i);
      await expect(main).toContainText(/laptop/i);
      await expect(main).toContainText(/smartphone/i);
      await expect(main).toContainText(/\$2\,499\.98/i); // updated total price
    });

    test("Refresh Cart Page and verify cart contents persist for authenticated user", async ({
      page,
    }) => {
      // Refresh the cart page
      await page.reload();
      await page.waitForURL("**/cart");
      const main = page.getByRole("main");
      await expect(main).toBeVisible();

      // Verify cart contents persist
      await expect(main).toContainText(
        new RegExp(`hello  ${testUser1.name}`, "i")
      );
      await expect(main).toContainText(/you have 3 items in your cart/i);
      await expect(main).toContainText(/laptop/i);
      await expect(main).toContainText(/smartphone/i);
      await expect(main).toContainText(/\$3\,499\.97/i);
    });

    test("Logout from Cart Page and verify cart contents persist", async ({
      page,
    }) => {
      // Click on logout link
      await page
        .locator("a.nav-link.dropdown-toggle", {
          hasText: "CS 4218 Test Account",
        })
        .click();
      await page.getByRole("link", { name: "logout" }).click();

      // Wait for redirection
      await page.waitForURL("**/login");

      // Navigate back to cart page
      await page.goto("http://localhost:3000/cart");
      await page.waitForURL("**/cart");
      const main = page.getByRole("main");
      await expect(main).toBeVisible();

      // Verify cart contents mantained for unauthenticated user
      await expect(main).toContainText(/hello guest/i);
      await expect(main).toContainText(/you have 3 items in your cart/i);
      await expect(main).toContainText(/laptop/i);
      await expect(main).toContainText(/smartphone/i);
      await expect(main).toContainText(/\$3\,499\.97/i);
    });

    test("Update Address from Cart Page and ensure that Address is updated and cart contents persist", async ({
      page,
    }) => {
      // Click on update address button
      const updateAddressButton = page.getByRole("button", {
        name: /update address/i,
      });
      await updateAddressButton.click();

      // Wait for navigation to profile page
      await page.waitForURL("**/dashboard/user/profile");

      // Update address field
      const newAddress = "42 New Address St, Test City";
      await page.getByPlaceholder("Enter Your Address").fill(newAddress);
      await page.getByRole("button", { name: /update/i }).click();

      // Wait for profile update confirmation (could be a toast or message)
      const main = page.getByRole("main");
      await expect(main).toContainText(/profile updated successfully/i);

      // Navigate back to cart page
      await page.goto("http://localhost:3000/cart");
      await page.waitForURL("**/cart");

      // Verify updated address is shown and cart contents persist
      await expect(main).toContainText(/current address/i);
      await expect(main).toContainText(new RegExp(newAddress, "i"));
      await expect(main).toContainText(/you have 3 items in your cart/i);
      await expect(main).toContainText(/laptop/i);
      await expect(main).toContainText(/smartphone/i);
      await expect(main).toContainText(/\$3\,499\.97/i);

      await updateAddressButton.click();

      // Wait for navigation to profile page
      await page.waitForURL("**/dashboard/user/profile");

      // Update address field back to original
      await page.getByPlaceholder("Enter Your Address").fill(testUser1.address);
      await page.getByRole("button", { name: /update/i }).click();

      // Wait for profile update confirmation (could be a toast or message)
      await expect(main).toContainText(/profile updated successfully/i);
    });
  });

  test.describe("Authenticated User with No Cart Items", () => {
    test.beforeEach(async ({ page }) => {
      // Clear localStorage before each test
      await page.goto("http://localhost:3000");
      await page.evaluate(() => localStorage.clear());

      // Perform login
      await page.goto("http://localhost:3000/login");
      await page.getByPlaceholder("Enter Your Email").fill(testUser1.email);
      await page
        .getByPlaceholder("Enter Your Password")
        .fill(testUser1.password);
      await page.getByRole("button", { name: /login/i }).click();

      // Wait for redirection back to home page
      await page.waitForURL("**/");

      // Navigate to cart page
      await page.goto("http://localhost:3000/cart");
    });

    test("Load Cart Page with no items in cart for authenticated user", async ({
      page,
    }) => {
      // Assert navigation to cart page
      await page.waitForURL("**/cart");
      const main = page.getByRole("main");
      await expect(main).toBeVisible();

      await expect(main).toContainText(
        new RegExp(`hello  ${testUser1.name}`, "i")
      );
      await expect(main).toContainText(/your cart is empty/i);
      await expect(main).toContainText(/\$0\.00/i);

      // ensure address prompt is visible
      await expect(main).toContainText(/current address/i);
      await expect(main).toContainText(new RegExp(`${testUser1.address}`, "i"));

      // ensure payment button is not visible
      const payButton = page.getByRole("button", { name: /pay/i });
      await expect(payButton).not.toBeVisible();
    });
  });
});
