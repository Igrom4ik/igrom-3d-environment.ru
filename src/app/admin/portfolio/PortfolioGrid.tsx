"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './portfolio.module.css';
import { 
    Eye, Heart, MessageSquare, Plus, Trash2, CheckCircle2, Circle
} from 'lucide-react';

interface PortfolioGridProps {
    albums: any[];
}

export default function PortfolioGrid({ albums }: PortfolioGridProps) {
    const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

    // Default stats (placeholders)
    const getStats = () => ({
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 10)
    });

    const toggleSelection = (e: React.MouseEvent, slug: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedSlugs(prev => 
            prev.includes(slug) 
                ? prev.filter(s => s !== slug) 
                : [...prev, slug]
        );
    };

    const handleSelectAll = () => {
        if (selectedSlugs.length === albums.length) {
            setSelectedSlugs([]);
        } else {
            setSelectedSlugs(albums.map(a => a.slug));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedSlugs.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedSlugs.length} project(s)?`)) return;
        
        try {
            const res = await fetch('/api/portfolio/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slugs: selectedSlugs })
            });
            
            if (res.ok) {
                const data = await res.json();
                alert(`Successfully deleted ${data.deleted.length} project(s).`);
                // Refresh page or update state
                window.location.reload();
            } else {
                const error = await res.json();
                alert(`Failed to delete projects: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting projects.');
        }
    };

    return (
        <>
            {/* Selection Toolbar */}
            <div className={styles.filtersRow}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className={styles.filterSelect}>
                        Any Visibility
                    </div>
                    <div className={styles.filterSelect}>
                        Any Status
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {selectedSlugs.length > 0 && (
                        <button 
                            onClick={handleDeleteSelected}
                            className={styles.deleteBatchButton}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                color: '#ff4d4d', 
                                background: 'rgba(255, 77, 77, 0.1)',
                                border: '1px solid rgba(255, 77, 77, 0.2)',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            <Trash2 size={14} /> Delete Selected ({selectedSlugs.length})
                        </button>
                    )}
                    <button 
                        type="button" 
                        onClick={handleSelectAll}
                        style={{ background: 'none', border: 'none', color: '#1e90ff', cursor: 'pointer', fontSize: '13px' }}
                    >
                        {selectedSlugs.length === albums.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {/* New Project Card */}
                <Link href="/admin/portfolio/create" className={styles.newCard}>
                    <Plus className={styles.plusIcon} />
                    <span className={styles.newText}>Create New Project</span>
                </Link>

                {/* Project Cards */}
                {albums.map((album: any, index: number) => {
                    const stats = getStats();
                    const isSelected = selectedSlugs.includes(album.slug);
                    
                    return (
                        <div 
                            key={album.slug} 
                            className={`${styles.projectCard} ${isSelected ? styles.projectCardSelected : ''}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className={styles.cardImageContainer}>
                                <div 
                                    className={`${styles.selectorCircle} ${isSelected ? styles.selectorCircleActive : ''}`}
                                    onClick={(e) => toggleSelection(e, album.slug)}
                                >
                                    {isSelected ? <CheckCircle2 size={16} color="#fff" fill="#1e90ff" /> : <Circle size={16} color="rgba(255,255,255,0.5)" />}
                                </div>
                                <Link href={`/admin/portfolio/${album.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                                    {album.entry.publishing?.cover ? (
                                        <img 
                                            src={album.entry.publishing.cover} 
                                            alt={album.entry.title} 
                                            className={styles.cardImage} 
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: '#282a36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Circle size={40} color="#3a3a45" />
                                        </div>
                                    )}
                                </Link>
                            </div>
                            
                            <Link href={`/admin/portfolio/${album.slug}`} className={styles.cardMeta} style={{ textDecoration: 'none' }}>
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
                            </Link>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
