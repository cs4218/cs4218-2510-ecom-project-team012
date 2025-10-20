import { test, expect } from '@playwright/test';

// test generated with playwright codegen and formatted with AI assistance

const ORIGINAL_NAME = 'Test Bot';
const ORIGINAL_DESCRIPTION = 'A bot that is really good at writing tests';
const UPDATED_NAME = 'Test Bot Updated';
const UPDATED_DESCRIPTION = 'Updated description for the bot';
const PRICE_ORIGINAL = '300';
const PRICE_UPDATED = '350';
const QUANTITY_ORIGINAL = '20';
const QUANTITY_UPDATED = '25';
const SHIPPING_ORIGINAL = 'Yes';
const SHIPPING_UPDATED = 'No';
const PRODUCT_IMAGE = 'tests/data/robot.jpg';

async function loginAndGoToCreateProduct(page) {
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
  await page.getByRole('link', { name: 'Create Product' }).click();
}

test('Invalid product creation shows error toast', async ({ page }) => {
  await loginAndGoToCreateProduct(page);

  // Attempt to submit an empty form
  await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

  // Assert error toast appears
  await expect(page.getByText('Something went wrong')).toBeVisible({ timeout: 5000 });
});

test('Valid product creation, edit, and teardown', async ({ page }) => {
  await loginAndGoToCreateProduct(page);

  // CREATE PRODUCT
  await page.locator('input[type="file"]').setInputFiles(PRODUCT_IMAGE);
  await page.locator('#rc_select_0').click();
  await page.getByTitle('Electronics').locator('div').click();
  await page.getByRole('textbox', { name: 'Input name' }).fill(ORIGINAL_NAME);
  await page.getByRole('textbox', { name: 'Input description' }).fill(ORIGINAL_DESCRIPTION);
  await page.getByPlaceholder('Input Price').fill(PRICE_ORIGINAL);
  await page.getByPlaceholder('Input quantity').fill(QUANTITY_ORIGINAL);
  await page.getByTestId('shipping-select').click();
  await page.getByText(SHIPPING_ORIGINAL).click();
  await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

  // ASSERT CREATION
  await expect(page.getByText('Product created successfully')).toBeVisible({ timeout: 5000 });
  await page.getByRole('heading', { name: 'All Products List' }).waitFor({ state: 'visible', timeout: 5000 });
  await expect(page.getByRole('link', { name: new RegExp(ORIGINAL_NAME, 'i') })).toBeVisible();

  // NAVIGATE TO PRODUCT PAGE
  await page.getByRole('link', { name: new RegExp(ORIGINAL_NAME, 'i') }).click();
  await page.getByRole('textbox', { name: 'Input description' }).waitFor({ state: 'visible', timeout: 5000 });
  await expect(page.getByRole('textbox', { name: 'Input description' })).toHaveValue(ORIGINAL_DESCRIPTION, { timeout: 5000 });

  // EDIT PRODUCT
  await page.getByRole('textbox', { name: 'Input name' }).fill(UPDATED_NAME);
  await page.getByRole('textbox', { name: 'Input description' }).fill(UPDATED_DESCRIPTION);
  await page.getByPlaceholder('Input Price').fill(PRICE_UPDATED);
  await page.getByPlaceholder('Input quantity').fill(QUANTITY_UPDATED);
  await page.getByTestId('shipping-select').click();
  await page.getByText(SHIPPING_UPDATED).click();
  await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click(); 

  // ASSERT EDIT via toast
  await expect(page.getByText('Product updated successfully')).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('link', { name: new RegExp(UPDATED_NAME, 'i') })).toBeVisible();

  // NAVIGATE TO PRODUCT PAGE AFTER EDIT
  await page.getByRole('link', { name: new RegExp(UPDATED_NAME, 'i') }).click();
  await page.getByRole('textbox', { name: 'Input description' }).waitFor({ state: 'visible', timeout: 5000 });
  await expect(page.getByRole('textbox', { name: 'Input description' })).toHaveValue(UPDATED_DESCRIPTION, { timeout: 5000 });

  // TEARDOWN: DELETE PRODUCT
  page.once('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept('yes'); // type "yes" and confirm
  });
  await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();

  // ASSERT DELETION via toast
  await expect(page.getByText('Product deleted successfully')).toBeVisible({ timeout: 5000 });
});
