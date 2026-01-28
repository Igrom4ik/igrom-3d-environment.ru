import Link from 'next/link';
import { getAlbums, getSettings } from '@/utils/reader';
import styles from './portfolio.module.css';
import { 
    Folder, Trash, Eye, Link as LinkIcon, Plus, ChevronDown
} from 'lucide-react';
import PortfolioGrid from './PortfolioGrid';

export default async function PortfolioAdminPage() {
    const rawAlbums = await getAlbums();
    const settings = await getSettings();

    // Sanitize albums for Client Component (remove functions)
    const albums = rawAlbums.map((album: any) => ({
        slug: album.slug,
        entry: {
            title: album.entry.title,
            publishing: album.entry.publishing || {},
            categorization: album.entry.categorization || {},
        }
    }));

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

                    {/* Grid */}
                    <PortfolioGrid albums={albums} />
                </main>
            </div>
        </div>
    );
}
