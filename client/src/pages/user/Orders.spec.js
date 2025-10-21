import { test, expect } from '@playwright/test';

const USER_AUTH_API   = '**/api/**/user-auth';
const CATEGORY_API    = '**/api/**/get-category';
const ANY_ORDERS_API  = '**/api/**/orders';

const mockCategories = [
  { _id: 'c1', name: 'Electronics', slug: 'electronics' },
  { _id: 'c2', name: 'Clothing',    slug: 'clothing' },
];

const mockOrders = [
  {
    _id: 'ord-u-001',
    status: 'Processing',
    buyer: { name: 'CS 4218 Test Account' },
    // Orders.js uses "createAt" (typo) for moment().fromNow()
    createAt: new Date().toISOString(),
    payment: { success: true },
    products: [
      { _id: 'p101', name: 'Travel Backpack', description: 'Durable backpack for daily use', price: 129 },
      { _id: 'p102', name: 'Wireless Mouse',  description: 'Ergonomic wireless mouse',      price:  59 },
    ],
  },
  {
    _id: 'ord-u-002',
    status: 'Not Process',
    buyer: { name: 'CS 4218 Test Account' },
    createAt: new Date(Date.now() - 3600_000).toISOString(),
    payment: { success: false },
    products: [
      { _id: 'p201', name: 'Running Shoes', description: 'Lightweight and comfy', price: 299 },
    ],
  },
];

// ---- Interceptors & seeding ----
async function interceptGuardsAndHeader(page) {
  // user-auth guard
  await page.route(USER_AUTH_API, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  // categories for Header
  await page.route(CATEGORY_API, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, category: mockCategories }),
    });
  });
}

async function interceptUserOrders(page) {
  await page.route(ANY_ORDERS_API, async (route, req) => {
    const url = req.url();
    const method = req.method();

    // Only fulfill the *user* Orders GET (paths often like /api/v1/auth/orders)
    const looksLikeUserOrders =
      method === 'GET' &&
      /\/api\/.+\/auth\/.*orders/.test(url);

    if (!looksLikeUserOrders) {
      // Let any other "orders" endpoints (admin, post, etc.) proceed normally
      return route.continue();
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockOrders),
    });
  });
}

async function seedUserAuth(page, { name = 'Test User', role = 0 } = {}) {
  await page.addInitScript(user => {
    localStorage.setItem('auth', JSON.stringify({ user, token: 'user-fake-token' }));
    localStorage.setItem('cart', '[]');
  }, { name, role });
}

// ---- Navigation ----
async function openUserOrders(page) {
  // Try a handful of likely routes first
  const candidates = [
    '/dashboard/user/orders',
    '/dashboard/user/all-orders',
    '/dashboard/orders',
    '/dashboard/user',
  ];

  for (const path of candidates) {
    await page.goto(path);
    const readySoon = await Promise.race([
      page.locator('table').first().isVisible().catch(() => false),
      page.locator('.col-md-9 .border.shadow').first().isVisible().catch(() => false),
      page.locator('.card.flex-row').first().isVisible().catch(() => false),
      page.getByRole('heading', { name: /orders/i }).first().isVisible().catch(() => false),
      (async () => { await page.waitForTimeout(250); return false; })(),
    ]);
    if (readySoon) break;
  }

  const clickCandidates = [
    page.getByRole('link',   { name: /all orders|my orders|orders/i }),
    page.getByRole('button', { name: /all orders|my orders|orders/i }),
    page.locator('a[href*="/orders"]'),
  ];
  for (const loc of clickCandidates) {
    if (await loc.count()) {
      const el = loc.first();
      if (await el.isVisible().catch(() => false)) {
        await el.click();
        break;
      }
    }
  }

  await expect
    .poll(async () => {
      const t  = await page.locator('table').count().catch(() => 0);
      const b  = await page.locator('.col-md-9 .border.shadow').count().catch(() => 0);
      const c  = await page.locator('.card.flex-row').count().catch(() => 0);
      const h  = await page.getByRole('heading', { name: /orders/i }).count().catch(() => 0);
      return t + b + c + h;
    }, { timeout: 12000 })
    .toBeGreaterThan(0);
}

test.describe('Orders page (user)', () => {
  test.beforeEach(async ({ page }) => {
    await interceptGuardsAndHeader(page);
    await interceptUserOrders(page);
    await seedUserAuth(page);
  });

  test('renders order tables with correct headers & summary cells', async ({ page }) => {
    await openUserOrders(page);

    const hasTable = (await page.locator('table').count()) > 0;

    if (hasTable) {
      // If multiple order sections exist, scope to the first block if present
      const firstBlock = (await page.locator('.col-md-9 .border.shadow').count()) > 0
        ? page.locator('.col-md-9 .border.shadow').first()
        : page.locator('table').first();

      const firstRowCells = firstBlock.locator('tbody tr').first().locator('td');
      await expect(firstRowCells.nth(0)).toHaveText('1');
      await expect(firstRowCells.nth(1)).toHaveText(mockOrders[0].status);
      await expect(firstRowCells.nth(2)).toHaveText(mockOrders[0].buyer.name);
      await expect(firstRowCells.nth(3)).not.toHaveText('');
      await expect(firstRowCells.nth(4)).toHaveText('Success');
      await expect(firstRowCells.nth(5)).toHaveText(String(mockOrders[0].products.length));
      return;
    }

    await expect(page.getByText(mockOrders[0].buyer.name)).toBeVisible();
    await expect(page.getByText('Success')).toBeVisible();

    const totalExpectedCards =
      mockOrders[0].products.length + mockOrders[1].products.length; // 2 + 1 = 3

    await expect
      .poll(async () => await page.locator('.card.flex-row').count(), { timeout: 8000 })
      .toBe(totalExpectedCards);
  });

  test('renders product cards (name, description, price, image) for each order', async ({ page }) => {
    await openUserOrders(page);

    // Prefer scoping by explicit order sections if present
    const orderBlocks = page.locator('.col-md-9 .border.shadow');
    const blockCount = await orderBlocks.count();

    if (blockCount > 0) {
      // First order products
      const firstOrderBlock = orderBlocks.first();
      const firstCards = firstOrderBlock.locator('.container .card.flex-row');
      await expect(firstCards).toHaveCount(mockOrders[0].products.length);

      const firstCard = firstCards.first();
      await expect(firstCard.getByText(mockOrders[0].products[0].name)).toBeVisible();
      await expect(firstCard.getByText(/Price\s*:\s*129/)).toBeVisible();
      await expect(firstCard.getByText(/Durable backpack/i)).toBeVisible();

      const firstImg = firstCard.locator('img').first();
      await expect(firstImg).toHaveAttribute(
        'src',
        new RegExp(`/api/v1/product/product-photo/${mockOrders[0].products[0]._id}`)
      );

      // Second order single product
      const secondOrderBlock = orderBlocks.nth(1);
      const secondCards = secondOrderBlock.locator('.container .card.flex-row');
      await expect(secondCards).toHaveCount(mockOrders[1].products.length);

      const secondCard = secondCards.first();
      await expect(secondCard.getByText(mockOrders[1].products[0].name)).toBeVisible();
      await expect(secondCard.getByText(/Price\s*:\s*299/)).toBeVisible();
      await expect(secondCard.getByText(/Lightweight and comfy/i)).toBeVisible();

      const secondImg = secondCard.locator('img').first();
      await expect(secondImg).toHaveAttribute(
        'src',
        new RegExp(`/api/v1/product/product-photo/${mockOrders[1].products[0]._id}`)
      );
      return;
    }

    const cards = page.locator('.card.flex-row');
    await expect(cards).toHaveCount(
      mockOrders[0].products.length + mockOrders[1].products.length
    );

    // First order, first product card
    const firstCard = cards.nth(0);
    await expect(firstCard.getByText('Travel Backpack')).toBeVisible();
    await expect(firstCard.getByText(/Price\s*:\s*129/)).toBeVisible();
    await expect(firstCard.getByText(/Durable backpack/i)).toBeVisible();

    const firstImg = firstCard.locator('img').first();
    await expect(firstImg).toHaveAttribute(
      'src',
      new RegExp(`/api/v1/product/product-photo/${mockOrders[0].products[0]._id}`)
    );
  });
});
