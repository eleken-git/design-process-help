# AGENTS.md

Rules for any coding agent working in this repository (Claude Code, Codex, Cursor, Copilot, Gemini CLI).
Read this file fully before the first change. `CLAUDE.md` only points here, so there is one source of truth.

Keep this file under 300 lines. Long-form history goes to [`progress.log`](progress.log); human-facing
explanations go to [`README.md`](README.md) and [`PRACTICE.md`](PRACTICE.md).

## What this repo is

A teaching repo for UX/UI designers who design in code through an AI agent and learn to work in pairs
through branches and Pull Requests. It contains a practice app (Nimbus), a slide deck, animated 3D
episodes about Git, a podcast player and a reading page about agent harnesses. The audience is
designers, not engineers: they type requests in plain language and you do the git and the code.

## Language policy (strict)

| Audience | Where | Language |
| --- | --- | --- |
| Designers (users) | `README.md`, `PRACTICE.md`, every page under `docs/`, all UI strings, all code comments, commit messages, PR descriptions | **Ukrainian** |
| Agents | `AGENTS.md`, `CLAUDE.md`, `progress.log`, `ANIMATIONS.md`, `src/*/README.md` | **English** |

Never translate user-visible text to English, and never write agent documentation in Ukrainian.
When you add a new document, decide who reads it and follow the table.

## Architecture

Three layers, imports only point downwards: `src/screens → src/components → src/tokens`.
A screen never imports another screen, a component never imports a screen, tokens import nothing.

- **Styles come from tokens only.** Use `var(--…)` from `src/tokens`. Never write raw colors or sizes
  in components and screens. If a token is missing, propose adding it in a separate `ds/tokens-…` branch.
- **One-screen components** live in `src/screens/<screen>/components/`. `src/components` holds only what
  two or more screens need (the "rule of two").
- **Every shared component and every one of its variants is shown on `#/ui-kit`**
  (`src/screens/ui-kit/UiKit.tsx`). Add a variant, add it there in the same PR.
- Screens are `#/dashboard`, `#/settings`, `#/ui-kit`; routing is a hash router in `src/App.tsx`.

## Branches and Pull Requests

- **Never commit to `main`.** Before a new task: `git switch main && git pull && git switch -c <branch>`.
- Branch names: `feat/<screen>-<what>` for changes in `src/screens/<screen>`, `ds/<component>-<what>` for
  `src/components` or `src/tokens`, `fix/<what>` for fixes, `docs/<what>` for documentation and the site.
- **In a `feat/*` branch do not touch `src/components` or `src/tokens`.** If the task needs it, stop,
  explain it to the user and propose a separate `ds/*` branch from a fresh `main`.
- A new prop or token ships with a default that preserves the current look. Changing a default, renaming
  or deleting one is a breaking change: ask the user first, find every usage (`grep -rn "<Button" src`)
  and update them in the same PR.
- Small commits, message format `<area>: <what was done>`, in Ukrainian, e.g. `dashboard: картка відтоку`.
- **Before push and PR: `npm run typecheck && npm run build`.** If it fails, fix it, never skip it.
- If you touched `docs/3d/`, also run `npm run test:e2e` and look at the frames in
  `test-results/frames/<episode>/`: nothing may overlap the caption text.
- Open PRs with `gh pr create` and fill in `.github/PULL_REQUEST_TEMPLATE.md` (the template is Ukrainian).
  A `ds/*` PR must include a screenshot of `#/ui-kit`.
- **No force push. Do not merge your own PR** — a human merges after review, unless the user explicitly
  asks you to merge.
- **Do not stack PRs.** Branch every PR off `main`. A squash merge rewrites SHAs, so a branch stacked on
  another one ends up conflicting and GitHub closes it when the base branch is deleted. If you already
  stacked and the base got merged, cherry-pick the child's own commits onto a fresh branch from `main`.
- On a conflict during `git merge main`: show the user both versions of the lines in plain language and
  ask which one stays. Never resolve silently.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | once after cloning |
| `npm run dev` | the app on http://localhost:5173 (`#/dashboard`, `#/settings`, `#/ui-kit`) |
| `npm run docs` | the static pages of `docs/` on http://127.0.0.1:8765 |
| `npm run typecheck` | TypeScript check, required before a PR |
| `npm run build` | production build into `dist/` (git ignores it), required before a PR |
| `npm run build:pages` | separate static build of the app into `docs/app/` for GitHub Pages |
| `npm run test:e2e` | Playwright: app screens, deck, podcast, 3D overlap checks (first run: `npx playwright install chromium`) |

`npm run docs` serves `docs/` with Range request support. Plain `python3 -m http.server` cannot seek in
audio, which breaks the 3D player and the podcast locally — always use the npm script.

`npm run build:pages` rewrites `docs/app/`. Commit it deliberately, in its own PR, when you want to
refresh the public preview — not in every PR.

## The site in `docs/`

`docs/` is the GitHub Pages root: https://eleken-git.github.io/design-process-help/

| Path | What it is |
| --- | --- |
| `docs/index.html` | landing hub with a card per section |
| `docs/presentation/` | the slide deck |
| `docs/3d/` | the 3D player: `engine.js`, `backlog.js`, `episodes/<id>.js` + `<id>.mp3` |
| `docs/podcast/` | podcast player, episodes are `.m4a` files next to `index.html` |
| `docs/harness/` | reading page about agent harnesses + `notebooklm/` source texts |
| `docs/app/` | built practice app, produced by `npm run build:pages` |

Every page keeps the same GitHub Dark palette, a `← design-process-help` breadcrumb back to the landing,
and its own `<style>` block. There is no shared CSS file across `docs/` pages on purpose: a designer can
open one file and see everything that page uses.

## 3D episodes

An episode is `docs/3d/episodes/<id>.js` (scene) plus `<id>.mp3` (music), registered in `window.EPISODES`
and loaded by a `<script>` tag in `docs/3d/index.html`. The shared engine gives you scene primitives
(`mk.commit`, `mk.tube`, `mk.label`, `mk.card`, `mk.platform`), canvas textures, HUD and camera.

Every episode defines `BEATS` (sections with `t0`, `t1`, title, caption, terminal lines), `DUR`, `CAM`
(camera keyframes) and an `update(t)` function that drives everything from a single time value.

Rules that keep episodes readable:

- The caption block lives in the lower-left quarter of the frame. Keep geometry, labels and cards out of it.
- Keep the chapter title area (top-left) clear too.
- `npm run test:e2e` checks every section of every episode for overlaps and off-frame plates and writes
  frames to `test-results/frames/<episode>/`. Look at those frames before you call an episode done.
- New topics come from [`ANIMATIONS.md`](ANIMATIONS.md); the same list is shown to designers in Ukrainian
  in the player's "Наступні" panel (`docs/3d/backlog.js`). When you ship an episode, remove it from both
  and add it to the "done" table in `ANIMATIONS.md` and `README.md`.

Music is generated by `scripts/compose-music.py` (numpy + `lame`). Each episode has its own key, tempo,
meter, texture and reverb room so the tracks do not sound like one loop. It is background music under a
voice: sparse (about one note per second), soft attack, pad-led, normalized to about −21 dBFS.
Regenerate one track with `python3 scripts/compose-music.py <episode-id>`.

## Progress log

After every finished piece of work — a merged PR, a shipped episode, a documentation pass — append one entry
to [`progress.log`](progress.log), newest last, and never rewrite past entries. Keep the format that file
declares. It exists so this file can stay short: rules here, history there.

## Files map

```
AGENTS.md          rules for agents (this file, English, ≤300 lines)
CLAUDE.md          pointer to AGENTS.md
progress.log       build log, newest entry last (English)
README.md          the whole project explained for designers (Ukrainian)
PRACTICE.md        four paired exercises for designers (Ukrainian)
ANIMATIONS.md      3D episode catalogue and production brief (English)
scripts/           compose-music.py (episode tracks), serve-docs.mjs (Range-capable docs server)
src/tokens/        CSS variables: colors, spacing, typography
src/components/    shared components, each with .tsx + .module.css + index.ts
src/screens/       one folder per screen, local components inside
tests/             Playwright: app.spec, landing.spec, player.spec, deck.spec, 3d-episodes.spec
docs/              GitHub Pages site (see the table above)
```
