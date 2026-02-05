import { getAlbums, getRawAlbum } from "@/utils/reader";
import ClientPage from "./ClientPage";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  
  let initialData = null;
  if (slug !== 'create') {
      initialData = getRawAlbum(slug);
  }

  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <ClientPage slug={slug} initialData={initialData} />
    </Suspense>
  );
}
