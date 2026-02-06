import { config, fields, collection, singleton, component } from '@keystatic/core';
import React from 'react';

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
        brand: { 
            name: 'Igrom Dashboard',
            mark: ({ colorScheme }) => {
                // Use LogoBW for dark mode (assuming white text/logo) and LogoColor for light mode
                const src = colorScheme === 'dark' ? '/images/LogoBW.png' : '/images/LogoColor.png';
                return <img src={src} alt="Igrom Logo" style={{ height: 24 }} />;
            }
        },
        navigation: {
            'Контент': ['home', 'about', 'albums', 'posts', 'gallery'],
            'Система': ['design', 'settings', 'telegramSettings', 'telegramPosts'],
        },
    },
  collections: {
    telegramPosts: collection({
        label: 'Telegram Посты',
        path: 'src/content/telegram-posts/*',
        slugField: 'title',
        format: { contentField: 'content' },
        previewUrl: '/preview/telegram/post/{slug}',
        entryLayout: 'content',
        schema: {
            title: fields.slug({ name: { label: 'Название (для админки)' } }),
            publishedAt: fields.date({ label: 'Дата (для сортировки)' }),
            content: fields.markdoc({ 
                label: 'Markdown Контент',
            }),
        }
    }),
    albums: collection({
        label: 'Портфолио (Проекты)',
        path: 'src/content/albums/*/',
        slugField: 'title',
        format: { contentField: 'description' },
        previewUrl: '/gallery/{slug}',
        entryLayout: 'content',
        schema: {
            title: fields.slug({ name: { label: 'Название проекта' } }),
            projectFolder: fields.text({ label: 'Папка проекта (public/...)', description: 'Имя папки в public, где лежат ассеты (например: MilitaryHat)' }),
            priority: fields.integer({ label: 'Приоритет (сортировка)', defaultValue: 0 }),
            hidden: fields.checkbox({ label: 'Скрыто (Hidden)', defaultValue: false, description: 'Скрыть проект с сайта, но оставить в админке' }),
            
            // Artwork Details
            description: fields.document({
                label: 'Описание проекта',
                formatting: true,
                links: true,
            }),

            // Categorization Section
            categorization: fields.object({
                medium: fields.array(
                    fields.text({ label: 'Медиум (например, Digital 3D)' }),
                    { label: 'Medium', itemLabel: props => props.value || 'Medium' }
                ),
                software: fields.array(
                    fields.text({ label: 'Название программы' }),
                    { label: 'Software Used', itemLabel: props => props.value || 'Software' }
                ),
                tags: fields.array(
                    fields.text({ label: 'Тег' }),
                    { label: 'Tags', itemLabel: props => props.value || 'Tag' }
                ),
            }, { label: 'Категоризация (Categorization)' }),

            // Media Section
            images: fields.blocks(
                {
                    image: {
                        label: 'HQ Изображение',
                        itemLabel: (props) => props.fields.alt.value || 'Изображение',
                        schema: fields.object({
                            src: fields.image({
                                label: 'Файл изображения (JPG, PNG, GIF, WEBP)',
                                directory: 'public/images',
                                publicPath: '/images',
                            }),
                            alt: fields.text({ label: 'Альтернативный текст' }),
                            caption: fields.text({ label: 'Подпись' }),
                            orientation: fields.select({
                                label: 'Ориентация',
                                options: [
                                    { label: 'Горизонтальная', value: 'horizontal' },
                                    { label: 'Вертикальная', value: 'vertical' },
                                ],
                                defaultValue: 'horizontal',
                            }),
                        }),
                    },
                    video: {
                        label: 'Видео клип (MP4)',
                        itemLabel: (props) => `Видео: ${props.fields.src.value}`,
                        schema: fields.object({
                            src: fields.text({ label: 'Путь к видео (например, /images/gallery/albums/video.mp4)' }),
                            autoPlay: fields.checkbox({ label: 'Автовоспроизведение', defaultValue: true }),
                            muted: fields.checkbox({ label: 'Без звука', defaultValue: true }),
                            loop: fields.checkbox({ label: 'Зациклить', defaultValue: true }),
                            caption: fields.text({ label: 'Подпись' }),
                        }),
                    },
                    youtube: {
                        label: 'Видео (YouTube/Vimeo)',
                        itemLabel: (props) => `Вставка: ${props?.fields?.url?.value || ''}`,
                        schema: fields.object({
                            url: fields.text({ label: 'Ссылка на видео' }),
                        }),
                    },
                    sketchfab: {
                        label: 'Sketchfab',
                        itemLabel: (props) => 'Sketchfab',
                        schema: fields.object({
                            url: fields.text({ label: 'Ссылка на модель Sketchfab' }),
                        }),
                    },
                    marmoset: {
                        label: 'Marmoset Viewer',
                        itemLabel: (props) => props.fields.manualPath.value || props.fields.src.value?.filename || 'Marmoset Viewer',
                        schema: fields.object({
                            src: fields.file({
                                label: 'Файл MView (Опционально, для небольших файлов)',
                                directory: 'public/marmoset',
                                publicPath: '/marmoset',
                                validation: { isRequired: false },
                            }),
                            manualPath: fields.text({
                                label: 'Путь к большому файлу (> 100MB)',
                                description: 'Для больших файлов используйте "Large File Uploader" в меню слева, затем вставьте полученный путь сюда (например: /marmoset/model.mview).',
                            }),
                            alt: fields.text({ label: 'Альтернативный текст' }),
                            orientation: fields.select({
                                label: 'Ориентация',
                                options: [
                                    { label: 'Горизонтальная', value: 'horizontal' },
                                    { label: 'Вертикальная', value: 'vertical' },
                                ],
                                defaultValue: 'horizontal',
                            }),
                        }),
                    },
                    pano: {
                        label: '360 Панорама',
                        itemLabel: (props) => '360 Панорама',
                        schema: fields.object({
                            image: fields.image({
                                label: 'Панорамное изображение (JPG)',
                                directory: 'public/images',
                                publicPath: '/images',
                            }),
                            caption: fields.text({ label: 'Подпись' }),
                        }),
                    },
                },
                { label: 'Медиа файлы (Media Upload)' }
            ),

            // Publishing Section
            publishing: fields.object({
                date: fields.date({ label: 'Дата публикации', defaultValue: { kind: 'today' } }),
                artstation: fields.url({ label: 'Ссылка на Artstation' }),
                cover: fields.image({
                    label: 'Обложка (Thumbnail)',
                    directory: 'public/images/gallery/albums',
                    publicPath: '/images/gallery/albums',
                    validation: { isRequired: true }
                }),
            }, { label: 'Публикация (Publishing Options)' }),
        },
    }),
    posts: collection({
      label: 'Блог',
      path: 'src/app/(site)/blog/posts/*/',
      slugField: 'title',
      format: { contentField: 'content' },
      previewUrl: '/preview/post/{slug}',
      entryLayout: 'content',
      schema: {
        // Metadata
        title: fields.slug({ name: { label: 'Заголовок' } }),
        slug: fields.text({ label: 'Slug', description: 'Оставьте пустым для генерации из заголовка', validation: { length: { min: 0 } } }), // Optional manual slug override if needed, but slug() handles it. Wait, fields.slug handles the slug.
        publishedAt: fields.date({ label: 'Дата публикации' }),
        tag: fields.text({ label: 'Тег' }),
        
        // Hero
        summary: fields.text({ label: 'Краткое описание (Summary)', multiline: true, description: 'Для карточки блога.' }),
        image: fields.image({
          label: 'Обложка (Cover Image)',
          directory: 'public/images/blog',
          publicPath: '/images/blog',
        }),

        // Content
        content: fields.document({
          label: 'Содержание',
          formatting: true,
          dividers: true,
          links: true,
          layouts: [
            [1],
            [1, 1], // 2 columns
          ],
          images: {
            directory: 'public/images/blog/content',
            publicPath: '/images/blog/content',
          },
          componentBlocks: {
            'gallery-album': component({
                label: 'Альбом галереи',
                schema: {
                    album: fields.relationship({
                        label: 'Выберите альбом',
                        collection: 'albums',
                    }),
                },
                preview: (props) => (
                    <div style={{ padding: '10px', background: '#e0f7fa', borderRadius: '4px', border: '1px solid #00acc1' }}>
                        <strong>Альбом галереи:</strong> {props.fields.album.value || 'Не выбран'}
                    </div>
                )
            }),
            'image-gallery': component({
                label: 'Галерея изображений',
                schema: {
                    images: fields.array(
                        fields.image({
                            label: 'Изображение',
                            directory: 'public/images/blog/content',
                            publicPath: '/images/blog/content',
                        }),
                        { label: 'Изображения' }
                    ),
                    columns: fields.select({
                        label: 'Колонки',
                        options: [
                            { label: '2', value: '2' },
                            { label: '3', value: '3' },
                            { label: '4', value: '4' },
                        ],
                        defaultValue: '2'
                    }),
                },
                preview: (props) => (
                    <div style={{ padding: '10px', border: '1px solid #ccc' }}>
                        <strong>Галерея:</strong> {props.fields.images.elements.length} изображений
                    </div>
                )
            }),
            'callout': component({
                label: 'Callout / Заметка',
                schema: {
                    type: fields.select({
                        label: 'Тип',
                        options: [
                            { label: 'Info', value: 'info' },
                            { label: 'Warning', value: 'warning' },
                            { label: 'Error', value: 'error' },
                            { label: 'Success', value: 'success' },
                        ],
                        defaultValue: 'info'
                    }),
                    title: fields.text({ label: 'Заголовок' }),
                    content: fields.text({ label: 'Текст', multiline: true }),
                },
                preview: (props) => (
                    <div style={{ padding: '10px', background: '#f5f5f5', borderLeft: '4px solid #333' }}>
                        <strong>{props.fields.title.value || 'Callout'}</strong>
                        <div>{props.fields.content.value}</div>
                    </div>
                )
            }),
            'code-block': component({
                label: 'Код',
                schema: {
                    code: fields.text({ label: 'Код', multiline: true }),
                    language: fields.text({ label: 'Язык', defaultValue: 'typescript' }),
                    label: fields.text({ label: 'Заголовок (файл)' }),
                },
                preview: (props) => (
                    <div style={{ background: '#222', color: '#fff', padding: '10px', borderRadius: '4px' }}>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{props.fields.language.value}</div>
                        <pre style={{ margin: 0 }}>{props.fields.code.value?.slice(0, 50)}...</pre>
                    </div>
                )
            }),
            'youtube': component({
                label: 'YouTube',
                schema: {
                    url: fields.text({ label: 'Ссылка' }),
                },
                preview: (props) => (
                    <div style={{ padding: '10px', background: '#ffebeb', borderRadius: '4px' }}>
                        <strong>YouTube:</strong> {props.fields.url.value}
                    </div>
                )
            })
          },
        }),
      },
    }),
    projects: collection({
      label: 'Проекты',
      path: 'src/content/projects/*/',
      slugField: 'title',
      format: { contentField: 'content' },
      previewUrl: '/work/{slug}',
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Название' } }),
        summary: fields.text({ label: 'Краткое описание', multiline: true, description: 'Отображается в сетке портфолио.' }),
        publishedAt: fields.date({ label: 'Дата публикации' }),
        cover: fields.image({
            label: 'Обложка (Миниатюра)',
            directory: 'public/images/projects',
            publicPath: '/images/projects',
            validation: { isRequired: false }
        }),
        software: fields.array(
            fields.text({ label: 'Название программы' }),
            {
                label: 'Использованный софт',
                itemLabel: props => props?.value || 'Софт'
            }
        ),
        tags: fields.array(
            fields.text({ label: 'Тег' }),
            {
                label: 'Теги',
                itemLabel: props => props?.value || 'Тег'
            }
        ),
        artstation: fields.url({ label: 'Ссылка на Artstation' }),
        media: fields.blocks(
            {
                gallery: {
                    label: 'Галерея изображений',
                    itemLabel: (props) => `Галерея (${props?.fields?.images?.elements?.length || 0} изображений)`,
                    schema: fields.object({
                        images: fields.array(
                            fields.image({
                                label: 'Изображение',
                                directory: 'public/images/projects',
                                publicPath: '/images/projects',
                            }),
                            { label: 'Изображения' }
                        ),
                        columns: fields.select({
                            label: 'Колонки',
                            options: [
                                { label: '2 Колонки', value: '2' },
                                { label: '3 Колонки', value: '3' },
                                { label: '4 Колонки', value: '4' },
                            ],
                            defaultValue: '2',
                        }),
                    }),
                },
                image: {
                    label: 'Изображение высокого качества',
                    itemLabel: (props) => props.fields.caption.value || 'HQ Изображение',
                    schema: fields.object({
                        image: fields.image({
                            label: 'Файл изображения (JPG, PNG, GIF, WEBP)',
                            directory: 'public/images/projects',
                            publicPath: '/images/projects',
                        }),
                        caption: fields.text({ label: 'Подпись' }),
                    }),
                },
                video: {
                    label: 'Видео клип (MP4)',
                    itemLabel: (props) => `Видео: ${props.fields.src.value}`,
                    schema: fields.object({
                        src: fields.text({ label: 'Путь к видео (например, /images/projects/video.mp4)' }),
                        autoPlay: fields.checkbox({ label: 'Автовоспроизведение', defaultValue: true }),
                        muted: fields.checkbox({ label: 'Без звука', defaultValue: true }),
                        loop: fields.checkbox({ label: 'Зациклить', defaultValue: true }),
                    }),
                },
                youtube: {
                    label: 'Вставка (YT/Vimeo)',
                    itemLabel: (props) => `Вставка: ${props?.fields?.url?.value || ''}`,
                    schema: fields.object({
                        url: fields.text({ label: 'Ссылка на видео' }),
                    }),
                },
                sketchfab: {
                    label: 'Sketchfab',
                    itemLabel: (props) => 'Sketchfab',
                    schema: fields.object({
                        url: fields.text({ label: 'Ссылка на модель Sketchfab' }),
                    }),
                },
                marmoset: {
                        label: 'Marmoset Viewer',
                        itemLabel: (props) => props.fields.manualPath.value || props.fields.src.value?.filename || 'Marmoset Viewer',
                        schema: fields.object({
                            src: fields.file({
                                label: 'Файл MView (Опционально, для небольших файлов)',
                                directory: 'public/marmoset',
                                publicPath: '/marmoset',
                                validation: { isRequired: false },
                            }),
                            manualPath: fields.text({
                                label: 'Путь к большому файлу (> 100MB)',
                                description: 'Для больших файлов используйте "Large File Uploader" в меню слева, затем вставьте полученный путь сюда (например: /marmoset/model.mview).',
                            }),
                            width: fields.text({ label: 'Ширина (px или %)', defaultValue: '100%' }),
                            height: fields.text({ label: 'Высота (px)', defaultValue: '600px' }),
                            autoStart: fields.checkbox({ label: 'Автозапуск', defaultValue: false }),
                        }),
                    },
                pano: {
                    label: '360 Панорама',
                    itemLabel: (props) => '360 Панорама',
                    schema: fields.object({
                        image: fields.image({
                            label: 'Панорамное изображение (JPG)',
                            directory: 'public/images/projects',
                            publicPath: '/images/projects',
                        }),
                        caption: fields.text({ label: 'Подпись' }),
                    }),
                },
                compare: {
                    label: 'Сравнение (До/После)',
                    itemLabel: (props) => 'Сравнение',
                    schema: fields.object({
                        leftImage: fields.image({
                            label: 'Левое изображение (До)',
                            directory: 'public/images/projects',
                            publicPath: '/images/projects',
                        }),
                        rightImage: fields.image({
                            label: 'Правое изображение (После)',
                            directory: 'public/images/projects',
                            publicPath: '/images/projects',
                        }),
                    }),
                }
            },
            { label: 'Медиа галерея' }
        ),
        content: fields.document({
          label: 'Контент (Медиа и текст)',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'public/images/projects/content',
            publicPath: '/images/projects/content',
          },
          componentBlocks: {
            'image-full': component({
                label: 'Изображение во всю ширину',
                schema: {
                    src: fields.image({
                        label: 'Изображение',
                        directory: 'public/images/projects/content',
                        publicPath: '/images/projects/content',
                    }),
                    caption: fields.text({ label: 'Подпись' }),
                },
                preview: (props) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {props.fields.src.value?.data && (
                            <img 
                                src={URL.createObjectURL(new Blob([props.fields.src.value.data as unknown as BlobPart]))} 
                                alt="Preview" 
                                style={{ maxWidth: '100%', borderRadius: '4px' }} 
                            />
                        )}
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {props.fields.caption.value || 'Без подписи'}
                        </div>
                    </div>
                )
            }),
            'video-loop': component({
                label: 'Зацикленное видео (MP4/WebM)',
                schema: {
                    src: fields.text({ label: 'Путь к видео (например, /images/projects/video.mp4)' }),
                    autoPlay: fields.checkbox({ label: 'Автовоспроизведение', defaultValue: true }),
                    muted: fields.checkbox({ label: 'Без звука', defaultValue: true }),
                    loop: fields.checkbox({ label: 'Зациклить', defaultValue: true }),
                },
                preview: (props) => (
                    <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <strong>Видео:</strong> {props.fields.src.value}
                    </div>
                )
            }),
            'youtube-embed': component({
                label: 'Вставка YouTube / Vimeo',
                schema: {
                    url: fields.text({ label: 'Ссылка на видео' }),
                },
                preview: (props) => (
                    <div style={{ padding: '10px', background: '#ffebeb', borderRadius: '4px' }}>
                        <strong>Вставка:</strong> {props.fields.url.value}
                    </div>
                )
            }),
            'sketchfab-embed': component({
                label: 'Вставка Sketchfab',
                schema: {
                    url: fields.text({ label: 'Ссылка на модель Sketchfab' }),
                },
                preview: (props) => (
                    <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '4px' }}>
                        <strong>Sketchfab:</strong> {props.fields.url.value}
                    </div>
                )
            }),
            'comparison-slider': component({
                label: 'Слайдер До / После',
                schema: {
                    leftImage: fields.image({
                        label: 'Левое изображение (До)',
                        directory: 'public/images/projects/content',
                        publicPath: '/images/projects/content',
                    }),
                    rightImage: fields.image({
                        label: 'Правое изображение (После)',
                        directory: 'public/images/projects/content',
                        publicPath: '/images/projects/content',
                    }),
                },
                preview: (props) => (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <strong>Слева:</strong>
                            {props.fields.leftImage.value?.data && <img src={URL.createObjectURL(new Blob([props.fields.leftImage.value.data as unknown as BlobPart]))} alt="Left Preview" style={{width: '50px'}} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <strong>Справа:</strong>
                            {props.fields.rightImage.value?.data && <img src={URL.createObjectURL(new Blob([props.fields.rightImage.value.data as unknown as BlobPart]))} alt="Right Preview" style={{width: '50px'}} />}
                        </div>
                    </div>
                )
            }),
          }
        }),
      },
    }),
  },
  singletons: {
    telegramSettings: singleton({
        label: 'Настройки Telegram',
        path: 'src/content/telegram/settings',
        format: 'json',
        schema: {
            chatId: fields.text({ 
                label: 'ID канала / чата', 
                description: 'Например @mychannel или -100xxxxxxx. Бот должен быть админом.' 
            }),
            defaultFooter: fields.text({
                label: 'Подпись по умолчанию',
                multiline: true,
                description: 'Добавляется в конец каждого поста (Markdown)'
            })
        }
    }),
    settings: singleton({
      label: 'Настройки сайта',
      path: 'src/content/settings',
      format: 'json',
      schema: {
        person: fields.object({
          name: fields.text({ label: 'Полное имя', description: 'Ваше полное имя, отображаемое на сайте.' }),
          role: fields.text({ label: 'Должность', description: 'Ваша текущая должность или профессия.' }),
          location: fields.text({ label: 'Местоположение', description: 'Город и страна проживания.' }),
          timeZone: fields.text({ label: 'Часовой пояс (IANA)', description: 'Например: Europe/Kaliningrad' }),
          avatar: fields.image({
            label: 'Аватар',
            directory: 'public/images',
            publicPath: '/images',
            description: 'Фотография профиля.'
          }),
        }, { label: 'Личная информация' }),
        email: fields.object({
            enabled: fields.checkbox({ label: 'Включить отправку почты через SMTP', defaultValue: false }),
            host: fields.text({ label: 'SMTP Сервер (Host)', description: 'Например: smtp.yandex.ru' }),
            port: fields.integer({ label: 'SMTP Порт', defaultValue: 465, description: '465 (SSL) или 587 (TLS)' }),
            secure: fields.checkbox({ label: 'Использовать SSL (Secure)', defaultValue: true, description: 'Обычно включено для 465' }),
            user: fields.text({ label: 'SMTP Пользователь (Email)', description: 'Полный email адрес' }),
            password: fields.text({ label: 'SMTP Пароль', description: 'Пароль приложения (App Password)' }),
            fromName: fields.text({ label: 'Имя отправителя', description: 'Например: Ivan Gromov' }),
        }, { label: 'Настройки почты (SMTP)' }),
      },
    }),
    home: singleton({
        label: 'Главная страница',
        path: 'src/content/home',
        format: 'json',
        previewUrl: '/preview/home',
        schema: {
            blocks: fields.blocks({
                hero: {
                    label: 'Hero секция (Верхняя)',
                    schema: fields.object({
                        content: fields.object({
                            headline: fields.text({ label: 'Заголовок' }),
                            subline: fields.document({
                                label: 'Подзаголовок',
                                formatting: { inlineMarks: { bold: true, italic: true } },
                            }),
                        }, { label: 'Текстовый контент' }),
                        layout: fields.object({
                            alignment: fields.select({
                                label: 'Выравнивание текста',
                                options: [
                                    { label: 'Слева', value: 'left' },
                                    { label: 'По центру', value: 'center' }
                                ],
                                defaultValue: 'center'
                            }),
                            height: fields.select({
                                label: 'Высота секции',
                                options: [
                                    { label: 'Авто', value: 'auto' },
                                    { label: 'На весь экран', value: 'full' }
                                ],
                                defaultValue: 'auto'
                            })
                        }, { label: 'Макет и настройки' }),
                    }),
                    itemLabel: (props) => props.fields.content.fields.headline.value || 'Hero секция',
                },
                about: {
                    label: 'Секция "О себе"',
                    schema: fields.object({
                        title: fields.text({ label: 'Заголовок секции' }),
                        content: fields.document({
                            label: 'Содержание',
                            formatting: true,
                            dividers: true,
                            links: true,
                        }),
                    }),
                    itemLabel: (props) => props.fields.title.value || 'Секция "О себе"',
                },
                gallery: {
                    label: 'Превью галереи',
                    schema: fields.object({
                        title: fields.text({ label: 'Заголовок (например, Последние работы)' }),
                        limit: fields.integer({ label: 'Количество изображений', defaultValue: 6 }),
                    }),
                    itemLabel: (props) => `Галерея: ${props.fields.title.value || 'Недавние'}`,
                },
                testimonial: {
                    label: 'Отзыв / Цитата',
                    schema: fields.object({
                        quote: fields.text({ label: 'Цитата', multiline: true }),
                        author: fields.text({ label: 'Автор' }),
                        role: fields.text({ label: 'Должность / Компания' }),
                        avatar: fields.image({
                            label: 'Аватар автора',
                            directory: 'public/images/avatars',
                            publicPath: '/images/avatars',
                        }),
                    }),
                    itemLabel: (props) => `Цитата: ${props.fields.author.value}`,
                },
                cta: {
                    label: 'Призыв к действию (CTA)',
                    schema: fields.object({
                        title: fields.text({ label: 'Заголовок' }),
                        text: fields.text({ label: 'Описание', multiline: true }),
                        buttonLabel: fields.text({ label: 'Текст кнопки' }),
                        buttonLink: fields.text({ label: 'Ссылка кнопки' }),
                    }),
                    itemLabel: (props) => `CTA: ${props.fields.title.value}`,
                },
                features: {
                    label: 'Сетка преимуществ',
                    schema: fields.object({
                        title: fields.text({ label: 'Заголовок секции' }),
                        columns: fields.select({
                            label: 'Колонки',
                            options: [
                                { label: '2 Колонки', value: '2' },
                                { label: '3 Колонки', value: '3' },
                                { label: '4 Колонки', value: '4' },
                            ],
                            defaultValue: '3',
                        }),
                        features: fields.array(
                            fields.object({
                                title: fields.text({ label: 'Заголовок' }),
                                description: fields.text({ label: 'Описание', multiline: true }),
                                icon: fields.text({ label: 'Иконка (Once UI)' }),
                            }),
                            { label: 'Преимущества' }
                        ),
                    }),
                    itemLabel: (props) => `Преимущества: ${props.fields.title.value}`,
                },
                video: {
                    label: 'Видео секция',
                    schema: fields.object({
                        title: fields.text({ label: 'Заголовок' }),
                        url: fields.text({ label: 'Ссылка на видео (YouTube/Vimeo/File)' }),
                        autoplay: fields.checkbox({ label: 'Автовоспроизведение (без звука)' }),
                    }),
                    itemLabel: (props) => `Видео: ${props.fields.title.value}`,
                },
                spacer: {
                    label: 'Разделитель',
                    schema: fields.object({
                        height: fields.select({
                            label: 'Высота',
                            options: [
                                { label: 'Маленький (32px)', value: 'small' },
                                { label: 'Средний (64px)', value: 'medium' },
                                { label: 'Большой (128px)', value: 'large' },
                                { label: 'Очень большой (256px)', value: 'xlarge' },
                            ],
                            defaultValue: 'medium',
                        }),
                    }),
                    itemLabel: (props) => `Разделитель: ${props.fields.height.value}`,
                },
            }, { label: 'Блоки страницы' }),
        },
    }),
    about: singleton({
        label: 'Страница "О себе"',
        path: 'src/content/about',
        format: 'json',
        previewUrl: '/preview/about',
        schema: {
            title: fields.text({ label: 'Заголовок страницы' }),
            description: fields.text({ label: 'Описание страницы' }),
            tableOfContent: fields.object({
                display: fields.checkbox({ label: 'Показывать оглавление', defaultValue: true }),
                subItems: fields.checkbox({ label: 'Показывать подпункты', defaultValue: false }),
            }, { label: 'Оглавление' }),
            avatar: fields.object({
                display: fields.checkbox({ label: 'Показывать аватар', defaultValue: true }),
            }, { label: 'Аватар' }),
            calendar: fields.object({
                display: fields.checkbox({ label: 'Показывать кнопку календаря', defaultValue: true }),
                link: fields.text({ label: 'Ссылка на календарь' }),
            }, { label: 'Календарь' }),
            /* intro: fields.object({
                display: fields.checkbox({ label: 'Показывать введение', defaultValue: true }),
                title: fields.text({ label: 'Заголовок секции' }),
                content: fields.document({
                    label: 'Биография / Введение',
                    formatting: true,
                    links: true,
                }),
            }, { label: 'Введение (Биография)' }), */
            work: fields.object({
                display: fields.checkbox({ label: 'Показывать опыт работы', defaultValue: true }),
                title: fields.text({ label: 'Заголовок секции' }),
                experiences: fields.array(
                    fields.object({
                        company: fields.text({ label: 'Компания' }),
                        timeframe: fields.text({ label: 'Период работы' }),
                        role: fields.text({ label: 'Должность' }),
                        achievements: fields.array(fields.text({ label: 'Достижение', multiline: true }), { label: 'Достижения' }),
                        images: fields.array(
                            fields.object({
                                src: fields.image({ label: 'Изображение', directory: 'public/images/projects', publicPath: '/images/projects' }),
                                alt: fields.text({ label: 'Альтернативный текст' }),
                                width: fields.number({ label: 'Соотношение ширины', defaultValue: 16 }),
                                height: fields.number({ label: 'Соотношение высоты', defaultValue: 9 }),
                            }),
                            { label: 'Изображения' }
                        ),
                    }),
                    { label: 'Места работы', itemLabel: props => props.fields.company.value }
                ),
            }, { label: 'Опыт работы' }),
            studies: fields.object({
                display: fields.checkbox({ label: 'Показывать образование', defaultValue: true }),
                title: fields.text({ label: 'Заголовок секции' }),
                institutions: fields.array(
                    fields.object({
                        name: fields.text({ label: 'Название заведения' }),
                        description: fields.text({ label: 'Описание', multiline: true }),
                    }),
                    { label: 'Учебные заведения', itemLabel: props => props.fields.name.value }
                ),
            }, { label: 'Образование' }),
            technical: fields.object({
                display: fields.checkbox({ label: 'Показывать навыки', defaultValue: true }),
                title: fields.text({ label: 'Заголовок секции' }),
                skills: fields.array(
                    fields.object({
                        title: fields.text({ label: 'Название навыка' }),
                        description: fields.text({ label: 'Описание', multiline: true }),
                        tags: fields.array(
                            fields.object({
                                name: fields.text({ label: 'Название тега' }),
                                icon: fields.text({ label: 'Название иконки' }),
                            }),
                            { label: 'Теги' }
                        ),
                        images: fields.array(
                             fields.object({
                                src: fields.image({ label: 'Изображение', directory: 'public/images/projects', publicPath: '/images/projects' }),
                                alt: fields.text({ label: 'Альтернативный текст' }),
                                width: fields.number({ label: 'Соотношение ширины', defaultValue: 16 }),
                                height: fields.number({ label: 'Соотношение высоты', defaultValue: 9 }),
                            }),
                            { label: 'Изображения' }
                        ),
                    }),
                    { label: 'Навыки', itemLabel: props => props.fields.title.value }
                ),
            }, { label: 'Технические навыки' }),
            blocks: fields.blocks({
                hero: {
                    label: 'Hero секция (Верхняя)',
                    schema: fields.object({
                        content: fields.object({
                            headline: fields.text({ label: 'Заголовок' }),
                            subline: fields.document({
                                label: 'Подзаголовок',
                                formatting: { inlineMarks: { bold: true, italic: true } },
                            }),
                        }, { label: 'Текстовый контент' }),
                        layout: fields.object({
                            alignment: fields.select({
                                label: 'Выравнивание текста',
                                options: [
                                    { label: 'Слева', value: 'left' },
                                    { label: 'По центру', value: 'center' }
                                ],
                                defaultValue: 'center'
                            }),
                            height: fields.select({
                                label: 'Высота секции',
                                options: [
                                    { label: 'Авто', value: 'auto' },
                                    { label: 'На весь экран', value: 'full' }
                                ],
                                defaultValue: 'auto'
                            })
                        }, { label: 'Макет и настройки' }),
                    }),
                    itemLabel: (props) => props.fields.content.fields.headline.value || 'Hero секция',
                },
                about: {
                    label: 'Секция "О себе"',
                    schema: fields.object({
                        title: fields.text({ label: 'Заголовок секции' }),
                        content: fields.document({
                            label: 'Содержание',
                            formatting: true,
                            dividers: true,
                            links: true,
                        }),
                    }),
                    itemLabel: (props) => props.fields.title.value || 'Секция "О себе"',
                },
                gallery: {
                    label: 'Превью галереи',
                    schema: fields.object({
                        title: fields.text({ label: 'Заголовок (например, Последние работы)' }),
                        limit: fields.integer({ label: 'Количество изображений', defaultValue: 6 }),
                    }),
                    itemLabel: (props) => `Галерея: ${props.fields.title.value || 'Недавние'}`,
                },
                testimonial: {
                    label: 'Отзыв / Цитата',
                    schema: fields.object({
                        quote: fields.text({ label: 'Цитата', multiline: true }),
                        author: fields.text({ label: 'Автор' }),
                        role: fields.text({ label: 'Должность / Компания' }),
                        avatar: fields.image({
                            label: 'Аватар автора',
                            directory: 'public/images/avatars',
                            publicPath: '/images/avatars',
                        }),
                    }),
                    itemLabel: (props) => `Цитата: ${props.fields.author.value}`,
                },
                cta: {
                    label: 'Призыв к действию (CTA)',
                    schema: fields.object({
                        title: fields.text({ label: 'Заголовок' }),
                        text: fields.text({ label: 'Описание', multiline: true }),
                        buttonLabel: fields.text({ label: 'Текст кнопки' }),
                        buttonLink: fields.text({ label: 'Ссылка кнопки' }),
                    }),
                    itemLabel: (props) => `CTA: ${props.fields.title.value}`,
                },
                features: {
                    label: 'Сетка преимуществ',
                    schema: fields.object({
                        title: fields.text({ label: 'Заголовок секции' }),
                        columns: fields.select({
                            label: 'Колонки',
                            options: [
                                { label: '2 Колонки', value: '2' },
                                { label: '3 Колонки', value: '3' },
                                { label: '4 Колонки', value: '4' },
                            ],
                            defaultValue: '3',
                        }),
                        features: fields.array(
                            fields.object({
                                title: fields.text({ label: 'Заголовок' }),
                                description: fields.text({ label: 'Описание', multiline: true }),
                                icon: fields.text({ label: 'Иконка (Once UI)' }),
                            }),
                            { label: 'Преимущества' }
                        ),
                    }),
                    itemLabel: (props) => `Преимущества: ${props.fields.title.value}`,
                },
                video: {
                    label: 'Видео секция',
                    schema: fields.object({
                        title: fields.text({ label: 'Заголовок' }),
                        url: fields.text({ label: 'Ссылка на видео (YouTube/Vimeo/File)' }),
                        autoplay: fields.checkbox({ label: 'Автовоспроизведение (без звука)' }),
                    }),
                    itemLabel: (props) => `Видео: ${props.fields.title.value}`,
                },
                spacer: {
                    label: 'Разделитель',
                    schema: fields.object({
                        height: fields.select({
                            label: 'Высота',
                            options: [
                                { label: 'Маленький (32px)', value: 'small' },
                                { label: 'Средний (64px)', value: 'medium' },
                                { label: 'Большой (128px)', value: 'large' },
                                { label: 'Очень большой (256px)', value: 'xlarge' },
                            ],
                            defaultValue: 'medium',
                        }),
                    }),
                    itemLabel: (props) => `Разделитель: ${props.fields.height.value}`,
                },
            }, { label: 'Блоки страницы' }),
        },
    }),
    design: singleton({
        label: 'Дизайн-система',
        path: 'src/content/design',
        format: 'json',
        previewUrl: '/style-guide',
        schema: {
            preset: fields.select({
                label: 'Пресет темы',
                options: [
                    { label: 'Пользовательский', value: 'custom' },
                    { label: 'Apple iOS Жидкое Стекло 🍏', value: 'ios-liquid-glass' },
                ],
                defaultValue: 'custom',
            }),
            background: fields.conditional(
                fields.select({
                    label: 'Эффект фона',
                    options: [
                        { label: 'Нет', value: 'none' },
                        { label: 'Аврора', value: 'aurora' },
                        { label: 'Частицы', value: 'particles' },
                        { label: 'Сетка (Старая)', value: 'grid' },
                        { label: 'Созвездие (Constellation)', value: 'constellation' },
                        { label: 'Интерактивная сетка', value: 'interactive-grid' },
                        { label: 'Вихрь (Vortex)', value: 'vortex' },
                        { label: 'Топография', value: 'topography' },
                        { label: 'Волновая сетка (3D)', value: 'wave-grid' },
                        { label: 'Лучи (Beams)', value: 'beams' },
                        { label: 'Снег', value: 'snow' },
                    ],
                    defaultValue: 'none',
                }),
                {
                    none: fields.empty(),
                    aurora: fields.empty(), // Placeholder for existing or future params
                    particles: fields.empty(),
                    grid: fields.empty(),
                    constellation: fields.object({
                        color: fields.text({ label: 'Цвет линий (HEX/RGBA)', defaultValue: 'rgba(255, 255, 255, 0.5)' }),
                    }),
                    'interactive-grid': fields.object({
                        color: fields.text({ label: 'Цвет активных точек', defaultValue: 'rgba(100, 200, 255, 0.8)' }),
                    }),
                    vortex: fields.object({
                        particleCount: fields.integer({ label: 'Количество частиц', defaultValue: 400 }),
                    }),
                    topography: fields.object({
                        color: fields.text({ label: 'Цвет линий', defaultValue: 'rgba(255, 255, 255, 0.3)' }),
                    }),
                    'wave-grid': fields.object({
                        color: fields.text({ label: 'Цвет сетки', defaultValue: 'rgba(0, 255, 200, 0.5)' }),
                    }),
                    beams: fields.object({
                        color: fields.text({ label: 'Цвет лучей (не используется в демо)', defaultValue: '#fff' }),
                    }),
                    snow: fields.object({
                        density: fields.integer({ label: 'Плотность', defaultValue: 150 }),
                    }),
                }
            ),
            backgroundMusic: fields.object({
                file: fields.file({
                    label: 'Файл музыки (MP3)',
                    directory: 'public/music',
                    publicPath: '/music',
                    validation: { isRequired: false }
                }),
                autoplay: fields.checkbox({ label: 'Автовоспроизведение', defaultValue: false }),
                volume: fields.number({ label: 'Громкость (0.0 - 1.0)', defaultValue: 0.3, validation: { min: 0, max: 1 }, step: 0.1 }),
            }, { label: 'Фоновая музыка' }),
            theme: fields.select({
                label: 'Тема (Системная/Тёмная/Светлая)',
                options: [
                    { label: 'Системная (Авто)', value: 'system' },
                    { label: 'Тёмная 🌑', value: 'dark' },
                    { label: 'Светлая ☀️', value: 'light' },
                ],
                defaultValue: 'system',
            }),
            brand: fields.select({
                label: 'Фирменный цвет (Основные действия, ссылки)',
                options: [
                    { label: 'Cyan 🔵', value: 'cyan' },
                    { label: 'Blue 🔵', value: 'blue' },
                    { label: 'Indigo 🟣', value: 'indigo' },
                    { label: 'Violet 🟣', value: 'violet' },
                    { label: 'Magenta 🟣', value: 'magenta' },
                    { label: 'Pink 🌸', value: 'pink' },
                    { label: 'Red 🔴', value: 'red' },
                    { label: 'Orange 🟠', value: 'orange' },
                    { label: 'Yellow 🟡', value: 'yellow' },
                    { label: 'Moss 🌿', value: 'moss' },
                    { label: 'Green 🟢', value: 'green' },
                    { label: 'Emerald 🟢', value: 'emerald' },
                    { label: 'Aqua 💧', value: 'aqua' },
                ],
                defaultValue: 'cyan',
            }),
            accent: fields.select({
                label: 'Акцентный цвет (Выделения, ошибки)',
                options: [
                    { label: 'Cyan 🔵', value: 'cyan' },
                    { label: 'Blue 🔵', value: 'blue' },
                    { label: 'Indigo 🟣', value: 'indigo' },
                    { label: 'Violet 🟣', value: 'violet' },
                    { label: 'Magenta 🟣', value: 'magenta' },
                    { label: 'Pink 🌸', value: 'pink' },
                    { label: 'Red 🔴', value: 'red' },
                    { label: 'Orange 🟠', value: 'orange' },
                    { label: 'Yellow 🟡', value: 'yellow' },
                    { label: 'Moss 🌿', value: 'moss' },
                    { label: 'Green 🟢', value: 'green' },
                    { label: 'Emerald 🟢', value: 'emerald' },
                    { label: 'Aqua 💧', value: 'aqua' },
                ],
                defaultValue: 'red',
            }),
            neutral: fields.select({
                label: 'Нейтральный цвет (Фон, текст)',
                options: [
                    { label: 'Серый (Стандарт)', value: 'gray' },
                    { label: 'Песочный (Тёплый)', value: 'sand' },
                    { label: 'Грифельный (Холодный)', value: 'slate' },
                ],
                defaultValue: 'gray',
            }),
            border: fields.select({
                label: 'Стиль границ (Радиус)',
                options: [
                    { label: 'Игривый (Большой радиус)', value: 'playful' },
                    { label: 'Закругленный (Средний радиус)', value: 'rounded' },
                    { label: 'Строгий (Малый радиус)', value: 'conservative' },
                ],
                defaultValue: 'playful',
            }),
            solid: fields.select({
                label: 'Стиль заливки',
                options: [
                    { label: 'Цвет (Сплошная заливка)', value: 'color' },
                    { label: 'Контраст (Высокий контраст)', value: 'contrast' },
                ],
                defaultValue: 'contrast',
            }),
            solidStyle: fields.select({
                label: 'Стиль сплошных элементов (Глубина)',
                options: [
                    { label: 'Плоский (Без глубины)', value: 'flat' },
                    { label: 'Пластик (3D эффект)', value: 'plastic' },
                ],
                defaultValue: 'flat',
            }),
            surface: fields.select({
                label: 'Стиль поверхности (Прозрачность)',
                options: [
                    { label: 'Залитый (Непрозрачный)', value: 'filled' },
                    { label: 'Полупрозрачный (Стекло)', value: 'translucent' },
                ],
                defaultValue: 'translucent',
            }),
        },
    }),
    work: singleton({
      label: 'Портфолио',
      path: 'src/content/work',
      format: 'json',
      previewUrl: '/preview/work',
      schema: {
        title: fields.text({ label: 'Заголовок', description: 'Главный заголовок страницы портфолио.' }),
        description: fields.text({ label: 'Описание', multiline: true, description: 'Вступительный текст под заголовком.' }),
        blocks: fields.blocks({
            projects: {
                label: 'Сетка проектов',
                schema: fields.object({
                    title: fields.text({ label: 'Заголовок' }),
                    selectedProjects: fields.array(
                        fields.relationship({
                            label: 'Проект',
                            collection: 'projects',
                        }),
                        {
                            label: 'Выберите проекты (порядок важен)',
                            itemLabel: (props) => props.value || 'Проект',
                        }
                    ),
                }),
                itemLabel: (props) => `Сетка проектов (${props.fields.selectedProjects.elements.length || 0})`,
            },
            hero: {
                label: 'Hero секция',
                schema: fields.object({
                    headline: fields.text({ label: 'Заголовок' }),
                    subline: fields.document({
                        label: 'Подзаголовок',
                        formatting: { inlineMarks: { bold: true, italic: true } },
                    }),
                }),
                itemLabel: (props) => props.fields.headline.value || 'Hero секция',
            },
            cta: {
                label: 'Призыв к действию (CTA)',
                schema: fields.object({
                    title: fields.text({ label: 'Заголовок' }),
                    text: fields.text({ label: 'Описание', multiline: true }),
                    buttonLabel: fields.text({ label: 'Текст кнопки' }),
                    buttonLink: fields.text({ label: 'Ссылка кнопки' }),
                }),
                itemLabel: (props) => `CTA: ${props.fields.title.value}`,
            },
            spacer: {
                label: 'Разделитель',
                schema: fields.object({
                    height: fields.select({
                        label: 'Высота',
                        options: [
                            { label: 'Маленький (32px)', value: 'small' },
                            { label: 'Средний (64px)', value: 'medium' },
                            { label: 'Большой (128px)', value: 'large' },
                            { label: 'Очень большой (256px)', value: 'xlarge' },
                        ],
                        defaultValue: 'medium',
                    }),
                }),
                itemLabel: (props) => `Разделитель: ${props.fields.height.value}`,
            },
        }, { label: 'Блоки страницы' }),
      },
    }),
    gallery: singleton({
      label: 'Настройки страницы Галереи (SEO)',
      path: 'src/content/gallery',
      format: 'json',
      previewUrl: '/preview/gallery',
      schema: {
        _notice: fields.text({
            label: 'Важно!',
            description: 'Контент (проекты/альбомы) добавляется в разделе "Портфолио (Проекты)". Здесь настраивается только заголовок страницы.',
            defaultValue: 'Перейдите в раздел "Портфолио (Проекты)" для управления контентом.',
            validation: { length: { min: 1 } },
        }),
        title: fields.text({ label: 'Заголовок', description: 'Главный заголовок страницы галереи.' }),
        description: fields.text({ label: 'Описание', multiline: true, description: 'Вступительный текст под заголовком.' }),
      },
    }),
  },
});
