import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders page headline', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Cards & Transactions' })).toBeVisible();
});

test('auto-selects first card and shows its transactions', async ({ page }) => {
  // wait for cards to finish loading (skeleton uses aria-busy)
  await expect(page.getByLabel(/loading cards/i)).not.toBeVisible();

  const privateCard = page.getByRole('button', { name: /private card/i });
  await expect(privateCard).toBeVisible();
  await expect(privateCard).toHaveAttribute('aria-pressed', 'true');

  await expect(page.getByText('Food')).toBeVisible();
  await expect(page.getByText('Snack')).toBeVisible();
  await expect(page.getByText('Tickets')).toBeVisible();
});

test("switching cards shows the new card's transactions", async ({ page }) => {
  await page.getByRole('button', { name: /business card/i }).click();

  await expect(page.getByText('T-Shirt')).toBeVisible();
  await expect(page.getByText('Smart Phone', { exact: true })).toBeVisible();
  await expect(page.getByText('Refund for Smart Phone')).toBeVisible();
  await expect(page.getByText('Food')).not.toBeVisible();
});

test('amount filter hides transactions below the threshold', async ({ page }) => {
  await page.getByLabel(/amount filter/i).fill('100');

  await expect(page.getByText('Food')).toBeVisible();
  await expect(page.getByText('Tickets')).toBeVisible();
  await expect(page.getByText('Snack')).not.toBeVisible();
});

test('filter resets when switching cards', async ({ page }) => {
  await page.getByLabel(/amount filter/i).fill('100');
  await expect(page.getByText('Snack')).not.toBeVisible();

  await page.getByRole('button', { name: /business card/i }).click();
  await page.getByRole('button', { name: /private card/i }).click();

  await expect(page.getByText('Snack')).toBeVisible();
});

test('negative amounts (refunds) are visible and filtered by the ≥0 threshold', async ({ page }) => {
  await page.getByRole('button', { name: /business card/i }).click();
  await expect(page.getByText('Refund for Smart Phone')).toBeVisible();

  await page.getByLabel(/amount filter/i).fill('0');
  await expect(page.getByText('Refund for Smart Phone')).not.toBeVisible();
});

test('unknown route renders 404 page with a link home', async ({ page }) => {
  await page.goto('/this-does-not-exist');

  await expect(page.getByText('404')).toBeVisible();
  await expect(page.getByText(/page not found/i)).toBeVisible();

  await page.getByRole('link', { name: /go back home/i }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Cards & Transactions' })).toBeVisible();
});
