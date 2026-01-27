import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { Projects } from "@/components/work/Projects";
import { about, baseURL, home, person } from "@/resources";
import { getHomeSettings } from "@/utils/reader";
import {
  Column,
  Line,
  Meta,
  Schema,
} from "@once-ui-system/core";
import { PageBuilder } from "@/components/PageBuilder";
import type { PageBlock } from "@/components/PageBuilder";
import { HeroBlock } from "@/components/blocks/HeroBlock";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default async function Home() {
  const settings = await getHomeSettings();
  
  // Check if home blocks exist
  const homeBlocks = (Array.isArray(settings?.blocks) ? settings.blocks : []) as PageBlock[];
  
  // Fallback for empty blocks
  const showFallback = homeBlocks.length === 0;

  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      
      {showFallback ? (
         // Legacy Layout Fallback
        <Column fillWidth horizontal="center" gap="m">
            <HeroBlock
              data={{
                content: {
                  headline: home.headline as string,
                },
              }}
            />
        </Column>
      ) : (
        // Dynamic Blocks Renderer
        <Column fillWidth gap="l">
          <PageBuilder blocks={homeBlocks} />
        </Column>
      )}

      {/* Legacy Hardcoded Sections (only show if no blocks are present to avoid duplication) */}
      {showFallback && (
        <>
          <Projects range={[1, 1]} />
          <Posts range={[1, 2]} columns="2" />
          <Line />
          <Mailchimp />
        </>
      )}
    </Column>
  );
}
