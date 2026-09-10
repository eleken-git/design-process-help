import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:8765';

test.describe('лендінг-хаб docs/', () => {
  test('GET / → 200, є посилання на presentation/, 3d/, app/', async ({ request }) => {
    const res = await request.get(BASE + '/');
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('href="presentation/"');
    expect(html).toContain('href="3d/"');
    expect(html).toContain('href="app/"');
  });

  test('GET /presentation/ → 200, перенесення нічого не зламало', async ({ request }) => {
    const res = await request.get(BASE + '/presentation/');
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('<title>Дизайн у коді з Claude</title>');
  });

  test('GET /3d/ → 200', async ({ request }) => {
    const res = await request.get(BASE + '/3d/');
    expect(res.status()).toBe(200);
  });

  test('/app/ монтується без помилок (base: "./" у білді працює)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(BASE + '/app/');
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
    expect(errors, 'помилки в консолі').toEqual([]);
  });
});
