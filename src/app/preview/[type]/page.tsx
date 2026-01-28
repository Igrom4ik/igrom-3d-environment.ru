import { PageBuilder } from "../../../components/PageBuilder";
import type { PageBlock } from "../../../components/PageBuilder";
import { getHomeSettings, getWorkSettings } from "../../../utils/reader";
import { Column } from "@once-ui-system/core";
import About from "../../(site)/about/page";
import Gallery from "../../(site)/gallery/page";

import Work from "../../(site)/work/page";
import Blog from "../../(site)/blog/page";

interface PreviewPageProps {
  params: Promise<{
    type: string;
  }>;
}

export async function generateStaticParams() {
  return [
    { type: 'home' },
    { type: 'work' },
    { type: 'blog' },
    { type: 'about' },
    { type: 'gallery' },
  ];
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { type } = await params;

  let blocks: PageBlock[] = [];

  switch (type) {
    case 'home':
      {
        const homeSettings = await getHomeSettings();
        const maybeBlocks =
          (homeSettings as { blocks?: PageBlock[]; home?: PageBlock[] } | undefined)?.blocks ??
          (homeSettings as { blocks?: PageBlock[]; home?: PageBlock[] } | undefined)?.home;
        const nextBlocks = Array.isArray(maybeBlocks) ? maybeBlocks : [];
        blocks = nextBlocks;
      }
      break;
    case 'work':
      return <Work />;
    case 'blog':
      return <Blog />;
    case 'about':
      return <About />;
    case 'gallery':
      return <Gallery />;
    default:
      return (
        <Column fillWidth padding="l" horizontal="center" align="center">
          <h1>Preview</h1>
          <p>Please select a page to preview.</p>
        </Column>
      );
  }

  if (!blocks || blocks.length === 0) {
    return (
      <Column fillWidth padding="l" horizontal="center" align="center">
        <h1>Empty Preview</h1>
        <p>No blocks found for {type}. Add some blocks in the editor.</p>
      </Column>
    );
  }

  return (
    <Column fillWidth>
      <PageBuilder blocks={blocks} />
    </Column>
  );
}
