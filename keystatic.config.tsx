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
            'Контент': ['home', 'about', 'work', 'blog', 'gallery', 'posts', 'projects'],
            'Система': ['design', 'settings'],
        },
    },
  collections: {
    posts: collection({
      label: 'Блог',
      path: 'src/app/(site)/blog/posts/*',
      slugField: 'title',
      format: { contentField: 'content' },
      previewUrl: '/blog/{slug}',
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Заголовок' } }),
        summary: fields.text({ label: 'Краткое описание', multiline: true, description: 'Краткое описание для карточки блога.' }),
        publishedAt: fields.date({ label: 'Дата публикации' }),
        tag: fields.text({ label: 'Тег' }),
        image: fields.image({
          label: 'Обложка',
          directory: 'public/images/blog',
          publicPath: '/images/blog',
        }),
        content: fields.document({
          label: 'Содержание',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'public/images/blog/content',
            publicPath: '/images/blog/content',
          },
        }),
      },
    }),
    projects: collection({
      label: 'Проекты',
      path: 'src/app/(site)/work/projects/*',
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
                    itemLabel: (props) => 'Marmoset',
                    schema: fields.object({
                        src: fields.file({
                            label: 'Файл MView',
                            directory: 'public/marmoset',
                            publicPath: '/marmoset',
                            validation: { isRequired: false },
                        }),
                        manualPath: fields.text({
                            label: 'Ручной путь (для больших файлов)',
                            description: 'Для файлов > 100МБ: 1. Нажмите "Open Marmoset Folder". 2. Вставьте файл туда. 3. Введите путь здесь (например, /marmoset/file.mview)',
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
      },
    }),
    home: singleton({
        label: 'Главная страница',
        path: 'src/content/home',
        format: 'json',
        previewUrl: '/preview?type=home',
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
        }
    }),
    about: singleton({
        label: 'Страница "О себе"',
        path: 'src/content/about',
        format: 'json',
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
            backgroundEffect: fields.select({
                label: 'Эффект фона',
                options: [
                    { label: 'Нет', value: 'none' },
                    { label: 'Аврора', value: 'aurora' },
                    { label: 'Частицы', value: 'particles' },
                    { label: 'Сетка', value: 'grid' },
                ],
                defaultValue: 'none',
            }),
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
      previewUrl: '/preview?type=work',
      schema: {
        title: fields.text({ label: 'Заголовок', description: 'Главный заголовок страницы портфолио.' }),
        description: fields.text({ label: 'Описание', multiline: true, description: 'Вступительный текст под заголовком.' }),
        blocks: fields.blocks({
            projects: {
                label: 'Сетка проектов',
                schema: fields.object({
                    title: fields.text({ label: 'Заголовок' }),
                    limit: fields.integer({ label: 'Лимит' }),
                }),
                itemLabel: (props) => 'Сетка проектов',
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
    blog: singleton({
      label: 'Страница блога',
      path: 'src/content/blog',
      format: 'json',
      previewUrl: '/preview?type=blog',
      schema: {
        title: fields.text({ label: 'Заголовок', description: 'Главный заголовок страницы блога.' }),
        description: fields.text({ label: 'Описание', multiline: true, description: 'Вступительный текст под заголовком.' }),
        blocks: fields.blocks({
            posts: {
                label: 'Сетка постов',
                schema: fields.object({
                    title: fields.text({ label: 'Заголовок' }),
                    columns: fields.select({
                        label: 'Колонки',
                        options: [
                            { label: '1 Колонка', value: '1' },
                            { label: '2 Колонки', value: '2' },
                            { label: '3 Колонки', value: '3' },
                        ],
                        defaultValue: '3',
                    }),
                    limit: fields.integer({ label: 'Лимит' }),
                }),
                itemLabel: (props) => 'Сетка постов',
            },
            newsletter: {
                label: 'Подписка на рассылку',
                schema: fields.object({
                    title: fields.text({ label: 'Заголовок' }),
                    description: fields.text({ label: 'Описание', multiline: true }),
                }),
                itemLabel: (props) => 'Форма подписки',
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
      label: 'Галерея',
      path: 'src/content/gallery',
      format: 'json',
      previewUrl: '/preview?type=gallery',
      schema: {
        title: fields.text({ label: 'Заголовок', description: 'Главный заголовок страницы галереи.' }),
        description: fields.text({ label: 'Описание', multiline: true, description: 'Вступительный текст под заголовком.' }),
        images: fields.blocks(
          {
            image: {
              label: 'Изображение',
              schema: fields.object({
                src: fields.image({
                  label: 'Файл изображения',
                  directory: 'public/images/gallery',
                  publicPath: '/images/gallery',
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
            marmoset: {
              label: 'Marmoset Viewer',
              schema: fields.object({
                src: fields.file({
                  label: 'Файл MView',
                  directory: 'public/marmoset',
                  publicPath: '/marmoset',
                  validation: { isRequired: false },
                }),
                manualPath: fields.text({
                  label: 'Ручной путь (если файл не загружен)',
                  description: 'Введите путь, например /marmoset/file.mview',
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
          },
          { label: 'Изображения галереи' }
        ),
      },
    }),
  },
});
