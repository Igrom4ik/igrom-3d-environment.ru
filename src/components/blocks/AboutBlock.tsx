import type { ReactNode, ComponentProps } from 'react';
import { Column, Heading, Text } from "@once-ui-system/core";
import { DocumentRenderer } from '@keystatic/core/renderer';

interface AboutBlockProps {
  data: {
    title?: string;
    content?: unknown;
  };
}

export async function AboutBlock({ data }: AboutBlockProps) {
  const { title, content } = data;
  const resolvedContent =
    typeof content === 'function' ? await (content as () => Promise<unknown>)() : content;
  return (
    <Column fillWidth gap="m" paddingBottom="40">
      {title && (
        <Heading variant="heading-strong-l">{title}</Heading>
      )}
      {!!resolvedContent && (
        <Text variant="body-default-m" onBackground="neutral-weak">
          {Array.isArray(resolvedContent) ? (
            <DocumentRenderer document={resolvedContent as ComponentProps<typeof DocumentRenderer>['document']} />
          ) : (
            (resolvedContent as ReactNode)
          )}
        </Text>
      )}
    </Column>
  );
}
