# Дизайн у коді: один репозиторій, паралельна робота, нічого не ламається

Практичний план для команди «дизайнер + розробник», яка робить продукт для клієнта одразу в коді.
Презентація для дизайнера — [`docs/index.html`](docs/index.html): відкрийте файл у браузері або увімкніть GitHub Pages з папки `/docs`.

## Рішення за 30 секунд

| Питання | Відповідь |
|---|---|
| Розділяти продукт, компоненти й дизайн-систему на окремі репозиторії? | **Ні.** Один репозиторій, три папки з чіткими межами: `tokens → components → screens`. Окремий пакет — це версії, публікація, оновлення залежностей. Для двох людей це зайва робота. |
| Як контролювати зміни? | `main` захищений. Будь-яка зміна: гілка → Pull Request → ревʼю → squash merge. Історія змін живе в PR: хто, що, чому, зі скриншотами. |
| Як зміна спільного компонента не зламає інші екрани? | Спільний код (`src/tokens`, `src/components`) змінюється **окремим маленьким PR**, який ревʼюють обидва (CODEOWNERS). Правило: додавай варіант, не змінюй дефолт. Перевірка — екран `/ui-kit`. |

## 1. Структура папок

```
.
├── README.md                      ← цей план
├── docs/index.html                ← презентація для дизайнера
├── .github/
│   ├── CODEOWNERS                 ← хто обовʼязково ревʼює спільний код
│   └── PULL_REQUEST_TEMPLATE.md   ← чекліст для кожного PR
└── src/
    ├── tokens/                    ← 1. значення: кольори, відступи, шрифти
    │   ├── colors.css
    │   ├── spacing.css
    │   ├── typography.css
    │   └── index.css
    ├── components/                ← 2. спільні компоненти («правило двох»)
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   ├── Button.module.css
    │   │   └── index.ts
    │   ├── Card/
    │   └── index.ts
    └── screens/                   ← 3. екрани: одна папка = один екран = одна гілка
        ├── dashboard/
        │   ├── Dashboard.tsx
        │   ├── Dashboard.module.css
        │   └── components/StatCard.tsx          ← локальний компонент екрана
        ├── settings/
        │   ├── Settings.tsx
        │   └── components/NotificationRow.tsx
        └── ui-kit/UiKit.tsx                     ← галерея компонентів для ревʼю
```

Три шари, залежності тільки вниз: `screens → components → tokens`.

- `tokens` не імпортують нічого.
- `components` використовують лише `tokens` і не знають про екрани.
- `screens` використовують `components` і `tokens`; один екран не імпортує інший.
- Компонент, потрібний одному екрану, лежить у `screens/<екран>/components/`. Стає спільним, коли знадобився другому екрану («правило двох»).
- Стилі — тільки через `var(--…)`. Жодних «сирих» `#2563eb` і `14px` поза `src/tokens`.

Стек у прикладах — React + CSS Modules, `@/` = `src/`. Це шаблон структури без збірки: перенесіть папки у ваш codebase.

## 2. Гілки

```
              PR #12 (ds)          PR #13 (settings)        PR #14 (dashboard)
                  ▼                      ▼                        ▼
main ●────────────●──────────────────────●────────────────────────●────▶
     │\           ▲                      ▲                        ▲
     │ ●──────────┘ ds/button-size-sm    │                        │
     │                                   │                        │
     ├─●────●────●───────────────────────┘ feat/settings-notifications
     │
     └─●────●──(⇐ main)──●────(⇐ main)──●─────────────────────────┘ feat/dashboard-redesign

(⇐ main) = git merge main: підтягнути свіжий main у свою гілку
```

| Префікс | Для чого | Приклад | Ревʼю |
|---|---|---|---|
| `feat/` | екран або фіча | `feat/dashboard-redesign` | 1 апрув другого учасника |
| `ds/` | зміни в `src/tokens` або `src/components` | `ds/button-size-sm` | апрув обох (CODEOWNERS) |
| `fix/` | виправлення | `fix/settings-save-button` | 1 апрув |

- Гілку створюємо від свіжого `main`: `git switch main && git pull && git switch -c feat/…`.
- Гілка живе 1–3 дні. Довше — розбиваємо задачу.
- Щодня підтягуємо `main` у свою гілку: `git merge main`.

## 3. Правила Pull Request

1. `main` завжди робочий. У `main` ніхто не пушить напряму (branch protection).
2. Одна задача = одна гілка = один PR.
3. PR маленький: до ~300 рядків, опис і скриншоти «до / після» за шаблоном.
4. Екрани ревʼює другий учасник (1 апрув). `src/tokens` і `src/components` — апрув обох.
5. Merge — тільки **Squash and merge**. Гілка після merge видаляється.
6. Спільний код — окремий PR, а не частина PR екрана.
7. Ревʼю — протягом робочого дня. Маленький `ds/` PR — за 15 хвилин.

## 4. Спільні компоненти й токени: три правила

1. **Додавай варіант, не змінюй дефолт.** Новий проп або токен має дефолт, що дорівнює поточній поведінці. Потрібна менша кнопка — `size="sm"`, а не менший `padding` у `.button`.
2. **Знайди всі використання** перед зміною: пошук `<Button` по проєкту, потім екран `/ui-kit`, де кожен компонент показаний у всіх станах.
3. **Breaking change — окрема історія.** Змінити дефолт, перейменувати або видалити проп можна: спершу написати в чаті → окремий PR `ds/…` → у тому ж PR оновити всі екрани → ревʼю обох.

Диф із прикладу нижче:

```diff
 type ButtonProps = {
   variant?: 'primary' | 'secondary';
+  /** Дефолт 'md' = попередня поведінка, Settings не змінюється. */
+  size?: 'md' | 'sm';
   children: ReactNode;
 };

-export function Button({ variant = 'primary', children }: ButtonProps) {
+export function Button({ variant = 'primary', size = 'md', children }: ButtonProps) {
```

## 5. Приклад: дизайнер робить Dashboard, розробник — Settings

| # | Дизайнер — `feat/dashboard-redesign` | `main` | Розробник — `feat/settings-notifications` |
|---|---|---|---|
| 1 | `git switch main && git pull`<br>`git switch -c feat/dashboard-redesign` | ● обидві гілки від одного коміту | `git switch main && git pull`<br>`git switch -c feat/settings-notifications` |
| 2 | Працює лише в `src/screens/dashboard/`. Коміт → `git push -u origin feat/dashboard-redesign`. Можна одразу відкрити Draft PR | | Працює лише в `src/screens/settings/`. Коміт → push |
| 3 | Потрібна менша кнопка. Button у своїй гілці **не** чіпає: коміт → `git switch main && git pull` → `git switch -c ds/button-size-sm` | | Продовжує Settings |
| 4 | Додає `size` з дефолтом `md`, `.sm` у CSS, варіант у `/ui-kit`. Відкриває **PR #12** зі скриншотом `/ui-kit` | | Ревʼює PR #12 (15 хв): дефолт не змінився, `/ui-kit` в порядку → Approve |
| 5 | | **PR #12 → Squash and merge.** Button має `size="sm"` | |
| 6 | `git switch feat/dashboard-redesign` → `git merge main` → використовує `<Button size="sm">` | | `git merge main` → Settings виглядає так само, дефолт `md` |
| 7 | | | Settings готовий → **PR #13** зі скриншотами до / після |
| 8 | Ревʼює PR #13 → Approve | **PR #13 → Squash and merge**, гілку видалено | |
| 9 | `git merge main` — конфліктів немає, інші папки → **PR #14** | | Ревʼює PR #14 → Approve |
| 10 | | **PR #14 → Squash and merge** | |

Результат: у `main` — новий Dashboard, нові Settings і Button із `size="sm"`. Жоден екран не зламався, ніхто не чекав на іншого.

### Що було б без правила про окремий PR

Дизайнер зменшує `padding` у `.button` прямо в `feat/dashboard-redesign`. PR Dashboard зливається — і всі кнопки в Settings стають меншими. Розробник помічає це після релізу, бо в його PR цих файлів не було.

## 6. Конфлікти

Конфлікт буває лише коли обидва змінили ті самі рядки одного файлу. Типові місця: роутинг, `src/components/index.ts`, файли токенів. Різні екрани — різні папки — конфліктів немає.

```bash
git switch feat/dashboard-redesign
git merge main                 # git пише CONFLICT і назву файлу
# відкрити файл у VS Code → Accept Current / Incoming / Both → зберегти
git add -A && git commit       # завершити злиття
git push
```

Не впевнений, що обрати — поклич другого учасника, це 5 хвилин.

## 7. Налаштувати один раз (розробник)

1. GitHub → Settings → Rules → New branch ruleset для `main`: Require a pull request (1 approval) · Require review from Code Owners · Block force pushes.
2. Settings → General → Pull Requests: залишити лише **Allow squash merging**, увімкнути **Automatically delete head branches**.
3. У `.github/CODEOWNERS` вписати реальні GitHub-логіни.
4. За бажанням: Settings → Pages → Deploy from a branch → `main` / `docs` — презентація відкриється за посиланням.

## 8. Шпаргалка для дизайнера

| Дія | Термінал | GitHub Desktop |
|---|---|---|
| Оновити `main` | `git switch main && git pull` | Current branch → `main` → Fetch origin → Pull |
| Нова гілка | `git switch -c feat/dashboard-redesign` | Branch → New branch (from `main`) |
| Зберегти роботу | `git add -A && git commit -m "Dashboard: картки статистики"` | Summary → Commit to feat/… |
| Відправити на GitHub | `git push -u origin feat/dashboard-redesign` | Publish branch / Push origin |
| Підтягнути `main` у гілку | `git merge main` | Branch → Update from main |
| Відкрити PR | кнопка **Compare & pull request** на GitHub | Branch → Create Pull Request |

## 9. Чого не робимо зараз

| Що | Чому не зараз | Коли повернемось |
|---|---|---|
| Окремий репозиторій або npm-пакет для дизайн-системи | Версії, публікація, оновлення залежностей — зайва робота для двох людей | Другий продукт починає використовувати ті самі компоненти |
| Storybook, візуальні регресійні тести | Ще одна інфраструктура; `/ui-kit` і скриншоти в PR закривають потребу | Понад 20 компонентів або понад 3 людей у коді |
| Семантичні версії компонентів | Без пакета не мають сенсу | Разом із пакетом |
