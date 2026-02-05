# План рефакторинга UI админки Keystatic

## 1. Подготовка и очистка
- [ ] **Удалить блок деплоя**
  - Удалить поля `deploy*` из `keystatic.config.tsx` (если есть, хотя в текущем конфиге их не видно, но проверить стоит).
  - Убрать лишние API роуты (если есть).

## 2. Создание кастомных UI-компонентов
- [ ] **ColorPicker.tsx**
  - Визуальный выбор цвета (Hex/RGBA).
  - Popover с палитрой (react-colorful или нативный input type="color" с расширением).
  - Поддержка прозрачности.
- [ ] **Slider.tsx**
  - Ползунок для числовых значений (0.0 - 1.0).
  - Отображение текущего значения.
- [ ] **Стилизация**
  - Использование CSS-переменных из `src/resources/custom.css` (или `@once-ui-system/core`).

## 3. Live Preview и Theme Editor
Keystatic имеет ограниченные возможности по кастомизации *внутри* стандартных форм полей (field views). 
Однако мы можем создать **отдельную страницу админки** (`/admin/theme-editor`), которая будет:
1.  Загружать текущие настройки через API.
2.  Отображать форму с нашими крутыми компонентами (ColorPicker, Slider).
3.  Рендерить Live Preview (Canvas с эффектом) справа.
4.  Сохранять JSON обратно в `src/content/design.json` через API.

Этот подход (Custom Admin Page) более гибкий, чем попытка взломать Keystatic UI.

- [ ] **Страница `/admin/theme-editor`**
  - Layout: Split view (Settings Left, Preview Right).
  - Компонент `ThemePreview.tsx` (Canvas Wrapper).
- [ ] **API**
  - `GET /api/settings/design`
  - `PUT /api/settings/design`

## 4. Интеграция
- [ ] Добавить ссылку на Theme Editor в навигацию (если возможно) или просто использовать как основной инструмент для настройки дизайна.

## 5. Тестирование
- [ ] Проверка сборки.
- [ ] Проверка сохранения.
- [ ] Проверка Live Preview.
