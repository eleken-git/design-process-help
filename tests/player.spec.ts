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
    await stage.click({ position: { x: 160, y: 200 } });
    await expect(play).toHaveText('▶');                        // пауза
    await expect(flash).toHaveClass(/go/);
    await expect(flash).toHaveText('❚❚');                      // спалах показує новий стан
    await stage.click({ position: { x: 160, y: 200 } });
    await expect(play).toHaveText('❚❚');                       // знову грає
    await page.keyboard.press('k');
    await expect(play).toHaveText('▶');
    await page.keyboard.press('Space');
    await expect(play).toHaveText('❚❚');
    const before = await page.locator('#tlabel').textContent();
    await page.keyboard.press('Digit5');
    await expect(page.locator('#tlabel')).not.toHaveText(before!);   // стрибок на 50 %
    await expect(page.locator('#btnFull')).toBeVisible();
    const box = await page.locator('.controls').boundingBox();
    const viewport = page.viewportSize()!;
    expect(Math.abs((box!.x + box!.width / 2) - viewport.width / 2), 'панель керування по центру знизу').toBeLessThan(2);
    await page.keyboard.press('f');                            // не має кидати помилок незалежно від того, чи дозволено fullscreen
    await page.locator('#btnChapters').click();
    await expect(page.locator('#chips')).toBeVisible();
    await page.locator('#btnChapters').click();
    await expect(page.locator('#chips')).toBeHidden();
    await page.locator('#btnEp').click();
    await expect(page.locator('#eplist')).toBeVisible();
    await stage.click({ position: { x: 160, y: 200 } });      // клік по відео з відкритим меню лише закриває меню
    await expect(page.locator('#eplist')).toBeHidden();
    await expect(play).toHaveText('❚❚');
    expect(errors, 'помилки JS').toEqual([]);
  });

  test('музика: після паузи і плею трек грає далі, без циклу перемотки', async ({ page }) => {
    await page.goto(`${BASE}?ep=conflict`);
    await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.ready, null, { timeout: 60_000 });
    const audioTime = () => page.evaluate(() => (document.getElementById('bgm') as HTMLAudioElement).currentTime);
    await page.evaluate(() => {
      (window as any).__seeks = 0;
      document.getElementById('bgm')!.addEventListener('seeking', () => (window as any).__seeks++);
    });
    await expect.poll(audioTime, { message: 'автоплей: аудіо має йти вперед', timeout: 10_000 }).toBeGreaterThan(1.5);
    await page.keyboard.press('k');                                   // пауза
    await page.waitForTimeout(800);
    const atPause = await audioTime();
    await page.keyboard.press('k');                                   // плей
    await page.waitForTimeout(3000);
    expect((await audioTime()) - atPause, 'аудіо продовжило йти після плею').toBeGreaterThan(2);
    expect(await page.evaluate(() => (window as any).__seeks), 'перемоток аудіо за весь час').toBeLessThan(6);
  });

  test('кнопка «Увімкнути звук» вмикає звук, а не вимикає музику', async ({ page }) => {
    await page.addInitScript(() => {
      // емуляція політики автоплею браузера: play() відхиляється, доки користувач не клікнув
      const orig = HTMLMediaElement.prototype.play;
      let allowed = false;
      document.addEventListener('pointerdown', () => { allowed = true; }, true);
      HTMLMediaElement.prototype.play = function () {
        if (!allowed) return Promise.reject(new DOMException('blocked', 'NotAllowedError'));
        return orig.call(this);
      };
    });
    await page.goto(`${BASE}?ep=conflict`);
    await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.ready, null, { timeout: 60_000 });
    const btn = page.locator('#btnMusic');
    await expect(btn).toHaveText('♪ Увімкнути звук');
    await btn.click();
    await expect(btn).toHaveText('♪ Музика');
    await expect.poll(() => page.evaluate(() => (document.getElementById('bgm') as HTMLAudioElement).paused)).toBe(false);
  });

  test('плашка «Наступні»: черга тем, як замовити епізод, клік копіює запит для Claude', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(`${BASE}?ep=file-states`);
    await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.ready, null, { timeout: 60_000 });
    const pop = page.locator('#backlog');
    await expect(pop).toBeHidden();
    await page.locator('#btnNext').click();
    await expect(pop).toBeVisible();
    await expect(pop).toContainText('Claude Code');                       // пояснення, як замовити
    await expect(pop).toContainText('git clone');
    await expect(pop.locator('#backlogList button')).toHaveCount(26);   // усі теми з ANIMATIONS.md, крім уже зроблених
    await expect(pop.locator('#backlogCount')).toHaveText('26');
    await pop.locator('#backlogList button', { hasText: 'package-lock' }).click();
    await expect(page.locator('#toast')).toHaveClass(/show/);
    await expect(page.locator('#toast')).toContainText('Зроби епізод 16');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Зроби епізод 16');
    await page.keyboard.press('Escape');
    await expect(pop).toBeHidden();
    await page.locator('#btnNext').click();
    await page.locator('#btnEp').click();                                // інша плашка закриває цю
    await expect(pop).toBeHidden();
    await expect(page.locator('#eplist')).toBeVisible();
  });
});
