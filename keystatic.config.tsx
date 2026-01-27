import { config, fields, collection, component } from '@keystatic/core';
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
      'Blog': ['posts'],
      'Portfolio': ['projects'],
    },
  },
  collections: {
    posts: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/app/(site)/blog/posts/*',
      format: { contentField: 'content' },
      previewUrl: '/blog/{slug}',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        summary: fields.text({ label: 'Summary', multiline: true }),
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
      slugField: 'title',
      path: 'src/app/(site)/work/projects/*',
      format: { contentField: 'content' },
      previewUrl: '/work/{slug}',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        summary: fields.text({ label: 'Summary', multiline: true }),
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
});
