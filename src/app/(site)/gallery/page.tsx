import { baseURL, gallery, person } from "@/resources";
import { getGallerySettings, getAlbums } from "@/utils/reader";
import { Flex, Meta, Schema, Grid, Column, Heading, Text, SmartLink, Media, Tag, Row } from "@once-ui-system/core";

export async function generateMetadata() {
  const settings = await getGallerySettings();
  const title = settings?.title || gallery.title;
  const description = settings?.description || gallery.description;

  return Meta.generate({
    title,
    description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(title)}`,
    path: gallery.path,
  });
}

export default async function Gallery() {
  const settings = await getGallerySettings();
  const albums = await getAlbums();
  
  const title = settings?.title || gallery.title;
  const description = settings?.description || gallery.description;

  // Extract all unique tags
  const allTags = Array.from(new Set(albums.flatMap(album => album.entry.categorization?.tags || []))).sort();
  
  return (
    <Flex maxWidth="l" direction="column" gap="32" fillWidth>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={title}
        description={description}
        path={gallery.path}
        image={`/api/og/generate?title=${encodeURIComponent(title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${gallery.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      
      <Grid style={{ gridTemplateColumns: "260px 1fr" }} m={{columns: "1fr"}} gap="32">
        {/* SIDEBAR */}
        <Column gap="24" m={{ display: 'none' }}>
             <Column gap="16" padding="24" radius="l" background="surface" border="neutral-alpha-weak">
                <Heading variant="heading-strong-s">ФИЛЬТРЫ</Heading>
                
                <Column gap="8">
                    <Text variant="label-default-s" onBackground="neutral-weak">ТЕГИ</Text>
                    {allTags.length > 0 ? (
                        <Flex wrap gap="8">
                            {allTags.map(tag => (
                                <Tag key={tag} variant="neutral" size="s">{tag}</Tag>
                            ))}
                        </Flex>
                    ) : (
                        <Text variant="body-default-xs" onBackground="neutral-weak">Нет тегов</Text>
                    )}
                </Column>
             </Column>

             <Column gap="16" padding="24" radius="l" background="surface" border="neutral-alpha-weak">
                 <Heading variant="heading-strong-s">АЛЬБОМЫ</Heading>
                 <Column gap="8">
                    <SmartLink href="/gallery">
                        <Text variant="body-default-s" onBackground="brand-strong">Все проекты ({albums.length})</Text>
                    </SmartLink>
                 </Column>
             </Column>
        </Column>

        {/* MAIN CONTENT */}
        <Column fillWidth gap="32">
             <Column fillWidth gap="16">
                <Heading variant="display-strong-l">{title}</Heading>
                {description && (
                     <Text variant="body-default-l" onBackground="neutral-weak">{description}</Text>
                )}
             </Column>

              {albums.length > 0 ? (
                  <Grid columns="3" m={{columns: 2}} s={{columns: 1}} gap="16">
                    {albums.map((album) => (
                        <SmartLink key={album.slug} href={`/gallery/${album.slug}`} style={{ display: 'block' }}>
                            <Column 
                                fillWidth 
                                border="neutral-alpha-weak" 
                                radius="m" 
                                overflow="hidden" 
                                background="surface"
                                style={{ 
                                    transition: 'transform 0.2s, box-shadow 0.2s', 
                                    height: '100%',
                                }}
                            >
                                <div style={{ position: 'relative' }}>
                                    <Media 
                                        src={album.entry.publishing?.cover || ''} 
                                        aspectRatio="16/9" 
                                        alt={album.entry.title}
                                        style={{ objectFit: 'cover' }}
                                    />
                                    {/* Overlay Gradient on Hover could go here */}
                                </div>
                                
                                <Column padding="16" gap="8" fillHeight vertical="between">
                                     <Column gap="4">
                                        <Heading 
                                            variant="heading-strong-s" 
                                            style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 1,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {album.entry.title}
                                        </Heading>
                                        <Text variant="body-default-xs" onBackground="neutral-weak">{person.name}</Text>
                                     </Column>
                                     
                                     <Row vertical="center" horizontal="between">
                                         {album.entry.categorization?.tags && album.entry.categorization.tags.length > 0 && (
                                             <Text 
                                                 variant="body-default-xs" 
                                                 onBackground="neutral-weak"
                                                 style={{
                                                     display: '-webkit-box',
                                                     WebkitLineClamp: 1,
                                                     WebkitBoxOrient: 'vertical',
                                                     overflow: 'hidden'
                                                 }}
                                             >
                                                {album.entry.categorization.tags[0]} {album.entry.categorization.tags.length > 1 && `+${album.entry.categorization.tags.length - 1}`}
                                             </Text>
                                         )}
                                         <Text variant="body-default-xs" onBackground="brand-weak">
                                            Смотреть &rarr;
                                         </Text>
                                     </Row>
                                </Column>
                            </Column>
                        </SmartLink>
                    ))}
                  </Grid>
              ) : (
                  <Column fillWidth padding="32" background="neutral-alpha-weak" radius="l" align="center">
                      <Text>Проекты пока не созданы.</Text>
                  </Column>
              )}
        </Column>
      </Grid>
    </Flex>
  );
}
