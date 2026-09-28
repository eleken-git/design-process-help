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


  test('GET /podcast/ → 200, плеєр з аудіо і кнопкою плей', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE + '/podcast/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Дизайн у коді з Claude');
    await expect(page.locator('#play')).toBeVisible();
    await expect(page.locator('.track')).toHaveCount(2);                                  // два епізоди
    await expect(page.locator('#nowTitle')).toHaveText('Спільна робота дизайнерів у Git через Claude');
    // тривалість підставляється з файлу, коли браузер прочитав метадані
    await expect(page.locator('#dur')).toHaveText(/^\d+:\d\d$/);
    const duration = await page.evaluate(() => (document.getElementById('audio') as HTMLAudioElement).duration);
    expect(duration, 'аудіофайл читається').toBeGreaterThan(60);
    // перемотка ±15 с працює без відтворення
    await page.locator('#fwd').click();
    await expect(page.locator('#cur')).toHaveText('0:15');
    await page.locator('#back').click();
    await expect(page.locator('#cur')).toHaveText('0:00');
    // другий епізод відкривається з рядка списку і стає «зараз грає» в нижній панелі
    await page.locator('.track[data-n="2"]').click();
    await expect(page.locator('#nowTitle')).toHaveText('Як приборкати Claude для дизайну інтерфейсів');
    await expect.poll(() => page.evaluate(() => (document.getElementById('audio') as HTMLAudioElement).duration), { timeout: 10_000 }).toBeGreaterThan(1000);
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

test.describe('шлях назад на головну', () => {
  for (const path of ['/presentation/', '/podcast/', '/harness/', '/map/']) {
    test(`${path}: лого в меню веде на головну`, async ({ page }) => {
      await page.goto(BASE + path);
      await page.locator('a.site-logo').click();
      await expect(page).toHaveURL(BASE + '/');
    });
  }

  test('3D-плеєр: лого в меню веде на головну, кнопки керування на місці', async ({ page }) => {
    await page.goto(BASE + '/3d/');
    await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.ready, null, { timeout: 60_000 });
    await expect(page.locator('#btnPlay')).toBeVisible();
    await expect(page.locator('#btnEp')).toBeVisible();
    await page.locator('a.site-logo').click();
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

test.describe('карта і харнес окремими сторінками', () => {
  test('/map/: 16 зупинок, 17 запитів, зміст збоку, без помилок JS', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/map/#s4');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Карта фронтенду');
    await expect(page.locator('.station')).toHaveCount(16);
    await expect(page.locator('.prompt p[lang="en"]')).toHaveCount(17);
    const toc = page.locator('#toc-map');
    await expect(toc).toBeVisible();
    await expect(toc.locator('a[aria-current]')).toHaveAttribute('href', '#s4');
    await expect(toc.locator('a[href="#s5"]')).toBeVisible();          // зупинки поточного етапу розгорнуті
    await expect(toc.locator('a[href="#s13"]')).toBeHidden();          // інші етапи згорнуті
    expect(errors, 'помилки JS').toEqual([]);
  });

  test('/map/: чекліст бере відмітки, зроблені до переїзду', async ({ page }) => {
    await page.goto(BASE + '/map/');
    await page.evaluate(() => localStorage.setItem('frontend-map-done-v1', JSON.stringify({ 'd-a1': true })));
    await page.reload();
    await expect(page.locator('#total')).toHaveText('1 з 31');
    await expect(page.locator('#d-a1')).toBeChecked();
  });

  test('/map/: чекліст збирає незакриті пункти в запит англійською', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
    await page.goto(BASE + '/map/#done');
    await expect(page.locator('#total')).toHaveText('0 з 31');
    await page.locator('#d-a1').check();
    await expect(page.locator('#total')).toHaveText('1 з 31');
    await page.locator('#copy-open').click();
    await expect(page.locator('#status')).toHaveText(/Скопійовано/);
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain('Check the project against the items below');
    expect(text).toContain('Agree:');
    expect(text).not.toContain('Project scope written down and agreed');
  });

  test('/harness/: дерево файлів, 5 людей, 5 матеріалів з лінками на оригінали', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE + '/harness/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Харнес');
    await expect(page.locator('.person')).toHaveCount(5);
    await expect(page.locator('article.item')).toHaveCount(5);
    for (const href of ['gist.github.com/karpathy/442a6bf555914893e9891c11519de94f', 'agents.md', 'github.com/genkovich/sdd', 'github.com/github/spec-kit', 'github.com/obra/superpowers']) {
      await expect(page.locator(`a.open[href*="${href}"]`)).toHaveCount(1);
    }
    await page.locator('.ftree button[data-f="settings"]').click();
    await expect(page.locator('#fd-name')).toHaveText('.claude/settings.json');
    await expect(page.locator('.ftree button[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('#fd-code')).toContainText('"Stop"');
    expect(errors, 'помилки JS').toEqual([]);
  });

  test('/harness/: посилання на карту ведуть на сторінку карти', async ({ page }) => {
    await page.goto(BASE + '/harness/');
    await page.locator('#h-build a[href="../map/#map"]').click();
    await expect(page).toHaveURL(/\/map\/#map$/);
    await expect(page.locator('#map')).toBeVisible();
  });

  test('/harness/ на телефоні: зміст відкривається кнопкою і закривається після вибору', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/harness/');
    const btn = page.locator('#toc-btn');
    await expect(page.locator('#toc-harness')).toBeHidden();
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await page.locator('#toc-harness a[href="#h-gates"]').click();
    await expect(page.locator('#toc-harness')).toBeHidden();
    await expect(btn).toContainText('Ворота якості');
  });

  test('на 375 px карта і харнес не скроляться вбік', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ['/map/', '/harness/']) {
      await page.goto(BASE + path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `горизонтальний скрол на ${path}`).toBeLessThanOrEqual(0);
    }
  });
});
