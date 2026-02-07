import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";
import styles from "@/components/admin/admin-layout.module.css";

import { Providers } from "@/components";
import { Header } from "@/components/Header";
import { adminHeaderLinks } from "@/components/admin/adminHeaderLinks";
import { Column, Flex } from "@once-ui-system/core";
import { fonts } from "@/resources";
import { getDesignSettings } from "@/utils/reader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const settings = await getDesignSettings();
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
          <Header preset={settings?.preset} links={adminHeaderLinks} menuMaxVisibleItems={5} />
          {children}
        </Column>
      </Providers>
    </Flex>
  );
}
