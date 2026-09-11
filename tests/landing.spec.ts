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
    expect(html).toContain('href="podcast/"');
    expect(html).toContain('href="harness/"');
  });

  test('GET /harness/ → 200, пʼять матеріалів з лінками на оригінали і бічна навігація', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE + '/harness/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Будуємо харнес');
    await expect(page.locator('article.item')).toHaveCount(5);
    await expect(page.locator('nav.side a[href^="#"]')).toHaveCount(5);
    for (const href of ['gist.github.com/karpathy/442a6bf555914893e9891c11519de94f', 'agents.md', 'github.com/genkovich/sdd', 'github.com/github/spec-kit', 'github.com/obra/superpowers']) {
      await expect(page.locator(`a.open[href*="${href}"]`)).toHaveCount(1);
    }
    expect(errors, 'помилки JS').toEqual([]);
  });

  test('GET /podcast/ → 200, плеєр з аудіо і кнопкою плей', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE + '/podcast/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Спільна робота дизайнерів у Git через Claude');
    await expect(page.locator('#play')).toBeVisible();
    // тривалість підставляється з файлу, коли браузер прочитав метадані
    await expect(page.locator('#dur')).toHaveText(/^\d+:\d\d$/);
    const duration = await page.evaluate(() => (document.getElementById('audio') as HTMLAudioElement).duration);
    expect(duration, 'аудіофайл читається').toBeGreaterThan(60);
    // перемотка ±15 с працює без відтворення
    await page.locator('#fwd').click();
    await expect(page.locator('#cur')).toHaveText('0:15');
    await page.locator('#back').click();
    await expect(page.locator('#cur')).toHaveText('0:00');
    expect(errors, 'помилки JS').toEqual([]);
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

test.describe('хлібні крихти назад на лендінг', () => {
  test('презентація: окрема крихта "← design-process-help" у сайдбарі веде на "../"', async ({ page }) => {
    await page.goto(BASE + '/presentation/');
    const link = page.locator('a.crumb-home');
    await expect(link).toHaveAttribute('href', '../');
    await link.click();
    await expect(page).toHaveURL(BASE + '/');
  });

  test('3D-плеєр: кнопка 🏠 веде на "../" і не ламає інші кнопки керування', async ({ page }) => {
    await page.goto(BASE + '/3d/');
    await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.ready, null, { timeout: 60_000 });
    await expect(page.locator('#btnHome')).toBeVisible();
    await expect(page.locator('#btnPlay')).toBeVisible();
    await page.locator('#btnHome').click();
    await expect(page).toHaveURL(BASE + '/');
  });

  test('подкаст: крихта "← design-process-help" веде на "../"', async ({ page }) => {
    await page.goto(BASE + '/podcast/');
    const link = page.locator('a.crumb-home');
    await expect(link).toHaveAttribute('href', '../');
    await link.click();
    await expect(page).toHaveURL(BASE + '/');
  });

  test('харнес: крихта "← design-process-help" веде на "../"', async ({ page }) => {
    await page.goto(BASE + '/harness/');
    const link = page.locator('a.crumb-home');
    await expect(link).toHaveAttribute('href', '../');
    await link.click();
    await expect(page).toHaveURL(BASE + '/');
  });

  test('тренувальний застосунок: крихта видима на /app/, прихована при локальній розробці', async ({ page }) => {
    await page.goto(BASE + '/app/');
    const crumb = page.locator('#hub-crumb');
    await expect(crumb).toBeVisible();
    await expect(crumb.locator('a')).toHaveAttribute('href', '../');
    await crumb.locator('a').click();
    await expect(page).toHaveURL(BASE + '/');

    await page.goto('http://127.0.0.1:5173/');
    await expect(page.locator('#hub-crumb')).toBeHidden();
  });
});
