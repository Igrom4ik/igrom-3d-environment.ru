import { getAlbum } from '@/utils/reader';
import { Column, Row, Media, Heading, SmartLink, Text } from "@once-ui-system/core";
import { BlogImageGallery } from './BlogBlocks';

export const BlogGalleryAlbum = async ({ album }: { album: string }) => {
    if (!album) return null;
    const data = await getAlbum(album);
    if (!data) return null;

    const images = (data.images || []).map((img) => {
         if (img.discriminant === 'image') return img.value.src;
         return null;
    }).filter(Boolean) as string[];

    return (
        <Column fillWidth gap="16" marginBottom="32" padding="16" border="neutral-alpha-weak" radius="l" background="neutral-alpha-weak">
             <Row gap="16" vertical="center" marginBottom="16">
                 {data.publishing.cover && (
                     <Media src={data.publishing.cover} alt={data.title} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-m)' }} />
                 )}
                 <Column>
                    <Heading variant="heading-strong-m">{data.title}</Heading>
                    <SmartLink href={`/gallery/${album}`}>
                        <Text variant="label-default-s" onBackground="brand-strong">Открыть альбом &rarr;</Text>
                    </SmartLink>
                 </Column>
             </Row>
             <BlogImageGallery images={images.slice(0, 4)} columns="4" />
             {images.length > 4 && (
                 <Text variant="body-default-xs" align="center" onBackground="neutral-weak">
                     Еще {images.length - 4} изображений...
                 </Text>
             )}
        </Column>
    );
};
