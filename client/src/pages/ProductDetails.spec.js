import { test, expect } from "@playwright/test";

test("Load Product Details Page with product information and related products", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/");

  // Click on a product from the homepage
  await page
    .getByRole("button", { name: /More Details/i })
    .first()
    .click();

  // Assert navigation to product details page
  await page.waitForURL("**/product/**");
  const main = page.getByRole("main");
  await expect(main).toContainText(/Product Details/i);

  // Check for product information
  await expect(main).toContainText(/Name :/i);
  await expect(main).toContainText(/Description :/i);
  await expect(main).toContainText(/Price :/i);
  await expect(main).toContainText(/Category :/i);

  await expect(main).toContainText(/nus t-?shirt/i);
  await expect(main).toContainText(/plain nus t-?shirt for sale/i);
  await expect(main).toContainText(/\$4\.99/i);
  await expect(main).toContainText(/clothing/i);
  await expect(main.getByRole("img")).toHaveAttribute("alt", /nus t-?shirt/i);
  await expect(main.getByRole("img")).toHaveAttribute(
    "src",
    /\/api\/v1\/product\/product-photo\/[a-f0-9]{24}/i
  );

  // expect add to cart button
  const addToCartButton = page.getByRole("button", { name: /Add to Cart/i });
  await expect(addToCartButton).toBeVisible();

  // Check for related products section
  const relatedProductsSection = main.getByTestId("related-products-section");
  await expect(relatedProductsSection).toBeVisible();
  await expect(relatedProductsSection).toContainText(/Similar Products/i);
  await expect(relatedProductsSection).toContainText(
    /No similar products found/i
  );
});

test("Load Product Details Page with product with related products and able to navigate to related products Product Detail page", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/product/smartphone");

  // Assert navigation to product details page
  await page.waitForURL("**/product/smartphone");
  const main = page.getByRole("main");
  await expect(main).toContainText(/Product Details/i);
  await expect(main).toContainText(/smartphone/i);

  // Check for related products section
  const relatedProductsSection = main.getByTestId("related-products-section");
  await expect(relatedProductsSection).toBeVisible();
  await expect(relatedProductsSection).toContainText(/Similar Products/i);
  await expect(relatedProductsSection).toContainText(/laptop/i);
  await expect(relatedProductsSection).not.toContainText(/smartphone/i);
  await expect(relatedProductsSection).not.toContainText(/nus t-?shirt/i);

  // Navigate to related product's detail page
  const relatedProductMoreDetailsButton = relatedProductsSection.getByRole(
    "button",
    { name: /More Details/i }
  );
  await relatedProductMoreDetailsButton.click();

  // Assert navigation to related product details page
  await page.waitForURL("**/product/laptop");
  const relatedProductMain = page.getByRole("main");
  await expect(relatedProductMain).toContainText(/Product Details/i);
  await expect(relatedProductMain).toContainText(/laptop/i);
  const relatedProductSimilarProductsSection = relatedProductMain.getByTestId(
    "related-products-section"
  );
  await expect(relatedProductSimilarProductsSection).toBeVisible();
  await expect(relatedProductSimilarProductsSection).toContainText(
    /smartphone/i
  );
});

test("Navigate to non-existent product slug redirects to Page Not Found", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/product/non-existent-slug-12345");

  // Assert redirection to Page Not Found
  await page.waitForURL("**/page-not-found");
  const main = page.getByRole("main");
  await expect(main).toContainText(/Page Not Found/i);

  const goHomeButton = page.getByRole("link", { name: /Go Back/i });
  await goHomeButton.click();
  await page.waitForURL("**/");

  // Assert redirected to homepage
  await expect(page).toHaveURL("http://localhost:3000/");
});

test("Able to Add Product to Cart from Product Details Page", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/product/smartphone");

  // Assert navigation to product details page
  await page.waitForURL("**/product/smartphone");
  const main = page.getByRole("main");
  await expect(main).toContainText(/Product Details/i);
  await expect(main).toContainText(/smartphone/i);

  // Click on Add to Cart button
  const addToCartButton = page.getByRole("button", { name: /Add to Cart/i });
  await addToCartButton.click();

  // Check for confirmation message or cart update
  const cartCount = page.getByTestId("cart-count");
  await expect(cartCount).toHaveText(/1/);

  // Check that add to cart button is not disabled
  await expect(addToCartButton).not.toBeDisabled();
});

test("User unable to Add out-of-stock Product to Cart from Product Details Page", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/product/out-of-stock-product");

  // Assert navigation to product details page
  await page.waitForURL("**/product/out-of-stock-product");
  const main = page.getByRole("main");
  await expect(main).toContainText(/Product Details/i);
  await expect(main).toContainText(/sold out/i);

  // Check that Add to Cart button is disabled
  const addToCartButton = page.getByRole("button", { name: /sold out/i });
  await expect(addToCartButton).toBeDisabled();
});

test("User can only add one instance of a product to cart from Product Details Page if the product stock has 1", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/product/left-1-stock-product");

  // Assert navigation to product details page
  await page.waitForURL("**/product/left-1-stock-product");
  const main = page.getByRole("main");
  await expect(main).toContainText(/Product Details/i);
  await expect(main).toContainText(/left 1 stock product/i);

  // Click on Add to Cart button
  const addToCartButton = page.getByRole("button", { name: /Add to Cart/i });
  await addToCartButton.click();

  // Check for confirmation message or cart update
  const cartCount = page.getByTestId("cart-count");
  await expect(cartCount).toHaveText(/1/);

  await expect(addToCartButton).not.toBeVisible();
  const outOfStockButton = page.getByRole("button", { name: /sold out/i });
  await expect(outOfStockButton).toBeVisible();
});
