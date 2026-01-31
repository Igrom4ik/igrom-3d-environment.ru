import Link from "next/link";
import { getPosts } from "@/utils/utils";

export default async function BlogIndexPage() {
  const posts = getPosts(["src", "app", "(site)", "blog", "posts"]);

  const sorted = posts.sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime(),
  );

  return (
    <main style={{ padding: "80px 24px 120px" }}>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "0 4px",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 26px)",
              color: "#f4f5ff",
            }}
          >
            Dev‑blog
          </h1>
          <span style={{ fontSize: 13, color: "#8c92b0" }}>
            {sorted.length} записей
          </span>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: 20,
          }}
        >
          {sorted.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                textDecoration: "none",
              }}
            >
              <article
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  background:
                    "linear-gradient(145deg, rgba(14,16,35,0.96), rgba(6,8,22,0.96))",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow:
                    "0 14px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {post.metadata.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.metadata.image}
                    alt={post.metadata.title}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                )}
                <div style={{ padding: "14px 14px 16px" }}>
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.14,
                      color: "#7f86a8",
                      marginBottom: 4,
                    }}
                  >
                    {new Date(post.metadata.publishedAt).toLocaleDateString()}
                  </div>
                  <h2
                    style={{
                      fontSize: 16,
                      color: "#f4f5ff",
                      margin: 0,
                      marginBottom: 6,
                    }}
                  >
                    {post.metadata.title}
                  </h2>
                  {post.metadata.summary && (
                    <p
                      style={{
                        margin: 0,
                        marginTop: 4,
                        fontSize: 13,
                        color: "#9ea3c1",
                      }}
                    >
                      {post.metadata.summary}
                    </p>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
