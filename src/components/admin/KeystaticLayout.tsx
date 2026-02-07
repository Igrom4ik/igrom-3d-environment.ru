"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { adminHeaderLinks } from "@/components/admin/adminHeaderLinks";
import { KeystaticSidebar } from "./KeystaticSidebar";
import styles from "./admin-layout.module.css";
import { usePathname } from "next/navigation";

interface KeystaticLayoutProps {
  children: React.ReactNode;
  customHeaderActions?: React.ReactNode;
}

export const KeystaticLayout = ({ children, customHeaderActions }: KeystaticLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname() ?? "";
  const embeddedInAdminLayout = pathname.startsWith("/admin");

  return (
    <div
      style={{
        position: "relative",
        ...(embeddedInAdminLayout
          ? null
          : {
              minHeight: "100vh",
              background: "linear-gradient(180deg, #0f0f11 0%, #111216 100%)",
            }),
      }}
    >
      {!embeddedInAdminLayout && (
        <Header preset="ios-liquid-glass" links={adminHeaderLinks} customActions={customHeaderActions} menuMaxVisibleItems={5} />
      )}
      
      <KeystaticSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div
        className={[
          styles.adminBody,
          embeddedInAdminLayout ? styles.embeddedBody : "",
          styles.adminBodyWithSidebar,
          !isSidebarOpen ? styles.adminBodySidebarClosed : "",
        ].join(" ")}
      >
        {embeddedInAdminLayout && customHeaderActions && (
          <div className={styles.embeddedActionsBar}>{customHeaderActions}</div>
        )}
        {children}
      </div>
    </div>
  );
};
