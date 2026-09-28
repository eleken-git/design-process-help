# Site UX redesign — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `docs/` site into a reference with one centered nav, separate pages for prompts,
harness, map and learning, and working old links, then ship it to GitHub Pages.

**Architecture:** Static HTML pages under `docs/`, each self-contained (own `<style>` and `<script>`,
no shared files). The nav block is copied into every page and guarded by a Playwright test. The prompt
library reads prompts from the map and harness pages at runtime with `fetch` + `DOMParser`, so prompts
live in one place. Old hash URLs on `/` are redirected by an inline script.

**Tech Stack:** plain HTML/CSS/JS, Playwright (`@playwright/test` 1.63), `scripts/serve-docs.mjs` on
port 8765, Vite for the Nimbus app build (`npm run build:pages` → `docs/app/`).

**Spec:** `specs/2026-09-29-site-ux-design.md`

## Global Constraints

- User-visible text in Ukrainian; agent docs (`AGENTS.md`, `progress.log`, this plan) in English.
- Commit messages in Ukrainian, format `<area>: <what>`, with the `Co-Authored-By` trailer.
- Every `docs/` page keeps its own `<style>`; no shared CSS/JS files across pages.
- GitHub Dark palette via each page's CSS variables (`--bg`, `--surface`, `--border`, `--border-muted`,
  `--text`, `--muted`, `--hover`, `--sans`, `--mono`); light theme where the page already has one.
- Nav order: `Запити` → `prompts/`, `Харнес` → `harness/`, `Карта` → `map/`, `Вчитися` → `learn/`.
- No horizontal page scroll from 320 to 1920 px.
- Before every PR: `npm run typecheck && npm run build && npm run test:e2e`; look at
  `test-results/frames/<episode>/` after 3D changes.
- Every PR branches from a fresh `main`; no stacking; no force push. The user asked to merge every PR
  in this plan (squash, delete branch).
- `npm run build:pages` output is committed only in the last PR.

## Review Focus

1. A shared old link with a station hash (`/#s7`) must land on that station on `/map/`, not on home.
2. The prompt library must still show a useful message and links if `fetch` fails (file opened from
   disk, network error).
3. Searching with a typographic apostrophe ("п’ять", "пʼять") must match text typed with `'`.
4. The 3D player must still fill the screen in fullscreen and in `?capture=1` (the overlap tests run in
   capture mode), with the nav hidden there.
5. The checklist on `/map/` must keep marks made before the move (same `localStorage` key).

Each item has a test in the task that owns the code (Tasks 3, 5, 5, 7, 2).

---

## PR 1 — `docs/site-structure`

### Task 1: Branch, spec, reuse the TOC from PR #16

**Files:** `specs/*`, cherry-pick of `ba9a3c7` (`docs/index.html`, `tests/landing.spec.ts`)

- [ ] `git switch main && git pull && git switch -c docs/site-structure`
- [ ] `git cherry-pick fce98af` (spec) and `git cherry-pick ba9a3c7` (TOC + its test). Both apply on
      `main` without conflicts because `main` has not moved.
- [ ] Commit this plan: `git add specs/2026-09-29-site-ux-plan.md && git commit -m "docs: план нового UX сайту"`

### Task 2: Split the landing into `/map/` and `/harness/`

**Files:**
- Create: `docs/map/index.html`
- Replace: `docs/harness/index.html` (Верстак content + the five materials of the old reading page)
- Test: `tests/landing.spec.ts`

A one-off Python script in the scratchpad (not committed) cuts `docs/index.html`:

- `map/index.html` = the `<head>` (title "Карта фронтенду · design-process-help", own description),
  the full `<style>` minus the blocks `/* харнес: … */`, `/* усі матеріали: … */`, `/* головна: … */`
  and the old jump-bar/tab rules; the nav (Task 3); the `#frontend` panel content (TOC + `.panel-main`)
  without `#ask`; the footer; the script parts: copy buttons, checklist, TOC (tab logic removed).
- `harness/index.html` = the same head pattern (title "Харнес · design-process-help"), the full
  `<style>` minus the station picture blocks `/* 1. межі */` … `/* 16. підтримка */`, `/* карта метро */`,
  `/* формула запиту */`, `/* чекліст */`, `/* скіли */`, `/* головна: … */`; the nav; the `#harness`
  panel content; then a new section `<section id="h-materials" class="block">` holding the five
  `<article class="item">` blocks of the old reading page (ids `karpathy`, `agents`, `sdd`, `speckit`,
  `superpowers`) with their styles; the footer; scripts: copy buttons, `FILES` tree, TOC.
- In both pages the TOC markup stays, the `role="tabpanel"`/`hidden` attributes go, and the wrapper gets
  `id="main"`. The harness TOC gets an entry `#h-materials` "П'ять матеріалів" before "Джерела".
- Relative links inside moved content change: `href="#map"` from the harness page becomes
  `href="../map/#map"`, `href="#s13"` → `../map/#s13`, `href="#skills"` → `../map/#skills`,
  `href="harness/"` → `./` (self), `presentation/` → `../presentation/` etc. The `FILES` object links in
  the harness script change the same way.

- [ ] **Step 1: Failing tests.** In `tests/landing.spec.ts` replace the tab tests with page tests:

```ts
test('/map/: 16 зупинок, 17 запитів, зміст збоку, без помилок JS', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/map/#s4');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Карта фронтенду');
  await expect(page.locator('.station')).toHaveCount(16);
  await expect(page.locator('.prompt p[lang="en"]')).toHaveCount(17);
  await expect(page.locator('#toc-map a[aria-current]')).toHaveAttribute('href', '#s4');
  expect(errors).toEqual([]);
});

test('/map/: чекліст бере відмітки, зроблені до переїзду', async ({ page }) => {
  await page.goto(BASE + '/map/');
  await page.evaluate(() => localStorage.setItem('frontend-map-done-v1', JSON.stringify({ 'd-a1': true })));
  await page.reload();
  await expect(page.locator('#total')).toHaveText('1 з 31');
  await expect(page.locator('#d-a1')).toBeChecked();
});

test('/harness/: дерево файлів, 5 людей, 5 матеріалів з лінками на оригінали', async ({ page }) => {
  await page.goto(BASE + '/harness/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Харнес');
  await expect(page.locator('.person')).toHaveCount(5);
  await expect(page.locator('article.item')).toHaveCount(5);
  for (const href of ['gist.github.com/karpathy/442a6bf555914893e9891c11519de94f', 'agents.md', 'github.com/genkovich/sdd', 'github.com/github/spec-kit', 'github.com/obra/superpowers']) {
    await expect(page.locator(`a.open[href*="${href}"]`)).toHaveCount(1);
  }
  await page.locator('.ftree button[data-f="settings"]').click();
  await expect(page.locator('#fd-name')).toHaveText('.claude/settings.json');
  await expect(page.locator('#fd-code')).toContainText('"Stop"');
});
```

- [ ] **Step 2:** `npx playwright test tests/landing.spec.ts` → the new tests FAIL (404 on `/map/`).
- [ ] **Step 3:** Write and run the split script; fix links; remove the panels from `docs/index.html`
      (the home rewrite happens in Task 4).
- [ ] **Step 4:** Tests PASS. Screenshot `/map/` and `/harness/` at 1440 and 375 px and compare with the
      old tabs: same look for every station and harness block.
- [ ] **Step 5:** Commit `docs: карта і харнес окремими сторінками`.

### Task 3: Global nav on every page + redirects

**Files:**
- Modify: `docs/index.html`, `docs/map/index.html`, `docs/harness/index.html`,
  `docs/presentation/index.html`, `docs/podcast/index.html`, `docs/3d/index.html`
- Create: `tests/site-nav.spec.ts`

Canonical nav CSS, pasted into every page's `<style>` under `/* спільне меню сайту */`:

```css
.skip{position:absolute;left:12px;top:-60px;z-index:100;padding:8px 12px;border-radius:6px;background:var(--surface);color:var(--text);font:13px var(--sans)}
.skip:focus{top:10px}
.site-nav{position:sticky;top:0;z-index:50;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;height:52px;padding:0 20px;background:var(--bg);border-bottom:1px solid var(--border-muted);font-family:var(--sans)}
.site-logo{justify-self:start;display:inline-flex;align-items:center;gap:8px;min-width:0;color:var(--text);font:600 13px var(--mono);text-decoration:none;white-space:nowrap}
.site-logo:hover{text-decoration:none}
.site-mark{flex:none;display:grid;place-items:center;width:24px;height:24px;border-radius:6px;background:var(--text);color:var(--bg);font:700 14px/1 var(--sans)}
.site-nav nav{display:flex;gap:2px;max-width:100%;padding:3px;overflow-x:auto;scrollbar-width:none;border:1px solid var(--border);border-radius:10px;background:var(--surface)}
.site-nav nav::-webkit-scrollbar{display:none}
.site-nav nav a{flex:none;display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:7px;color:var(--muted);font:500 13px var(--sans);white-space:nowrap;text-decoration:none}
.site-nav nav a:hover{color:var(--text);background:var(--hover);text-decoration:none}
.site-nav nav a[aria-current="page"]{background:var(--surface-2,#1C2128);color:var(--text);box-shadow:inset 0 0 0 1px var(--border)}
.site-gh{justify-self:end;display:grid;place-items:center;width:32px;height:32px;border-radius:8px;color:var(--muted)}
.site-gh:hover{color:var(--text);background:var(--hover)}
.site-gh svg{width:18px;height:18px;fill:currentColor}
@media (max-width:640px){
  .site-nav{grid-template-columns:auto minmax(0,1fr);padding:0 12px}
  .site-name,.site-gh{display:none}
  .site-nav nav{justify-self:end}
  .site-nav nav a{padding:0 9px}
}
```

Light themes: pages with a light theme define `--surface-2` for light (`#EAEEF2`) where missing.

Nav markup: exactly as in spec §4 with `../` (home uses `./`), GitHub octicon `mark-github` path.

Per page:
- presentation: remove `a.crumb-home`; the sticky sidebar gets `top:52px; height:calc(100vh - 52px)`.
- podcast: remove `a.crumb-home` and the "Дивись також" block.
- 3D: nav before `#stage`; `#stage` and `.hud` get `top:var(--nav-h)` (`--nav-h:52px`; `0` under
  `body.capture` and `:fullscreen`); the nav is hidden in both; `resize()` reads
  `stage.clientWidth/clientHeight`; `#btnHome` and its handler are removed.
- home: redirect script as the first element of `<head>`:

```html
<script>
(function(){
  var h = location.hash.slice(1);
  if(!h) return;
  var map = /^(frontend|map)$/.test(h) ? 'map/' :
    /^(phase-[a-d]|s([1-9]|1[0-6])|skills|done|sources)$/.test(h) ? 'map/#' + h :
    h === 'ask' ? 'prompts/#ask' :
    h === 'harness' ? 'harness/' :
    h === 'h-universal' ? 'harness/#h-tree' :
    /^h-[a-z-]+$/.test(h) ? 'harness/#' + h : null;
  if(map) location.replace(map);
})();
</script>
```

- [ ] **Step 1: Failing tests** — `tests/site-nav.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

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
      if (p.current) { await expect(cur).toHaveCount(1); await expect(cur).toHaveText(p.current); }
      else await expect(cur).toHaveCount(0);
      expect(await page.locator('a.site-logo').evaluate((a) => (a as HTMLAnchorElement).href)).toBe(BASE);
    });
  }

  test('меню стоїть по центру вікна на 1440 px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const p of ['', 'map/', 'podcast/']) {
      await page.goto(BASE + p);
      const box = await page.locator('header.site-nav nav').boundingBox();
      expect(Math.abs(box!.x + box!.width / 2 - 720), `центр меню на /${p}`).toBeLessThanOrEqual(2);
    }
  });

  test('375 px: меню не обрізане, сторінки не скроляться вбік', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const p of PAGES) {
      await page.goto(BASE + p.path);
      const clipped = await page.locator('header.site-nav nav').evaluate((n) => n.scrollWidth - n.clientWidth);
      expect(clipped, `меню обрізане на /${p.path}`).toBeLessThanOrEqual(0);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `горизонтальний скрол на /${p.path}`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('старі посилання', () => {
  const cases: [string, RegExp][] = [
    ['/#s7', /\/map\/#s7$/], ['/#frontend', /\/map\/$/], ['/#done', /\/map\/#done$/],
    ['/#harness', /\/harness\/$/], ['/#h-tree', /\/harness\/#h-tree$/], ['/#h-universal', /\/harness\/#h-tree$/],
    ['/#ask', /\/prompts\/#ask$/],
  ];
  for (const [from, to] of cases) {
    test(`${from} → ${to}`, async ({ page }) => {
      await page.goto('http://127.0.0.1:8765' + from);
      await expect(page).toHaveURL(to);
    });
  }
  test('невідомий хеш лишається на головній', async ({ page }) => {
    await page.goto(BASE + '#whatever');
    await expect(page).toHaveURL(BASE + '#whatever');
  });
});
```

- [ ] **Step 2:** Run → FAIL (no `.site-nav`).
- [ ] **Step 3:** Add the nav, CSS and per-page changes above.
- [ ] **Step 4:** `npx playwright test tests/site-nav.spec.ts tests/3d-episodes.spec.ts tests/player.spec.ts tests/deck.spec.ts`
      → PASS (prompts/ and learn/ rows pass after Tasks 5–6). Replace the crumb tests in
      `landing.spec.ts` ("хлібні крихти", `#btnHome`) with a check that the logo leads to `/`.
      Add to `3d-episodes.spec.ts` a test: at 1280×720 without `capture`, the canvas top equals the nav
      bottom and the canvas height equals `innerHeight - 52`; with `?capture=1` the nav is hidden and the
      canvas is `innerHeight` tall.
- [ ] **Step 5:** Commit `docs: спільне меню на всіх сторінках і перекидання старих посилань`.

### Task 4: New home page

**Files:** Modify `docs/index.html`; Test `tests/landing.spec.ts`

Content per spec §6: nav; `<main id="main">` with `h1`, lede, `<form class="find" action="prompts/"
method="get" role="search">` with `<label class="sr">Що треба зробити?</label><input type="search"
name="q" placeholder="Що треба зробити? Наприклад, «перевірити доступність»">` and a submit button
"Знайти"; `.entries` with three `<a class="entry">` cards (Запити для Claude · Харнес · Карта
фронтенду, icons inline SVG, counts "23 запити", "дерево файлів · 6 запитів", "16 зупинок · чекліст");
`.learn-row` with four links (`presentation/`, `3d/`, `podcast/`, `app/`) and "Усі матеріали →"
(`learn/`); footer. Styles: only what the home uses (base tokens, nav, entries, learn row, footer).

- [ ] **Step 1: Failing test** (replaces the old home test):

```ts
test('головна: пошук веде в запити, три входи і рядок «Вчитися» в одному екрані', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Дизайн у коді з Claude');
  await expect(page.locator('a.entry')).toHaveCount(3);
  for (const href of ['prompts/', 'harness/', 'map/']) await expect(page.locator(`a.entry[href="${href}"]`)).toHaveCount(1);
  for (const href of ['presentation/', '3d/', 'podcast/', 'app/', 'learn/']) await expect(page.locator(`main a[href="${href}"]`)).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(900 + 200);
  await page.getByRole('searchbox').fill('доступність');
  await page.getByRole('searchbox').press('Enter');
  await expect(page).toHaveURL(/\/prompts\/\?q=/);
  expect(errors).toEqual([]);
});
```

(The last check allows the footer below the fold.)

- [ ] **Step 2:** Run → FAIL. **Step 3:** Write the page. **Step 4:** PASS, screenshots at 1440/375 in
      both themes. **Step 5:** Commit `docs: нова головна — пошук запиту, три входи, рядок навчання`.

### Task 5: Prompt library `/prompts/`

**Files:** Create `docs/prompts/index.html`, `tests/prompts.spec.ts`; Modify `docs/map/index.html`
(remove `#ask`, add the link line under the metro map).

Core script (inline in the page):

```js
var SOURCES = [
  { url: '../map/', base: '../map/', kind: 'map' },
  { url: '../harness/', base: '../harness/', kind: 'harness' }
];
var PHASES = { 'phase-a': 'Домовитись', 'phase-b': 'Будувати', 'phase-c': 'Перевірити', 'phase-d': 'Здати' };
function norm(s){ return (s || '').toLowerCase().replace(/[’ʼ`]/g, "'").replace(/\s+/g, ' ').trim(); }
function collect(doc, src){
  return [].map.call(doc.querySelectorAll('.prompt'), function(box){
    var p = box.querySelector('p'), st = box.closest('.station'), ph = box.closest('.phase'), step = box.closest('.bstep');
    var sec = box.closest('section[id]');
    var item = { html: p.innerHTML, text: p.innerText || p.textContent, group: 'Харнес', title: '', href: src.base, where: src.kind === 'map' ? 'На карті' : 'У харнесі', extra: '' };
    if (st){
      item.group = PHASES[ph && ph.id] || 'Харнес';
      item.title = st.querySelector('.num').textContent.trim() + ' · ' + st.querySelector('h3').textContent.trim();
      item.href = src.base + '#' + st.id;
      item.extra = [].map.call(st.querySelectorAll('.checks li, .self'), function(n){ return n.textContent; }).join(' ');
    } else if (step){
      item.title = step.querySelector('.num').textContent.trim() + ' · ' + step.querySelector('h3').textContent.trim();
      item.href = src.base + '#' + sec.id;
    } else {
      item.title = sec.querySelector('h2').textContent.trim();
      item.href = src.base + '#' + sec.id;
    }
    item.hay = norm([item.title, item.group, item.text, item.extra].join(' '));
    return item;
  });
}
Promise.all(SOURCES.map(function(src){
  return fetch(src.url).then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); })
    .then(function(html){ return collect(new DOMParser().parseFromString(html, 'text/html'), src); });
})).then(function(lists){ ITEMS = lists[0].concat(lists[1]); render(); })
  .catch(function(){ showError(); });
```

`render()` filters `ITEMS` by `norm(query)` (every word must appear in `hay`) and by the chip, updates
chip counts, "Знайдено N", the empty state, and `history.replaceState(null, '', '?' + params)`.
Rows are built with `document.createElement`; the prompt paragraph uses the parsed `innerHTML` (it comes
from our own pages; `.ph` spans keep their highlight). Copy uses `navigator.clipboard.writeText`, with
the select-and-⌘C fallback from the map. `#ask` opens the `<details>` on load and on `hashchange`.

- [ ] **Step 1: Failing tests** — `tests/prompts.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
const BASE = 'http://127.0.0.1:8765/prompts/';

test.describe('сторінка «Запити»', () => {
  test('збирає 23 запити з карти й харнесу, групи з кількістю', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Запити для Claude');
    await expect(page.locator('.pr')).toHaveCount(23);
    await expect(page.locator('.chip[data-t="Харнес"] .n')).toHaveText('7');
    await expect(page.locator('.chip[data-t="Здати"] .n')).toHaveText('4');
    expect(errors).toEqual([]);
  });

  test('?q=доступність лишає зупинку 4 і веде на карту', async ({ page }) => {
    await page.goto(BASE + '?q=' + encodeURIComponent('доступність'));
    await expect(page.getByRole('searchbox')).toHaveValue('доступність');
    const row = page.locator('.pr', { hasText: '4 · Доступність' });
    await expect(row).toHaveCount(1);
    await expect(row.locator('a.src')).toHaveAttribute('href', '../map/#s4');
  });

  test('апостроф будь-якого виду знаходить те саме', async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole('searchbox').fill('обов’язково');
    const a = await page.locator('.pr').count();
    await page.getByRole('searchbox').fill("обов'язково");
    await expect(page.locator('.pr')).toHaveCount(a);
  });

  test('фільтр за групою і кнопка «Скопіювати»', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:8765' });
    await page.goto(BASE);
    await page.locator('.chip[data-t="Харнес"]').click();
    await expect(page.locator('.pr')).toHaveCount(7);
    await expect(page).toHaveURL(/t=%D0%A5/);
    const first = page.locator('.pr').first();
    await first.locator('button.copy').click();
    await expect(first.locator('button.copy')).toContainText('Скопійовано');
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text.length).toBeGreaterThan(40);
  });

  test('порожній результат і «Показати всі»', async ({ page }) => {
    await page.goto(BASE + '?q=zzzzqqq');
    await expect(page.locator('.empty')).toBeVisible();
    await page.getByRole('button', { name: 'Показати всі' }).click();
    await expect(page.locator('.pr')).toHaveCount(23);
  });

  test('#ask відкриває формулу запиту', async ({ page }) => {
    await page.goto(BASE + '#ask');
    await expect(page.locator('details#ask')).toHaveAttribute('open', '');
  });

  test('якщо джерела не завантажились, показує посилання на карту й харнес', async ({ page }) => {
    await page.route('**/map/', (r) => r.abort());
    await page.goto(BASE);
    await expect(page.locator('.load-error')).toBeVisible();
    await expect(page.locator('.load-error a[href="../map/"]')).toHaveCount(1);
  });
});
```

- [ ] **Step 2:** Run → FAIL. **Step 3:** Build the page (nav, header, `details#ask` with the formula
      markup moved from the map, search, chips, list, empty/error states). **Step 4:** PASS; screenshots
      1440/375. **Step 5:** Commit `docs: сторінка «Запити» з пошуком і фільтром`.

### Task 6: Learning page `/learn/`

**Files:** Create `docs/learn/index.html`; Test `tests/landing.spec.ts`

Four `<li class="step">` blocks per spec §11 with durations and outcomes; 3D episodes as five links
`../3d/?ep=conflict|file-states|pull-request|protected-main|merge-vs-rebase`; PRACTICE.md exercises
with durations from `PRACTICE.md` (10, 20, 25, 15, 20 хв) and a link
`https://github.com/eleken-git/design-process-help/blob/main/PRACTICE.md`.

- [ ] **Step 1: Failing test:**

```ts
test('/learn/: чотири кроки і пряме посилання на кожен 3D-епізод', async ({ page }) => {
  await page.goto(BASE + '/learn/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Вчитися');
  await expect(page.locator('.step')).toHaveCount(4);
  for (const ep of ['conflict', 'file-states', 'pull-request', 'protected-main', 'merge-vs-rebase']) {
    await expect(page.locator(`a[href="../3d/?ep=${ep}"]`)).toHaveCount(1);
  }
  await page.locator('a[href="../3d/?ep=protected-main"]').click();
  await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.episode === 'protected-main', null, { timeout: 60_000 });
});
```

- [ ] **Step 2–5:** FAIL → write page → PASS → commit `docs: сторінка «Вчитися» з маршрутом матеріалів`.

### Task 7: Full check, docs, PR, merge

- [ ] Run `npm run typecheck && npm run build && npm run test:e2e`; all green. Look at 3D frames.
- [ ] Update `README.md` (site map for designers), `AGENTS.md` (site table: `/`, `/prompts/`,
      `/harness/`, `/map/`, `/learn/`; nav rule: "the nav block is copied into every page; change all
      pages together, `tests/site-nav.spec.ts` guards it"; files map: `specs/`), `progress.log` entry.
- [ ] Commit, push, `gh pr create` with the Ukrainian template, wait for the `build` check, squash-merge
      with branch deletion, close PR #16 with a comment pointing to the new PR.
- [ ] Verify GitHub Pages: `curl -s https://eleken-git.github.io/design-process-help/map/ | grep site-nav`
      after the Pages deploy finishes (`gh run list --workflow pages-build-deployment`).

## PR 2 — `docs/harness-merge`

### Task 8: Harness order, legend, collapsed people and materials

**Files:** Modify `docs/harness/index.html`; Test `tests/landing.spec.ts`

- Reorder sections per spec §9; move the "постійне / змінне" explanation of `#h-universal` into a legend
  at the top of `#h-tree` and delete `#h-universal` (add `id="h-universal"` as an extra anchor span in
  the legend so old links still land there).
- People: each `.person` keeps its id and a visible header (initials, name, idea line, verdict); the
  body moves into `<details><summary>Детальніше</summary>…</details>`.
- Materials: "Що це" visible; "Головне" and "Що брати нам" inside `<details>`.
- Merge the two source lists into `#h-sources`, removing duplicates.
- TOC: group labels "Користуватися" (h-tree … h-skip) and "Розібратися" (h-what, h-people,
  h-materials, h-sources).

- [ ] **Step 1: Failing test:**

```ts
test('/harness/: спершу файли, люди й матеріали згорнуті, сторінка коротка', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(BASE + '/harness/');
  const ids = await page.locator('main section[id]').evaluateAll((s) => s.map((x) => x.id));
  expect(ids).toEqual(['h-tree', 'h-build', 'h-loop', 'h-rules', 'h-gates', 'h-skip', 'h-what', 'h-people', 'h-materials', 'h-sources']);
  await expect(page.locator('.person details:not([open])')).toHaveCount(5);
  await expect(page.locator('article.item details:not([open])')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(9000);
  await expect(page.locator('.toc-group')).toHaveText(['Користуватися', 'Розібратися']);
});
```

- [ ] **Step 2–4:** FAIL → change → PASS; full `test:e2e`; screenshots.
- [ ] **Step 5:** Commit `docs: харнес — спершу файли, люди й матеріали згорнуті`; `progress.log`;
      PR; merge; verify Pages.

## PR 3 — `docs/app-nav`

### Task 9: Nav in the Nimbus shell

**Files:** Modify `index.html` (repo root, Vite entry); Test `tests/landing.spec.ts`

Replace `#hub-crumb` with `<header id="hub-nav" class="site-nav">` (same markup, `../` paths, current
item "Вчитися", inline `<style>` with the canonical nav CSS and the GitHub Dark values hardcoded because
the app shell has no page tokens). Keep the existing condition that shows it only under `/app/`.

- [ ] **Step 1: Failing test:** the existing `/app/` crumb test becomes: on `127.0.0.1:5173/` the
      `#hub-nav` is hidden; the Dashboard heading is visible.
- [ ] **Step 2–4:** FAIL → change → PASS; `npm run typecheck && npm run build && npm run test:e2e`.
- [ ] **Step 5:** Commit `app: спільне меню сайту в оболонці Nimbus`; PR; merge.

## PR 4 — `docs/pages-rebuild`

### Task 10: Rebuild `docs/app/`, final verification

- [ ] `npm run build:pages`; add `app/` to `PAGES` in `tests/site-nav.spec.ts` (current "Вчитися");
      `npm run test:e2e` green.
- [ ] Commit `pages: збірка docs/app зі спільним меню`; `progress.log`; PR; merge.
- [ ] Verify on GitHub Pages: home, `/prompts/?q=доступність`, `/harness/`, `/map/#s4`, `/learn/`,
      `/presentation/`, `/3d/`, `/podcast/`, `/app/`, `/#s7` redirect, at 1440 and 375 px.
