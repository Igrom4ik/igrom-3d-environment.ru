import { getPosts } from "@/utils/utils";
import { Grid } from "@once-ui-system/core";
import { ThumbnailCard } from "@/components";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

export function Projects({ range, exclude }: ProjectsProps) {
  let allProjects = getPosts(["src", "app", "(site)", "work", "projects"]);

  // Exclude by slug (exact match)
  if (exclude && exclude.length > 0) {
    allProjects = allProjects.filter((post) => !exclude.includes(post.slug));
  }

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt || 0).getTime() - new Date(a.metadata.publishedAt || 0).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <Grid
      columns="3"
      tabletColumns="2"
      mobileColumns="1"
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
          image={post.metadata.image || (post.metadata.images && post.metadata.images.length > 0 ? post.metadata.images[0] : "")}
          title={post.metadata.title}
          tag={post.metadata.tag}
        />
      ))}
    </Grid>
  );
}
