import { ThumbnailCard } from "@/components";
import { getPosts } from "@/utils/utils";
import { Grid } from "@once-ui-system/core";

interface PostsProps {
  range?: [number] | [number, number];
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
  direction?: "row" | "column";
  exclude?: string[];
}

export function Posts({
  range,
  columns = "1",
  thumbnail = false,
  exclude = [],
  direction,
}: PostsProps) {
  let allBlogs = getPosts(["src", "app", "(site)", "blog", "posts"]);

  // Exclude by slug (exact match)
  if (exclude && exclude.length > 0) {
    allBlogs = allBlogs.filter((post) => !exclude.includes(post.slug));
  }

  const sortedBlogs = allBlogs.sort((a, b) => {
    return (
      new Date(b.metadata.publishedAt || 0).getTime() -
      new Date(a.metadata.publishedAt || 0).getTime()
    );
  });

  const displayedBlogs = range
    ? sortedBlogs.slice(range[0] - 1, range.length === 2 ? range[1] : sortedBlogs.length)
    : sortedBlogs;

  return (
    <>
      {displayedBlogs.length > 0 && (
        <Grid
          columns={columns}
          m={{ columns: 2 }}
          s={{ columns: 1 }}
          fillWidth
          marginBottom="40"
          gap="m"
        >
          {displayedBlogs.map((post) => (
            <ThumbnailCard
              key={post.slug}
              href={`/blog/${post.slug}`}
              image={post.metadata.image || ""}
              title={post.metadata.title}
              tag={post.metadata.tag}
            />
          ))}
        </Grid>
      )}
    </>
  );
}
