import { notFound } from "next/navigation";
import Link from "next/link";
import { getPosts } from "@/utils/utils";
import { mdxComponents } from "../mdxComponents";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft } from "lucide-react";
import styles from "./blog-post.module.css";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const posts = getPosts(["src", "app", "(site)", "blog", "posts"]);
  return posts.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const posts = getPosts(["src", "app", "(site)", "blog", "posts"]);
  const post = posts.find((p) => p.slug === slug);

  if (!post) return notFound();

  const { metadata, content } = post;

  // Split tags if they are a string
  const tags = Array.isArray(metadata.tag) 
    ? metadata.tag 
    : (metadata.tag ? metadata.tag.split(',').map((t: string) => t.trim()) : []);

  return (
    <main className={styles.container}>
      <div className={styles.layout}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <Link href="/blog" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          {metadata.image && (
            <div className={styles.coverImageWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={metadata.image} 
                alt={metadata.title} 
                className={styles.coverImage} 
              />
            </div>
          )}

          <div className={styles.metaSection}>
            <div className={styles.metaLabel}>Published</div>
            <div className={styles.metaValue}>
              {new Date(metadata.publishedAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {tags.length > 0 && (
            <div className={styles.metaSection}>
              <div className={styles.metaLabel}>Tags</div>
              <div className={styles.tagsWrapper}>
                {tags.map((tag: string) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <article className={styles.article}>
          <header style={{ marginBottom: 40 }}>
            <h1 className={styles.title}>{metadata.title}</h1>
            {metadata.summary && (
              <p className={styles.summary}>{metadata.summary}</p>
            )}
          </header>

          <section className={styles.content}>
            <MDXRemote source={content} components={mdxComponents as any} />
          </section>
        </article>
      </div>
    </main>
  );
}
