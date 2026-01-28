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

// Helper to normalize Marmoset paths
const normalizeMarmosetFilePath = (file: string) => {
  if (!file) return "";
  let normalized = file.replace(/\\/g, "/");
  const publicIndex = normalized.indexOf("/public/");
  if (publicIndex !== -1) {
    normalized = normalized.slice(publicIndex + "/public".length);
  }
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  return normalized;
};

export async function generateStaticParams() {
  const albums = await getAlbums();
  
  if (albums.length === 0) {
      // Fallback: Read directories from src/content/albums
      const albumsDir = path.join(process.cwd(), 'src/content/albums');
      if (fs.existsSync(albumsDir)) {
          const dirs = fs.readdirSync(albumsDir).filter(file => {
              return fs.statSync(path.join(albumsDir, file)).isDirectory();
          });
          return dirs.map(slug => ({ slug }));
      }
  }

  return albums.map((album: { slug: string }) => ({
    slug: album.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return {};
  
  return Meta.generate({
    title: album.title,
    description: `Проект: ${album.title}`,
    baseURL: baseURL,
    image: album.publishing?.cover || `/api/og/generate?title=${encodeURIComponent(album.title)}`,
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
    | { discriminant: 'image'; value: { src: string | null; alt?: string; caption?: string } }
    | { discriminant: 'video'; value: { src: string | null; autoPlay?: boolean; muted?: boolean; loop?: boolean } }
    | { discriminant: 'youtube'; value: { url: string | null } }
    | { discriminant: 'sketchfab'; value: { url: string | null } }
    | { discriminant: 'marmoset'; value: { src?: string | null; manualPath?: string | null } }
    | { discriminant: 'pano'; value: { image: string | null; caption?: string } };

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
                // ✅ Создаем уникальный ключ
                const uniqueKey = 
                  (item.discriminant === 'image' ? (item.value.src || '') : '') || 
                  (item.discriminant === 'video' ? item.value.src : '') ||
                  (item.discriminant === 'youtube' ? item.value.url : '') ||
                  (item.discriminant === 'sketchfab' ? item.value.url : '') ||
                  (item.discriminant === 'marmoset' ? (item.value.src || item.value.manualPath) : '') ||
                  (item.discriminant === 'pano' ? item.value.image : '') ||
                  `media-${index}`;

                if (item.discriminant === 'image') {
                    if (!item.value.src) return null;
                    return (
                        <Media
                            key={uniqueKey}
                            src={item.value.src}
                            alt={item.value.alt || album.title}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                            enlarge
                        />
                    );
                }
                if (item.discriminant === 'video') {
                    if (!item.value.src) return null;
                    return (
                        <VideoLoop 
                            key={uniqueKey}
                            src={item.value.src}
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
                    const mviewPath = normalizeMarmosetFilePath(item.value.src || item.value.manualPath || '');
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
                    if (!item.value.image) return null;
                    return <Pano360 key={uniqueKey} image={item.value.image} caption={item.value.caption} />;
                }
                return null;
             })}
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
