import type { ComponentProps } from 'react';
import { HeroBlock } from './blocks/HeroBlock';
import { AboutBlock } from './blocks/AboutBlock';
import { GalleryBlock } from './blocks/GalleryBlock';
import { TestimonialBlock } from './blocks/TestimonialBlock';
import { CtaBlock } from './blocks/CtaBlock';
import { FeaturesBlock } from './blocks/FeaturesBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { ProjectsBlock } from './blocks/ProjectsBlock';
import { PostsBlock } from './blocks/PostsBlock';
import { MailchimpBlock } from './blocks/MailchimpBlock';

type BlockDiscriminant =
  | 'hero'
  | 'about'
  | 'gallery'
  | 'testimonial'
  | 'cta'
  | 'features'
  | 'video'
  | 'spacer'
  | 'projects'
  | 'posts'
  | 'newsletter';

interface BaseBlock<T = unknown> {
  discriminant: BlockDiscriminant;
  value: T;
}

export type PageBlock = BaseBlock;

interface PageBuilderProps {
  blocks: PageBlock[];
}

export function PageBuilder({ blocks }: PageBuilderProps) {
  if (!blocks || !Array.isArray(blocks)) return null;

  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.discriminant}-${index}`;
        switch (block.discriminant) {
          case 'hero':
            return <HeroBlock key={key} data={block.value as ComponentProps<typeof HeroBlock>['data']} />;
          case 'about':
            return <AboutBlock key={key} data={block.value as ComponentProps<typeof AboutBlock>['data']} />;
          case 'gallery':
            return <GalleryBlock key={key} data={block.value as ComponentProps<typeof GalleryBlock>['data']} />;
          case 'testimonial':
            return <TestimonialBlock key={key} data={block.value as ComponentProps<typeof TestimonialBlock>['data']} />;
          case 'cta':
            return <CtaBlock key={key} data={block.value as ComponentProps<typeof CtaBlock>['data']} />;
          case 'features':
            return <FeaturesBlock key={key} data={block.value as ComponentProps<typeof FeaturesBlock>['data']} />;
          case 'video':
            return <VideoBlock key={key} data={block.value as ComponentProps<typeof VideoBlock>['data']} />;
          case 'spacer':
            return <SpacerBlock key={key} data={block.value as ComponentProps<typeof SpacerBlock>['data']} />;
          case 'projects':
            return <ProjectsBlock key={key} data={block.value as ComponentProps<typeof ProjectsBlock>['data']} />;
          case 'posts':
            return <PostsBlock key={key} data={block.value as ComponentProps<typeof PostsBlock>['data']} />;
          case 'newsletter':
            return <MailchimpBlock key={key} data={block.value as ComponentProps<typeof MailchimpBlock>['data']} />;
          default:
            return (
              <div
                key={key}
                style={{ padding: '20px', border: '1px dashed red' }}
              >
                Unknown block type: {String(block.discriminant)}
              </div>
            );
        }
      })}
    </>
  );
}
