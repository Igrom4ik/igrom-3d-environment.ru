import React from 'react';
import { Column, Heading, Text, Grid, Icon } from "@once-ui-system/core";

interface FeatureItem {
  icon?: string;
  title: string;
  description: string;
}

interface FeaturesBlockProps {
  data: {
    title?: string;
    columns?: '2' | '3' | '4';
    features: FeatureItem[];
  };
}

export function FeaturesBlock({ data }: FeaturesBlockProps) {
  const { title, features, columns = '3' } = data;
  
  return (
    <Column fillWidth gap="xl" paddingY="40">
      {title && (
        <Heading variant="heading-strong-xl" align="center" paddingBottom="24">
          {title}
        </Heading>
      )}
      
      <Grid columns={columns} gap="l" s={{ columns: 1 }}>
        {features.map((feature, index) => (
          <Column key={`${feature.title}-${index}`} gap="m" padding="24" background="surface" radius="m" border="neutral-weak">
            {feature.icon && (
              <Icon name={feature.icon} size="l" onBackground="brand-medium" />
            )}
            <Heading variant="heading-strong-m">{feature.title}</Heading>
            <Text variant="body-default-s" onBackground="neutral-medium">
              {feature.description}
            </Text>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
