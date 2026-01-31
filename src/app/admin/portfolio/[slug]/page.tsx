import { getAlbums } from "@/utils/reader";
import ClientPage from "./ClientPage";
import { Suspense } from "react";

export async function generateStaticParams() {
  const albums = await getAlbums();
  const params = albums.map((album: { slug: string }) => ({
    slug: album.slug,
  }));
  
  // Add 'create' slug
  params.push({ slug: 'create' });
  
  return params;
}

export const dynamicParams = true;

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <ClientPage slug={slug} />
    </Suspense>
  );
}
