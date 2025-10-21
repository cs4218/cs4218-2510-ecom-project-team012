import { test, expect } from "@playwright/test";

test("Load Category Products Page with product information", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/");

  // Click on the category in the header
  await page.getByRole("link", { name: "Categories" }).click(); // open dropdown
  await page.getByRole("link", { name: "Electronics" }).click(); // select item

  await page.waitForURL("**/category/electronics");

  const main = page.getByRole("main");
  await expect(main).toContainText(/electronics/i);
  await expect(main).toContainText(/2 result found/i);

  await expect(main).toContainText(/smartphone/i);
  await expect(main).toContainText(/laptop/i);

  // Check for product prices and descriptions
  await expect(main).toContainText(/\$1,499.99/i);
  await expect(main).toContainText(/\$999.99/i);
  await expect(main).toContainText(/A powerful laptop.../i);
  await expect(main).toContainText(/A high-end smartphone.../i);

  // Check for 'More Details' buttons
  const moreDetailsButtons = main.getByRole("button", {
    name: /More Details/i,
  });
  await expect(moreDetailsButtons.nth(0)).toBeVisible();
  await expect(moreDetailsButtons.nth(1)).toBeVisible();
});

test("User able to navigate to product details from Category Products Page", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/");

  // Click on the category in the header
  await page.getByRole("link", { name: "Categories" }).click(); // open dropdown
  await page.getByRole("link", { name: "Electronics" }).click(); // select item

  await page.waitForURL("**/category/electronics");

  // Click on 'More Details' of the first product
  const firstMoreDetailsButton = page
    .getByRole("button", {
      name: /More Details/i,
    })
    .first();
  await firstMoreDetailsButton.click();

  // Assert navigation to product details page
  await page.waitForURL("**/product/**");
  const main = page.getByRole("main");
  await expect(main).toContainText(/Product Details/i);
  await expect(main).toContainText(/laptop/i);

  // Check for related products section
  await expect(main).toContainText(/Similar Products/i);
  await expect(main).toContainText(/smartphone/i);
});

test("Load Category Products Page with no products", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  // Click on the category in the header
  await page.getByRole("link", { name: "Categories" }).click(); // open dropdown
  await page.getByRole("link", { name: "Furniture" }).click(); // select item

  await page.waitForURL("**/category/furniture");

  const main = page.getByRole("main");
  await expect(main).toContainText(/furniture/i);
  await expect(main).toContainText(/0 result found/i);
});

test("User navigates to non-existent category and sees page not found", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/category/non-existent-category");
  const main = page.getByRole("main");
  await expect(main).toContainText(/Page Not Found/i);

  // CLicks on 'Go to Home' button
  const goHomeButton = page.getByRole("link", { name: /Go Back/i });
  await goHomeButton.click();
  await page.waitForURL("**/");

  // Assert redirected to homepage
  await expect(page).toHaveURL("http://localhost:3000/");
});
