import { test, expect } from '@playwright/test';

const DECK = 'http://127.0.0.1:8765/index.html';

test.describe('презентація', () => {
  test('меню веде на кожен слайд, перемикач теми працює', async ({ page }) => {
    await page.goto(DECK);
    const links = page.locator('nav.side-nav a[href^="#s"]');
    const n = await links.count();
    expect(n).toBeGreaterThanOrEqual(10);
    for (let i = 0; i < n; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(await page.locator(href!).count(), `слайд ${href} існує`).toBe(1);
    }
    await page.locator('#theme').click();
    await expect(page.locator(':root')).toHaveAttribute('data-theme', 'light');
    await page.locator('#theme').click();
    await expect(page.locator(':root')).not.toHaveAttribute('data-theme', 'light');
  });
});
