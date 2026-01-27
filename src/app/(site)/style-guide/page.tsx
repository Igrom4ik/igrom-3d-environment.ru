"use client";

import {
  Button,
  Column,
  Heading,
  Input,
  Row,
  Text,
  Grid,
  Switch,
  Checkbox,
} from "@once-ui-system/core";

export default function StyleGuide() {
  return (
    <Column fillWidth padding="l" gap="l">
      <Heading variant="display-strong-m">Visual Style Guide</Heading>
      <Text variant="body-default-l" onBackground="neutral-weak">
        This page previews your current visual settings. Changes in the Admin UI
        will be reflected here.
      </Text>

      {/* Colors */}
      <Heading variant="heading-strong-m" marginTop="l">
        Colors
      </Heading>
      <Grid columns={3} gap="m" s={{ columns: 1 }}>
        <ColorSwatch
          name="Brand"
          description="Primary actions, links, highlights"
          bg="brand-medium"
          fg="brand-on-background-medium"
        />
        <ColorSwatch
          name="Accent"
          description="Errors, warnings, special highlights"
          bg="accent-medium"
          fg="accent-on-background-medium"
        />
        <ColorSwatch
          name="Neutral"
          description="Backgrounds, text, borders"
          bg="neutral-medium"
          fg="neutral-on-background-medium"
        />
        <ColorSwatch
          name="Surface"
          description="Card backgrounds"
          bg="surface"
          fg="neutral-strong"
          border="neutral-medium"
        />
      </Grid>

      {/* Typography */}
      <Heading variant="heading-strong-m" marginTop="l">
        Typography
      </Heading>
      <Column gap="m" padding="m" border="neutral-medium" radius="m">
        <Heading variant="display-strong-l">Display Strong L</Heading>
        <Heading variant="heading-strong-xl">Heading Strong XL</Heading>
        <Heading variant="heading-default-m">Heading Default M</Heading>
        <Text variant="body-default-m">
          Body Default M. The quick brown fox jumps over the lazy dog.
        </Text>
        <Text variant="body-strong-s">Body Strong S</Text>
      </Column>

      {/* Buttons */}
      <Heading variant="heading-strong-m" marginTop="l">
        Buttons
      </Heading>
      <Row gap="m" wrap>
        <Button variant="primary" label="Primary Button" />
        <Button variant="secondary" label="Secondary Button" />
        <Button variant="tertiary" label="Tertiary Button" />
        <Button variant="danger" label="Danger Button" />
      </Row>

      {/* Inputs & Controls */}
      <Heading variant="heading-strong-m" marginTop="l">
        Inputs & Controls
      </Heading>
      <Column gap="m" maxWidth="m">
        <Input
          id="example-input"
          label="Text Input"
          placeholder="Placeholder text"
        />
        <Input
          id="example-input-error"
          label="Input with Error"
          placeholder="Error state"
          errorMessage="This field is required"
        />
        <Row gap="l" vertical="center">
          <Switch isChecked={true} label="Switch On" onToggle={() => {}} />
          <Switch isChecked={false} label="Switch Off" onToggle={() => {}} />
        </Row>
        <Row gap="l" vertical="center">
          <Checkbox isChecked={true} label="Checkbox Checked" onToggle={() => {}} />
          <Checkbox isChecked={false} label="Checkbox Unchecked" onToggle={() => {}} />
        </Row>
      </Column>

      {/* Surface / Cards */}
      <Heading variant="heading-strong-m" marginTop="l">
        Surface & Borders
      </Heading>
      <Row gap="m" wrap>
        <Column
          padding="l"
          background="surface"
          border="neutral-medium"
          radius="l"
          gap="s"
        >
          <Heading variant="heading-strong-s">Card Surface</Heading>
          <Text>This card uses the configured border radius and surface style.</Text>
        </Column>
        <Column
          padding="l"
          background="neutral-medium"
          radius="l"
          gap="s"
        >
          <Heading variant="heading-strong-s">Neutral Surface</Heading>
          <Text>Uses neutral background color.</Text>
        </Column>
      </Row>
    </Column>
  );
}

function ColorSwatch({
  name,
  description,
  bg,
  fg,
  border,
}: {
  name: string;
  description: string;
  bg: string;
  fg: string;
  border?: string;
}) {
  return (
    <Column
      padding="m"
      radius="m"
      background={bg as "surface"} // Cast to valid type to satisfy linter
      border={border as "neutral-medium"} // Cast to valid type
      gap="xs"
    >
      <Text variant="heading-strong-s" style={{ color: `var(--${fg})` }}>
        {name}
      </Text>
      <Text variant="body-default-xs" style={{ color: `var(--${fg})`, opacity: 0.8 }}>
        {description}
      </Text>
    </Column>
  );
}
