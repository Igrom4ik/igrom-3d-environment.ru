import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: { name: 'Igrom Dashboard' },
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
        media: fields.blocks(
            {
                image: {
                    label: 'Image',
                    itemLabel: (props) => props.fields.caption.value || 'Image',
                    schema: fields.object({
                        image: fields.image({
                            label: 'Image File',
                            directory: 'public/images/projects',
                            publicPath: '/images/projects',
                        }),
                        caption: fields.text({ label: 'Caption' }),
                    }),
                },
                video: {
                    label: 'Video',
                    itemLabel: (props) => `Video: ${props.fields.src.value}`,
                    schema: fields.object({
                        src: fields.text({ label: 'Video URL / Path (mp4, webm, etc.)' }),
                        autoPlay: fields.checkbox({ label: 'AutoPlay', defaultValue: true }),
                        muted: fields.checkbox({ label: 'Muted', defaultValue: true }),
                        loop: fields.checkbox({ label: 'Loop', defaultValue: true }),
                    }),
                },
                youtube: {
                    label: 'YouTube / Vimeo',
                    itemLabel: (props) => `Embed: ${props.fields.url.value}`,
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
                        }),
                        width: fields.text({ label: 'Width (px or %)', defaultValue: '100%' }),
                        height: fields.text({ label: 'Height (px)', defaultValue: '600px' }),
                    }),
                }
            },
            { label: 'Project Media Gallery' }
        ),
        content: fields.document({
          label: 'Content',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'public/images/projects/content',
            publicPath: '/images/projects/content',
          },
        }),
      },
    }),
  },
});
