import React from 'react';
import { Column, Heading, Text, Button, RevealFx } from "@once-ui-system/core";

interface CtaBlockProps {
  data: {
    title: string;
    text?: string;
    buttonLabel: string;
    buttonLink: string;
  };
}

export function CtaBlock({ data }: CtaBlockProps) {
  const { title, text, buttonLabel, buttonLink } = data;
  
  return (
    <RevealFx fillWidth>
      <Column 
        fillWidth 
        padding="64" 
        background="surface" 
        border="neutral-weak"
        radius="l"
        align="center"
        horizontal="center"
        gap="l"
      >
        <Heading variant="display-strong-xs" align="center">{title}</Heading>
        {text && (
          <Text variant="body-default-l" onBackground="neutral-medium" align="center" style={{ maxWidth: '600px' }}>
            {text}
          </Text>
        )}
        <Button 
          href={buttonLink} 
          label={buttonLabel} 
          variant="primary" 
          size="l" 
          suffixIcon="arrowRight"
        />
      </Column>
    </RevealFx>
  );
}
