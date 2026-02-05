"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { adminHeaderLinks } from "@/components/admin/adminHeaderLinks";
import { KeystaticSidebar } from "./KeystaticSidebar";
import styles from "./admin-layout.module.css";

export const KeystaticLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f0f11 0%, #111216 100%)",
        position: "relative",
      }}
    >
      <Header preset="ios-liquid-glass" links={adminHeaderLinks} />
      
      <KeystaticSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div
        className={[
          styles.adminBody,
          styles.adminBodyWithSidebar,
          !isSidebarOpen ? styles.adminBodySidebarClosed : "",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
};
