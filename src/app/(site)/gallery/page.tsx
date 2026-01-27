import GalleryView from "@/components/gallery/GalleryView";
import { baseURL, gallery, person } from "@/resources";
import { getGallerySettings } from "@/utils/reader";
import { Flex, Meta, Schema } from "@once-ui-system/core";

type Orientation = 'horizontal' | 'vertical';
type ImageBlockValue = { src: string; alt?: string | null; orientation: Orientation };
type MarmosetBlockValue = { src?: string | null; manualPath?: string | null; alt?: string | null; orientation: Orientation };
type GalleryBlock =
  | { discriminant: 'image'; value: ImageBlockValue }
  | { discriminant: 'marmoset'; value: MarmosetBlockValue };
type GalleryImage = { src: string; alt: string; orientation: Orientation };

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
  const title = settings?.title || gallery.title;
  const description = settings?.description || gallery.description;
  
  const images: GalleryImage[] = settings?.images
    ? (settings.images as GalleryBlock[]).map((img) => {
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
    : (gallery.images as GalleryImage[]);

  return (
    <Flex maxWidth="l">
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
      <GalleryView images={images} />
    </Flex>
  );
}
