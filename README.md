# StartSmart

Онлайн-школа мов: English School + Szkoła Językowa. Astro + SCSS, тёмна/світла тема, контент через Sveltia CMS.

## Команди

```bash
npm install
npm run dev       # dev-сервер (localhost:4321)
npm run build     # статичний збір → dist/
npm run preview   # подивитись зібране
```

## Структура

```
src/
├── content/              # джерело правди для CMS
│   ├── config.ts         # Zod-схеми колекцій
│   ├── settings/site.json
│   ├── teachers/*.json
│   ├── formats/*.json    # group / pair / individual
│   └── pages/*.json      # home / english_school / polish
├── components/           # Hero, RateGrid, FaqList, TeacherGrid, MethodGrid, ContactSection, Header, Footer, MobileMenu, ThemeToggle, VersionSwitcher
├── layouts/BaseLayout.astro
├── pages/                # тонкі обгортки, читають контент через getEntry()
└── styles/
    ├── _tokens.scss      # CSS-змінні теми (:root + [data-theme="dark"])
    ├── _variables.scss   # SCSS-константи (breakpoints, spacing)
    └── *.scss            # блоки
public/
├── admin/                # Sveltia CMS (`/admin`)
│   ├── index.html
│   └── config.yml
└── images/               # медіа
```

## Тема

- Кольори живуть у CSS-змінних у `src/styles/_tokens.scss` (не в SCSS-змінних).
- `prefers-color-scheme` — default; ручний перемикач зберігається в `localStorage`.
- Інлайн-скрипт у `BaseLayout.astro` ставить `data-theme` ДО першого рендеру, щоб не було спалаху.
- Фото/растр у dark mode автоматично приглушуються (`filter: brightness(.85)`).

## Контент-менеджмент (Sveltia CMS)

Контент усіх сторінок лежить у `src/content/**/*.json`. Редагувати можна:

1. **Руками в файлах** — закомітити як звичайний код.
2. **Через адмінку `/admin`** — графічний редактор.

### Локальний запуск адмінки

Sveltia CMS налаштована на `backend: proxy`, тож у dev-режимі вона пише прямо у файли через локальний proxy-сервер:

```bash
# у першому терміналі — dev-сервер сайту
npm run dev

# у другому терміналі — proxy для CMS
npx @sveltia/cms-proxy-server
```

Після цього відкрий [http://localhost:4321/admin/](http://localhost:4321/admin/) — без авторизації, зміни зберігаються у `src/content/`. Після редагування — `git add . && git commit` як зазвичай.

### Продакшн auth

Для деплою треба замінити `backend: proxy` на `github` / `gitlab` у `public/admin/config.yml` і налаштувати OAuth-проксі (наприклад, `sveltia-cms-auth` на Cloudflare Workers). Поки що не зроблено — вирішимо під час деплою.

## Колекції

| Колекція  | Тип            | Що там                                           |
|-----------|----------------|--------------------------------------------------|
| settings  | singleton JSON | siteName, email, соцмережі, меню, footer         |
| teachers  | data JSON      | Картка викладача (name, photo, quote, info, languages) |
| formats   | data JSON      | Групові / парні / індивідуальні (hero, тарифи, FAQ) |
| pages     | data JSON      | home / english_school / polish (hero, about, features, rates, refs на teachers/formats) |

Сторінки в `src/pages/*.astro` — тонкі обгортки, які читають відповідний запис через `getEntry()` і передають у компоненти секцій.

## Додати викладача

1. `src/content/teachers/<slug>.json` за зразком інших файлів.
2. Прив'язати у потрібних `pages/*.json` → масив `teachers: ["<slug>", ...]`.
3. Або через `/admin` → «Викладачі» → New.

## Додати формат навчання

1. `src/content/formats/<slug>.json` (group/pair/individual — зразки).
2. Додати в `pages/english_school.json` → `methods: [...]`.
3. Створити `src/pages/<slug>_classes.astro` за зразком наявних трьох.

## Версії сайту

`VersionSwitcher` у хедері дозволяє перемикатися між поточним Astro-редизайном і легасі-копією в `/legacy/`. Додати нову версію — у `src/components/VersionSwitcher.astro` масив `versions`.
