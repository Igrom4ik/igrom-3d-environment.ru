"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin-sidebar.module.css';
import { 
    FileText, 
    LayoutGrid, 
    Send, 
    House, 
    User, 
    Briefcase, 
    Image, 
    Palette, 
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
    const pathname = usePathname();
    
    // Helper to check active state
    const isActive = (path: string) => pathname.startsWith(path);
    const isActiveKeystatic = (path: string) => pathname.includes(path);

    const collections = [
        { href: '/keystatic/collection/posts', icon: FileText, label: 'Posts' },
        { href: '/keystatic/collection/albums', icon: LayoutGrid, label: 'Portfolio' },
        { href: '/keystatic/collection/telegramPosts', icon: Send, label: 'Telegram Posts' },
    ];

    const singletons = [
        { href: '/keystatic/singleton/home', icon: House, label: 'Home' },
        { href: '/keystatic/singleton/about', icon: User, label: 'About' },
        { href: '/keystatic/singleton/work', icon: Briefcase, label: 'Work' },
        { href: '/keystatic/singleton/gallery', icon: Image, label: 'Gallery' },
        { href: '/keystatic/singleton/design', icon: Palette, label: 'Design / Theme' },
        { href: '/keystatic/singleton/settings', icon: Settings, label: 'Settings' },
    ];

    const otherSections = [
        { href: '/admin/blog', icon: FileText, label: 'Blog Manager' },
    ];

    return (
        <>
            {/* Sidebar Overlay for mobile */}
            {!isCollapsed && (
                <div 
                    className={styles.sidebarOverlay}
                    onClick={onToggle}
                />
            )}

            {/* Main Sidebar */}
            <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    {!isCollapsed && (
                        <div className={styles.sidebarTitle}>
                            <span>IGROM</span>
                            <span className={styles.sidebarSubtitle}>ADMIN</span>
                        </div>
                    )}
                    <button 
                        onClick={onToggle}
                        className={styles.sidebarToggle}
                        title={isCollapsed ? "Open Sidebar" : "Close Sidebar"}
                    >
                        {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                    </button>
                </div>

                {!isCollapsed && (
                    <div className={styles.sidebarContent}>
                        {/* Collections Section */}
                        <div className={styles.sidebarSection}>
                            <h3 className={styles.sidebarSectionTitle}>Collections</h3>
                            <nav className={styles.sidebarNav}>
                                {collections.map((item) => {
                                    const Icon = item.icon;
                                    const isCurrent = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`${styles.sidebarLink} ${isCurrent ? styles.sidebarLinkActive : ''}`}
                                        >
                                            <Icon size={16} />
                                            <span>{item.label}</span>
                                            {isCurrent && <ChevronRight size={14} className={styles.activeIndicator} />}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Singletons Section */}
                        <div className={styles.sidebarSection}>
                            <h3 className={styles.sidebarSectionTitle}>Singletons</h3>
                            <nav className={styles.sidebarNav}>
                                {singletons.map((item) => {
                                    const Icon = item.icon;
                                    const isCurrent = isActiveKeystatic(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`${styles.sidebarLink} ${isCurrent ? styles.sidebarLinkActive : ''}`}
                                        >
                                            <Icon size={16} />
                                            <span>{item.label}</span>
                                            {isCurrent && <ChevronRight size={14} className={styles.activeIndicator} />}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Other Admin Sections */}
                        <div className={styles.sidebarSection}>
                            <h3 className={styles.sidebarSectionTitle}>Management</h3>
                            <nav className={styles.sidebarNav}>
                                {otherSections.map((item) => {
                                    const Icon = item.icon;
                                    const isCurrent = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`${styles.sidebarLink} ${isCurrent ? styles.sidebarLinkActive : ''}`}
                                        >
                                            <Icon size={16} />
                                            <span>{item.label}</span>
                                            {isCurrent && <ChevronRight size={14} className={styles.activeIndicator} />}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
