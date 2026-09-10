import { test, expect } from '@playwright/test';

const APP = 'http://127.0.0.1:5173/';

test.describe('практичний застосунок Nimbus', () => {
  for (const [hash, title] of [['', 'Dashboard'], ['#/settings', 'Settings'], ['#/ui-kit', 'UI kit']] as const) {
    test(`екран ${title} відкривається без помилок`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(APP + hash);
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
      expect(errors, 'помилки в консолі').toEqual([]);
    });
  }
});
