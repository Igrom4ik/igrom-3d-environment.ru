"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './portfolio.module.css';
import { 
    Folder, Plus, ChevronDown, ChevronLeft, ChevronRight, EyeOff, LayoutGrid
} from 'lucide-react';
import PortfolioGrid from './PortfolioGrid';

interface PortfolioManagerProps {
    initialAlbums: any[];
}

export default function PortfolioManager({ initialAlbums }: PortfolioManagerProps) {
    const [localAlbums, setLocalAlbums] = useState(initialAlbums);
    const [activeTab, setActiveTab] = useState<'all' | 'hidden'>('all');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // Sync local state with props when they change (e.g. after server action/refresh)
    React.useEffect(() => {
        setLocalAlbums(initialAlbums);
    }, [initialAlbums]);
    
    const handleAlbumUpdate = (updatedAlbum: any) => {
        setLocalAlbums((prev: any[]) => prev.map(a => a.slug === updatedAlbum.slug ? updatedAlbum : a));
    };

    const handleBatchAction = (slugs: string[], action: 'soft' | 'hard' | 'restore') => {
        setLocalAlbums((prev: any[]) => {
            // All deletions are now treated as removals from state
            if (action === 'hard' || action === 'soft') {
                return prev.filter(a => !slugs.includes(a.slug));
            }
            return prev;
        });
    };
    
    const handleReorder = (newOrder: any[]) => {
        const priorityMap = new Map(newOrder.map((item, index) => [item.slug, index * 10]));
        
        setLocalAlbums(prev => {
            const updated = prev.map(a => {
                if (priorityMap.has(a.slug)) {
                    return { ...a, entry: { ...a.entry, priority: priorityMap.get(a.slug) } };
                }
                return a;
            });
            return updated.sort((a, b) => (a.entry.priority || 0) - (b.entry.priority || 0));
        });
    };
    
    // Calculate counts
    const counts = useMemo(() => {
        const hiddenCount = localAlbums.filter((a: any) => a.entry.hidden).length;
        const activeCount = localAlbums.filter((a: any) => !a.entry.hidden).length;
        const totalCount = localAlbums.length;
        
        return {
            all: totalCount,
            hidden: hiddenCount,
            active: activeCount
        };
    }, [localAlbums]);

    // Filter albums for the grid
    const filteredAlbums = useMemo(() => {
        if (activeTab === 'hidden') {
            return localAlbums.filter((a: any) => a.entry.hidden);
        }
        // 'all' (Active) shows everything that is NOT hidden
        return localAlbums.filter((a: any) => !a.entry.hidden);
    }, [activeTab, localAlbums]);
    
    return (
        <div className={styles.pageContainer}>
            <div className={styles.mainLayout}>
                {/* Sidebar */}
                <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
                    <button 
                        className={styles.toggleButton} 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        type="button"
                    >
                        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>

                    <div className={`${styles.sidebarSection} ${activeTab === 'all' ? styles.activeSidebar : ''}`}
                         onClick={() => setActiveTab('all')}
                    >
                        <div className={styles.sidebarHeader}>
                            <div className={styles.sidebarHeaderContent}>
                                <LayoutGrid size={16} color={activeTab === 'all' ? '#fff' : "#9a9cab"} />
                                <span className={styles.sidebarText}>Active Projects</span>
                            </div>
                            {!isSidebarCollapsed && activeTab === 'all' && <ChevronDown size={14} color="#fff" className={styles.chevron} />}
                        </div>
                        <div className={styles.sidebarInfo}>
                            {counts.active} Projects<br />
                            Visibility: Public
                        </div>
                    </div>

                    <div className={`${styles.sidebarSection} ${activeTab === 'hidden' ? styles.activeSidebar : ''}`}
                         onClick={() => setActiveTab('hidden')}
                    >
                        <div className={styles.sidebarHeader}>
                            <div className={styles.sidebarHeaderContent}>
                                <EyeOff size={16} color={activeTab === 'hidden' ? '#fff' : "#9a9cab"} />
                                <span className={styles.sidebarText}>Hidden Works</span>
                            </div>
                            {!isSidebarCollapsed && activeTab === 'hidden' && <ChevronDown size={14} color="#fff" className={styles.chevron} />}
                        </div>
                        <div className={styles.sidebarInfo}>
                            {counts.hidden} Projects<br />
                            Visibility: Hidden
                        </div>
                    </div>

                    <Link href="/admin/portfolio/create" className={styles.createButton}>
                        <Plus size={16} />
                        <span className={styles.sidebarText}>Create new album</span>
                    </Link>

                    {!isSidebarCollapsed && (
                        <div className={styles.dragHint}>
                            💡 Drag and drop projects to reorder.
                        </div>
                    )}
                </aside>

                {/* Content Area */}
                <main className={styles.contentArea} aria-labelledby="portfolio-page-title">
                    <div className={styles.portfolioHeader}>
                        <div>
                            <h1 className={styles.pageTitle} id="portfolio-page-title">Portfolio</h1>
                            <div className={styles.tabRow}>
                                <div className={styles.activeTab}>
                                    {activeTab === 'hidden' ? <EyeOff size={16} /> : <LayoutGrid size={16} />}
                                    <span style={{ marginLeft: '8px' }}>
                                        {activeTab === 'all' ? 'Active Projects' : 'Hidden Works'}
                                    </span>
                                </div>
                                <span className={styles.subText}>
                                    {activeTab === 'all' ? counts.active : counts.hidden} Projects · 
                                    Visibility: {activeTab === 'all' ? 'Public' : 'Hidden'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <PortfolioGrid 
                        key={activeTab} 
                        albums={filteredAlbums} 
                        onAlbumUpdate={handleAlbumUpdate}
                        onBatchAction={handleBatchAction}
                        onReorder={handleReorder}
                        activeTab={activeTab as any}
                    />
                </main>
            </div>
        </div>
    );
}
