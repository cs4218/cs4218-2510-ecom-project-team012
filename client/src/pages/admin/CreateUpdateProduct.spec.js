import { test, expect } from '@playwright/test';

const originalProduct = {
    name: 'Test Bot',
    description: 'A bot that is really good at writing tests',
    price: '300', 
    quantity: '20',
    category: 'Electronics',
    shipping: 'Yes',
    photo: 'tests/data/robot.jpg'
};

const updatedProduct = {
    name: 'Test Bot Updated',
    description: 'Updated description for the bot',
    price: '350', 
    quantity: '25',
    category: 'Electronics',
    shipping: 'No',
    photo: 'tests/data/robot.jpg'
};

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
  await page.locator('input[type="file"]').setInputFiles(originalProduct.photo);
  await page.locator('#rc_select_0').click();
  await page.getByTitle(originalProduct.category).locator('div').click();
  await page.getByRole('textbox', { name: 'Input name' }).fill(originalProduct.name);
  await page.getByRole('textbox', { name: 'Input description' }).fill(originalProduct.description);
  await page.getByPlaceholder('Input Price').fill(originalProduct.price);
  await page.getByPlaceholder('Input quantity').fill(originalProduct.quantity);
  await page.getByTestId('shipping-select').click();
  await page.getByText(originalProduct.shipping).click();
  await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

  // ASSERT CREATION
  await expect(page.getByText('Product created successfully')).toBeVisible({ timeout: 5000 });
  await page.getByRole('heading', { name: 'All Products List' }).waitFor({ state: 'visible', timeout: 5000 });
  await expect(page.getByRole('link', { name: new RegExp(originalProduct.name, 'i') })).toBeVisible();

  // NAVIGATE TO PRODUCT PAGE
  await page.getByRole('link', { name: new RegExp(originalProduct.name, 'i') }).click();
  await page.getByRole('textbox', { name: 'Input description' }).waitFor({ state: 'visible', timeout: 5000 });
  await expect(page.getByRole('textbox', { name: 'Input description' })).toHaveValue(originalProduct.description, { timeout: 5000 });

  // EDIT PRODUCT
  await page.getByRole('textbox', { name: 'Input name' }).fill(updatedProduct.name);
  await page.getByRole('textbox', { name: 'Input description' }).fill(updatedProduct.description);
  await page.getByPlaceholder('Input Price').fill(updatedProduct.price);
  await page.getByPlaceholder('Input quantity').fill(updatedProduct.quantity);
  await page.getByTestId('shipping-select').click();
  await page.getByText(updatedProduct.shipping).click();
  await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();

  // ASSERT EDIT via toast
  await expect(page.getByText('Product updated successfully')).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('link', { name: new RegExp(updatedProduct.name, 'i') })).toBeVisible();

  // NAVIGATE TO PRODUCT PAGE AFTER EDIT
  await page.getByRole('link', { name: new RegExp(updatedProduct.name, 'i') }).click();
  await page.getByRole('textbox', { name: 'Input description' }).waitFor({ state: 'visible', timeout: 5000 });
  await expect(page.getByRole('textbox', { name: 'Input description' })).toHaveValue(updatedProduct.description, { timeout: 5000 });

  // TEARDOWN: DELETE PRODUCT
  page.once('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept('yes'); // type "yes" and confirm
  });
  await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();

  // ASSERT DELETION via toast
  await expect(page.getByText('Product deleted successfully')).toBeVisible({ timeout: 5000 });
});
