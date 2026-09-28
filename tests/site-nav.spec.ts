import { test, expect } from '@playwright/test';

// Спільне меню скопійоване в кожну сторінку docs/. Цей тест стежить, щоб копії не розійшлися.
const BASE = 'http://127.0.0.1:8765/';
const LINKS: [string, string][] = [['Запити', 'prompts/'], ['Харнес', 'harness/'], ['Карта', 'map/'], ['Вчитися', 'learn/']];
const PAGES: { path: string; current: string | null }[] = [
  { path: '', current: null },
  { path: 'prompts/', current: 'Запити' },
  { path: 'harness/', current: 'Харнес' },
  { path: 'map/', current: 'Карта' },
  { path: 'learn/', current: 'Вчитися' },
  { path: 'presentation/', current: 'Вчитися' },
  { path: 'podcast/', current: 'Вчитися' },
  { path: '3d/', current: 'Вчитися' },
];

test.describe('спільне меню', () => {
  for (const p of PAGES) {
    test(`однакове меню на /${p.path}`, async ({ page }) => {
      await page.goto(BASE + p.path);
      const links = page.locator('header.site-nav nav[aria-label="Розділи сайту"] a');
      await expect(links).toHaveCount(4);
      for (let i = 0; i < LINKS.length; i++) {
        await expect(links.nth(i)).toHaveText(LINKS[i][0]);
        expect(await links.nth(i).evaluate((a) => (a as HTMLAnchorElement).href)).toBe(BASE + LINKS[i][1]);
      }
      const cur = page.locator('header.site-nav a[aria-current="page"]');
      if (p.current) {
        await expect(cur).toHaveCount(1);
        await expect(cur).toHaveText(p.current);
      } else {
        await expect(cur).toHaveCount(0);
      }
      expect(await page.locator('a.site-logo').evaluate((a) => (a as HTMLAnchorElement).href)).toBe(BASE);
      await expect(page.locator('a.skip-link[href="#main"]')).toHaveCount(1);
      await expect(page.locator('#main')).toHaveCount(1);
    });
  }

  test('меню стоїть по центру вікна на 1440 px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const p of ['', 'map/', 'harness/', 'podcast/', 'presentation/']) {
      await page.goto(BASE + p);
      const box = await page.locator('header.site-nav nav').boundingBox();
      expect(Math.abs(box!.x + box!.width / 2 - 720), `центр меню на /${p}`).toBeLessThanOrEqual(2);
    }
  });

  test('320 і 375 px: меню не обрізане, сторінки не скроляться вбік', async ({ page }) => {
    for (const p of PAGES) for (const width of [375, 320]) {
      await page.setViewportSize({ width, height: 812 });
      await page.goto(BASE + p.path);
      const clipped = await page.locator('header.site-nav nav').evaluate((n) => n.scrollWidth - n.clientWidth);
      if (width === 375) expect(clipped, `меню обрізане на /${p.path}`).toBeLessThanOrEqual(0);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `горизонтальний скрол на /${p.path} при ${width} px`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('старі посилання з головної', () => {
  const cases: [string, RegExp][] = [
    ['#s7', /\/map\/#s7$/],
    ['#frontend', /\/map\/$/],
    ['#done', /\/map\/#done$/],
    ['#harness', /\/harness\/$/],
    ['#h-tree', /\/harness\/#h-tree$/],
    ['#h-universal', /\/harness\/#h-tree$/],
    ['#ask', /\/prompts\/#ask$/],
  ];
  for (const [from, to] of cases) {
    test(`/${from} веде на нову адресу`, async ({ page }) => {
      await page.goto(BASE + from);
      await expect(page).toHaveURL(to);
    });
  }

  test('невідомий хеш лишається на головній', async ({ page }) => {
    await page.goto(BASE + '#whatever');
    await expect(page).toHaveURL(BASE + '#whatever');
  });
});

test.describe('меню в 3D-плеєрі', () => {
  test('меню над полотном, полотно займає решту екрана', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(BASE + '3d/');
    await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.ready, null, { timeout: 60_000 });
    const nav = await page.locator('header.site-nav').boundingBox();
    const canvas = await page.locator('#c').boundingBox();
    expect(nav!.height).toBeGreaterThan(40);
    expect(Math.round(canvas!.y)).toBe(Math.round(nav!.y + nav!.height));
    expect(Math.round(canvas!.height)).toBe(720 - Math.round(nav!.height));
    await expect(page.locator('#btnHome')).toHaveCount(0);
  });

  test('на весь екран (клас fs, зокрема старий Safari) меню сховане, полотно на весь екран', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(BASE + '3d/');
    await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.ready, null, { timeout: 60_000 });
    await page.evaluate(() => { document.body.classList.add('fs'); window.dispatchEvent(new Event('resize')); });
    await expect(page.locator('header.site-nav')).toBeHidden();
    await expect.poll(async () => Math.round((await page.locator('#c').boundingBox())!.height)).toBe(720);
  });

  test('у режимі запису (?capture=1) меню сховане, полотно на весь екран', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(BASE + '3d/?capture=1');
    await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.ready, null, { timeout: 60_000 });
    await expect(page.locator('header.site-nav')).toBeHidden();
    const canvas = await page.locator('#c').boundingBox();
    expect(Math.round(canvas!.y)).toBe(0);
    expect(Math.round(canvas!.height)).toBe(720);
  });
});

test.describe('посилання всередині сайту', () => {
  const PAGES_WITH_LINKS = ['', 'prompts/', 'harness/', 'map/', 'learn/', 'presentation/', 'podcast/'];
  test('кожне відносне посилання веде на існуючу сторінку і розділ', async ({ page, request }) => {
    const html = new Map<string, string>();
    const get = async (url: string) => {
      if (!html.has(url)) {
        const res = await request.get(url);
        expect(res.status(), `статус ${url}`).toBe(200);
        html.set(url, await res.text());
      }
      return html.get(url)!;
    };
    for (const p of PAGES_WITH_LINKS) {
      await page.goto(BASE + p);
      const hrefs = await page.locator('a[href]').evaluateAll((as) =>
        as.map((a) => [a.getAttribute('href')!, (a as HTMLAnchorElement).href]));
      for (const [raw, abs] of hrefs) {
        if (/^(https?:|mailto:)/.test(raw)) continue;
        const u = new URL(abs);
        const body = await get(u.origin + u.pathname + u.search);
        if (u.hash.length > 1) {
          const id = decodeURIComponent(u.hash.slice(1));
          expect(body.includes(`id="${id}"`), `/${p}: ${raw} — немає id="${id}"`).toBe(true);
        }
      }
    }
  });
});
