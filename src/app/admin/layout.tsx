import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";
import styles from "@/components/admin/admin-layout.module.css";

import { Providers } from "@/components";
import AdminNav from "@/components/admin/AdminNav";
import { Column, Flex } from "@once-ui-system/core";
import { fonts } from "@/resources";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex 
      as="html" 
      lang="en" 
      fillWidth 
      direction="column" 
      suppressHydrationWarning
      className={`${fonts.heading.variable} ${fonts.body.variable} ${fonts.label.variable} ${fonts.code.variable}`}
    >
      <Providers>
        <Column
          as="body"
          fillWidth
          className={styles.adminBody}
          background="page"
        >
          <AdminNav />
          {children}
        </Column>
      </Providers>
    </Flex>
  );
}
