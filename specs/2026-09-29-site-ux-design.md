# Site UX redesign — design spec

- Date: 2026-09-29
- Status: approved in chat, waiting for review of this file
- Scope: the GitHub Pages site in `docs/` (https://eleken-git.github.io/design-process-help/)
- Replaces: PR #16 (table of contents on the landing tabs). Its code is reused here, the PR gets closed.

This file is for agents (English). Every user-visible string quoted below stays Ukrainian.

## 1. Intent

Designers use the site as a **reference during work**, not as a course. They come mid-project, find
something, copy it, and go back to their editor. The two things they look up most:

1. a ready prompt for Claude;
2. what goes into the harness files (AGENTS.md, DESIGN.md, skills, hooks).

The user asked for a centered, good-looking top menu and a site that is comfortable to use.

### Problems found in the audit (1440 and 375 px, all 8 pages)

- Every page has its own way back: tabs on the landing, a sidebar crumb in the deck, "← design-process-help"
  on podcast and reading page, 🏠 in the 3D player, a thin strip in Nimbus. No way to go from one
  section to another without the landing.
- Mixed model: frontend map and "Верстак" are tabs inside `index.html`, everything else is a page. The
  tab bar is left-aligned and clipped at 375 px ("Харнес «Верста…").
- Two "harnesses": the "Харнес «Верстак»" tab and the "Будуємо харнес" page.
- No visible starting point for learning material.
- Very long pages: map 15,095 px desktop / 29,517 px mobile, Верстак 10,489 / 17,878 px. The deck's
  sidebar fills the whole first mobile screen.
- "eleken-git / design-process-help" on the landing looks like a link and is a `<span>`.

### Success criteria

- Every top-level section is one click away from every page (global nav).
- From the home page a prompt is copied in three actions: type a word, press Enter, press "Скопіювати".
- The nav is centered in the viewport, never clipped at 375 px, and no page scrolls horizontally
  anywhere from 320 to 1920 px.
- Every old URL keeps working (section 7).
- The harness page on mobile is at least 45% shorter than the same content was: the Верстак tab
  (17,878 px) plus the reading page (7,005 px) at 375 px → ≤ 13,500 px. Prompts, the file tree and the
  gates stay visible; people, materials and the "where to keep it" notes fold.
- Nothing is lost: 16 stations, 24 prompts, 5 people, 5 materials, the checklist and its saved state
  (`localStorage` key `frontend-map-done-v1`).

## 2. Scope

In scope: structure and navigation of `docs/`.

- one global nav on every page;
- new home page (launcher);
- `/map/`, `/harness/` (merged), `/prompts/`, `/learn/` as separate pages;
- redirects from old hashes;
- the nav replaces the existing back links in presentation, 3D player, podcast and Nimbus.

Out of scope:

- rewriting the content of the deck, 3D episodes, podcast or Nimbus screens;
- turning the deck into real slides;
- site-wide search (⌘K). The prompt filter covers the main need; search can be a later PR;
- anything in `src/`.

## 3. Information architecture

| URL | Page | Made from |
| --- | --- | --- |
| `/` | Home, a launcher | rewrite of `docs/index.html` |
| `/prompts/` | Prompt library | new `docs/prompts/index.html` |
| `/harness/` | Harness | the "Верстак" panel of `docs/index.html` + `docs/harness/index.html` |
| `/map/` | Frontend map | the `#frontend` panel of `docs/index.html` |
| `/learn/` | Learning path | new `docs/learn/index.html` |
| `/presentation/`, `/3d/`, `/podcast/`, `/app/` | unchanged content | nav only |

Nav items, in this order: `Запити` → `prompts/`, `Харнес` → `harness/`, `Карта` → `map/`,
`Вчитися` → `learn/`. On presentation, 3D, podcast and app pages the active item is `Вчитися`.
The home page has no active item.

Naming: the section is called "Харнес". "Верстак" is the name of the designer's template repository
(the prompts already say `Create a template repository called verstak`). The page heading is
"Карта фронтенду", the nav label is the short "Карта".

## 4. Global nav

### Markup

Inline in every page (the `docs/` rule: no shared CSS or JS files, each page keeps its own `<style>`):

```html
<a class="skip" href="#main">Перейти до змісту</a>
<header class="site-nav">
  <a class="site-logo" href="../" aria-label="design-process-help, на головну">
    <span class="site-mark" aria-hidden="true">d</span><span class="site-name">design-process-help</span>
  </a>
  <nav aria-label="Розділи сайту">
    <a href="../prompts/">Запити</a>
    <a href="../harness/">Харнес</a>
    <a href="../map/" aria-current="page">Карта</a>
    <a href="../learn/">Вчитися</a>
  </nav>
  <a class="site-gh" href="https://github.com/eleken-git/design-process-help" aria-label="Репозиторій на GitHub"><!-- svg --></a>
</header>
```

Paths are relative: `./` on the home page, `../` on every other page. The main content of each page
gets `id="main"`.

### Layout and behavior

- `display:grid; grid-template-columns:1fr auto 1fr`, so the nav sits in the exact center whatever the
  logo width. The GitHub link is right-aligned in the third column.
- The nav items form a segmented control in the existing GitHub Dark style: surface background,
  1 px border, the current item has `--surface-2` and an inset border, like the current `.seg` tabs.
  The current item carries `aria-current="page"`.
- Sticky at the top, `z-index` above page content, page background, 1 px bottom border.
  Height 52 px, exposed as `--nav-h` for sticky offsets.
- ≤ 640 px: the logo shows only the "d" mark, the GitHub link hides, item padding shrinks. All four
  items must fit on one line at 375 px. At 320 px the item row may scroll inside itself; the page
  never scrolls horizontally.
- Items are at least 32 px tall, have `:focus-visible` outlines, and work in light and dark themes
  through each page's own tokens.

### Per page

- **Presentation**: remove `a.crumb-home` from the sidebar; the sticky sidebar starts below the nav.
- **Podcast**: remove `a.crumb-home` and the "Дивись також" block (the nav replaces both).
- **3D player**: the nav sits above `#stage`. `#stage` starts at `--nav-h`; `resize()` in `engine.js`
  sizes the renderer from `#stage` instead of `window`. The nav hides in fullscreen and in
  `?capture=1`. `#btnHome` is removed. The e2e overlap checks must stay green.
- **Nimbus** (`/app/`): replace `#hub-crumb` in the root `index.html` with the same nav, inline styles,
  shown only when served under `/app/` (the existing condition). Goes live after `npm run build:pages`.

### Drift guard

Because the nav is copied into every page, a Playwright test visits every page and asserts the same
four labels in the same order, the same resolved URLs, exactly one `aria-current` (none on home), and a
logo link that resolves to the site root.

## 5. Page table of contents (map, harness)

Reuse the PR #16 implementation (commit `ba9a3c7` on `docs/landing-toc`): cherry-pick it and adapt.

- ≥ 1180 px: sticky left sidebar, scrollspy with `aria-current="location"`, nested items of the current
  group expand, the sidebar keeps the active item in view.
- < 1180 px: a second sticky row under the global nav with a "Зміст · <current section>" button that
  opens the list as a dropdown. It closes on a link click, an outside click and Esc.
- Sticky offsets use `--nav-h` plus the TOC row height instead of the old jump bar.

## 6. Home page

- `<h1>Дизайн у коді з Claude</h1>` and one lede line: "Довідник для дизайнерів: готові запити, харнес
  і карта перевірок фронтенду."
- A search form that works without JavaScript:
  `<form action="prompts/" method="get" role="search"><input type="search" name="q" …></form>`,
  placeholder "Що треба зробити? Наприклад, «перевірити доступність»". Enter opens `/prompts/?q=…`.
- Three entry cards, in this order: "Запити для Claude", "Харнес", "Карта фронтенду". Each has an
  icon, a title, one line on what is inside, and "Відкрити →". The whole card is the link.
- A "Вчитися" row: four compact links (Презентація, Git у 3D, Подкаст, Nimbus) and "Усі матеріали →"
  to `/learn/`.
- The footer stays.
- Removed: the long hero, the kicker, the fake crumb, the tabs, the old "Інші матеріали" cards.
- The page fits in one 1440×900 screen. At ≤ 640 px the cards become one-column rows.

## 7. Redirects from old URLs

A small script at the top of `docs/index.html` maps the old hash and calls `location.replace()` before
the page renders. Unknown hashes stay on home.

| Old | New |
| --- | --- |
| `/#frontend`, `/#map` | `map/` |
| `/#phase-a` … `/#phase-d`, `/#s1` … `/#s16`, `/#skills`, `/#done`, `/#sources` | `map/#<same id>` |
| `/#ask` | `prompts/#ask` |
| `/#harness` | `harness/` |
| `/#h-<id>` | `harness/#h-<id>` (ids are kept) |
| `/#h-universal` | `harness/#h-tree` (the section is merged into the file tree) |
| `/#home`, `/#m-start`, `/#m-cards` | stay on home |

Old anchors of the reading page (`harness/#karpathy`, `#agents`, `#sdd`, `#speckit`, `#superpowers`)
are kept on the merged harness page.

## 8. Prompt library (`/prompts/`)

### Single source

Prompts stay where they are, next to their explanation, in `map/index.html` (17: stations 1–16 and the
`#skills` section) and `harness/index.html` (7: the six "Зібрати" steps and one in "Помилка стає правилом"). The library page fetches both
pages, parses them with `DOMParser`, and renders a list. A prompt added to the map appears in the
library with no second copy.

For each `.prompt` it derives:

| Field | Map | Harness |
| --- | --- | --- |
| group | the closest `.phase` → Домовитись (2), Будувати (5), Перевірити (5), Здати (4); the `#skills` prompt → Харнес, because skills are part of the harness | Харнес (7, so 8 with `#skills`) |
| title | station number + `h3` of the closest `.station`; `#skills` uses its `h2` | step number + `h3` of the closest `.bstep`, otherwise the section `h2` |
| link | `../map/#<station id>` or `../map/#skills` | `../harness/#h-build` |
| search text | title, `.checks li`, `.self`, the English prompt text, the group name | title, prompt text, group |

If the fetch fails: "Не вдалося завантажити запити." plus links to the map and the harness.

### UI

- Heading "Запити для Claude", lede: "Усі запити з карти й харнесу. Англійською, бо так Claude розуміє
  точніше. Замініть [дужки] своїм."
- A collapsible "Як скласти свій запит" block (`<details id="ask">`, closed by default, opened when the
  URL hash is `#ask`) with the four-part formula moved from the map (Що, Де, Доказ, Межа, the example
  and the three rules).
- A search input, prefilled from `?q=`. Matching is case-insensitive and treats `'`, `’`, `ʼ` as the
  same character.
- Filter chips: Усі, Домовитись, Будувати, Перевірити, Здати, Харнес, each with a count for the
  current query. Group colors come from the map's phase colors.
- "Знайдено N" above the list.
- Each row: group dot, title, the prompt text in monospace with `.ph` placeholders highlighted,
  a "Скопіювати" button (same clipboard fallback as the map: select and ask for ⌘C), and
  "На карті →" or "У харнесі →".
- State lives in the URL (`?q=…&t=…`, `history.replaceState`) so a filtered list can be shared.
- Empty state: "Нічого не знайшлося." and a "Показати всі" button that clears the query and the chip.

## 9. Harness page (`/harness/`)

`<h1>Харнес</h1>`, a lede with the one-sentence definition and "Верстак — ваш шаблон-репозиторій для
кожного клієнтського проєкту."

Section order, existing ids kept:

**Користуватися**
1. `#h-tree` Файли харнесу: the file tree and detail panel. The "постійне / змінне" explanation from
   `#h-universal` becomes a short legend here; `#h-universal` goes away.
2. `#h-build` Зібрати за шість запитів.
3. `#h-loop` Робочий день.
4. `#h-rules` Помилка стає правилом.
5. `#h-gates` Ворота якості.
6. `#h-skip` Що не брати на старті.

**Розібратися**
7. `#h-what` Що таке харнес (the rings diagram).
8. `#h-people` П'ять людей, п'ять ідей: compact cards (initials, name, one idea, verdict). The full
   text sits in `<details>` inside each card. Ids `#h-huntley` … `#h-yegge` stay.
9. `#h-materials` П'ять матеріалів: the five items from the reading page (`#karpathy`, `#agents`,
   `#sdd`, `#speckit`, `#superpowers`). "Що це" stays visible, "Головне" and "Що брати нам" go into
   `<details>`, the link to the original stays visible.
10. `#h-sources` Джерела: the two source lists merged, duplicates removed.

The TOC shows the two group labels "Користуватися" and "Розібратися".

## 10. Map page (`/map/`)

- The content of the `#frontend` panel, without `#ask` (moved to the prompt library). A line under the
  map links there: "Як скласти свій запит → Запити".
- A short header: `<h1>Карта фронтенду</h1>`, one line, and "4 етапи · 16 зупинок · 17 запитів". The
  metro map follows at once.
- Station ids (`#s1` … `#s16`), `#done`, `#skills`, `#sources` stay. The checklist keeps its
  `localStorage` key.
- The copy and checklist scripts move with the content.

## 11. Learning page (`/learn/`)

An ordered route of four steps, each with duration, one line on what you can do afterwards, and links:

1. **Презентація**, about 10 minutes → `../presentation/`.
2. **Git у 3D**, five episodes of up to 2 minutes, each linked directly as `../3d/?ep=<id>`, in
   `order`: `conflict` (Конфлікт у Git), `file-states` (Три стани файлу), `pull-request` (Життєвий цикл
   Pull Request), `protected-main` (Чому main захищений), `merge-vs-rebase` (merge main vs rebase main).
3. **Подкаст**, two episodes, 13:21 and 17:30 → `../podcast/`.
4. **Вправи в Nimbus**: the exercises of `PRACTICE.md` in one line each (Підготовка, Паралельні екрани
   без конфліктів, Спільний компонент правильно, Конфлікт навмисно, Breaking change за процедурою) with
   durations, a link to `../app/` and to `PRACTICE.md` on GitHub.

## 12. Accessibility and responsive rules

- A skip link "Перейти до змісту" is the first focusable element on every page.
- `aria-current="page"` in the nav, `aria-current="location"` in the TOC.
- No horizontal page scroll from 320 to 1920 px, in light and dark themes.
- `prefers-reduced-motion` keeps smooth scrolling off.
- `<details>` summaries are real buttons for the keyboard (native behavior), with visible focus.

## 13. Tests

- New `tests/site-nav.spec.ts`: the nav on every page (home, prompts, harness, map, learn,
  presentation, 3d, podcast, app); identical labels and URLs; one `aria-current` (none on home); logo
  goes to the root; at 375 px the nav is not clipped and the page has no horizontal overflow.
- Redirects: `/#s4` → `map/#s4`, `/#h-tree` → `harness/#h-tree`, `/#frontend` → `map/`,
  `/#ask` → `prompts/#ask` with the formula open, `/#h-universal` → `harness/#h-tree`.
- New `tests/prompts.spec.ts`: 24 prompts; `?q=доступність` keeps station 4; a chip filters by group;
  "Скопіювати" writes the prompt to the clipboard; the empty state and "Показати всі".
- Update `tests/landing.spec.ts`: home cards and search form; the crumb tests become nav tests; the map
  test moves to `/map/` (16 stations, 17 prompts); the harness test moves to `/harness/` (5 people, the
  file tree, 5 materials); the TOC test from PR #16.
- `tests/3d-episodes.spec.ts` stays green with the nav present; look at the frames in
  `test-results/frames/<episode>/`.
- Before every PR: `npm run typecheck && npm run build && npm run test:e2e`.

## 14. Delivery

Each PR branches from a fresh `main` and waits for the previous one to be merged. No stacking.

1. `docs/site-structure` — this spec, the nav on every `docs/` page (including 3D), the new home, the
   `/map/`, `/prompts/` and `/learn/` pages, `/harness/` with the Верстак content followed by the five
   materials as they are, the redirects, the TOC from PR #16, tests, `README.md`, `AGENTS.md` (site
   table), `progress.log`. Close PR #16.
2. `docs/harness-merge` — the harness order, the merged file-tree legend, collapsed people and
   materials, merged sources, TOC groups.
3. `docs/app-nav` — the nav in the Nimbus shell (root `index.html`).
4. `docs/pages-rebuild` — `npm run build:pages` so `/app/` shows the nav. Last, on its own.
