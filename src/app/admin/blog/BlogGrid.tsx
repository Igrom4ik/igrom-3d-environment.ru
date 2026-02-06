"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../portfolio/portfolio.module.css'; // Reusing portfolio styles
import { getImageUrl } from '@/lib/assets';
import { 
    Eye, EyeOff, Plus, Trash2, Check, Circle, GripVertical, FileText, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface BlogGridProps {
    posts: any[];
    isTrash?: boolean;
    onMoveToTrash?: (slugs: string[]) => void;
    onRestore?: (slugs: string[]) => void;
    onPermanentDelete?: (slugs: string[]) => void;
}

export default function BlogGrid({ 
    posts: initialPosts, 
    isTrash = false,
    onMoveToTrash,
    onRestore,
    onPermanentDelete
}: BlogGridProps) {
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>(initialPosts);
    const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
    const [processingIds, setProcessingIds] = useState<string[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setPosts(initialPosts);
        // Clear selection when posts change (e.g. switching tabs)
        setSelectedSlugs([]);
    }, [initialPosts]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
        if (selectedSlugs.length === posts.length) {
            setSelectedSlugs([]);
        } else {
            setSelectedSlugs(posts.map(p => p.slug));
        }
    };

    const handleBatchAction = async (e: React.MouseEvent, action: 'trash' | 'restore' | 'delete') => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (selectedSlugs.length === 0) return;
        
        let confirmMsg = '';
        if (action === 'trash') confirmMsg = `Move ${selectedSlugs.length} post(s) to Trash?`;
        if (action === 'restore') confirmMsg = `Restore ${selectedSlugs.length} post(s)?`;
        if (action === 'delete') confirmMsg = `PERMANENTLY delete ${selectedSlugs.length} post(s)? This cannot be undone.`;

        if (!window.confirm(confirmMsg)) return;
        
        setProcessingIds(selectedSlugs);

        try {
            let res;
            if (action === 'delete') {
                // Permanent Delete
                res = await fetch('/api/blog/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slugs: selectedSlugs })
                });
            } else {
                // Trash / Restore
                res = await fetch('/api/blog/trash', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slugs: selectedSlugs, action })
                });
            }
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                // Update parent state
                if (action === 'trash' && onMoveToTrash) onMoveToTrash(selectedSlugs);
                if (action === 'restore' && onRestore) onRestore(selectedSlugs);
                if (action === 'delete' && onPermanentDelete) onPermanentDelete(selectedSlugs);
                
                // Local cleanup handled by parent passing new props, but clear selection here
                setSelectedSlugs([]);
                setProcessingIds([]);
            } else {
                alert(`Failed: ${data.error || 'Unknown error'}`);
                setProcessingIds([]);
            }
        } catch (error) {
            console.error('Action error:', error);
            alert('Error processing request.');
            setProcessingIds([]);
        }
    };

    return (
        <>
            {/* Selection Toolbar */}
            <div className={styles.filtersRow} style={{ justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {selectedSlugs.length > 0 && (
                        <>
                            {isTrash ? (
                                <>
                                    <button 
                                        type="button"
                                        onClick={(e) => handleBatchAction(e, 'restore')}
                                        className={styles.actionButton}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '6px', 
                                            color: '#1e90ff', background: 'rgba(30, 144, 255, 0.1)',
                                            border: '1px solid rgba(30, 144, 255, 0.2)',
                                            padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
                                        }}
                                    >
                                        <RefreshCw size={14} /> Восстановить ({selectedSlugs.length})
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => handleBatchAction(e, 'delete')}
                                        className={styles.actionButton}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '6px', 
                                            color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)',
                                            border: '1px solid rgba(255, 77, 77, 0.2)',
                                            padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
                                        }}
                                    >
                                        <Trash2 size={14} /> Удалить Навсегда ({selectedSlugs.length})
                                    </button>
                                </>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={(e) => handleBatchAction(e, 'trash')}
                                    className={styles.actionButton}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '6px', 
                                        color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)',
                                        border: '1px solid rgba(255, 77, 77, 0.2)',
                                        padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
                                    }}
                                >
                                    <Trash2 size={14} /> В Корзину ({selectedSlugs.length})
                                </button>
                            )}
                        </>
                    )}
                    <button 
                        type="button" 
                        onClick={handleSelectAll}
                        style={{ background: 'none', border: 'none', color: '#1e90ff', cursor: 'pointer', fontSize: '13px' }}
                    >
                        {selectedSlugs.length === posts.length ? 'Снять выделение' : 'Выбрать Все'}
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {!isTrash && (
                    <Link 
                        href="/admin/blog/create" 
                        className={styles.newCard}
                    >
                        <Plus className={styles.plusIcon} />
                        <span className={styles.newText}>Создать Статью</span>
                    </Link>
                )}

                {posts.map((post) => (
                    <BlogPostCard
                        key={post.slug}
                        post={post}
                        isSelected={selectedSlugs.includes(post.slug)}
                        toggleSelection={toggleSelection}
                        isProcessing={processingIds.includes(post.slug)}
                        isTrash={isTrash}
                    />
                ))}
            </div>
        </>
    );
}

function BlogPostCard({ 
    post, 
    isSelected, 
    toggleSelection, 
    isProcessing,
    isTrash
}: any) {
    const getExitAnimation = () => {
        return {
            opacity: 0,
            scale: 0.9,
            filter: "blur(10px)",
        };
    };

    return (
        <motion.article
            initial={false}
            animate={
                isProcessing
                    ? getExitAnimation()
                    : { opacity: 1, scale: 1 }
            }
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`${styles.projectCard} ${isSelected ? styles.projectCardSelected : ''}`}
            style={isTrash ? { opacity: 0.7 } : {}}
        >
            <div className={styles.cardImageContainer}>
                <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '8px', zIndex: 20 }}>
                    <div 
                        className={`${styles.selectorCircle} ${isSelected ? styles.selectorCircleActive : ''}`}
                        onClick={(e) => toggleSelection && toggleSelection(e, post.slug)}
                    >
                        {isSelected ? <Check size={14} color="#1e90ff" strokeWidth={3} /> : null}
                    </div>
                </div>

                {/* Disable link if in trash, or link to preview? */}
                <Link href={isTrash ? '#' : `/admin/blog/edit/${post.slug}`} style={{ display: 'block', width: '100%', height: '100%', pointerEvents: isTrash ? 'none' : 'auto' }}>
                    {post.entry.image ? (
                        <img 
                            src={getImageUrl(post.entry.image)} 
                            alt={post.entry.title} 
                            className={styles.cardImage} 
                            style={isTrash ? { filter: 'grayscale(100%)' } : {}}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: '#282a36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={40} color="#3a3a45" />
                        </div>
                    )}
                </Link>
            </div>
            
            <div className={styles.cardMeta}>
                <div className={styles.cardTitle}>{post.entry.title}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span 
                        className={`${styles.statusBadge}`}
                        style={{ 
                            background: post.entry.hidden ? 'rgba(231, 76, 60, 0.1)' : '#282a36',
                            color: post.entry.hidden ? '#e74c3c' : '#9a9cab',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            border: post.entry.hidden ? '1px solid rgba(231, 76, 60, 0.2)' : 'none'
                        }}
                    >
                        {isTrash ? 'Deleted' : (post.entry.hidden ? 'Draft' : (post.entry.publishedAt ? new Date(post.entry.publishedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Draft'))}
                    </span>
                    
                    {post.entry.tag && (
                        <span style={{ fontSize: '12px', color: '#1e90ff' }}>#{post.entry.tag.split(',')[0]}</span>
                    )}
                </div>
                
                {post.entry.summary && (
                    <div style={{ fontSize: '12px', color: '#5c5c6b', marginTop: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.entry.summary}
                    </div>
                )}
            </div>
        </motion.article>
    );
}
