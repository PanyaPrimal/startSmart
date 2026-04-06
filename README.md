# StartSmart — Static Website

Перенесено з Tilda. Усі 7 сторінок, HTML + SCSS (БЕМ).

## Структура

```
startsmart/
├── index.html               # Quick Menu — головна навігація
├── english_school.html      # English School лендинг (УКР)
├── polish.html              # Szkoła Językowa лендинг (PL/УКР)
├── individual_classes.html  # Індивідуальні заняття
├── pair_classes.html        # Парні заняття
├── group_classes.html       # Групові заняття
├── css/
│   └── main.css             # Скомпільований CSS (з main.scss)
└── scss/
    ├── main.scss            # Точка входу
    ├── _variables.scss      # Кольори, шрифти, breakpoints
    ├── _reset.scss          # Скидання стилів
    ├── _layout.scss         # Загальна обгортка + .container
    ├── _header.scss         # Хедер
    ├── _nav.scss            # Навігація + мобільне меню
    ├── _footer.scss         # Футер
    ├── _quick-menu.scss     # Сторінка навігації (index)
    └── _school.scss         # Всі блоки лендингів
```

## Компіляція SCSS

```bash
npm install -g sass
sass scss/main.scss css/main.css --watch
```

## Кольори

- Рожевий: `#e17088`
- Бірюзовий: `#65b9a8`
- Фон: `#ffffff` / `#fdf6f6`

## Шрифт

Inter (Google Fonts) — замінює TildaSans.
