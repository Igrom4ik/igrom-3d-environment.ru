import React from 'react';
import { Mailchimp } from "@/components";
import { Column, Heading, Text } from "@once-ui-system/core";

interface MailchimpBlockProps {
  data: {
    title?: string;
    description?: string;
  };
}

export function MailchimpBlock({ data }: MailchimpBlockProps) {
  const { title, description } = data;
  
  return (
    <Column fillWidth gap="m" paddingBottom="40" horizontal="center">
      {title && (
        <Heading variant="heading-strong-l" align="center">{title}</Heading>
      )}
      {description && (
        <Text variant="body-default-m" align="center" marginBottom="s">{description}</Text>
      )}
      <Mailchimp />
    </Column>
  );
}
