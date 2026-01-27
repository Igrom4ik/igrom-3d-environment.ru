"use client";

import { GoogleTranslate } from "@/components/GoogleTranslate";
import { Row } from "@once-ui-system/core";

export function LanguageSwitcher() {
  return (
    <Row gap="8" padding="4" vertical="center">
      <GoogleTranslate />
    </Row>
  );
}
