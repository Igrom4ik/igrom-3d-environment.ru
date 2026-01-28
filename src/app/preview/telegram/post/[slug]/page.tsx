import { getPosts } from "@/utils/utils";
import ClientPage from "./ClientPage";

export async function generateStaticParams() {
  const posts = getPosts(["src", "app", "(site)", "blog", "posts"]);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export const dynamicParams = false;

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <ClientPage slug={slug} />;
}
