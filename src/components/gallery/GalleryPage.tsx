"use client";

import { useState, useMemo } from 'react';
import { Flex, Grid, Column, Heading, Text, SmartLink, Media, Tag, Row, Button } from "@once-ui-system/core";
import { person } from "@/resources";

interface GalleryPageProps {
  title: string;
  description: string;
  albums: any[];
}

export default function GalleryPage({ title, description, albums }: GalleryPageProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    return Array.from(new Set(albums.flatMap((album: any) => album.entry.categorization?.tags || []))).sort() as string[];
  }, [albums]);

  // Filter albums
  const filteredAlbums = useMemo(() => {
    if (!selectedTag) return albums;
    return albums.filter((album: any) => 
      album.entry.categorization?.tags?.includes(selectedTag)
    );
  }, [albums, selectedTag]);

  return (
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
                                <Tag 
                                    key={tag} 
                                    variant={selectedTag === tag ? "brand" : "neutral"} 
                                    size="s"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                >
                                    {tag}
                                </Tag>
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
                    <div 
                        onClick={() => setSelectedTag(null)} 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <Text variant="body-default-s" onBackground={selectedTag === null ? "brand-strong" : "neutral-weak"}>
                            Все проекты ({albums.length})
                        </Text>
                    </div>
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

              {filteredAlbums.length > 0 ? (
                  <Grid columns="3" m={{columns: 2}} s={{columns: 1}} gap="16">
                    {filteredAlbums.map((album: any) => (
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
                                    {album.entry.publishing?.cover && (
                                        <Media 
                                            src={album.entry.publishing.cover} 
                                            aspectRatio="16/9" 
                                            alt={album.entry.title}
                                            style={{ objectFit: 'cover' }}
                                        />
                                    )}
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
                      <Text>Проекты не найдены.</Text>
                      {selectedTag && (
                          <div style={{ marginTop: '16px' }}>
                              <Button 
                                variant="secondary" 
                                size="s" 
                                onClick={() => setSelectedTag(null)}
                              >
                                  Сбросить фильтр
                              </Button>
                          </div>
                      )}
                  </Column>
              )}
        </Column>
      </Grid>
  );
}
