import { test, expect } from "@playwright/test";

test("Load Homepage", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  const main = page.getByRole("main");

  await expect(main).toContainText(/the law of contract in singapore/i);
  await expect(main).toContainText(/nus t-?shirt/i);
  await expect(main).toContainText(/smartphone/i);
  await expect(main).toContainText(/laptop/i);
  await expect(main).toContainText(/textbook/i);
});
