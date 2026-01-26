"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Heading, Text } from "@once-ui-system/core";

export function TranslatedHomeHeadline() {
  const { t } = useLanguage();

  return (
    <Heading wrap="balance" variant="display-strong-s">
      {t("home.headline")}
    </Heading>
  );
}

export function TranslatedHomeSubline() {
  const { t } = useLanguage();

  return (
    <Text
      wrap="balance"
      onBackground="neutral-weak"
      variant="body-default-l"
      dangerouslySetInnerHTML={{ __html: t("home.subline") }}
    />
  );
}
