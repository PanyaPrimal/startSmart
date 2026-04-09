# Деплой і домен

Цей документ описує як зібрати, задеплоїти й підключити власний домен до сайту StartSmart. Також — як налаштувати продакшн-auth для адмінки.

## Стек

- **Astro** (статичний генератор) → `npm run build` віддає готовий HTML+CSS+JS у `dist/`
- **Sveltia CMS** як git-based адмінка (без бази даних — коміти прямо в репозиторій)
- **Хостинг**: рекомендую **Cloudflare Pages** (безкоштовно, швидко, HTTPS з коробки, підтримує кастомні домени). Альтернативи: Netlify, Vercel, GitHub Pages.

## 1. Збірка

```bash
npm install
npm run build
```

На виході — папка `dist/` з усіма статичними файлами. Її можна закинути на будь-який статичний хостинг.

## 2. Деплой на Cloudflare Pages (рекомендовано)

### Перше підключення

1. Зайди на [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Авторизуйся через GitHub і вибери репозиторій `startSmart`.
3. Налаштування збірки:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: (порожньо)
   - **Environment variables**: `NODE_VERSION` = `20`
4. Натисни **Save and Deploy**. За 1-2 хвилини сайт буде на `<project>.pages.dev`.

### Подальші деплої

Автоматично: кожен `git push` у master (або ту гілку, яку вкажеш) перезбирає і публікує сайт. Preview-деплої з інших гілок Cloudflare робить сам.

### Альтернатива: GitHub Pages

Уже є `.nojekyll` у `public/`. Треба додати GitHub Action `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [master]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Увімкнути в Settings → Pages → Source = GitHub Actions.

## 3. Підключення власного домену

Припустимо, ти купив `startsmart.com.ua` у реєстратора (imena.ua, gname, namecheap…).

### На Cloudflare Pages

1. В Cloudflare Pages → твій проєкт → **Custom domains** → **Set up a custom domain**.
2. Введи `startsmart.com.ua` (і окремо `www.startsmart.com.ua`, якщо треба).
3. Cloudflare покаже які DNS-записи додати. Варіанти:
   - **Якщо DNS теж на Cloudflare** (рекомендовано — передай домен на Cloudflare nameservers через реєстратор): записи з'являться автоматично.
   - **Якщо DNS у реєстратора**: додай `CNAME startsmart.com.ua → <project>.pages.dev`.
4. Зачекай ~5-30 хвилин на поширення DNS. Cloudflare автоматично видасть Let's Encrypt сертифікат — HTTPS запрацює без жодних дій з твого боку.

### На GitHub Pages

1. Settings → Pages → **Custom domain** → `startsmart.com.ua` → Save.
2. У реєстратора додай DNS:
   - `A` записи на IP GitHub Pages (185.199.108.153, .109.153, .110.153, .111.153)
   - `CNAME www → <user>.github.io`
3. Увімкни **Enforce HTTPS** після поширення DNS.

### Перевірка

```bash
nslookup startsmart.com.ua
curl -I https://startsmart.com.ua
```

## 4. Налаштування адмінки на продакшені

Локально (dev) адмінка працює через `@sveltia/cms-proxy-server`. На проді треба, щоб Sveltia коммітила прямо у GitHub від імені редактора. Для цього потрібен OAuth-проксі.

### Крок 1 — GitHub OAuth App

1. [github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**.
2. **Application name**: `StartSmart CMS`
3. **Homepage URL**: `https://startsmart.com.ua`
4. **Authorization callback URL**: `https://auth.startsmart.com.ua/callback` (буде Worker'ом — див. крок 2)
5. Збережи. Запиши **Client ID** і згенеруй **Client Secret**.

### Крок 2 — Cloudflare Worker для auth

Найпростіше — розгорнути готовий `sveltia-cms-auth`:

```bash
git clone https://github.com/sveltia/sveltia-cms-auth
cd sveltia-cms-auth
npm install
# створи wrangler.toml з твоїми даними
```

`wrangler.toml`:
```toml
name = "sveltia-cms-auth"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
ALLOWED_DOMAINS = "startsmart.com.ua"
OAUTH_CLIENT_ID = "<Client ID з GitHub>"
```

Секрет додати через CLI:
```bash
npx wrangler secret put OAUTH_CLIENT_SECRET
npx wrangler deploy
```

Worker отримає URL типу `https://sveltia-cms-auth.<username>.workers.dev`. Прив'яжи до нього домен `auth.startsmart.com.ua` через Cloudflare → Workers → Custom Domains.

### Крок 3 — переключити `config.yml` на GitHub backend

У `public/admin/config.yml` заміни блок `backend:`:

```yaml
backend:
  name: github
  repo: PanyaPrimal/startSmart
  branch: master
  base_url: https://auth.startsmart.com.ua
  auth_endpoint: auth

# видалити або закоментувати:
# local_backend: true
```

Закомітити, запушити. Після деплою `https://startsmart.com.ua/admin/` запросить вхід через GitHub. Редактор має бути колаборатором репозиторію.

### Крок 4 — додати редакторів

GitHub → репозиторій → Settings → Collaborators → Add. Достатньо прав `Write` — Sveltia комітить від їхнього імені.

## 5. Чеклист при деплої нової версії

- [ ] `npm run build` локально проходить без помилок
- [ ] `git status` чистий
- [ ] Закомічено на гілку master (або PR → merge)
- [ ] Cloudflare Pages показує «Success» у Deployments
- [ ] Сайт відкривається на кастомному домені
- [ ] `/admin/` відкривається й логін працює
- [ ] Тестова правка в адмінці зберігається і з'являється на сайті через 1-2 хв

## 6. Траблшутинг

**«Cannot find module 'astro:content'» на збірці CI**
У `package.json` нема `astro` як залежності — перевір `dependencies`/`devDependencies`.

**Cloudflare Pages каже «nothing to deploy»**
Build output directory не той — має бути `dist`, не `build` / `public`.

**`/admin/` показує білу сторінку**
Заблокувався `unpkg.com` (у деяких мережах). Можна зберегти `sveltia-cms.js` локально в `public/admin/` і підключити відносним шляхом.

**GitHub OAuth redirect loop**
`base_url` у config.yml не збігається з callback URL у GitHub OAuth App. Мають збігатися точно по протоколу + домену.

**На проді адмінка пише в git, а зміни не з'являються**
Sveltia коммітить у гілку `branch` з config.yml, але Cloudflare Pages слухає іншу. Переконайся, що обидва на `master` (або на тій самій гілці).

## 7. Бекап

Оскільки весь контент живе в git, бекап = `git clone`. Ніякої бази даних, ніяких admin-only файлів. Втратити дані можна лише `git push --force` — не роби так.
