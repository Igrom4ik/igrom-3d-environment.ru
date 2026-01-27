import React from 'react';
import { Button, Column, Heading, Row } from "@once-ui-system/core";
import GalleryView from "@/components/gallery/GalleryView";
import { getGallerySettings } from "@/utils/reader";
import { gallery as galleryResource } from "@/resources";

type Orientation = 'horizontal' | 'vertical';
type ImageBlockValue = { src: string; alt?: string | null; orientation: Orientation };
type MarmosetBlockValue = { src?: string | null; manualPath?: string | null; alt?: string | null; orientation: Orientation };
type GalleryBlockUnion =
  | { discriminant: 'image'; value: ImageBlockValue }
  | { discriminant: 'marmoset'; value: MarmosetBlockValue };
type GalleryImage = { src: string; alt: string; orientation: Orientation };

interface GalleryBlockProps {
  data: {
    title?: string;
    limit?: number;
  };
}

export async function GalleryBlock({ data }: GalleryBlockProps) {
  const { title, limit } = data;
  const settings = await getGallerySettings();
  
  // Use CMS images or fallback to resource images
  const allImages: GalleryImage[] = settings?.images
    ? (settings.images as GalleryBlockUnion[]).map((img) => {
        if (img.discriminant === 'marmoset') {
          return {
            src: img.value.manualPath || img.value.src || '',
            alt: img.value.alt ?? '',
            orientation: img.value.orientation,
          };
        }
        return {
          src: img.value.src || '',
          alt: img.value.alt ?? '',
          orientation: img.value.orientation,
        };
      })
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
