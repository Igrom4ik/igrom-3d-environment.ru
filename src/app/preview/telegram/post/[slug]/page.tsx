import { getPosts } from "@/utils/utils";
import ClientPage from "./ClientPage";
import { ContentService } from "@/core/content/ContentService";

export async function generateStaticParams() {
  try {
    const posts = await ContentService.getAllTelegramPosts();
    if (posts.length === 0) {
      return [{ slug: 'placeholder-telegram' }];
    }
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error in generateStaticParams for preview/telegram/post:", error);
    return [{ slug: 'placeholder-telegram' }];
  }
}

export const dynamicParams = false;

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <ClientPage slug={slug} />;
}
