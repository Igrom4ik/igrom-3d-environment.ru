import { JDoodleEmbed } from "@/components/JDoodleEmbed";
import { Column, Heading, Text, Flex } from "@once-ui-system/core";
import { baseURL } from "@/resources";
import { Meta } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: "Coding Playground",
    description: "Run code directly in your browser with JDoodle IDE.",
    baseURL: baseURL,
    path: "/coding",
  });
}

export default function CodingPage() {
  return (
    <Column fillWidth padding="l" gap="l" horizontal="center">
      <Column maxWidth="l" fillWidth gap="m">
        <Heading variant="display-strong-s">Coding Playground</Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Experiment with code snippets using the interactive IDE below.
        </Text>
      </Column>
      <Column fillWidth maxWidth="l">
        <JDoodleEmbed />
      </Column>
    </Column>
  );
}
