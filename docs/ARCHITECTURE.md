# Архітектура проєкту

Короткий опис того, як усе побудовано — для розробника, який щойно зайшов у код.

## Стек

- **Astro 4** — статичний генератор, усі сторінки рендеряться на збірці в чистий HTML.
- **SCSS** — модульні файли в `src/styles/`, сучасний Sass API (`@use`/`@forward`).
- **Content Collections** — рідний Astro-механізм, типізований через Zod.
- **Sveltia CMS** — git-based адмінка, drop-in replacement для Netlify/Decap CMS.
- **CSS Custom Properties** для темізації (не SCSS змінні).

## Дерево

```
startSmart/
├── astro.config.mjs          # Vite + Sass modern API
├── public/
│   ├── admin/                # Sveltia CMS адмінка (/admin)
│   │   ├── index.html
│   │   └── config.yml        # опис усіх колекцій для CMS
│   ├── images/               # медіа, доступне за /images/*
│   └── legacy/               # стара версія сайту (опційно, для VersionSwitcher)
├── src/
│   ├── content/              # ДЖЕРЕЛО ПРАВДИ для контенту
│   │   ├── config.ts         # Zod-схеми колекцій
│   │   ├── settings/site.json
│   │   ├── teachers/*.json
│   │   ├── formats/*.json
│   │   └── pages/*.json
│   ├── components/           # переюзні секції
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── MobileMenu.astro
│   │   ├── ThemeToggle.astro
│   │   ├── VersionSwitcher.astro
│   │   ├── Hero.astro
│   │   ├── MethodGrid.astro
│   │   ├── RateGrid.astro
│   │   ├── FaqList.astro
│   │   ├── TeacherGrid.astro
│   │   └── ContactSection.astro
│   ├── layouts/
│   │   └── BaseLayout.astro  # html skeleton + inline no-flash theme script
│   ├── pages/                # тонкі файли, тільки fetch + композиція компонентів
│   │   ├── index.astro
│   │   ├── english_school.astro
│   │   ├── polish.astro
│   │   ├── individual_classes.astro
│   │   ├── pair_classes.astro
│   │   └── group_classes.astro
│   └── styles/
│       ├── main.scss         # точка входу, @use усіх партіалів
│       ├── _variables.scss   # НЕтемізовані константи (breakpoints, spacing, typography)
│       ├── _tokens.scss      # CSS custom properties для теми (:root + [data-theme="dark"])
│       ├── _reset.scss
│       ├── _layout.scss
│       ├── _header.scss
│       ├── _nav.scss
│       ├── _footer.scss
│       ├── _quick-menu.scss
│       └── _school.scss
└── docs/                     # ця документація
    ├── ADMIN.md
    ├── ARCHITECTURE.md
    └── DEPLOY.md
```

## Потік даних (як контент потрапляє на сторінку)

```
Редактор                                         Кінцевий користувач
   │                                                       ▲
   │ /admin (Sveltia CMS)                                  │
   ▼                                                       │
src/content/**/*.json     → Zod schema (config.ts)         │
       │                          │                        │
       │                          ▼                        │
       │                 astro:content API                 │
       │                 getEntry / getEntries             │
       │                          │                        │
       ▼                          ▼                        │
git commit            src/pages/*.astro                    │
       │              └─ читає контент                     │
       │              └─ передає в секційні компоненти     │
       │                          │                        │
       ▼                          ▼                        │
CI (Cloudflare Pages)     npm run build                    │
       │                          │                        │
       └──────────────────────────┴─── dist/*.html ────────┘
                                        (статика)
```

Ключове: сторінка не має власного контенту. Вона:
1. викликає `getEntry('pages', '<slug>')`,
2. передає отримані дані в `<Hero>`, `<RateGrid>`, `<TeacherGrid>` і т.д.,
3. ніколи не зашиває тексти.

Це значить, що 99% правок сайту — це редагування JSON у `src/content/`, не коду.

## Колекції

Усі визначені в `src/content/config.ts` з Zod-схемами, щоб TypeScript ловив помилки на збірці.

### `settings` (singleton)

Один файл `settings/site.json`. Зберігає глобальне: назва сайту, email, соцмережі, меню, футер. Читається в `Header`, `Footer`, `MobileMenu`, `ContactSection`.

### `teachers`

Data collection, один JSON на викладача. Поля: `name`, `photo {src, srcDark?, alt}`, `quote`, `info`, `languages[]`, `order`.

### `formats`

Формати навчання: `group`, `pair`, `individual`. Кожен має hero-секцію, опис для картки на сторінці школи, `rates[]`, `faq[]`, `heroOverlay` (pink/teal/dark). Шерятся між:
- окремою сторінкою формату (`src/pages/group_classes.astro` і т.д.),
- сіткою «Види навчання» на English School.

### `pages`

Сторінки `home`, `english_school`, `polish`. Містить `hero`, `about`, `features`, `rates`, `faq`, `contact`, + масиви референсів `methods: reference('formats')[]` і `teachers: reference('teachers')[]`.

Референси — це Astro-механізм: у JSON просто пишеш `"teachers": ["svitlana", "evgenia"]`, а `reference()` у схемі перетворює їх на валідовані посилання, які резолвляться через `getEntries(page.teachers)`.

## Темізація

Дві теми: `light` (default) і `dark`. Правила в `docs/ARCHITECTURE.md` і `memory/projects/startsmart/design-rules.md`.

- **Усі кольори** — CSS custom properties у `_tokens.scss`. `:root { --color-bg: #fff; }` для light, `[data-theme="dark"] { --color-bg: #0f1115; }` для dark.
- **SCSS-змінні** (`_variables.scss`) — тільки для того, що не змінюється між темами (брейкпоінти, padding, шрифти).
- **Переключення**:
  - Default = `prefers-color-scheme`.
  - Ручний вибір зберігається в `localStorage.theme`.
  - `BaseLayout.astro` має inline-скрипт, який ставить `data-theme` ДО першого рендеру (щоб не було спалаху білого).
- **Растрові зображення** у dark mode автоматично тьмяніють через CSS-фільтр (`filter: brightness(.85) contrast(1.05)`) — дивись селектори в `_tokens.scss`.
- **Опційний `imageDark`** у схемі — можна задати окрему картинку для темної теми, якщо автоматичне приглушення не підходить (поки ніде не використовується, але схема готова).

## Mobile-first

Усі нові стилі пишуться mobile-first: базові правила без медіа-запиту → `@media (min-width: $bp-tablet)` для tablet/desktop. **Ніколи** не писати `max-width` запити для основної розкладки. Перевірка — Playwright на 375px / 768px / 1280px.

## Хедер і адаптив

- < 1200px — ховається nav і VersionSwitcher, показується burger.
- < 768px — ховаються ще й socials.
- `overflow-x: clip` на `html, body` — захист від випадкового горизонтального скролу.

## Версії сайту

`VersionSwitcher` у хедері дає перемикати між Astro-редизайном і легасі-копією в `/legacy/`. Додати нову версію — масив `versions` у `src/components/VersionSwitcher.astro`.

## Додавання нового (для розробника)

### Нова сторінка

1. Створи `src/content/pages/<slug>.json`.
2. Створи `src/pages/<slug>.astro`:
   ```astro
   ---
   import { getEntry } from 'astro:content';
   import BaseLayout from '../layouts/BaseLayout.astro';
   import Hero from '../components/Hero.astro';
   const page = (await getEntry('pages', '<slug>'))!.data;
   ---
   <BaseLayout title={page.title}>
     {page.hero && <Hero {...page.hero} />}
     {/* інші секції */}
   </BaseLayout>
   ```
3. Додай пункт меню в `src/content/settings/site.json` → `nav`.

### Новий тип контенту (окрема колекція)

1. `src/content/config.ts` → `defineCollection({...})` з Zod-схемою.
2. Додати в експорт `collections`.
3. Описати в `public/admin/config.yml` для Sveltia.
4. Створити папку `src/content/<name>/` і перший JSON.

### Новий компонент секції

Клади в `src/components/`, сигнатура — приймає вже типізований slice даних (не сирий JSON). Стилі — в `_school.scss` або новому партіалі, який підключається в `main.scss`.

## Що НЕ робити

- **Не хардкодити тексти в `.astro` файлах** — усе в JSON.
- **Не використовувати SCSS-змінні для кольорів** — тільки CSS custom properties.
- **Не писати desktop-first CSS** — mobile-first обов'язково.
- **Не амендити опубліковані коміти** — завжди новий коміт.
- **Не робити `git push --force` на `master`**.
