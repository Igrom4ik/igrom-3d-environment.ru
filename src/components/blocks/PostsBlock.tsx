import React from 'react';
import { Posts } from "@/components/blog/Posts";
import { Column, Heading } from "@once-ui-system/core";

interface PostsBlockProps {
  data: {
    title?: string;
    columns?: '1' | '2' | '3';
    limit?: number;
  };
}

export function PostsBlock({ data }: PostsBlockProps) {
  const { title, columns = '3' } = data;
  
  return (
    <Column fillWidth gap="m" paddingBottom="40">
      {title && (
        <Heading variant="heading-strong-l" marginBottom="m">{title}</Heading>
      )}
      <Posts columns={columns} />
    </Column>
  );
}
