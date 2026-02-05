import { notFound } from "next/navigation";
import { getPosts } from "@/utils/utils";
import { mdxComponents } from "../../../(site)/blog/mdxComponents";
import { MDXRemote } from "next-mdx-remote/rsc";

type Params = { slug: string };

export async function generateStaticParams() {
  try {
    const posts = getPosts(["src", "app", "(site)", "blog", "posts"]);
    if (posts.length === 0) {
      return [{ slug: 'placeholder-preview' }];
    }
    return posts.map((p) => ({ slug: p.slug }));
  } catch (error) {
    console.error("Error in generateStaticParams for preview/post:", error);
    return [{ slug: 'placeholder-preview' }];
  }
}

export default async function PostPreview({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const posts = getPosts(["src", "app", "(site)", "blog", "posts"]);
  const post = posts.find((p) => p.slug === slug);

  if (!post) return notFound();

  const { metadata, content } = post;

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 16px 120px",
        minHeight: "100vh",
        background: "#050712", // Match the new dark theme
      }}
    >
        {/* Preview Banner */}
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#ffeb3b',
            color: 'black',
            textAlign: 'center',
            padding: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 9999,
            letterSpacing: '1px'
        }}>
            PREVIEW MODE
        </div>

      <article
        style={{
          maxWidth: 720,
          width: "100%",
          borderRadius: 24,
          padding: "clamp(24px, 5vw, 40px) clamp(16px, 4vw, 28px) 40px",
          background:
            "linear-gradient(145deg, rgba(9,12,28,0.98), rgba(4,6,16,0.98))",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <header style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 0.14,
              textTransform: "uppercase",
              color: "#7f86a8",
              marginBottom: 6,
            }}
          >
            Devlog • {new Date(metadata.publishedAt).toLocaleDateString()}
          </div>
          <h1
            style={{
              fontSize: "clamp(22px, 5vw, 28px)",
              lineHeight: 1.2,
              margin: 0,
              color: "#f4f5ff",
            }}
          >
            {metadata.title}
          </h1>
          {metadata.summary && (
            <p
              style={{
                marginTop: 12,
                fontSize: "clamp(14px, 4vw, 15px)",
                color: "#a7adc7",
                lineHeight: 1.6,
              }}
            >
              {metadata.summary}
            </p>
          )}
        </header>

        <section
          style={{
            fontSize: "clamp(15px, 4vw, 16px)",
            lineHeight: 1.7,
            color: "#cdd2eb",
          }}
        >
          <MDXRemote source={content} components={mdxComponents as any} />
        </section>
      </article>
    </main>
  );
}
