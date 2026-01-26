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
        publishedAt: fields.date({ label: 'Published Date' }),
        images: fields.array(
          fields.text({ label: 'Image or Video Path' }),
          {
            label: 'Images/Videos (Paths relative to public, e.g. /images/...)',
            itemLabel: (props) => props.value || 'New Item',
          }
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
