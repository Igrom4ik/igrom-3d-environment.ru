"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin-nav.module.css';
import { LayoutGrid, Send, Upload, Home, ChevronRight, LogOut } from 'lucide-react';

export default function AdminNav() {
    const pathname = usePathname();

    // Helper to check active state
    const isActive = (path: string) => pathname.startsWith(path);

    // Generate breadcrumbs based on pathname
    const generateBreadcrumbs = () => {
        const paths = pathname.split('/').filter(p => p);
        // paths: ['admin', 'portfolio', 'my-project']
        
        return paths.map((path, index) => {
            const href = `/${paths.slice(0, index + 1).join('/')}`;
            const isLast = index === paths.length - 1;
            const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

            return (
                <React.Fragment key={path}>
                    {index > 0 && <ChevronRight size={14} color="#5c5c6b" />}
                    {isLast ? (
                        <span className={styles.crumbActive}>{label}</span>
                    ) : (
                        <Link href={href} className={styles.crumb}>
                            {label}
                        </Link>
                    )}
                </React.Fragment>
            );
        });
    };

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <Link href="/admin" className={styles.logo}>
                    IGROM ADMIN
                </Link>

                <nav className={styles.navLinks}>
                    <Link 
                        href="/admin/portfolio" 
                        className={`${styles.navLink} ${isActive('/admin/portfolio') ? styles.navLinkActive : ''}`}
                    >
                        Portfolio
                    </Link>
                    <Link 
                        href="/keystatic/collection/posts" 
                        className={`${styles.navLink} ${pathname.includes('/keystatic/collection/posts') ? styles.navLinkActive : ''}`}
                    >
                        Blog
                    </Link>
                    <Link 
                        href="/keystatic/singleton/home" 
                        className={`${styles.navLink} ${pathname.includes('/keystatic/singleton/home') ? styles.navLinkActive : ''}`}
                    >
                        Home
                    </Link>
                    <Link 
                        href="/keystatic/singleton/about" 
                        className={`${styles.navLink} ${pathname.includes('/keystatic/singleton/about') ? styles.navLinkActive : ''}`}
                    >
                        About
                    </Link>
                    <Link 
                        href="/admin/telegram" 
                        className={`${styles.navLink} ${isActive('/admin/telegram') ? styles.navLinkActive : ''}`}
                    >
                        Telegram
                    </Link>
                    <Link 
                        href="/admin/upload" 
                        className={`${styles.navLink} ${isActive('/admin/upload') ? styles.navLinkActive : ''}`}
                    >
                        Uploads
                    </Link>
                    <Link 
                        href="/keystatic/singleton/settings" 
                        className={`${styles.navLink} ${pathname.includes('/keystatic/singleton/settings') ? styles.navLinkActive : ''}`}
                    >
                        Settings
                    </Link>
                </nav>

                <div className={styles.breadcrumbs}>
                    {generateBreadcrumbs()}
                </div>
            </div>

            <div className={styles.rightSection}>
                <Link href="/" className={styles.iconButton} title="Back to Website">
                    <Home size={20} />
                </Link>
                <button className={styles.iconButton} title="Logout" onClick={() => alert('Logout functionality to be implemented')}>
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}
