"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../portfolio/portfolio.module.css'; // Reusing portfolio styles
import { 
    Eye, EyeOff, Plus, Trash2, Check, Circle, GripVertical, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface BlogGridProps {
    posts: any[];
    onBatchAction?: (slugs: string[]) => void;
}

export default function BlogGrid({ posts: initialPosts, onBatchAction }: BlogGridProps) {
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>(initialPosts);
    const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setPosts(initialPosts);
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

    const handleDeleteSelected = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (selectedSlugs.length === 0) return;
        
        const message = `Are you sure you want to PERMANENTLY delete ${selectedSlugs.length} post(s)? This action cannot be undone.`;

        if (!window.confirm(message)) return;
        
        setDeletingIds(selectedSlugs);

        try {
            const res = await fetch('/api/blog/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slugs: selectedSlugs })
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                setPosts(prev => prev.filter(p => !selectedSlugs.includes(p.slug)));
                setSelectedSlugs([]);
                setDeletingIds([]);
                
                if (data.errors && data.errors.length > 0) {
                    alert(`Some posts had errors: ${data.errors.join(', ')}`);
                }
                
                if (onBatchAction) onBatchAction(selectedSlugs);
            } else {
                console.error('Delete failed:', data);
                alert(`Failed to delete posts: ${data.error || 'Unknown error'}`);
                setDeletingIds([]);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting posts.');
            setDeletingIds([]);
        }
    };

    return (
        <>
            {/* Selection Toolbar */}
            <div className={styles.filtersRow} style={{ justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {selectedSlugs.length > 0 && (
                        <button 
                            type="button"
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
                            <Trash2 size={14} /> Delete Forever ({selectedSlugs.length})
                        </button>
                    )}
                    <button 
                        type="button" 
                        onClick={handleSelectAll}
                        style={{ background: 'none', border: 'none', color: '#1e90ff', cursor: 'pointer', fontSize: '13px' }}
                    >
                        {selectedSlugs.length === posts.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Create New Card - Link to Keystatic Create */}
                <Link 
                    href="/keystatic/collection/posts/create" 
                    className={styles.newCard}
                >
                    <Plus className={styles.plusIcon} />
                    <span className={styles.newText}>Create New Post</span>
                </Link>

                {posts.map((post) => (
                    <BlogPostCard
                        key={post.slug}
                        post={post}
                        isSelected={selectedSlugs.includes(post.slug)}
                        toggleSelection={toggleSelection}
                        isBeingDeleted={deletingIds.includes(post.slug)}
                        isMounted={isMounted}
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
    isBeingDeleted,
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
                isBeingDeleted
                    ? getExitAnimation()
                    : { opacity: 1, scale: 1 }
            }
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`${styles.projectCard} ${isSelected ? styles.projectCardSelected : ''}`}
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

                <Link href={`/keystatic/collection/posts/item/${post.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                    {post.entry.image ? (
                        <img 
                            src={post.entry.image} 
                            alt={post.entry.title} 
                            className={styles.cardImage} 
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: '#282a36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={40} color="#3a3a45" />
                        </div>
                    )}
                </Link>
            </div>
            
            <Link 
                href={`/keystatic/collection/posts/item/${post.slug}`} 
                className={styles.cardMeta} 
                style={{ textDecoration: 'none', display: 'block' }}
            >
                <div className={styles.cardTitle}>{post.entry.title}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span 
                        className={`${styles.statusBadge}`}
                        style={{ 
                            background: '#282a36',
                            color: '#9a9cab',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}
                    >
                        {post.entry.publishedAt ? new Date(post.entry.publishedAt).toLocaleDateString() : 'Draft'}
                    </span>
                    
                    {post.entry.tag && (
                        <span style={{ fontSize: '12px', color: '#1e90ff' }}>#{post.entry.tag}</span>
                    )}
                </div>
                
                {post.entry.summary && (
                    <div style={{ fontSize: '12px', color: '#5c5c6b', marginTop: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.entry.summary}
                    </div>
                )}
            </Link>
        </motion.article>
    );
}
