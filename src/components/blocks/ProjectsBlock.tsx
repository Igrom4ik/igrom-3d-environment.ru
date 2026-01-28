import React from 'react';
import { Projects } from "@/components/work/Projects";
import { Column, Heading } from "@once-ui-system/core";

interface ProjectsBlockProps {
  data: {
    title?: string;
    limit?: number;
    selectedProjects?: string[] | null;
  };
}

export function ProjectsBlock({ data }: ProjectsBlockProps) {
  const { title, selectedProjects } = data;
  
  return (
    <Column fillWidth gap="m" paddingBottom="40">
      {title && (
        <Heading variant="heading-strong-l" marginBottom="m">{title}</Heading>
      )}
      <Projects slugs={selectedProjects} />
    </Column>
  );
}
