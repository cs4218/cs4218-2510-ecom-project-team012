import { test, expect } from '@playwright/test';

const CATEGORY_API       = '**/api/**/get-category';
const ADMIN_AUTH_API     = '**/api/**/admin-auth';
const USER_AUTH_API      = '**/api/**/user-auth';
const ADMIN_ALL_ORDERS   = '**/api/v1/auth/all-orders';
const ADMIN_UPDATE_ORDER = /\/api\/v1\/auth\/order-status\/([^/]+)$/;

const mockCategories = [
  { _id: 'c1', name: 'Electronics', slug: 'electronics' },
  { _id: 'c2', name: 'Clothing',    slug: 'clothing' },
];

const orderId1 = 'ord-111';
const orderId2 = 'ord-222';

const baseOrders = [
  {
    _id: orderId1,
    status: 'Processing',
    buyer: { name: 'Alice AdminBuyer' },
    createAt: new Date().toISOString(),
    payment: { success: true },
    products: [
      { _id: 'p1', name: 'Laptop Pro 14',       description: 'Powerful laptop for work and play', price: 4999 },
      { _id: 'p2', name: 'NoiseCancel Headset', description: 'Blocks out the world',              price:  699 },
    ],
  },
  {
    _id: orderId2,
    status: 'Not Process',
    buyer: { name: 'Bob Buyer' },
    createAt: new Date(Date.now() - 86400000).toISOString(),
    payment: { success: false },
    products: [
      { _id: 'p3', name: 'Mechanical Keyboard', description: 'Clicky keys galore', price: 299 },
    ],
  },
];

async function interceptGuardsHeaderAndData(page) {
  await page.route(ADMIN_AUTH_API, async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  await page.route(USER_AUTH_API, async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  await page.route(CATEGORY_API, async route => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, category: mockCategories }),
    });
  });
}
async function interceptOrdersWithRefresh(page) {
  let getCount = 0;
  await page.route(ADMIN_ALL_ORDERS, async route => {
    getCount += 1;
    const orders = getCount === 1
      ? baseOrders
      : [{ ...baseOrders[0], status: 'Shipped' }, baseOrders[1]];
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify(orders),
    });
  });
}
async function seedAdminAuth(page, { name = 'Admin Guy', role = 1 } = {}) {
  await page.addInitScript(user => {
    localStorage.setItem('auth', JSON.stringify({ user, token: 'admin-fake-token' }));
    localStorage.setItem('cart', '[]');
  }, { name, role });
}
async function tryClickOrdersLink(page) {
  const candidates = [
    page.getByRole('link',   { name: /orders/i }),
    page.locator('a',        { hasText: /orders/i }),
    page.getByRole('button', { name: /orders/i }),
  ];
  for (const locator of candidates) {
    if (await locator.count()) {
      const first = locator.first();
      if (await first.isVisible().catch(() => false)) {
        await first.click();
        return true;
      }
    }
  }
  return false;
}
async function openAdminOrders(page) {
  const candidates = [
    '/dashboard/admin/orders',
    '/dashboard/admin/all-orders',
    '/dashboard/admin',
  ];
  let opened = false;
  for (const path of candidates) {
    await page.goto(path);
    const table = page.locator('table');
    const cards = page.locator('.card.flex-row');
    const visibleSoon = await Promise.race([
      table.first().isVisible().catch(() => false),
      cards.first().isVisible().catch(() => false),
      (async () => { await page.waitForTimeout(200); return false; })(),
    ]);
    if (visibleSoon) { opened = true; break; }
  }
  if (!opened) {
    await page.goto('/dashboard/admin');
    await tryClickOrdersLink(page);
  }
  await expect.poll(async () => {
    const th = await page.locator('table thead th').count().catch(() => 0);
    const cards = await page.locator('.card.flex-row').count().catch(() => 0);
    return th + cards;
  }, { timeout: 8000 }).toBeGreaterThan(0);
}

test.describe('AdminOrders page', () => {
  test.beforeEach(async ({ page }) => {
    await interceptGuardsHeaderAndData(page);
    await interceptOrdersWithRefresh(page);
    await seedAdminAuth(page);
  });

  test('renders orders table/cards and product details', async ({ page }) => {
    await openAdminOrders(page);

    const tableExists = await page.locator('table').count() > 0;
    if (tableExists) {
      const firstRowCells = page.locator('tbody tr').first().locator('td');
      await expect(firstRowCells.nth(0)).toHaveText('1');
      await expect(page.getByText('Alice AdminBuyer')).toBeVisible();
      await expect(page.getByText('Success')).toBeVisible();
      await expect(firstRowCells.nth(5)).toHaveText('2');
    }

    const firstCard = page.locator('.container .card.flex-row').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.getByText('Laptop Pro 14')).toBeVisible();
    await expect(firstCard.getByText(/Powerful laptop/)).toBeVisible();
    await expect(firstCard.getByText(/Price\s*:\s*4999/)).toBeVisible();

    const firstImg = firstCard.locator('img').first();
    await expect(firstImg).toHaveAttribute('src', /\/api\/v1\/product\/product-photo\/p1/);
  });
});
