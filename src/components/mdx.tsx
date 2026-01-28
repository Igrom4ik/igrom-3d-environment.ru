/* eslint-disable @typescript-eslint/no-explicit-any */
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import type React from "react";
import type { ReactNode } from "react";
import { slugify as transliterate } from "transliteration";

import {
  Accordion,
  AccordionGroup,
  Button,
  Card,
  CodeBlock,
  Column,
  Feedback,
  Grid,
  Heading,
  HeadingLink,
  Icon,
  InlineCode,
  Line,
  List,
  ListItem,
  Media,
  type MediaProps,
  Row,
  SmartLink,
  Table,
  Text,
  type TextProps,
} from "@once-ui-system/core";

import { 
  ImageFull, 
  VideoLoop, 
  YoutubeEmbed, 
  SketchfabEmbed, 
  ComparisonSlider 
} from "./ProjectBlocks";

import {
  BlogImageGallery,
  BlogCallout,
  BlogCodeBlock,
  BlogYoutube,
  BlogVideoBlock,
  BlogSpacer
} from "@/components/blog/BlogBlocks";
import { BlogGalleryAlbum } from "@/components/blog/BlogGalleryAlbum";

// Force rebuild

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

function CustomLink({ href, children, ...props }: CustomLinkProps) {
  if (href.startsWith("/")) {
    return (
      <SmartLink href={href} {...props}>
        {children}
      </SmartLink>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

function createImage({ alt, src, ...props }: MediaProps & { src: string }) {
  if (!src) {
    console.error("Media requires a valid 'src' property.");
    return null;
  }

  return (
    <Media
      marginTop="8"
      marginBottom="16"
      enlarge
      radius="m"
      border="neutral-alpha-medium"
      sizes="(max-width: 960px) 100vw, 960px"
      alt={alt}
      src={src}
      {...props}
    />
  );
}

function slugify(str: string): string {
  const strWithAnd = str.replace(/&/g, " and "); // Replace & with 'and'
  return transliterate(strWithAnd, {
    lowercase: true,
    separator: "-", // Replace spaces with -
  }).replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

function createHeading(as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  const CustomHeading = ({
    children,
    ...props
  }: Omit<React.ComponentProps<typeof HeadingLink>, "as" | "id">) => {
    const slug = slugify(children as string);
    return (
      <HeadingLink marginTop="24" marginBottom="12" as={as} id={slug} {...props}>
        {children}
      </HeadingLink>
    );
  };

  CustomHeading.displayName = `${as}`;

  return CustomHeading;
}

function createParagraph({ children }: TextProps) {
  return (
    <Text
      style={{ lineHeight: "175%" }}
      variant="body-default-m"
      onBackground="neutral-medium"
      marginTop="8"
      marginBottom="12"
    >
      {children}
    </Text>
  );
}

function createInlineCode({ children }: { children: ReactNode }) {
  return <InlineCode>{children}</InlineCode>;
}

// biome-ignore lint/suspicious/noExplicitAny: mdx props
function createCodeBlock(props: any) {
  // For pre tags that contain code blocks
  if (props.children?.props?.className) {
    const { className, children } = props.children.props;

    // Extract language from className (format: language-xxx)
    const language = className.replace("language-", "");
    const label = language.charAt(0).toUpperCase() + language.slice(1);

    return (
      <CodeBlock
        marginTop="8"
        marginBottom="16"
        codes={[
          {
            code: children,
            language,
            label,
          },
        ]}
        copyButton={true}
      />
    );
  }

  // Fallback for other pre tags or empty code blocks
  return <pre {...props} />;
}

function createList(as: "ul" | "ol") {
  return ({ children }: { children: ReactNode }) => <List as={as}>{children}</List>;
}

function createListItem({ children }: { children: ReactNode }) {
  return (
    <ListItem marginTop="4" marginBottom="8" style={{ lineHeight: "175%" }}>
      {children}
    </ListItem>
  );
}

function createHR() {
  return (
    <Row fillWidth horizontal="center">
      <Line maxWidth="40" />
    </Row>
  );
}

const components = {
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  p: createParagraph as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  h1: createHeading("h1") as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  h2: createHeading("h2") as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  h3: createHeading("h3") as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  h4: createHeading("h4") as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  h5: createHeading("h5") as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  h6: createHeading("h6") as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  img: createImage as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  a: CustomLink as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  code: createInlineCode as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  pre: createCodeBlock as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  ol: createList("ol") as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  ul: createList("ul") as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  li: createListItem as any,
  // biome-ignore lint/suspicious/noExplicitAny: mdx component mapping
  hr: createHR as any,
  Heading,
  Text,
  CodeBlock,
  InlineCode,
  Accordion,
  AccordionGroup,
  Table,
  Feedback,
  Button,
  Card,
  Grid,
  Row,
  Column,
  Icon,
  Media,
  SmartLink,
  // Keystatic Component Blocks Mapping
  'image-full': ImageFull,
  'video-loop': VideoLoop,
  'youtube-embed': YoutubeEmbed,
  'sketchfab-embed': SketchfabEmbed,
  'comparison-slider': ComparisonSlider,
  // Blog Blocks
  'image-gallery': BlogImageGallery,
  'callout': BlogCallout,
  'code-block': BlogCodeBlock,
  'youtube': BlogYoutube,
  'video': BlogVideoBlock,
  'spacer': BlogSpacer,
  'gallery-album': BlogGalleryAlbum,
};

type CustomMDXProps = MDXRemoteProps & {
  components?: typeof components;
};

export function CustomMDX(props: CustomMDXProps) {
  return <MDXRemote {...props} components={{ ...components, ...(props.components || {}) }} />;
}
