"use client";

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin-nav.module.css';
import { LayoutGrid, Send, Upload, Home, ChevronRight, LogOut, Menu, X } from 'lucide-react';

export default function AdminNav() {
    const pathname = usePathname();
    const headerRef = useRef<HTMLElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Mouse Wheel Horizontal Scroll
    useEffect(() => {
        const header = headerRef.current;
        if (!header) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY === 0) return;
            // Check if content overflows
            if (header.scrollWidth > header.clientWidth) {
                e.preventDefault();
                header.scrollLeft += e.deltaY;
            }
        };

        header.addEventListener('wheel', handleWheel, { passive: false });
        return () => header.removeEventListener('wheel', handleWheel);
    }, []);

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
        <>
            <header className={styles.header} ref={headerRef}>
                <div className={styles.leftSection}>
                    <Link href="/admin" className={styles.logo}>
                        IGROM ADMIN
                    </Link>

                    <nav className={`${styles.navLinks} ${styles.desktopNav}`}>
                        <Link 
                            href="/admin/portfolio" 
                            className={`${styles.navLink} ${isActive('/admin/portfolio') ? styles.navLinkActive : ''}`}
                        >
                            Portfolio
                        </Link>
                        <Link 
                            href="/admin/blog" 
                            className={`${styles.navLink} ${isActive('/admin/blog') ? styles.navLinkActive : ''}`}
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
                        <Link 
                            href="/admin/secrets" 
                            className={`${styles.navLink} ${isActive('/admin/secrets') ? styles.navLinkActive : ''}`}
                        >
                            Secrets
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
                    <button 
                        className={`${styles.iconButton} ${styles.mobileMenuBtn}`} 
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenuOverlay}>
                    <div className={styles.mobileMenuContent}>
                        <div className={styles.mobileMenuHeader}>
                            <span className={styles.logo}>IGROM ADMIN</span>
                            <button 
                                className={styles.iconButton} 
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <nav className={styles.mobileNavLinks}>
                             <Link href="/admin/portfolio" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileNavLink}>Portfolio</Link>
                             <Link href="/admin/blog" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileNavLink}>Blog</Link>
                             <Link href="/keystatic/singleton/home" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileNavLink}>Home</Link>
                             <Link href="/keystatic/singleton/about" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileNavLink}>About</Link>
                             <Link href="/admin/telegram" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileNavLink}>Telegram</Link>
                             <Link href="/admin/upload" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileNavLink}>Uploads</Link>
                             <Link href="/keystatic/singleton/settings" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileNavLink}>Settings</Link>
                             <Link href="/admin/secrets" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileNavLink}>Secrets</Link>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
