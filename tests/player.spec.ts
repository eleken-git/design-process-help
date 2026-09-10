import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:8765/3d/';

test.describe('3D-плеєр: керування як у YouTube', () => {
  test('клік по відео — пауза і плей, клавіші, кнопка повного екрана', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${BASE}?ep=protected-main`);
    await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.ready, null, { timeout: 60_000 });
    const play = page.locator('#btnPlay'), stage = page.locator('#stage'), flash = page.locator('#flash');
    await expect(page.locator('#chips')).toBeHidden();          // список розділів закритий, доки не натиснуто «Розділи»
    await expect(page.locator('#eplist')).toBeHidden();
    await expect(play).toHaveText('❚❚');                       // автоплей
    await stage.click({ position: { x: 640, y: 300 } });
    await expect(play).toHaveText('▶');                        // пауза
    await expect(flash).toHaveClass(/go/);
    await expect(flash).toHaveText('❚❚');                      // спалах показує новий стан
    await stage.click({ position: { x: 640, y: 300 } });
    await expect(play).toHaveText('❚❚');                       // знову грає
    await page.keyboard.press('k');
    await expect(play).toHaveText('▶');
    await page.keyboard.press('Space');
    await expect(play).toHaveText('❚❚');
    const before = await page.locator('#tlabel').textContent();
    await page.keyboard.press('Digit5');
    await expect(page.locator('#tlabel')).not.toHaveText(before!);   // стрибок на 50 %
    await expect(page.locator('#btnFull')).toBeVisible();
    await page.keyboard.press('f');                            // не має кидати помилок незалежно від того, чи дозволено fullscreen
    await page.locator('#btnChapters').click();
    await expect(page.locator('#chips')).toBeVisible();
    await page.locator('#btnChapters').click();
    await expect(page.locator('#chips')).toBeHidden();
    await page.locator('#btnEp').click();
    await expect(page.locator('#eplist')).toBeVisible();
    await stage.click({ position: { x: 640, y: 300 } });      // клік по відео з відкритим меню лише закриває меню
    await expect(page.locator('#eplist')).toBeHidden();
    await expect(play).toHaveText('❚❚');
    expect(errors, 'помилки JS').toEqual([]);
  });
});
