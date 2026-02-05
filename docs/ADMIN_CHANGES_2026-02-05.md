# Админка / Keystatic — изменения (2026‑02‑05)

Этот документ фиксирует изменения, сделанные в репозитории `igrom-3d-environment.ru` для админки, Keystatic и публичной части сайта.

## 1) Навигация и лейауты (публичный Header в админке)

### Что изменилось
- Публичный компонент [Header.tsx](file:///d:/igrom-3d-environment.ru/src/components/Header.tsx) переиспользуется в админке вместо старого `AdminNav`.
- В `Header` добавлен проп `links`, который позволяет подставлять собственный набор ссылок (для админки) без копипасты логики/стилей.
- Старый админский хедер удалён:
  - `src/components/admin/AdminNav.tsx`
  - `src/components/admin/admin-nav.module.css`

### Где подключено
- Админский лейаут: [admin/layout.tsx](file:///d:/igrom-3d-environment.ru/src/app/admin/layout.tsx)
  - Подтягивает дизайн‑настройки через `getDesignSettings()` и передаёт `preset` в `Header`.
  - Передаёт в `Header` админские ссылки: [adminHeaderLinks.ts](file:///d:/igrom-3d-environment.ru/src/components/admin/adminHeaderLinks.ts)
- Keystatic лейаут:
  - [KeystaticLayout.tsx](file:///d:/igrom-3d-environment.ru/src/components/admin/KeystaticLayout.tsx)
  - Базовый layout Keystatic теперь также подключает стили once‑ui и общий `custom.css`: [keystatic/layout.tsx](file:///d:/igrom-3d-environment.ru/src/app/keystatic/layout.tsx)

### Что это решает
- Единый визуальный стиль навигации (тот же “пользовательский” Header).
- Убрано дублирование реализации хедера и его CSS.

## 2) Sidebar Keystatic: закрытие/открытие и UX

### Исправление “закрыл и не открыть”
- В [KeystaticSidebar.tsx](file:///d:/igrom-3d-environment.ru/src/components/admin/KeystaticSidebar.tsx) добавлена отдельная фиксированная кнопка “Open Sidebar”, которая появляется, когда панель закрыта.
- Стили кнопки: [KeystaticSidebar.module.css](file:///d:/igrom-3d-environment.ru/src/components/admin/KeystaticSidebar.module.css)

## 3) Центрирование контента Keystatic

### Что сделано
- В [keystatic-overrides.css](file:///d:/igrom-3d-environment.ru/src/app/keystatic/keystatic-overrides.css) контент в `div[data-split-pane="secondary"]` выровнен по центру:
  - `display: flex; justify-content: center;`
  - внутренний контейнер ограничен `max-width: 1200px`, `margin: 0 auto`, добавлены горизонтальные `padding`.

## 4) Палитра и “слишком яркий голубой”

### Что изменилось
- Keystatic palette приведена к акценту `#1e90ff` (как в UI блог/портфолио менеджеров).
- Обновлены active/hover состояния и градиенты:
  - [keystatic/admin.css](file:///d:/igrom-3d-environment.ru/src/app/keystatic/admin.css)
  - [KeystaticSidebar.module.css](file:///d:/igrom-3d-environment.ru/src/components/admin/KeystaticSidebar.module.css)

## 5) Портфолио: API удаления и клиент

### API `/api/portfolio/delete`
- В [route.ts](file:///d:/igrom-3d-environment.ru/src/app/api/portfolio/delete/route.ts):
  - добавлен обработчик `DELETE` (query‑параметры `slugs`/`action`);
  - логика удаления вынесена в общую функцию;
  - добавлена `revalidatePath()` для публичных и админ‑страниц после удаления/восстановления.

### Клиент портфолио менеджера
- В [PortfolioGrid.tsx](file:///d:/igrom-3d-environment.ru/src/app/admin/portfolio/PortfolioGrid.tsx) массовое удаление переведено на `DELETE /api/portfolio/delete?slugs=...`.

## 6) Дизайн‑настройки: фоны и фоновая музыка

### Keystatic schema
- В [keystatic.config.tsx](file:///d:/igrom-3d-environment.ru/keystatic.config.tsx):
  - `backgroundEffect` заменён на `background` (conditional field) с расширенным набором эффектов;
  - добавлен блок `backgroundMusic` (file/autoplay/volume).

### Данные по умолчанию
- В [design.json](file:///d:/igrom-3d-environment.ru/src/content/design.json) добавлены новые поля `background` и `backgroundMusic`.

### Рендер на публичной части
- В [layout.tsx](file:///d:/igrom-3d-environment.ru/src/app/(site)/layout.tsx) добавлен [BackgroundManager.tsx](file:///d:/igrom-3d-environment.ru/src/components/BackgroundManager.tsx) и нормализация выбора эффекта фона (учёт нового `background.discriminant`).
- Музыка рендерится через [MusicPlayer.tsx](file:///d:/igrom-3d-environment.ru/src/components/MusicPlayer.tsx).

### Типы (TS)
- Приведены типы к реальности Keystatic: `backgroundMusic.file` и `volume` поддерживают `null`, при применении громкость нормализуется в дефолт.

## 7) Keystatic: кастомные страницы/вставки

### Вставка ссылок/страниц
- В [KeystaticWrapper.tsx](file:///d:/igrom-3d-environment.ru/src/app/keystatic/[[...params]]/KeystaticWrapper.tsx):
  - часть системных страниц отрисовывается кастомно (Theme Editor / Settings / Telegram list);
  - Keystatic “оборачивается” в общий [KeystaticLayout.tsx](file:///d:/igrom-3d-environment.ru/src/components/admin/KeystaticLayout.tsx).

### Быстрая ссылка на Theme Editor
- В [AdminToolbar.tsx](file:///d:/igrom-3d-environment.ru/src/app/keystatic/AdminToolbar.tsx) добавлена инъекция ссылки “Theme Editor” в навигацию Keystatic (через MutationObserver).

## 8) UI/зависимости

- Добавлена зависимость `react-colorful` (используется в админском UI/редакторах): [package.json](file:///d:/igrom-3d-environment.ru/package.json)

## 9) Settings/About: аватар, кроп, SSE и объединение разделов

### UI (единый блок Settings + About)
- Редактор настроек расширен и объединён с базовыми полями About (в одном экране и с одной кнопкой сохранения):
  - [SettingsEditor.tsx](file:///d:/igrom-3d-environment.ru/src/components/admin/SettingsEditor.tsx)
  - добавлена секция “About” (title/description + toggle `avatar.display`) с теми же отступами/типографикой/цветами
- Исправлено перекрытие элементов (avatar img / labels / inputs / dropzone) за счёт вынесения стилей в CSS‑модуль и нормализации layout через grid/minmax:
  - [SettingsEditor.module.css](file:///d:/igrom-3d-environment.ru/src/components/admin/SettingsEditor.module.css)

### Управление аватаром (клиент)
- Добавлены:
  - системный выбор файла, drag-and-drop
  - предпросмотр и кроп 1:1 (перетаскивание + точные поля X/Y/Scale + reset)
  - прогресс загрузки (проценты), toast‑уведомления на русском
  - “Сбросить” (reset к `/images/avatar.jpg`) с подтверждением
- Реализация: [SettingsEditor.tsx](file:///d:/igrom-3d-environment.ru/src/components/admin/SettingsEditor.tsx)

### API `/api/admin/settings` (multipart + атомарность и чистка старых файлов)
- Endpoint расширен для `multipart/form-data`:
  - принимает `settings` (json), `avatarMode=upload|reset|keep` и `avatar` (file)
  - сохраняет аватар в `public/images/uploads`, удаляет старый upload‑файл при замене/сбросе
  - серверная валидация: MIME (JPEG/PNG/WebP), размер (≤5MB), разрешение (200–1000px)
- Реализация: [settings/route.ts](file:///d:/igrom-3d-environment.ru/src/app/api/admin/settings/route.ts)

### Мониторинг файла (SSE)
- Добавлен SSE endpoint для отслеживания изменений файла в `public` и мгновенного обновления превью:
  - [fs/watch/route.ts](file:///d:/igrom-3d-environment.ru/src/app/api/admin/fs/watch/route.ts)

### API `/api/admin/about`
- Добавлен простой API для чтения/сохранения `src/content/about.json` (для объединённого редактора):
  - [about/route.ts](file:///d:/igrom-3d-environment.ru/src/app/api/admin/about/route.ts)

## 10) Build/Preview: TypeScript fix для `backgroundEffect`

- Убрано обращение к несуществующему `settings.backgroundEffect` в preview layout (типобезопасное вычисление из `settings.background.discriminant`):
  - [preview/layout.tsx](file:///d:/igrom-3d-environment.ru/src/app/preview/layout.tsx)

## Проверка (ручной чеклист)

- `/admin/*` — отображается публичный Header, ссылки ведут на нужные разделы.
- `/keystatic` — отображается публичный Header и кастомный sidebar; при закрытии sidebar есть кнопка для открытия.
- Dashboard Keystatic (secondary pane) центрируется и имеет ограниченную ширину.
- В Keystatic “Design” можно выбрать новый фон; на публичной части фон отображается.
- Включение фоновой музыки не ломает страницу при `null` значениях.
- `/keystatic/singleton/settings` — блок аватара не перекрывает поля, dnd работает, кроп и загрузка работают.
- `next build` — проходит TypeScript-check (включая preview layout).
