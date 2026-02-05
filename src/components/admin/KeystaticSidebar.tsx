"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  Send,
  Home,
  User,
  Briefcase,
  Image as ImageIcon,
  Palette,
  Settings,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import styles from "./KeystaticSidebar.module.css";

// Helper for navigation items
const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');
  
  return (
    <Link
      href={href}
      className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`}
    >
      <Icon className={styles.sidebarIcon} />
      <span>{label}</span>
      {isActive && <ChevronRight size={14} className={styles.activeIndicator} />}
    </Link>
  );
};

interface KeystaticSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const KeystaticSidebar = ({ isOpen, onToggle }: KeystaticSidebarProps) => {
  return (
    <>
      {isOpen && (
        <div 
          className={styles.sidebarOverlay}
          onClick={onToggle}
        />
      )}

      {!isOpen && (
        <button
          type="button"
          className={styles.sidebarReopen}
          onClick={onToggle}
          title="Open Sidebar"
          aria-label="Open Sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      <aside className={`${styles.sidebar} ${!isOpen ? styles.sidebarClosed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleMain}>IGROM</span>
            <span className={styles.sidebarTitleSub}>ADMIN</span>
          </div>
          <button
            type="button"
            className={styles.sidebarToggle}
            onClick={onToggle}
            title={isOpen ? 'Close Sidebar' : 'Open Sidebar'}
          >
            {isOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
        </div>

        <div className={styles.sidebarContent}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Collections</div>
            <nav className={styles.sidebarNav}>
              <NavItem href="/keystatic/collection/posts" icon={FileText} label="Posts" />
              <NavItem href="/keystatic/collection/albums" icon={LayoutGrid} label="Portfolio" />
              <NavItem href="/keystatic/collection/telegramPosts" icon={Send} label="Telegram Posts" />
            </nav>
          </div>

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Singletons</div>
            <nav className={styles.sidebarNav}>
              <NavItem href="/keystatic/singleton/home" icon={Home} label="Home" />
              <NavItem href="/keystatic/singleton/about" icon={User} label="About" />
              <NavItem href="/keystatic/singleton/work" icon={Briefcase} label="Work" />
              <NavItem href="/keystatic/singleton/gallery" icon={ImageIcon} label="Gallery" />
            </nav>
          </div>

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>System</div>
            <nav className={styles.sidebarNav}>
              <NavItem href="/keystatic/singleton/design" icon={Palette} label="Design / Theme" />
              <NavItem href="/keystatic/singleton/settings" icon={Settings} label="Settings" />
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};
