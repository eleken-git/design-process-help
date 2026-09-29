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

test.describe('головна', () => {
  test('без пошуку: три входи і рядок «Вчитися» в одному екрані', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Дизайн у коді з Claude');
    await expect(page.locator('a.entry')).toHaveCount(3);
    for (const href of ['prompts/', 'harness/', 'map/']) await expect(page.locator(`a.entry[href="${href}"]`)).toHaveCount(1);
    for (const href of ['presentation/', '3d/', 'podcast/', 'app/', 'learn/']) await expect(page.locator(`main a[href="${href}"]`)).toHaveCount(1);
    const learnBottom = await page.locator('.learn-row').evaluate((n) => n.getBoundingClientRect().bottom);
    expect(learnBottom, 'рядок «Вчитися» видно без прокрутки').toBeLessThanOrEqual(900);
    await expect(page.getByRole('searchbox')).toHaveCount(0);
    expect(errors, 'помилки JS').toEqual([]);
  });

  test('на 375 px входи стоять один під одним, без горизонтального скролу', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/');
    const xs = await page.locator('a.entry').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().x)));
    expect(new Set(xs).size).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
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

  test('тренувальний застосунок: меню сайту на /app/, лого веде на головну', async ({ page }) => {
    await page.goto(BASE + '/app/');
    const nav = page.locator('#hub-nav');
    await expect(nav).toBeVisible();
    await expect(page.locator('#hub-crumb')).toHaveCount(0);
    await nav.locator('a.site-logo').click();
    await expect(page).toHaveURL(BASE + '/');
  });
});

test.describe('меню сайту в оболонці Nimbus', () => {
  test('під /app/ оболонка показує спільне меню з поточним «Вчитися»', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/app/');
    const nav = page.locator('#hub-nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('nav[aria-label="Розділи сайту"] a')).toHaveText(['Запити', 'Харнес', 'Карта', 'Вчитися']);
    await expect(nav.locator('a[aria-current="page"]')).toHaveText('Вчитися');
    await expect(nav.locator('a.site-logo')).toHaveAttribute('href', '../');
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  });

  test('при локальній розробці меню сайту сховане', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    await expect(page.locator('#hub-nav')).toBeHidden();
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
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

test.describe('сторінка «Вчитися»', () => {
  test('чотири кроки по порядку і пряме посилання на кожен 3D-епізод', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE + '/learn/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Вчитися');
    await expect(page.locator('.step')).toHaveCount(4);
    await expect(page.locator('.step h2')).toHaveText(['Презентація', 'Git у 3D', 'Подкаст', 'Вправи в Nimbus']);
    for (const ep of ['conflict', 'file-states', 'pull-request', 'protected-main', 'merge-vs-rebase']) {
      await expect(page.locator(`a[href="../3d/?ep=${ep}"]`)).toHaveCount(1);
    }
    for (const href of ['../presentation/', '../podcast/', '../app/']) await expect(page.locator(`main a[href="${href}"]`).first()).toBeVisible();
    await expect(page.locator('a[href="https://github.com/eleken-git/design-process-help/blob/main/PRACTICE.md"]')).toHaveCount(1);
    expect(errors, 'помилки JS').toEqual([]);
  });

  test('посилання на епізод відкриває саме його', async ({ page }) => {
    await page.goto(BASE + '/learn/');
    await page.locator('a[href="../3d/?ep=protected-main"]').click();
    await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.episode === 'protected-main', null, { timeout: 60_000 });
  });
});

test.describe('карта і харнес на широкому екрані і під липкими панелями', () => {
  test('на 1440 px колонка змісту широка, як була у вкладках', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const path of ['/map/', '/harness/']) {
      await page.goto(BASE + path);
      const w = await page.locator('.panel-main').evaluate((n) => n.getBoundingClientRect().width);
      expect(w, `ширина колонки на ${path}`).toBeGreaterThanOrEqual(1000);
    }
  });

  test('1024 px: липка панель опису файлу не ховається під рядок «Зміст»', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto(BASE + '/harness/');
    await page.locator('.ftree button[data-f="agents"]').click();
    await page.evaluate(() => {
      const tree = document.getElementById('h-tree')!;
      window.scrollTo(0, tree.getBoundingClientRect().top + window.scrollY + 260);
    });
    await page.waitForTimeout(400);
    const barBottom = await page.locator('.toc-bar').evaluate((n) => n.getBoundingClientRect().bottom);
    const panelTop = await page.locator('#fdetail').evaluate((n) => n.getBoundingClientRect().top);
    expect(panelTop).toBeGreaterThanOrEqual(barBottom);
  });

  test('375 px: старе посилання harness/#karpathy не ховає заголовок під панелями', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/harness/#karpathy');
    await page.waitForTimeout(1500);
    const barBottom = await page.locator('.toc-bar').evaluate((n) => n.getBoundingClientRect().bottom);
    const top = await page.locator('#karpathy .src').evaluate((n) => n.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(barBottom);
  });

  test('/harness/: виноски в матеріалах мають заокруглені кути', async ({ page }) => {
    await page.goto(BASE + '/harness/');
    const r = await page.locator('#h-materials .us').first().evaluate((n) => getComputedStyle(n).borderTopRightRadius);
    expect(r).not.toBe('0px');
  });
});

test.describe('харнес: спершу користуватися, потім розібратися', () => {
  test('розділи по порядку, люди й матеріали згорнуті, сторінка вдвічі коротша', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/harness/');
    const ids = await page.locator('main section[id]').evaluateAll((s) => s.map((x) => x.id));
    expect(ids).toEqual(['h-tree', 'h-build', 'h-loop', 'h-rules', 'h-gates', 'h-skip', 'h-what', 'h-people', 'h-materials', 'h-sources']);
    await expect(page.locator('.person details:not([open])')).toHaveCount(5);
    await expect(page.locator('.person .eli')).toHaveCount(5);
    await expect(page.locator('article.item details:not([open])')).toHaveCount(5);
    await expect(page.locator('article.item a.open')).toHaveCount(5);
    // було: вкладка «Верстак» 17 878 px + сторінка «Будуємо харнес» 7 005 px на 375 px
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(13500);
    await expect(page.locator('.toc-group')).toHaveText(['Користуватися', 'Розібратися']);
  });

  test('картку людини можна розгорнути, старий якір #h-universal веде у файли', async ({ page }) => {
    await page.goto(BASE + '/harness/#h-hashimoto');
    const card = page.locator('#h-hashimoto');
    await card.locator('summary').click();
    await expect(card.locator('details')).toHaveAttribute('open', '');
    await expect(card.locator('.checks')).toBeVisible();
    await expect(page.locator('#h-tree #h-universal')).toHaveCount(1);
  });

  test('на телефоні запит згорнутий, але копіюється повністю', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/harness/#h-build');
    const box = page.locator('#h-build .prompt').first();
    const p = box.locator('p');
    const clipped = await p.evaluate((n) => n.scrollHeight - n.clientHeight);
    expect(clipped).toBeGreaterThan(10);
    await box.locator('.copy').click();
    const copied = (await page.evaluate(() => navigator.clipboard.readText())).trim();
    expect(copied).toContain('Do not add any client-specific content.');
    await box.locator('.pmore').click();
    await expect(box.locator('.pmore')).toHaveAttribute('aria-expanded', 'true');
    expect(await p.evaluate((n) => n.scrollHeight - n.clientHeight)).toBeLessThanOrEqual(1);
  });

  test('номери кроків і рамки запитів мають колір харнесу', async ({ page }) => {
    await page.goto(BASE + '/harness/');
    const num = await page.locator('#h-build .bstep .num').first().evaluate((n) => getComputedStyle(n).borderTopWidth);
    expect(num).not.toBe('0px');
    const edge = await page.locator('#h-build .prompt').first().evaluate((n) => getComputedStyle(n).borderLeftWidth);
    expect(edge).toBe('3px');
    await expect(page.locator('#toc-harness .toc-title')).toHaveCount(0);
  });

  test('джерела зведені в один список без повторів', async ({ page }) => {
    await page.goto(BASE + '/harness/');
    const hrefs = await page.locator('#h-sources a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(hrefs.length).toBeGreaterThanOrEqual(10);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
