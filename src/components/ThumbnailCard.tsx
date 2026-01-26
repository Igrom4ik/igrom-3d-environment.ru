"use client";

import { SmartLink, Media, Text, Flex, RevealFx } from "@once-ui-system/core";

interface ThumbnailCardProps {
  href: string;
  image: string;
  title: string;
  tag?: string;
  priority?: boolean;
}

export const ThumbnailCard: React.FC<ThumbnailCardProps> = ({
  href,
  image,
  title,
  tag,
  priority = false,
}) => {
  return (
    <RevealFx translateY="4" fillWidth>
      <SmartLink href={href} style={{ display: 'flex', flexDirection: 'column', width: '100%', textDecoration: 'none' }}>
        <Flex
            fillWidth
            direction="column"
            position="relative"
            overflow="hidden"
            radius="l"
            background="surface"
            border="neutral-alpha-weak"
            transition="macro-medium"
            s={{
                border: "neutral-medium"
            }}
        >
          <Media
            priority={priority}
            src={image}
            alt={title}
            aspectRatio="16 / 9"
            objectFit="cover"
            sizes="(max-width: 960px) 100vw, 33vw"
          />
          <Flex
            fillWidth
            padding="12"
            gap="4"
            direction="column"
          >
            <Text variant="label-strong-m" wrap="balance">{title}</Text>
            {tag && <Text variant="label-default-s" onBackground="neutral-weak">{tag}</Text>}
          </Flex>
        </Flex>
      </SmartLink>
    </RevealFx>
  );
};
