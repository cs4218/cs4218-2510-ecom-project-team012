import { test, expect } from '@playwright/test';

// test generated with playwright codegen and formatted with AI assistance

async function loginAndGoToCreateCategory(page) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@admin.com');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('test@admin.com');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.getByRole('button', { name: 'Test' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Create Category' }).click();
}

test('Admin can create, edit, and delete category', async ({ page }) => {
  await loginAndGoToCreateCategory(page);

  const originalName = 'Test Cat';
  const updatedName = 'New Test Cat';

  // CREATE
  const input = page.getByRole('textbox', { name: 'Enter new category' });
  await input.click();
  await input.fill(originalName);
  await page.getByRole('button', { name: 'Submit' }).click();

  // Assert creation via toast
  await expect(page.getByText(`${originalName} is created`)).toBeVisible({ timeout: 5000 });

  // EDIT
  await page.getByRole('button', { name: 'Edit' }).nth(3).click();
  const modalInput = page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' });
  await modalInput.click();
  await modalInput.press('ControlOrMeta+a');
  await modalInput.fill(updatedName);
  await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();

  // Assert edit via toast
  await expect(page.getByText(`${updatedName} is updated`)).toBeVisible({ timeout: 5000 });

  // DELETE
  await page.getByRole('button', { name: 'Delete' }).nth(3).click();

  // Assert deletion via toast
  await expect(page.getByText(`Category is deleted`)).toBeVisible({ timeout: 5000 });

});
