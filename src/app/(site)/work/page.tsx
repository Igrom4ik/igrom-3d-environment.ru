import { Projects } from "@/components/work/Projects";
import { about, baseURL, person, work } from "@/resources";
import { getWorkSettings } from "@/utils/reader";
import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import { PageBuilder } from "@/components/PageBuilder";

export async function generateMetadata() {
  const settings = await getWorkSettings();
  const title = settings?.title || work.title;
  const description = settings?.description || work.description;

  return Meta.generate({
    title,
    description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(title)}`,
    path: work.path,
  });
}

export default async function Work() {
  const settings = await getWorkSettings();
  const title = settings?.title || work.title;
  const description = settings?.description || work.description;
  const blocks = Array.isArray(settings?.blocks) ? settings.blocks : [];
  const showFallback = blocks.length === 0;

  return (
    <Column fillWidth maxWidth="l" paddingTop="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={work.path}
        title={title}
        description={description}
        image={`/api/og/generate?title=${encodeURIComponent(title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        {title}
      </Heading>
      
      {showFallback ? (
        <Projects />
      ) : (
        <PageBuilder blocks={blocks} />
      )}
    </Column>
  );
}
