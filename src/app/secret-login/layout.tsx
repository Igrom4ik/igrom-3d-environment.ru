import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import { Flex, Column } from "@once-ui-system/core";
import { Providers } from "@/components";

export default function SecretLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" fillWidth direction="column" suppressHydrationWarning>
      <Providers>
        <Column as="body" fillWidth style={{ minHeight: "100vh", margin: 0, padding: 0 }} horizontal="center" vertical="center">
           {children}
        </Column>
      </Providers>
    </Flex>
  );
}
