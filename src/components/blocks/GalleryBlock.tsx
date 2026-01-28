import { Button, Column, Heading, Row } from "@once-ui-system/core";
import GalleryView from "@/components/gallery/GalleryView";
import { getAlbums } from "@/utils/reader";
import { gallery as galleryResource } from "@/resources";

type Orientation = 'horizontal' | 'vertical';
type GalleryImage = { src: string; alt: string; orientation: Orientation };

interface GalleryBlockProps {
  data: {
    title?: string;
    limit?: number;
  };
}

export async function GalleryBlock({ data }: GalleryBlockProps) {
  const { title, limit } = data;
  const albums = await getAlbums();
  
  // Map albums to GalleryImage format using cover
  const albumImages: GalleryImage[] = albums.map((album) => ({
    src: album.entry.publishing.cover || '',
    alt: album.entry.title || '',
    orientation: 'horizontal' as Orientation, // Covers are usually horizontal or we default to it
  })).filter(img => !!img.src);

  // Use CMS albums or fallback to resource images
  const allImages: GalleryImage[] = albumImages.length > 0 
    ? albumImages 
    : (galleryResource.images as GalleryImage[]);

  // Apply limit
  const displayImages = allImages.slice(0, limit || 6);

  return (
    <Column fillWidth gap="m" paddingBottom="40">
      <Row horizontal="between" align="center">
        <Heading variant="heading-strong-l">{title || "Latest Work"}</Heading>
        <Button href="/gallery" variant="tertiary" label="View All" suffixIcon="arrowRight" />
      </Row>
      <GalleryView images={displayImages} />
    </Column>
  );
}
