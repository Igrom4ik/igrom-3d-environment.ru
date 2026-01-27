import { CustomMDX, ScrollToHash } from "@/components";
import { Projects } from "@/components/work/Projects";
import { about, baseURL, person, work } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { getPosts } from "@/utils/utils";
import {
  AvatarGroup,
  Button,
  Column,
  Heading,
  Line,
  Media,
  Meta,
  Row,
  Schema,
  SmartLink,
  Text,
  Grid
} from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ImageFull,
  VideoLoop,
  YoutubeEmbed,
  SketchfabEmbed,
  ComparisonSlider,
  MarmosetViewer,
  Pano360,
  ImageGallery
} from "@/components/ProjectBlocks";

interface ProjectMediaItem {
  discriminant?:
    | "image"
    | "video"
    | "youtube"
    | "sketchfab"
    | "marmoset"
    | "compare"
    | "pano"
    | "gallery";
  discriminator?:
    | "image"
    | "video"
    | "youtube"
    | "sketchfab"
    | "marmoset"
    | "compare"
    | "pano"
    | "gallery";
  // biome-ignore lint/suspicious/noExplicitAny: generic media item value
  value: any;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "(site)", "work", "projects"]);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const posts = getPosts(["src", "app", "(site)", "work", "projects"]);
  const post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL: baseURL,
    image: post.metadata.image || `/api/og/generate?title=${post.metadata.title}`,
    path: `${work.path}/${post.slug}`,
  });
}

export default async function Project({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const post = getPosts(["src", "app", "(site)", "work", "projects"]).find(
    (post) => post.slug === slugPath,
  );

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  return (
    <Column as="section" maxWidth="xl" horizontal="center" gap="l">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={`${work.path}/${post.slug}`}
        title={post.metadata.title}
        description={post.metadata.summary}
        datePublished={post.metadata.publishedAt}
        dateModified={post.metadata.publishedAt}
        image={
          post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`
        }
      />

      <Row gap="32" m={{ direction: 'column' }}>
        {/* Left Column: Media & Content */}
        <Column fillWidth flex={3}>
          {/* Media Gallery */}
          <Column fillWidth gap="l" marginBottom="l">
            {post.metadata.media?.map((item: ProjectMediaItem, index: number) => {
              const type = item.discriminant || item.discriminator;
              const key = `${type}-${index}`;
              switch (type) {
                case 'image':
                  return <ImageFull key={key} src={item.value.image} caption={item.value.caption} />;
                case 'gallery':
                  return <ImageGallery key={key} images={item.value.images} columns={item.value.columns} />;
                case 'video':
                  return <VideoLoop key={key} src={item.value.video || item.value.src} autoPlay={item.value.autoPlay} muted={item.value.muted} loop={item.value.loop} caption={item.value.caption} />;
                case 'youtube':
                  return <YoutubeEmbed key={key} url={item.value.url} />;
                case 'sketchfab':
                  return <SketchfabEmbed key={key} url={item.value.url} />;
                case 'marmoset':
                  return <MarmosetViewer key={key} src={item.value.manualPath || item.value.src} height={item.value.height} autoStart={item.value.autoStart} />;
                case 'compare':
                  return <ComparisonSlider key={key} leftImage={item.value.leftImage} rightImage={item.value.rightImage} />;
                case 'pano':
                  return <Pano360 key={key} image={item.value.image} caption={item.value.caption} />;
                default:
                  return null;
              }
            })}
          </Column>
        </Column>

        {/* Right Column: Sidebar */}
        <Column fillWidth flex={1} style={{ height: 'fit-content', position: 'sticky', top: '2rem' }}>
            {/* Header Info */}
            <Heading variant="display-strong-s">{post.metadata.title}</Heading>
            
            {/* Author / Profile */}
            <Row gap="s" vertical="center">
                 {avatars.length > 0 ? (
                    <AvatarGroup size="m" avatars={avatars} />
                 ) : (
                    // Default avatar fallback if needed, or just hide
                     <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#333' }} />
                 )}
                 <Column>
                    <Text variant="body-strong-m">Igrom4ik</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">3D Environment Artist</Text>
                 </Column>
            </Row>

            <Line />

            {/* Actions */}
            <Row gap="s">
                <Button fillWidth variant="primary">Follow</Button>
                <Button variant="secondary" prefixIcon="bookmark" />
            </Row>

            {/* Description */}
             <Text variant="body-default-m" onBackground="neutral-medium">
                {post.metadata.summary}
            </Text>

            {/* Software Used */}
            {post.metadata.software && post.metadata.software.length > 0 && (
                 <Column gap="xs">
                    <Text variant="label-strong-s" onBackground="neutral-weak">Software Used</Text>
                    <Row gap="xs" wrap>
                        {post.metadata.software.map((sw) => (
                             <Text key={sw} variant="label-default-s" style={{ padding: '4px 8px', background: 'var(--neutral-alpha-weak)', borderRadius: '4px' }}>
                                {sw}
                            </Text>
                        ))}
                    </Row>
                 </Column>
            )}

             {/* Tags */}
            {post.metadata.tags && post.metadata.tags.length > 0 && (
                 <Column gap="xs">
                    <Text variant="label-strong-s" onBackground="neutral-weak">Tags</Text>
                    <Row gap="xs" wrap>
                        {post.metadata.tags.map((tag) => (
                             <Text key={tag} variant="label-default-s" onBackground="neutral-weak">
                                #{tag}
                            </Text>
                        ))}
                    </Row>
                 </Column>
            )}
            
             <Line />

            {/* Meta */}
            <Column gap="xs">
                 <Text variant="label-default-s" onBackground="neutral-weak">Posted {formatDate(post.metadata.publishedAt)}</Text>
                 {post.metadata.artstation && (
                     <SmartLink href={post.metadata.artstation} target="_blank">
                        <Text variant="label-strong-s" style={{ color: '#13AFF0' }}>View on ArtStation</Text>
                     </SmartLink>
                 )}
            </Column>
        </Column>
      </Row>
      
      <ScrollToHash />
    </Column>
  );
}
