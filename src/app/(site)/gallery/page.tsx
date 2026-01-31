import { baseURL, gallery, person } from "@/resources";
import { getGallerySettings, getAlbums } from "@/utils/reader";
import { Flex, Meta, Schema } from "@once-ui-system/core";
import GalleryPage from "@/components/gallery/GalleryPage";

export const dynamic = 'force-dynamic';

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
  const allAlbums = await getAlbums();
  const albums = allAlbums.filter((album: any) => !album.entry.hidden);
  
  const title = settings?.title || gallery.title;
  const description = settings?.description || gallery.description;

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
      
      <GalleryPage 
        title={title} 
        description={description} 
        albums={albums} 
      />
    </Flex>
  );
}
