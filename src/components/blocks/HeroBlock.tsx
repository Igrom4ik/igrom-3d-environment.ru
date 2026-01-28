import type { ReactNode } from 'react';
import { Badge, Button, Column, Heading, RevealFx, Row, Text, Line } from "@once-ui-system/core";
import { DocumentRenderer } from '@keystatic/core/renderer';
import { home, about } from "@/resources";

interface HeroBlockProps {
  data: {
    content?: {
      headline: string;
      subline?: unknown;
    };
    layout?: {
      alignment?: 'left' | 'center';
      height?: 'auto' | 'full';
    };
    // Legacy fallback
    headline?: string;
    subline?: unknown;
  };
}

export async function HeroBlock({ data }: HeroBlockProps) {
  const headline = data.content?.headline || data.headline;
  const rawSubline = data.content?.subline ?? data.subline ?? home.subline;
  const subline =
    typeof rawSubline === 'function' ? await (rawSubline as () => Promise<unknown>)() : rawSubline;
  const alignment = data.layout?.alignment || 'center';
  
  const alignValue = alignment === 'left' ? 'start' : 'center';

  return (
    <Column fillWidth horizontal={alignValue} gap="m" paddingBottom="32">
      <Column maxWidth="s" horizontal={alignValue} align={alignValue}>
        {home.featured.display && (
          <RevealFx
            fillWidth
            horizontal={alignValue}
            paddingTop="16"
            paddingBottom="32"
            paddingLeft="12"
          >
            <Badge
              background="brand-alpha-weak"
              paddingX="12"
              paddingY="4"
              onBackground="neutral-strong"
              textVariant="label-default-s"
              arrow={false}
              href={home.featured.href}
            >
               <Row paddingY="2">
                 <Row gap="12" vertical="center">
                   <strong className="ml-4">Featured Project</strong>
                   <Line background="brand-alpha-strong" vert height="20" />
                   <Text marginRight="4" onBackground="brand-medium">
                     Featured work
                   </Text>
                 </Row>
               </Row>
            </Badge>
          </RevealFx>
        )}
        <RevealFx translateY="4" fillWidth horizontal={alignValue} paddingBottom="16">
          <Heading wrap="balance" variant="display-strong-s">
            {headline}
          </Heading>
        </RevealFx>
        <RevealFx translateY="8" delay={0.2} fillWidth horizontal={alignValue} paddingBottom="32">
          <Text
            wrap="balance"
            onBackground="neutral-weak"
            variant="body-default-l"
            align={alignment}
          >
            {Array.isArray(subline) ? (
              <DocumentRenderer document={subline} />
            ) : (
              (subline as ReactNode)
            )}
          </Text>
        </RevealFx>
        <RevealFx paddingTop="12" delay={0.4} horizontal={alignValue} paddingLeft="12">
          <Button
            id="about"
            data-border="rounded"
            href={about.path}
            variant="secondary"
            size="m"
            weight="default"
            label={about.label}
            suffixIcon="arrowRight"
          />
        </RevealFx>
      </Column>
    </Column>
  );
}
