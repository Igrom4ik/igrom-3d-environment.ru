"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button, Row } from "@once-ui-system/core";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <Row gap="8" padding="4">
      <Button
        variant={locale === "en" ? "primary" : "secondary"}
        size="s"
        onClick={() => setLocale("en")}
      >
        EN
      </Button>
      <Button
        variant={locale === "ru" ? "primary" : "secondary"}
        size="s"
        onClick={() => setLocale("ru")}
      >
        RU
      </Button>
    </Row>
  );
}
