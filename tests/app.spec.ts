import { test, expect } from '@playwright/test';

const APP = 'http://127.0.0.1:5173/';

const SCREENS = [['', 'Dashboard'], ['#/settings', 'Settings'], ['#/ui-kit', 'UI kit']] as const;

test.describe('практичний застосунок Nimbus', () => {
  for (const [hash, title] of SCREENS) {
    test(`екран ${title} відкривається без помилок`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(APP + hash);
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
      expect(errors, 'помилки в консолі').toEqual([]);
    });
  }

  test('375 і 320 px: екрани не скроляться вбік', async ({ page }) => {
    for (const width of [375, 320]) for (const [hash, title] of SCREENS) {
      await page.setViewportSize({ width, height: 812 });
      await page.goto(APP + hash);
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `горизонтальний скрол на ${title} при ${width} px`).toBeLessThanOrEqual(0);
    }
  });

  test('1280 px: у верхній панелі видно шлях до папки екрана', async ({ page }) => {
    await page.goto(APP + '#/settings');
    await expect(page.getByText('src/screens/settings/', { exact: true })).toBeVisible();
  });
});
