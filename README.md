# igrom-3d-environment.ru

Портфолио на Next.js 16 с Once UI и Keystatic. Использует блоковый Page Builder для страниц, MDX/компонент-блоки для блога, отдельные превью‑роуты и гибкую настройку дизайна.

## Быстрый старт
- Требования: Node.js 18.17+
- Установка:
```
npm install
```
- Запуск dev-сервера:
```
npm run dev
```
- Продакшн сборка:
```
npm run build
```
- Статический экспорт (production):
```
npm run export
```
- Линт кода:
```
npm run lint
```
- Форматирование (Biome):
```
npm run biome-write
```

## Стек и ключевые модули
- Next.js 16 + React 19 + TypeScript
- Once UI дизайн‑система
- MDX для контента (посты/проекты)
- Keystatic CMS для Page Builder и настроек
- Глобальные ресурсы и конфиг: [once-ui.config.ts](file:///d:/igrom-3d-environment.ru/src/resources/once-ui.config.ts)

## Страницы и контент
- Главная, Work, Blog, About, Gallery: динамически рендерятся из Keystatic/MDX
- Coding Playground: интерактивная IDE на странице [/coding](file:///d:/igrom-3d-environment.ru/src/app/(site)/coding/page.tsx)
- Превью контента:
  - Индекс превью: [/preview](file:///d:/igrom-3d-environment.ru/src/app/preview/page.tsx)
  - Превью постов: [/preview/post/[slug]](file:///d:/igrom-3d-environment.ru/src/app/preview/post/%5Bslug%5D/page.tsx)
  - Универсальные превью: [/preview/[type]](file:///d:/igrom-3d-environment.ru/src/app/preview/%5Btype%5D/page.tsx)

## Keystatic: Page Builder
- Схемы блоков и настройки в [keystatic.config.tsx](file:///d:/igrom-3d-environment.ru/keystatic.config.tsx)
- Рендерер блоков: [PageBuilder.tsx](file:///d:/igrom-3d-environment.ru/src/components/PageBuilder.tsx)
- Доступные блоки: hero, about, gallery, testimonial, cta, features, video, spacer, projects, posts, newsletter
- Админ‑роут: [/app/api/keystatic](file:///d:/igrom-3d-environment.ru/src/app/api/keystatic/%5B%5B...params%5D%5D/route.local.ts)

## Блог: MDX + компонент‑блоки
- Посты: `src/app/(site)/blog/posts/*.mdx`
- Компонент‑блоки для MDX: [BlogBlocks.tsx](file:///d:/igrom-3d-environment.ru/src/components/blog/BlogBlocks.tsx)
- MDX‑рендерер: [mdx.tsx](file:///d:/igrom-3d-environment.ru/src/components/mdx.tsx)
- Поддержка вставок: ImageGallery, Callout, CodeBlock, YouTube и др.

## Дизайн‑система
- Настройки темы/фон/пресет управляются из Keystatic и применяются в layout.tsx
- Предустановка «Apple iOS Liquid Glass»

## Конфигурация Next.js
- MDX включён (next.config.mjs)
- При статическом экспорте используется `basePath=/igrom-3d-environment.ru`
- Игнорируются большие директории для стабильной работы dev‑сервера:
  - `public/images/projects/**`
  - `public/marmoset/**`
- Важно: для роутов превью используйте относительные импорты вместо алиасов (`@/…`)

## Локация/время в шапке
- Время и город берутся из браузера (`Intl.DateTimeFormat`)
- Компоненты находятся в [Header.tsx](file:///d:/igrom-3d-environment.ru/src/components/Header.tsx)

## Лицензия
- CC BY‑NC 4.0 (см. LICENSE.txt)
