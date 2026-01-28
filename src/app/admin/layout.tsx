import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import { Providers } from "@/components";
import { Column, Flex } from "@once-ui-system/core";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" fillWidth direction="column" suppressHydrationWarning>
      <Providers>
        <Column
          as="body"
          fillWidth
          style={{ minHeight: "100vh", margin: 0, padding: 0 }}
          background="page"
        >
          {children}
        </Column>
      </Providers>
    </Flex>
  );
}
