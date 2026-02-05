import { getAlbum, getAlbums } from "@/utils/reader";
import { notFound } from "next/navigation";
import fs from 'fs';
import path from 'path';
import { Flex, Heading, Column, Button, SmartLink, Grid, Text, Tag, Avatar, Media } from "@once-ui-system/core";
import { DocumentRenderer } from '@keystatic/core/renderer';
import { baseURL, gallery, person } from "@/resources";
import { Meta } from "@once-ui-system/core";
import { VideoLoop, YoutubeEmbed, SketchfabEmbed, MarmosetViewer, Pano360 } from "@/components/ProjectBlocks";
import { log } from "@/utils/logger";
import { LikeButton, CommentSection } from "@/components";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

import { resolveAssetPath } from "@/utils/utils";

// Helper to normalize media paths with basePath support
const normalizePath = (file: string) => {
  if (!file || file.startsWith('http')) return file;
  let normalized = file.replace(/\\/g, "/");
  const publicIndex = normalized.indexOf("/public/");
  if (publicIndex !== -1) {
    normalized = normalized.slice(publicIndex + "/public".length);
  }
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (basePath && !normalized.startsWith(basePath)) {
    normalized = `${basePath}${normalized}`;
  }
  return normalized;
};

export async function generateStaticParams() {
  console.log('🔍 Generating static params for gallery...');
  
  // Hardcoded slugs to ensure they are always generated during static export
  const staticSlugs = [
    { slug: 'main-gallery' },
    { slug: 'military-hat' },
  ];

  try {
    const albums = await getAlbums();
    console.log('📦 Albums found in DB/Filesystem:', albums.length);
    
    if (albums && albums.length > 0) {
      const dbSlugs = albums.map((album: { slug: string }) => ({
        slug: album.slug,
      }));
      
      // Combine hardcoded and DB slugs, removing duplicates
      const allSlugs = [...staticSlugs];
      dbSlugs.forEach((dbSlug: { slug: string }) => {
        if (!allSlugs.some(s => s.slug === dbSlug.slug)) {
          allSlugs.push(dbSlug);
        }
      });
      
      console.log('🚀 Total slugs to generate:', allSlugs.length);
      return allSlugs;
    }
  } catch (error) {
    console.error('❌ Error fetching albums in generateStaticParams:', error);
  }

  console.warn('⚠️ Using only hardcoded slugs for gallery');
  return staticSlugs;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return {};
  
  const coverImage = album.publishing?.cover ? normalizePath(album.publishing.cover) : `/api/og/generate?title=${encodeURIComponent(album.title)}`;

  return Meta.generate({
    title: album.title,
    description: `Проект: ${album.title}`,
    baseURL: baseURL,
    image: coverImage,
    path: `${gallery.path}/${slug}`,
  });
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  log(`Rendering AlbumPage for slug: ${slug}`);

  const album = await getAlbum(slug);
  
  if (!album) {
      log(`Album not found for slug: ${slug}, triggering notFound()`);
      notFound();
  }

  log(`Album found: ${album.title}. Images count: ${album.images?.length || 0}`);
  const description = await album.description();

  // ✅ Типизация для изображений (объединение всех типов медиа)
  type AlbumMediaItem = 
    | { discriminant: 'image'; value: { src: string | null; file?: string; folder?: string; alt?: string; caption?: string } }
    | { discriminant: 'video'; value: { src: string | null; file?: string; folder?: string; autoPlay?: boolean; muted?: boolean; loop?: boolean } }
    | { discriminant: 'youtube'; value: { url: string | null } }
    | { discriminant: 'sketchfab'; value: { url: string | null } }
    | { discriminant: 'marmoset'; value: { src?: string | null; file?: string; folder?: string; manualPath?: string | null } }
    | { discriminant: 'pano'; value: { image: string | null; file?: string; folder?: string; caption?: string } };

  const projectFolder = album.projectFolder || "";

  return (
    <Flex maxWidth="l" direction="column" gap="32" fillWidth>
       <Column>
          <SmartLink href="/gallery">
              <Button prefixIcon="chevronLeft" variant="tertiary" size="s">Назад к портфолио</Button>
          </SmartLink>
       </Column>

       {/* ✅ ИСПРАВЛЕНИЕ 1: Используйте style вместо columns="3fr 1fr" */}
       <div 
         className="main-sidebar-layout"
         style={{ 
            display: 'grid', 
            gridTemplateColumns: '3fr 1fr', 
            gap: '48px',
            alignItems: 'start',
            width: '100%' 
         }}
       >
          {/* LEFT COLUMN: MEDIA */}
          <Column fillWidth gap="4">
             {album.images?.map((item: AlbumMediaItem, index: number) => {
                const resolveSrc = (val: any) => {
                    if (val.file && projectFolder) {
                        const resolved = resolveAssetPath({ file: val.file, folder: val.folder }, projectFolder);
                        return normalizePath(resolved);
                    }
                    return normalizePath(val.src || val.image || val.manualPath || val.url || "");
                };

                const uniqueKey = `media-${index}`;

                if (item.discriminant === 'image') {
                    const src = resolveSrc(item.value);
                    if (!src) return null;
                    return (
                        <Media
                            key={uniqueKey}
                            src={src}
                            alt={item.value.alt || album.title}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                            enlarge
                        />
                    );
                }
                if (item.discriminant === 'video') {
                    const src = resolveSrc(item.value);
                    if (!src) return null;
                    return (
                        <VideoLoop 
                            key={uniqueKey}
                            src={src}
                            autoPlay={item.value.autoPlay}
                            muted={item.value.muted}
                            loop={item.value.loop}
                        />
                    );
                }
                if (item.discriminant === 'youtube') {
                    if (!item.value.url) return null;
                    return <YoutubeEmbed key={uniqueKey} url={item.value.url} />;
                }
                if (item.discriminant === 'sketchfab') {
                    if (!item.value.url) return null;
                    return <SketchfabEmbed key={uniqueKey} url={item.value.url} />;
                }
                if (item.discriminant === 'marmoset') {
                    const mviewPath = resolveSrc(item.value);
                    if (!mviewPath) return null;
                    return (
                        <MarmosetViewer 
                            key={uniqueKey}
                            src={mviewPath}
                            autoStart={false}
                            height="600px"
                        />
                    );
                }
                if (item.discriminant === 'pano') {
                    const normalizedImage = resolveSrc(item.value);
                    if (!normalizedImage) return null;
                    return <Pano360 key={uniqueKey} image={normalizedImage} caption={item.value.caption} />;
                }
                return null;
             })}

             {/* COMMENTS */}
             <CommentSection projectSlug={slug} />
          </Column>

          {/* RIGHT COLUMN: SIDEBAR */}
          <Column fillWidth gap="32" style={{ position: 'sticky', top: '24px', height: 'fit-content' }}>
             {/* HEADER INFO */}
             <Column gap="16">
                 <Heading variant="heading-strong-xl">{album.title}</Heading>
                <Flex gap="12" vertical="center">
                     <Avatar src={person.avatar} size="m" />
                     <Column>
                         <Text variant="label-strong-m">{person.name}</Text>
                         <Text variant="body-default-xs" onBackground="neutral-weak">{person.role}</Text>
                     </Column>
                 </Flex>
                 
                 {/* LIKE BUTTON */}
                 <LikeButton projectSlug={slug} />
             </Column>

             {/* DESCRIPTION */}
             {description && (Array.isArray(description) ? description.length > 0 : true) && (
                 <Column gap="8">
                     <Text variant="label-strong-s" onBackground="neutral-weak">ОПИСАНИЕ</Text>
                     <DocumentRenderer document={description} />
                 </Column>
             )}

             {/* SOFTWARE */}
             {album.categorization?.software && album.categorization.software.length > 0 && (
                 <Column gap="8">
                     <Text variant="label-strong-s" onBackground="neutral-weak">СОФТ</Text>
                     <Flex gap="8" wrap>
                         {album.categorization.software.map((soft: string) => (
                             <Tag key={soft} variant="neutral" size="s">{soft}</Tag>
                         ))}
                     </Flex>
                 </Column>
             )}

             {/* TAGS */}
             {album.categorization?.tags && album.categorization.tags.length > 0 && (
                 <Column gap="8">
                     <Text variant="label-strong-s" onBackground="neutral-weak">ТЕГИ</Text>
                     <Flex gap="8" wrap>
                         {album.categorization.tags.map((tag: string) => (
                             <Tag key={tag} variant="brand" size="s">#{tag}</Tag>
                         ))}
                     </Flex>
                 </Column>
             )}
             
             {/* LINKS */}
             {album.publishing?.artstation && (
                 <SmartLink href={album.publishing.artstation} target="_blank">
                     <Button fillWidth prefixIcon="arrowUpRight" variant="secondary">Смотреть на ArtStation</Button>
                 </SmartLink>
             )}
          </Column>
       </div>
    </Flex>
  );
}
