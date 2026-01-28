import { ThumbnailCard } from "@/components";
import { getPosts } from "@/utils/utils";
import type { Metadata } from "@/types";
import { Grid } from "@once-ui-system/core";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
  slugs?: string[] | null;
}

interface Project {
  slug: string;
  metadata: Metadata;
  content: string;
}

export function Projects({ range, exclude, slugs }: ProjectsProps) {
  const allProjects: Project[] = getPosts(["src", "app", "(site)", "work", "projects"]);

  let displayedProjects: Project[] = [];

  // If manual slugs provided, filter and sort by them (preserving order)
  if (slugs && slugs.length > 0) {
    // Create a map for O(1) lookup
    const projectMap = new Map(allProjects.map((p) => [p.slug, p]));
    
    // Map slugs to projects, filtering out any that don't exist
    displayedProjects = slugs
      .map(slug => projectMap.get(slug))
      .filter((p): p is typeof allProjects[0] => Boolean(p));
      
  } else {
    // Default behavior: sort by date
    displayedProjects = allProjects.sort((a, b) => {
      return (
        new Date(b.metadata.publishedAt || 0).getTime() -
        new Date(a.metadata.publishedAt || 0).getTime()
      );
    });
  }

  // Exclude by slug (exact match)
  if (exclude && exclude.length > 0) {
    displayedProjects = displayedProjects.filter((post) => !exclude.includes(post.slug));
  }

  // Apply range if provided (and not using manual slugs, or apply it on top?)
  // Usually if manual slugs are provided, we show exactly those.
  // But let's apply range if strictly provided.
  if (range && !slugs) {
    displayedProjects = displayedProjects.slice(range[0] - 1, range[1] ?? displayedProjects.length);
  }

  if (displayedProjects.length === 0) {
      return null;
  }

  return (
    <Grid
      columns="3"
      m={{ columns: 2 }}
      s={{ columns: 1 }}
      fillWidth
      gap="m"
      marginBottom="40"
      paddingX="l"
    >
      {displayedProjects.map((post, index) => (
        <ThumbnailCard
          priority={index < 2}
          key={post.slug}
          href={`/work/${post.slug}`}
          image={
            post.metadata.cover ||
            post.metadata.image ||
            (post.metadata.images && post.metadata.images.length > 0 ? post.metadata.images[0] : "")
          }
          title={post.metadata.title}
          tag={
            Array.isArray(post.metadata.tag)
              ? post.metadata.tag.length > 0
                ? post.metadata.tag[0]
                : undefined
              : post.metadata.tag
          }
        />
      ))}
    </Grid>
  );
}
