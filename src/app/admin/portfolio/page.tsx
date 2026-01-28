import React from 'react';
import Link from 'next/link';
import { getAlbums, getSettings } from '@/utils/reader';
import styles from './portfolio.module.css';
import { 
    Search, Bell, MessageCircle, MoreVertical, Folder, Trash, 
    Eye, Link as LinkIcon, Plus, Heart, MessageSquare, ChevronDown
} from 'lucide-react';

export default async function PortfolioAdminPage() {
    const albums = await getAlbums();
    const settings = await getSettings(); // For avatar if needed, though ArtStation has user avatar

    // Sort albums by date (newest first) or as needed. Keystatic returns them in file order usually.
    // We can assume they are sorted or just map them.
    
    // Default stats (placeholders as we don't have real analytics yet)
    const getStats = () => ({
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 10)
    });

    return (
        <div className={styles.pageContainer}>
            {/* Main Layout */}
            <div className={styles.mainLayout}>
                {/* 2. Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarSection}>
                        <div className={styles.sidebarHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Folder size={16} color="#9a9cab" />
                                <span>All</span>
                            </div>
                            <ChevronDown size={14} color="#9a9cab" />
                        </div>
                        <div className={styles.sidebarInfo}>
                            {albums.length} Projects<br />
                            Visibility: ArtStation, Website
                        </div>
                    </div>

                    <div className={styles.sidebarSection}>
                        <div className={styles.sidebarHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Folder size={16} color="#9a9cab" />
                                <span>Hide works</span>
                            </div>
                            <ChevronDown size={14} color="#9a9cab" />
                        </div>
                        <div className={styles.sidebarInfo}>
                            0 Projects<br />
                            Visibility: ArtStation, Website
                        </div>
                    </div>

                    <Link href="/admin/portfolio/create" className={styles.createButton}>
                        <Plus size={16} />
                        Create new album
                    </Link>

                    <div className={styles.dragHint}>
                        💡 Drag and drop projects and albums to reorder them. Drag and drop projects onto albums to add them to an album.
                    </div>

                    <div className={styles.trashSection}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Trash size={16} />
                            <span>Trash</span>
                        </div>
                        <span className={styles.badge}>0</span>
                    </div>
                </aside>

                {/* Content Area */}
                <main className={styles.contentArea}>
                    {/* 3. Portfolio Header */}
                    <div className={styles.portfolioHeader}>
                        <div>
                            <h1 className={styles.pageTitle}>Portfolio</h1>
                            <div className={styles.tabRow}>
                                <div className={styles.activeTab}>
                                    <Folder size={16} />
                                    All
                                </div>
                                <span className={styles.subText}>
                                    {albums.length} Projects · Visibility: ArtStation, Website
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link href="/gallery" className={styles.actionButton} target="_blank">
                                <Eye size={16} /> View on community
                            </Link>
                            <Link href="/" className={styles.actionButton} target="_blank">
                                <LinkIcon size={16} /> View on website
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className={styles.filtersRow}>
                        <div className={styles.filterSelect}>
                            Any Visibility <ChevronDown size={14} />
                        </div>
                        <div className={styles.filterSelect}>
                            Any Status <ChevronDown size={14} />
                        </div>
                        <button type="button" style={{ background: 'none', border: 'none', color: '#1e90ff', cursor: 'pointer', fontSize: '13px' }}>
                            Select All
                        </button>
                    </div>

                    {/* 4. Grid */}
                    <div className={styles.grid}>
                        {/* New Project Card */}
                        <Link href="/admin/portfolio/create" className={styles.newCard}>
                            <Plus className={styles.plusIcon} />
                            <span className={styles.newText}>Create New Project</span>
                        </Link>

                        {/* Project Cards */}
                        {albums.map((album: any, index: number) => {
                            const stats = getStats();
                            return (
                                <Link 
                                    key={album.slug} 
                                    href={`/admin/portfolio/${album.slug}`}
                                    className={styles.projectCard}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className={styles.cardImageContainer}>
                                        <div className={styles.selectorCircle}></div>
                                        {album.entry.publishing?.cover ? (
                                            <img 
                                                src={album.entry.publishing.cover} 
                                                alt={album.entry.title} 
                                                className={styles.cardImage} 
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: '#282a36' }} />
                                        )}
                                    </div>
                                    
                                    <div className={styles.cardMeta}>
                                        <div className={styles.cardTitle}>{album.entry.title}</div>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className={`${styles.statusBadge} ${styles.statusPublished}`}>
                                                Published
                                            </span>
                                            
                                            <div className={styles.cardStats}>
                                                <span className={styles.statItem}>
                                                    <Eye size={12} /> {stats.views}
                                                </span>
                                                <span className={styles.statItem}>
                                                    <Heart size={12} /> {stats.likes}
                                                </span>
                                                <span className={styles.statItem}>
                                                    <MessageSquare size={12} /> {stats.comments}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
}
