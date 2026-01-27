import React from 'react';
import { Projects } from "@/components/work/Projects";
import { Column, Heading } from "@once-ui-system/core";

interface ProjectsBlockProps {
  data: {
    title?: string;
    limit?: number;
  };
}

export function ProjectsBlock({ data }: ProjectsBlockProps) {
  const { title } = data;
  // Note: Projects component currently doesn't accept a limit prop based on its definition in page.tsx usage
  // <Projects range={[1, 1]} /> in page.tsx fallback implies it might take a range.
  // Let's check Projects definition if possible, but for now we'll wrap it simply.
  
  return (
    <Column fillWidth gap="m" paddingBottom="40">
      {title && (
        <Heading variant="heading-strong-l" marginBottom="m">{title}</Heading>
      )}
      <Projects />
    </Column>
  );
}
