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
  Pano360
} from "@/components/ProjectBlocks";

interface ProjectMediaItem {
  discriminator: "image" | "video" | "youtube" | "sketchfab" | "marmoset" | "compare" | "pano";
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
    <Column as="section" maxWidth="m" horizontal="center" gap="l">
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
      
      {/* Header Section */}
      <Column fillWidth gap="m" horizontal="start">
        <Row fillWidth horizontal="between" vertical="center">
            <Heading variant="display-strong-s">{post.metadata.title}</Heading>
            {post.metadata.artstation && (
                <SmartLink href={post.metadata.artstation} target="_blank">
                    <Button variant="secondary" size="s" prefixIcon="arrowUpRight">
                        Artstation
                    </Button>
                </SmartLink>
            )}
        </Row>
        <Text variant="body-default-m" onBackground="neutral-medium">
          {post.metadata.summary}
        </Text>
        
        {/* Metadata: Date, Software, Team */}
        <Row gap="l" vertical="center" wrap>
            <Text variant="label-default-s" onBackground="neutral-weak">
                {formatDate(post.metadata.publishedAt)}
            </Text>
            {post.metadata.software && post.metadata.software.length > 0 && (
                <Row gap="8" vertical="center">
                    <Text variant="label-default-s" onBackground="neutral-weak">Software:</Text>
                    {post.metadata.software.map((sw) => (
                        <Text key={sw} variant="label-default-s" style={{ padding: '4px 8px', background: 'var(--neutral-alpha-weak)', borderRadius: '4px' }}>
                            {sw}
                        </Text>
                    ))}
                </Row>
            )}
        </Row>
      </Column>

      <Line />

      {/* Media Gallery (Artstation Style) */}
      <Column fillWidth gap="l" marginBottom="l">
        {post.metadata.media?.map((item: ProjectMediaItem, index: number) => {
            const key = `${item.discriminator}-${index}`;
            switch (item.discriminator) {
                case 'image':
                    return <ImageFull key={key} src={item.value.image} caption={item.value.caption} />;
                case 'video':
                    return <VideoLoop key={key} src={item.value.src} autoPlay={item.value.autoPlay} muted={item.value.muted} loop={item.value.loop} />;
                case 'youtube':
                    return <YoutubeEmbed key={key} url={item.value.url} />;
                case 'sketchfab':
                    return <SketchfabEmbed key={key} url={item.value.url} />;
                case 'marmoset':
                    return <MarmosetViewer key={key} src={item.value.src} width={item.value.width} height={item.value.height} autoStart={item.value.autoStart} />;
                case 'pano':
                    return <Pano360 key={key} image={item.value.image} caption={item.value.caption} />;
                case 'compare':
                    return <ComparisonSlider key={key} leftImage={item.value.leftImage} rightImage={item.value.rightImage} />;
                default:
                    return null;
            }
        })}
      </Column>

      {/* Main Content */}
      <Column fillWidth>
        <CustomMDX source={post.content} />
      </Column>

      <ScrollToHash />
    </Column>
  );
}
