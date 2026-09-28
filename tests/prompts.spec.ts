import { test, expect } from '@playwright/test';

// Сторінка «Запити» збирає запити з карти й харнесу під час відкриття.
const BASE = 'http://127.0.0.1:8765/prompts/';

test.describe('сторінка «Запити»', () => {
  test('збирає 24 запити з карти й харнесу, у фільтрах кількість за групами', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Запити для Claude');
    await expect(page.locator('.pr')).toHaveCount(24);
    await expect(page.locator('.chip[data-t=""] .n')).toHaveText('24');
    await expect(page.locator('.chip[data-t="Домовитись"] .n')).toHaveText('2');
    await expect(page.locator('.chip[data-t="Будувати"] .n')).toHaveText('5');
    await expect(page.locator('.chip[data-t="Перевірити"] .n')).toHaveText('5');
    await expect(page.locator('.chip[data-t="Здати"] .n')).toHaveText('4');
    await expect(page.locator('.chip[data-t="Харнес"] .n')).toHaveText('8');
    expect(errors, 'помилки JS').toEqual([]);
  });

  test('?q=доступність лишає зупинку 4 з посиланням на карту', async ({ page }) => {
    await page.goto(BASE + '?q=' + encodeURIComponent('доступність'));
    await expect(page.getByRole('searchbox')).toHaveValue('доступність');
    const row = page.locator('.pr', { hasText: '4 · Доступність' });
    await expect(row).toHaveCount(1);
    await expect(row.locator('a.src')).toHaveAttribute('href', '../map/#s4');
    await expect(page.locator('.found')).toContainText('Знайдено');
  });

  test('апостроф будь-якого виду знаходить те саме', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.pr')).toHaveCount(24);
    await page.getByRole('searchbox').fill('ім’я');
    const typographic = await page.locator('.pr').count();
    expect(typographic).toBeGreaterThan(0);
    await page.getByRole('searchbox').fill("ім'я");
    await expect(page.locator('.pr')).toHaveCount(typographic);
    await page.getByRole('searchbox').fill('імʼя');
    await expect(page.locator('.pr')).toHaveCount(typographic);
  });

  test('фільтр за групою потрапляє в адресу, «Скопіювати» кладе запит у буфер', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:8765' });
    await page.goto(BASE);
    await page.locator('.chip[data-t="Харнес"]').click();
    await expect(page.locator('.pr')).toHaveCount(8);
    await expect(page.locator('.chip[data-t="Харнес"]')).toHaveAttribute('aria-pressed', 'true');
    expect(decodeURIComponent(page.url())).toContain('t=Харнес');
    const first = page.locator('.pr').first();
    const expected = (await first.locator('.pr-text').innerText()).trim();
    await first.locator('button.copy').click();
    await expect(first.locator('button.copy')).toContainText('Скопійовано');
    expect((await page.evaluate(() => navigator.clipboard.readText())).trim()).toBe(expected);
    await page.reload();
    await expect(page.locator('.pr')).toHaveCount(8);
  });

  test('порожній результат і кнопка «Показати всі»', async ({ page }) => {
    await page.goto(BASE + '?q=zzzzqqq');
    await expect(page.locator('.empty')).toBeVisible();
    await expect(page.locator('.pr')).toHaveCount(0);
    await page.getByRole('button', { name: 'Показати всі' }).click();
    await expect(page.locator('.pr')).toHaveCount(24);
    await expect(page.getByRole('searchbox')).toHaveValue('');
  });

  test('#ask відкриває формулу запиту', async ({ page }) => {
    await page.goto(BASE + '#ask');
    await expect(page.locator('details#ask')).toHaveAttribute('open', '');
    await expect(page.locator('details#ask .f-step')).toHaveCount(4);
  });

  test('якщо джерела не завантажились, показує посилання на карту й харнес', async ({ page }) => {
    await page.route('**/map/', (r) => r.abort());
    await page.goto(BASE);
    await expect(page.locator('.load-error')).toBeVisible();
    await expect(page.locator('.load-error a[href="../map/"]')).toHaveCount(1);
    await expect(page.locator('.load-error a[href="../harness/"]')).toHaveCount(1);
  });

  test('на карті більше немає формули, є посилання на неї', async ({ page }) => {
    await page.goto('http://127.0.0.1:8765/map/');
    await expect(page.locator('#ask')).toHaveCount(0);
    await expect(page.locator('a[href="../prompts/#ask"]')).toHaveCount(1);
  });
});
