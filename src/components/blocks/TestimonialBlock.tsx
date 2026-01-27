import React from 'react';
import { Column, Text, Row, Avatar } from "@once-ui-system/core";

interface TestimonialBlockProps {
  data: {
    quote: string;
    author: string;
    role?: string;
    avatar?: string;
  };
}

export function TestimonialBlock({ data }: TestimonialBlockProps) {
  const { quote, author, role, avatar } = data;
  
  return (
    <Column fillWidth paddingY="64" horizontal="center" align="center" gap="l">
      <Text 
        variant="heading-default-xl" 
        align="center" 
        onBackground="neutral-strong"
        style={{ maxWidth: '800px', fontStyle: 'italic' }}
      >
        "{quote}"
      </Text>
      
      <Row gap="m" vertical="center">
        {avatar && <Avatar src={avatar} size="l" />}
        <Column>
          <Text variant="body-strong-m" onBackground="neutral-strong">{author}</Text>
          {role && <Text variant="body-default-s" onBackground="neutral-medium">{role}</Text>}
        </Column>
      </Row>
    </Column>
  );
}
