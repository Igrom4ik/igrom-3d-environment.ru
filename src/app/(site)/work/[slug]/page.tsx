import { CustomMDX, ScrollToHash } from "@/components";
import { Projects } from "@/components/work/Projects";
import { about, baseURL, person, work } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { getPosts } from "@/utils/utils";
import {
  AvatarGroup,
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

interface ProjectMediaItem {
  discriminator: "image" | "video" | "youtube" | "sketchfab";
  value: {
    image?: string;
    caption?: string;
    src?: string;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    url?: string;
  };
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
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column maxWidth="s" gap="16" horizontal="center" align="center">
        <SmartLink href="/work">
          <Text variant="label-strong-m">Projects</Text>
        </SmartLink>
        <Text variant="body-default-xs" onBackground="neutral-weak" marginBottom="12">
          {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
        </Text>
        <Heading variant="display-strong-m">{post.metadata.title}</Heading>
      </Column>
      <Row marginBottom="32" horizontal="center">
        <Row gap="16" vertical="center">
          {post.metadata.team && <AvatarGroup reverse avatars={avatars} size="s" />}
          <Text variant="label-default-m" onBackground="brand-weak">
            {post.metadata.team?.map((member, idx) => (
              <span key={member.name || idx}>
                {idx > 0 && (
                  <Text as="span" onBackground="neutral-weak">
                    ,{" "}
                  </Text>
                )}
                <SmartLink href={member.linkedIn}>{member.name}</SmartLink>
              </span>
            ))}
          </Text>
        </Row>
      </Row>

      <Column fillWidth gap="24" marginBottom="40">
        {post.metadata.media && post.metadata.media.length > 0
          ? post.metadata.media.map((item: ProjectMediaItem, index: number) => {
              if (item.discriminator === "image") {
                return (
                  <Column key={item.value.image || index} fillWidth gap="8" horizontal="center">
                    <Media
                      src={item.value.image || ""}
                      alt={item.value.caption || post.metadata.title}
                      radius="m"
                      aspectRatio="16 / 9"
                      objectFit="cover"
                    />
                    {item.value.caption && (
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {item.value.caption}
                      </Text>
                    )}
                  </Column>
                );
              }
              if (item.discriminator === "video") {
                return (
                  <Column key={item.value.src || index} fillWidth>
                    <video
                      src={item.value.src}
                      autoPlay={item.value.autoPlay}
                      muted={item.value.muted}
                      loop={item.value.loop}
                      playsInline
                      controls
                      style={{ width: "100%", borderRadius: "var(--radius-m)" }}
                    />
                  </Column>
                );
              }
              if (item.discriminator === "youtube") {
                return (
                  <Column key={item.value.url || index} fillWidth>
                    <iframe
                      width="100%"
                      height="500"
                      src={item.value.url}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ borderRadius: "var(--radius-m)" }}
                    />
                  </Column>
                );
              }
              if (item.discriminator === "sketchfab") {
                return (
                  <Column key={item.value.url || index} fillWidth>
                    <iframe
                      width="100%"
                      height="600"
                      src={item.value.url}
                      title="Sketchfab Model"
                      frameBorder="0"
                      allow="autoplay; fullscreen; vr"
                      allowFullScreen
                      style={{ borderRadius: "var(--radius-m)" }}
                    />
                  </Column>
                );
              }
              return null;
            })
          : /* Fallback for legacy data: show all images */
            post.metadata.images.length > 0 &&
            post.metadata.images.map((img, index) => (
              <Media
                key={img || index}
                priority={index === 0}
                aspectRatio="16 / 9"
                radius="m"
                alt="image"
                src={img}
              />
            ))}
      </Column>

      <Column style={{ margin: "auto" }} as="article" maxWidth="xs">
        <CustomMDX source={post.content} />
      </Column>
      <Column fillWidth gap="40" horizontal="center" marginTop="40">
        <Line maxWidth="40" />
        <Heading as="h2" variant="heading-strong-xl" marginBottom="24">
          Related projects
        </Heading>
        <Projects exclude={[post.slug]} range={[2]} />
      </Column>
      <ScrollToHash />
    </Column>
  );
}
