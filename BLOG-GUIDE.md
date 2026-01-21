# 📚 Руководство по работе с блогом

## 🎯 Быстрый старт

### Создание нового поста

1. Откройте папку `src/app/blog/posts/`
2. Создайте новый файл с расширением `.mdx` (например: `my-first-post.mdx`)
3. Добавьте frontmatter (метаданные) в начало файла
4. Напишите контент используя Markdown
5. Сохраните и запустите `npm run build`

## 📝 Структура поста

### Базовый шаблон

```mdx
---
title: "Заголовок вашего поста"
publishedAt: "2026-01-21"
summary: "Краткое описание поста (отображается в списке постов)"
image: "/images/blog/post-cover.jpg"
---

## Введение

Ваш текст здесь...

### Подзаголовок

Больше текста...

## Заключение

Выводы...
```

### Обязательные поля frontmatter

- `title` - Заголовок поста
- `publishedAt` - Дата публикации в формате YYYY-MM-DD
- `summary` - Краткое описание (2-3 предложения)

### Опциональные поля

- `image` - Обложка поста (путь к изображению)

## 🖼️ Работа с изображениями

### Вставка изображения

```mdx
![Описание изображения](/images/blog/my-image.jpg)
```

**Важно:**
1. Положите изображение в папку `public/images/blog/`
2. Используйте абсолютный путь: `/images/blog/имя-файла.jpg`
3. Рекомендуемые форматы: JPG, PNG, WebP
4. Оптимизируйте изображения перед загрузкой (макс. 1920px ширина)

### Изображение с подписью

```mdx
<figure>
  <img src="/images/blog/my-image.jpg" alt="Описание" />
  <figcaption>Подпись к изображению</figcaption>
</figure>
```

### Изображение с кастомными размерами

```mdx
<img
  src="/images/blog/my-image.jpg"
  alt="Описание"
  width="800"
  height="600"
  style={{ maxWidth: '100%', height: 'auto' }}
/>
```

## 🎥 Работа с видео

### YouTube видео

```mdx
<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
  <iframe
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    src="https://www.youtube.com/embed/VIDEO_ID"
    frameBorder="0"
    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>
```

**Как получить VIDEO_ID:**
- URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- VIDEO_ID: `dQw4w9WgXcQ`

### Vimeo видео

```mdx
<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
  <iframe
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    src="https://player.vimeo.com/video/VIDEO_ID"
    frameBorder="0"
    allow="autoplay; fullscreen; picture-in-picture"
    allowFullScreen
  />
</div>
```

### Локальное видео

```mdx
<video
  width="100%"
  controls
  poster="/images/blog/video-poster.jpg"
  style={{ maxWidth: '100%', borderRadius: '8px' }}
>
  <source src="/videos/my-video.mp4" type="video/mp4" />
  <source src="/videos/my-video.webm" type="video/webm" />
  Ваш браузер не поддерживает тег video.
</video>
```

**Важно:**
1. Положите видео в папку `public/videos/`
2. Используйте сжатые форматы (H.264 для MP4)
3. Рекомендуется разрешение: 1920x1080 или 1280x720
4. Добавьте poster (превью кадр)

## 🎨 Marmoset Viewer

### Базовая вставка Marmoset Viewer

```mdx
<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <iframe
    src="/marmoset-viewer/model.html"
    width="100%"
    height="100%"
    frameBorder="0"
    allowFullScreen
    style={{ border: 'none' }}
  />
</div>
```

### Подготовка Marmoset Viewer:

**Шаг 1: Экспорт из Marmoset Toolbag**

1. Откройте вашу сцену в Marmoset Toolbag
2. Перейдите в `File` → `Export` → `Viewer`
3. Настройте параметры экспорта:
   - Width/Height: 1920x1080 (или желаемое разрешение)
   - Include UI: Yes
   - Responsive: Yes
4. Нажмите `Export`
5. Сохраните файлы (будет создана HTML страница и папка с ассетами)

**Шаг 2: Загрузка на сайт**

1. Создайте папку `public/marmoset-viewer/название-модели/`
2. Скопируйте туда все экспортированные файлы:
   - `index.html` (переименуйте в `model.html`)
   - Папка с файлами модели (обычно называется `viewer`)

Структура должна быть:
```
public/
  marmoset-viewer/
    my-character/
      model.html
      viewer/
        *.mview
        *.jpg
        *.js
```

**Шаг 3: Вставка в пост**

```mdx
## Интерактивная 3D модель

Вращайте модель мышью, зажмите правую кнопку для панорамирования.

<div style={{
  width: '100%',
  height: '700px',
  marginBottom: '2rem',
  border: '1px solid #333',
  borderRadius: '8px',
  overflow: 'hidden'
}}>
  <iframe
    src="/igrom-3d-environment.ru/marmoset-viewer/my-character/model.html"
    width="100%"
    height="100%"
    frameBorder="0"
    allowFullScreen
    style={{ border: 'none' }}
  />
</div>

**Описание модели:**
- Полигонов: 50,000
- Текстуры: 4K PBR
- Софт: Blender, Marmoset Toolbag
```

### Встроенный Marmoset с кастомными настройками

```mdx
<div style={{
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  aspectRatio: '16/9',
  position: 'relative',
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
}}>
  <iframe
    src="/igrom-3d-environment.ru/marmoset-viewer/environment/model.html"
    width="100%"
    height="100%"
    frameBorder="0"
    allowFullScreen
    loading="lazy"
    title="Interactive 3D Environment"
    style={{ border: 'none' }}
  />
</div>

<p style={{ textAlign: 'center', marginTop: '1rem', color: '#888', fontSize: '0.9rem' }}>
  💡 Используйте мышь для вращения камеры
</p>
```

## 📐 Форматирование текста

### Заголовки

```mdx
# H1 - Главный заголовок (не используйте в теле поста)
## H2 - Заголовок раздела
### H3 - Подзаголовок
#### H4 - Мелкий заголовок
```

### Текстовые стили

```mdx
**Жирный текст**
*Курсив*
***Жирный курсив***
~~Зачеркнутый~~
`Код в строке`
```

### Списки

**Маркированный список:**
```mdx
- Элемент 1
- Элемент 2
  - Подэлемент 2.1
  - Подэлемент 2.2
- Элемент 3
```

**Нумерованный список:**
```mdx
1. Первый шаг
2. Второй шаг
3. Третий шаг
```

### Ссылки

```mdx
[Текст ссылки](https://example.com)
[Ссылка с тайтлом](https://example.com "Описание при наведении")
```

### Цитаты

```mdx
> Это цитата
> Может быть многострочной
```

### Код

**Блок кода:**

````mdx
```javascript
const greeting = "Hello World";
console.log(greeting);
```
````

**Поддерживаемые языки:**
- javascript / js
- typescript / ts
- python / py
- cpp / c++
- glsl
- hlsl
- json
- html
- css
- bash / shell

### Горизонтальная линия

```mdx
---
```

## 📊 Таблицы

```mdx
| Софт | Назначение | Опыт |
|------|-----------|------|
| Blender | 3D моделирование | 5 лет |
| Houdini | Процедурная генерация | 3 года |
| Unreal Engine | Game Engine | 4 года |
```

## 🎯 Специальные компоненты

### Важное примечание

```mdx
<div style={{
  padding: '1rem',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  borderLeft: '4px solid #3b82f6',
  borderRadius: '4px',
  marginBottom: '1rem'
}}>
  <strong>💡 Совет:</strong> Важная информация здесь
</div>
```

### Предупреждение

```mdx
<div style={{
  padding: '1rem',
  backgroundColor: 'rgba(245, 158, 11, 0.1)',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '4px',
  marginBottom: '1rem'
}}>
  <strong>⚠️ Внимание:</strong> Текст предупреждения
</div>
```

### Галерея изображений (2 колонки)

```mdx
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  marginBottom: '2rem'
}}>
  <img src="/images/blog/image1.jpg" alt="Изображение 1" style={{ width: '100%' }} />
  <img src="/images/blog/image2.jpg" alt="Изображение 2" style={{ width: '100%' }} />
</div>
```

### Галерея изображений (3 колонки)

```mdx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1rem',
  marginBottom: '2rem'
}}>
  <img src="/images/blog/img1.jpg" alt="1" style={{ width: '100%' }} />
  <img src="/images/blog/img2.jpg" alt="2" style={{ width: '100%' }} />
  <img src="/images/blog/img3.jpg" alt="3" style={{ width: '100%' }} />
</div>
```

## 🚀 Публикация поста

### Локальная проверка

```bash
# Запустите dev сервер
npm run dev

# Откройте http://localhost:3000/blog
```

### Деплой на GitHub Pages

```bash
# Соберите сайт
npm run build

# Закоммитьте изменения
git add .
git commit -m "Add new blog post: название поста"

# Отправьте на GitHub
git push
```

Через 2-3 минуты пост появится на сайте!

## 📝 Пример полного поста

```mdx
---
title: "Создание процедурного леса в Houdini"
publishedAt: "2026-01-21"
summary: "Подробный туториал по созданию реалистичного леса с использованием процедурной генерации в Houdini и экспорту в Unreal Engine 5"
image: "/images/blog/procedural-forest-cover.jpg"
---

## Введение

В этом туториале я покажу, как создать реалистичный процедурный лес используя Houdini и Unreal Engine 5.

![Финальный результат](/images/blog/forest-final.jpg)

## Что вам понадобится

- Houdini 19.5+
- Unreal Engine 5.1+
- Базовые знания Houdini
- 2-3 часа времени

## Шаг 1: Создание ландшафта

Первым делом создадим базовый ландшафт используя Height Field.

```python
# Houdini VEX код для генерации ландшафта
float noise = noise(@P * 0.1);
@height = noise * 100;
```

<div style={{
  width: '100%',
  height: '600px',
  marginBottom: '2rem'
}}>
  <iframe
    src="/igrom-3d-environment.ru/marmoset-viewer/forest-terrain/model.html"
    width="100%"
    height="100%"
    frameBorder="0"
    allowFullScreen
  />
</div>

## Шаг 2: Scatter деревьев

Используем scatter node для распределения деревьев по ландшафту.

### Параметры scatter:

| Параметр | Значение | Описание |
|----------|----------|----------|
| Density | 5000 | Количество точек |
| Seed | 42 | Случайное зерно |
| Slope Filter | 0-30° | Только пологие склоны |

<div style={{
  padding: '1rem',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  borderLeft: '4px solid #3b82f6',
  borderRadius: '4px',
  marginBottom: '1rem'
}}>
  <strong>💡 Совет:</strong> Используйте Slope Filter чтобы деревья не появлялись на крутых склонах
</div>

## Шаг 3: Процесс в видео

<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
  <iframe
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
    frameBorder="0"
    allowFullScreen
  />
</div>

## Результаты

### Сравнение до и после

<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  marginBottom: '2rem'
}}>
  <div>
    <img src="/images/blog/forest-before.jpg" alt="До" style={{ width: '100%' }} />
    <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>До оптимизации</p>
  </div>
  <div>
    <img src="/images/blog/forest-after.jpg" alt="После" style={{ width: '100%' }} />
    <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>После оптимизации</p>
  </div>
</div>

## Заключение

В этом туториале мы создали процедурный лес с:
- **50,000** деревьев
- **Оптимизация** через LODs
- **Экспорт** в Unreal Engine 5

### Полезные ссылки

- [Документация Houdini](https://www.sidefx.com/docs/)
- [Unreal Engine Foliage](https://docs.unrealengine.com/)
- [Мой ArtStation](https://www.artstation.com/igrom)

---

<p style={{ textAlign: 'center', color: '#888' }}>
  Спасибо за чтение! Если есть вопросы - пишите в Telegram: @igrom
</p>
```

## 🔧 Troubleshooting

### Проблема: Изображение не отображается

**Решение:**
- Проверьте путь: должен начинаться с `/images/`
- Убедитесь что файл в папке `public/images/blog/`
- Проверьте расширение файла (jpg, png, webp)

### Проблема: Marmoset Viewer не загружается

**Решение:**
- Проверьте что используется правильный путь с basePath: `/igrom-3d-environment.ru/marmoset-viewer/...`
- Убедитесь что все файлы viewer скопированы
- Проверьте что `model.html` существует

### Проблема: Пост не появляется в списке

**Решение:**
- Убедитесь что файл имеет расширение `.mdx`
- Проверьте frontmatter (должен быть между `---`)
- Обязательны поля: `title`, `publishedAt`, `summary`
- Пересоберите сайт: `npm run build`

---

**Последнее обновление:** 2026-01-21
**Версия:** 1.0
