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
            'Content': ['home', 'work', 'blog', 'gallery', 'posts', 'projects'],
            'System': ['design', 'settings'],
        },
    },
  collections: {
    posts: collection({
      label: 'Blog Posts',
      path: 'src/app/(site)/blog/posts/*',
      slugField: 'title',
      format: { contentField: 'content' },
      previewUrl: '/blog/{slug}',
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        summary: fields.text({ label: 'Summary', multiline: true, description: 'Short description for the blog list card.' }),
        publishedAt: fields.date({ label: 'Published Date' }),
        tag: fields.text({ label: 'Tag' }),
        image: fields.image({
          label: 'Cover Image',
          directory: 'public/images/blog',
          publicPath: '/images/blog',
        }),
        content: fields.document({
          label: 'Content',
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
      label: 'Projects',
      path: 'src/app/(site)/work/projects/*',
      slugField: 'title',
      format: { contentField: 'content' },
      previewUrl: '/work/{slug}',
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        summary: fields.text({ label: 'Summary', multiline: true, description: 'Displayed on the portfolio grid.' }),
        publishedAt: fields.date({ label: 'Published Date' }),
        cover: fields.image({
            label: 'Cover Image (Thumbnail)',
            directory: 'public/images/projects',
            publicPath: '/images/projects',
            validation: { isRequired: false }
        }),
        software: fields.array(
            fields.text({ label: 'Software Name' }),
            {
                label: 'Software Used',
                itemLabel: props => props?.value || 'Software'
            }
        ),
        tags: fields.array(
            fields.text({ label: 'Tag' }),
            {
                label: 'Tags',
                itemLabel: props => props?.value || 'Tag'
            }
        ),
        artstation: fields.url({ label: 'Artstation Link' }),
        media: fields.blocks(
            {
                gallery: {
                    label: 'Image Gallery',
                    itemLabel: (props) => `Gallery (${props?.fields?.images?.elements?.length || 0} images)`,
                    schema: fields.object({
                        images: fields.array(
                            fields.image({
                                label: 'Image',
                                directory: 'public/images/projects',
                                publicPath: '/images/projects',
                            }),
                            { label: 'Images' }
                        ),
                        columns: fields.select({
                            label: 'Columns',
                            options: [
                                { label: '2 Columns', value: '2' },
                                { label: '3 Columns', value: '3' },
                                { label: '4 Columns', value: '4' },
                            ],
                            defaultValue: '2',
                        }),
                    }),
                },
                image: {
                    label: 'HQ Image',
                    itemLabel: (props) => props.fields.caption.value || 'HQ Image',
                    schema: fields.object({
                        image: fields.image({
                            label: 'Image File (JPG, PNG, GIF, WEBP)',
                            directory: 'public/images/projects',
                            publicPath: '/images/projects',
                        }),
                        caption: fields.text({ label: 'Caption' }),
                    }),
                },
                video: {
                    label: 'Video Clip (MP4)',
                    itemLabel: (props) => `Video: ${props.fields.src.value}`,
                    schema: fields.object({
                        src: fields.text({ label: 'Video Path (e.g. /images/projects/video.mp4)' }),
                        autoPlay: fields.checkbox({ label: 'AutoPlay', defaultValue: true }),
                        muted: fields.checkbox({ label: 'Muted', defaultValue: true }),
                        loop: fields.checkbox({ label: 'Loop', defaultValue: true }),
                    }),
                },
                youtube: {
                    label: 'Embed (YT/Vimeo)',
                    itemLabel: (props) => `Embed: ${props?.fields?.url?.value || ''}`,
                    schema: fields.object({
                        url: fields.text({ label: 'Video URL' }),
                    }),
                },
                sketchfab: {
                    label: 'Sketchfab',
                    itemLabel: (props) => 'Sketchfab',
                    schema: fields.object({
                        url: fields.text({ label: 'Sketchfab Model URL' }),
                    }),
                },
                marmoset: {
                    label: 'Marmoset Viewer',
                    itemLabel: (props) => 'Marmoset',
                    schema: fields.object({
                        src: fields.file({
                            label: 'MView File',
                            directory: 'public/marmoset',
                            publicPath: '/marmoset',
                            validation: { isRequired: false },
                        }),
                        manualPath: fields.text({
                            label: 'Manual Path (for large files)',
                            description: 'For files > 100MB: 1. Click the "Open Marmoset Folder" button. 2. Paste file there. 3. Enter path here (e.g. /marmoset/file.mview)',
                        }),
                        width: fields.text({ label: 'Width (px or %)', defaultValue: '100%' }),
                        height: fields.text({ label: 'Height (px)', defaultValue: '600px' }),
                        autoStart: fields.checkbox({ label: 'Auto Start', defaultValue: false }),
                    }),
                },
                pano: {
                    label: '360 Pano',
                    itemLabel: (props) => '360 Pano',
                    schema: fields.object({
                        image: fields.image({
                            label: 'Panorama Image (JPG)',
                            directory: 'public/images/projects',
                            publicPath: '/images/projects',
                        }),
                        caption: fields.text({ label: 'Caption' }),
                    }),
                },
                compare: {
                    label: 'Comparison (Before/After)',
                    itemLabel: (props) => 'Comparison',
                    schema: fields.object({
                        leftImage: fields.image({
                            label: 'Left Image (Before)',
                            directory: 'public/images/projects',
                            publicPath: '/images/projects',
                        }),
                        rightImage: fields.image({
                            label: 'Right Image (After)',
                            directory: 'public/images/projects',
                            publicPath: '/images/projects',
                        }),
                    }),
                }
            },
            { label: 'Media Gallery' }
        ),
        content: fields.document({
          label: 'Content (Media & Text)',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'public/images/projects/content',
            publicPath: '/images/projects/content',
          },
          componentBlocks: {
            'image-full': component({
                label: 'Full Width Image',
                schema: {
                    src: fields.image({
                        label: 'Image',
                        directory: 'public/images/projects/content',
                        publicPath: '/images/projects/content',
                    }),
                    caption: fields.text({ label: 'Caption' }),
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
                            {props.fields.caption.value || 'No caption'}
                        </div>
                    </div>
                )
            }),
            'video-loop': component({
                label: 'Looping Video (MP4/WebM)',
                schema: {
                    src: fields.text({ label: 'Video Path (e.g. /images/projects/video.mp4)' }),
                    autoPlay: fields.checkbox({ label: 'AutoPlay', defaultValue: true }),
                    muted: fields.checkbox({ label: 'Muted', defaultValue: true }),
                    loop: fields.checkbox({ label: 'Loop', defaultValue: true }),
                },
                preview: (props) => (
                    <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <strong>Video:</strong> {props.fields.src.value}
                    </div>
                )
            }),
            'youtube-embed': component({
                label: 'YouTube / Vimeo Embed',
                schema: {
                    url: fields.text({ label: 'Video URL' }),
                },
                preview: (props) => (
                    <div style={{ padding: '10px', background: '#ffebeb', borderRadius: '4px' }}>
                        <strong>Embed:</strong> {props.fields.url.value}
                    </div>
                )
            }),
            'sketchfab-embed': component({
                label: 'Sketchfab Embed',
                schema: {
                    url: fields.text({ label: 'Sketchfab Model URL' }),
                },
                preview: (props) => (
                    <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '4px' }}>
                        <strong>Sketchfab:</strong> {props.fields.url.value}
                    </div>
                )
            }),
            'comparison-slider': component({
                label: 'Before / After Slider',
                schema: {
                    leftImage: fields.image({
                        label: 'Left Image (Before)',
                        directory: 'public/images/projects/content',
                        publicPath: '/images/projects/content',
                    }),
                    rightImage: fields.image({
                        label: 'Right Image (After)',
                        directory: 'public/images/projects/content',
                        publicPath: '/images/projects/content',
                    }),
                },
                preview: (props) => (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <strong>Left:</strong>
                            {props.fields.leftImage.value?.data && <img src={URL.createObjectURL(new Blob([props.fields.leftImage.value.data as unknown as BlobPart]))} alt="Left Preview" style={{width: '50px'}} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <strong>Right:</strong>
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
      label: 'Site Settings',
      path: 'src/content/settings',
      format: 'json',
      schema: {
        person: fields.object({
          name: fields.text({ label: 'Full Name' }),
          role: fields.text({ label: 'Role / Job Title' }),
          location: fields.text({ label: 'Location' }),
          avatar: fields.image({
            label: 'Avatar',
            directory: 'public/images',
            publicPath: '/images',
          }),
        }, { label: 'Person Details' }),
      },
    }),
    home: singleton({
        label: 'Home Page',
        path: 'src/content/home',
        format: 'json',
        previewUrl: '/preview?type=home',
        schema: {
            blocks: fields.blocks({
                hero: {
                    label: 'Hero Section (Top)',
                    schema: fields.object({
                        content: fields.object({
                            headline: fields.text({ label: 'Headline' }),
                            subline: fields.document({
                                label: 'Subline',
                                formatting: { inlineMarks: { bold: true, italic: true } },
                            }),
                        }, { label: 'Text Content' }),
                        layout: fields.object({
                            alignment: fields.select({
                                label: 'Text Alignment',
                                options: [
                                    { label: 'Left', value: 'left' },
                                    { label: 'Center', value: 'center' }
                                ],
                                defaultValue: 'center'
                            }),
                            height: fields.select({
                                label: 'Section Height',
                                options: [
                                    { label: 'Auto', value: 'auto' },
                                    { label: 'Full Screen', value: 'full' }
                                ],
                                defaultValue: 'auto'
                            })
                        }, { label: 'Layout & Settings' }),
                    }),
                    itemLabel: (props) => props.fields.content.fields.headline.value || 'Hero Section',
                },
                about: {
                    label: 'About Section',
                    schema: fields.object({
                        title: fields.text({ label: 'Section Title' }),
                        content: fields.document({
                            label: 'Content',
                            formatting: true,
                            dividers: true,
                            links: true,
                        }),
                    }),
                    itemLabel: (props) => props.fields.title.value || 'About Section',
                },
                gallery: {
                    label: 'Gallery Preview',
                    schema: fields.object({
                        title: fields.text({ label: 'Title (e.g. Latest Work)' }),
                        limit: fields.integer({ label: 'Number of Images', defaultValue: 6 }),
                    }),
                    itemLabel: (props) => `Gallery: ${props.fields.title.value || 'Recent'}`,
                },
                testimonial: {
                    label: 'Testimonial / Quote',
                    schema: fields.object({
                        quote: fields.text({ label: 'Quote', multiline: true }),
                        author: fields.text({ label: 'Author Name' }),
                        role: fields.text({ label: 'Role / Company' }),
                        avatar: fields.image({
                            label: 'Author Avatar',
                            directory: 'public/images/avatars',
                            publicPath: '/images/avatars',
                        }),
                    }),
                    itemLabel: (props) => `Quote: ${props.fields.author.value}`,
                },
                cta: {
                    label: 'Call to Action',
                    schema: fields.object({
                        title: fields.text({ label: 'Headline' }),
                        text: fields.text({ label: 'Description', multiline: true }),
                        buttonLabel: fields.text({ label: 'Button Label' }),
                        buttonLink: fields.text({ label: 'Button Link' }),
                    }),
                    itemLabel: (props) => `CTA: ${props.fields.title.value}`,
                },
                features: {
                    label: 'Features Grid',
                    schema: fields.object({
                        title: fields.text({ label: 'Section Title' }),
                        columns: fields.select({
                            label: 'Columns',
                            options: [
                                { label: '2 Columns', value: '2' },
                                { label: '3 Columns', value: '3' },
                                { label: '4 Columns', value: '4' },
                            ],
                            defaultValue: '3',
                        }),
                        features: fields.array(
                            fields.object({
                                title: fields.text({ label: 'Title' }),
                                description: fields.text({ label: 'Description', multiline: true }),
                                icon: fields.text({ label: 'Icon Name (Once UI)' }),
                            }),
                            { label: 'Features' }
                        ),
                    }),
                    itemLabel: (props) => `Features: ${props.fields.title.value}`,
                },
                video: {
                    label: 'Video Section',
                    schema: fields.object({
                        title: fields.text({ label: 'Title' }),
                        url: fields.text({ label: 'Video URL (YouTube/Vimeo/File)' }),
                        autoplay: fields.checkbox({ label: 'Autoplay (Muted)' }),
                    }),
                    itemLabel: (props) => `Video: ${props.fields.title.value}`,
                },
                spacer: {
                    label: 'Spacer / Divider',
                    schema: fields.object({
                        height: fields.select({
                            label: 'Height',
                            options: [
                                { label: 'Small (32px)', value: 'small' },
                                { label: 'Medium (64px)', value: 'medium' },
                                { label: 'Large (128px)', value: 'large' },
                                { label: 'Extra Large (256px)', value: 'xlarge' },
                            ],
                            defaultValue: 'medium',
                        }),
                    }),
                    itemLabel: (props) => `Spacer: ${props.fields.height.value}`,
                },
            }, { label: 'Page Blocks' }),
        }
    }),
    about: singleton({
        label: 'About Page',
        path: 'src/content/about',
        format: 'json',
        schema: {
            title: fields.text({ label: 'Page Title' }),
            description: fields.text({ label: 'Page Description' }),
            tableOfContent: fields.object({
                display: fields.checkbox({ label: 'Show Table of Contents', defaultValue: true }),
                subItems: fields.checkbox({ label: 'Show Sub-items', defaultValue: false }),
            }, { label: 'Table of Contents' }),
            avatar: fields.object({
                display: fields.checkbox({ label: 'Show Avatar', defaultValue: true }),
            }, { label: 'Avatar' }),
            calendar: fields.object({
                display: fields.checkbox({ label: 'Show Calendar Button', defaultValue: true }),
                link: fields.text({ label: 'Calendar Link' }),
            }, { label: 'Calendar' }),
            intro: fields.object({
                display: fields.checkbox({ label: 'Show Introduction', defaultValue: true }),
                title: fields.text({ label: 'Section Title' }),
                description: fields.document({
                    label: 'Biography / Intro',
                    formatting: true,
                    links: true,
                }),
            }, { label: 'Introduction (Biography)' }),
            work: fields.object({
                display: fields.checkbox({ label: 'Show Work Experience', defaultValue: true }),
                title: fields.text({ label: 'Section Title' }),
                experiences: fields.array(
                    fields.object({
                        company: fields.text({ label: 'Company' }),
                        timeframe: fields.text({ label: 'Timeframe' }),
                        role: fields.text({ label: 'Role' }),
                        achievements: fields.array(fields.text({ label: 'Achievement' }), { label: 'Achievements' }),
                        images: fields.array(
                            fields.object({
                                src: fields.image({ label: 'Image', directory: 'public/images/projects', publicPath: '/images/projects' }),
                                alt: fields.text({ label: 'Alt Text' }),
                                width: fields.number({ label: 'Width Ratio', defaultValue: 16 }),
                                height: fields.number({ label: 'Height Ratio', defaultValue: 9 }),
                            }),
                            { label: 'Images' }
                        ),
                    }),
                    { label: 'Experiences', itemLabel: props => props.fields.company.value }
                ),
            }, { label: 'Work Experience' }),
            studies: fields.object({
                display: fields.checkbox({ label: 'Show Studies', defaultValue: true }),
                title: fields.text({ label: 'Section Title' }),
                institutions: fields.array(
                    fields.object({
                        name: fields.text({ label: 'Institution Name' }),
                        description: fields.text({ label: 'Description' }),
                    }),
                    { label: 'Institutions', itemLabel: props => props.fields.name.value }
                ),
            }, { label: 'Studies' }),
            technical: fields.object({
                display: fields.checkbox({ label: 'Show Technical Skills', defaultValue: true }),
                title: fields.text({ label: 'Section Title' }),
                skills: fields.array(
                    fields.object({
                        title: fields.text({ label: 'Skill Title' }),
                        description: fields.text({ label: 'Description' }),
                        tags: fields.array(
                            fields.object({
                                name: fields.text({ label: 'Tag Name' }),
                                icon: fields.text({ label: 'Icon Name' }),
                            }),
                            { label: 'Tags' }
                        ),
                        images: fields.array(
                             fields.object({
                                src: fields.image({ label: 'Image', directory: 'public/images/projects', publicPath: '/images/projects' }),
                                alt: fields.text({ label: 'Alt Text' }),
                                width: fields.number({ label: 'Width Ratio', defaultValue: 16 }),
                                height: fields.number({ label: 'Height Ratio', defaultValue: 9 }),
                            }),
                            { label: 'Images' }
                        ),
                    }),
                    { label: 'Skills', itemLabel: props => props.fields.title.value }
                ),
            }, { label: 'Technical Skills' }),
        },
    }),
    design: singleton({
        label: 'Design System',
        path: 'src/content/design',
        format: 'json',
        previewUrl: '/style-guide',
        schema: {
            preset: fields.select({
                label: 'Theme Preset',
                options: [
                    { label: 'Custom (Use below settings)', value: 'custom' },
                    { label: 'Apple iOS Liquid Glass 🍏', value: 'ios-liquid-glass' },
                ],
                defaultValue: 'custom',
            }),
            backgroundEffect: fields.select({
                label: 'Background Effect',
                options: [
                    { label: 'None (Static)', value: 'none' },
                    { label: 'Aurora (Gradient Animation)', value: 'aurora' },
                    { label: 'Particles (Dots)', value: 'particles' },
                    { label: 'Grid', value: 'grid' },
                ],
                defaultValue: 'none',
            }),
            theme: fields.select({
                label: 'Theme (System/Dark/Light)',
                options: [
                    { label: 'System (Auto)', value: 'system' },
                    { label: 'Dark 🌑', value: 'dark' },
                    { label: 'Light ☀️', value: 'light' },
                ],
                defaultValue: 'system',
            }),
            brand: fields.select({
                label: 'Brand Color (Primary Actions, Links)',
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
                label: 'Accent Color (Highlights, Errors)',
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
                label: 'Neutral Color (Backgrounds, Text)',
                options: [
                    { label: 'Gray (Standard)', value: 'gray' },
                    { label: 'Sand (Warm)', value: 'sand' },
                    { label: 'Slate (Cool)', value: 'slate' },
                ],
                defaultValue: 'gray',
            }),
            border: fields.select({
                label: 'Border Style (Radius)',
                options: [
                    { label: 'Playful (High Radius)', value: 'playful' },
                    { label: 'Rounded (Medium Radius)', value: 'rounded' },
                    { label: 'Conservative (Low Radius)', value: 'conservative' },
                ],
                defaultValue: 'playful',
            }),
            solid: fields.select({
                label: 'Solid Style (Fill Type)',
                options: [
                    { label: 'Color (Solid Fill)', value: 'color' },
                    { label: 'Contrast (High Contrast)', value: 'contrast' },
                ],
                defaultValue: 'contrast',
            }),
            solidStyle: fields.select({
                label: 'Solid Element Style (Depth)',
                options: [
                    { label: 'Flat (No Depth)', value: 'flat' },
                    { label: 'Plastic (3D Effect)', value: 'plastic' },
                ],
                defaultValue: 'flat',
            }),
            surface: fields.select({
                label: 'Surface Style (Transparency)',
                options: [
                    { label: 'Filled (Opaque)', value: 'filled' },
                    { label: 'Translucent (Glass Effect)', value: 'translucent' },
                ],
                defaultValue: 'translucent',
            }),
        },
    }),
    work: singleton({
      label: 'Work Page',
      path: 'src/content/work',
      format: 'json',
      previewUrl: '/preview?type=work',
      schema: {
        title: fields.text({ label: 'Title', description: 'Main heading for the Portfolio page.' }),
        description: fields.text({ label: 'Description', multiline: true, description: 'Introductory text below the title.' }),
        blocks: fields.blocks({
            projects: {
                label: 'Projects Grid',
                schema: fields.object({
                    title: fields.text({ label: 'Title' }),
                    limit: fields.integer({ label: 'Limit' }),
                }),
                itemLabel: (props) => 'Projects Grid',
            },
            hero: {
                label: 'Hero Section',
                schema: fields.object({
                    headline: fields.text({ label: 'Headline' }),
                    subline: fields.document({
                        label: 'Subline',
                        formatting: { inlineMarks: { bold: true, italic: true } },
                    }),
                }),
                itemLabel: (props) => props.fields.headline.value || 'Hero Section',
            },
            cta: {
                label: 'Call to Action',
                schema: fields.object({
                    title: fields.text({ label: 'Headline' }),
                    text: fields.text({ label: 'Description', multiline: true }),
                    buttonLabel: fields.text({ label: 'Button Label' }),
                    buttonLink: fields.text({ label: 'Button Link' }),
                }),
                itemLabel: (props) => `CTA: ${props.fields.title.value}`,
            },
            spacer: {
                label: 'Spacer / Divider',
                schema: fields.object({
                    height: fields.select({
                        label: 'Height',
                        options: [
                            { label: 'Small (32px)', value: 'small' },
                            { label: 'Medium (64px)', value: 'medium' },
                            { label: 'Large (128px)', value: 'large' },
                            { label: 'Extra Large (256px)', value: 'xlarge' },
                        ],
                        defaultValue: 'medium',
                    }),
                }),
                itemLabel: (props) => `Spacer: ${props.fields.height.value}`,
            },
        }, { label: 'Page Blocks' }),
      },
    }),
    blog: singleton({
      label: 'Blog Page',
      path: 'src/content/blog',
      format: 'json',
      previewUrl: '/preview?type=blog',
      schema: {
        title: fields.text({ label: 'Title', description: 'Main heading for the Blog page.' }),
        description: fields.text({ label: 'Description', multiline: true, description: 'Introductory text below the title.' }),
        blocks: fields.blocks({
            posts: {
                label: 'Posts Grid',
                schema: fields.object({
                    title: fields.text({ label: 'Title' }),
                    columns: fields.select({
                        label: 'Columns',
                        options: [
                            { label: '1 Column', value: '1' },
                            { label: '2 Columns', value: '2' },
                            { label: '3 Columns', value: '3' },
                        ],
                        defaultValue: '3',
                    }),
                    limit: fields.integer({ label: 'Limit' }),
                }),
                itemLabel: (props) => 'Posts Grid',
            },
            newsletter: {
                label: 'Newsletter Signup',
                schema: fields.object({
                    title: fields.text({ label: 'Title' }),
                    description: fields.text({ label: 'Description', multiline: true }),
                }),
                itemLabel: (props) => 'Newsletter Form',
            },
            hero: {
                label: 'Hero Section',
                schema: fields.object({
                    headline: fields.text({ label: 'Headline' }),
                    subline: fields.document({
                        label: 'Subline',
                        formatting: { inlineMarks: { bold: true, italic: true } },
                    }),
                }),
                itemLabel: (props) => props.fields.headline.value || 'Hero Section',
            },
            cta: {
                label: 'Call to Action',
                schema: fields.object({
                    title: fields.text({ label: 'Headline' }),
                    text: fields.text({ label: 'Description', multiline: true }),
                    buttonLabel: fields.text({ label: 'Button Label' }),
                    buttonLink: fields.text({ label: 'Button Link' }),
                }),
                itemLabel: (props) => `CTA: ${props.fields.title.value}`,
            },
            spacer: {
                label: 'Spacer / Divider',
                schema: fields.object({
                    height: fields.select({
                        label: 'Height',
                        options: [
                            { label: 'Small (32px)', value: 'small' },
                            { label: 'Medium (64px)', value: 'medium' },
                            { label: 'Large (128px)', value: 'large' },
                            { label: 'Extra Large (256px)', value: 'xlarge' },
                        ],
                        defaultValue: 'medium',
                    }),
                }),
                itemLabel: (props) => `Spacer: ${props.fields.height.value}`,
            },
        }, { label: 'Page Blocks' }),
      },
    }),
    gallery: singleton({
      label: 'Gallery Page',
      path: 'src/content/gallery',
      format: 'json',
      previewUrl: '/preview?type=gallery',
      schema: {
        title: fields.text({ label: 'Title', description: 'Main heading for the Gallery page.' }),
        description: fields.text({ label: 'Description', multiline: true, description: 'Introductory text below the title.' }),
        images: fields.blocks(
          {
            image: {
              label: 'Image',
              schema: fields.object({
                src: fields.image({
                  label: 'Image File',
                  directory: 'public/images/gallery',
                  publicPath: '/images/gallery',
                }),
                alt: fields.text({ label: 'Alt Text' }),
                orientation: fields.select({
                  label: 'Orientation',
                  options: [
                    { label: 'Horizontal', value: 'horizontal' },
                    { label: 'Vertical', value: 'vertical' },
                  ],
                  defaultValue: 'horizontal',
                }),
              }),
            },
            marmoset: {
              label: 'Marmoset Viewer',
              schema: fields.object({
                src: fields.file({
                  label: 'MView File',
                  directory: 'public/marmoset',
                  publicPath: '/marmoset',
                  validation: { isRequired: false },
                }),
                manualPath: fields.text({
                  label: 'Manual Path (if file not uploaded)',
                  description: 'Enter path like /marmoset/file.mview',
                }),
                alt: fields.text({ label: 'Alt Text' }),
                orientation: fields.select({
                  label: 'Orientation',
                  options: [
                    { label: 'Horizontal', value: 'horizontal' },
                    { label: 'Vertical', value: 'vertical' },
                  ],
                  defaultValue: 'horizontal',
                }),
              }),
            },
          },
          { label: 'Gallery Images' }
        ),
      },
    }),
  },
});
