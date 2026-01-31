"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './portfolio.module.css';
import { 
    Eye, EyeOff, Heart, MessageSquare, Plus, Trash2, Check, Circle, GripVertical, Settings
} from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  defaultAnimateLayoutChanges
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioGridProps {
    albums: any[];
    onAlbumUpdate?: (album: any) => void;
    onBatchAction?: (slugs: string[], action: 'soft' | 'hard' | 'restore') => void;
    onReorder?: (albums: any[]) => void;
    activeTab: 'all' | 'hidden';
}

import { useRouter } from 'next/navigation';

export default function PortfolioGrid({ albums: initialAlbums, onAlbumUpdate, onBatchAction, onReorder, activeTab }: PortfolioGridProps) {
    const router = useRouter();
    // Initialize sorted albums
    const [albums, setAlbums] = useState<any[]>(() => {
        return [...initialAlbums].sort((a, b) => (a.entry.priority || 0) - (b.entry.priority || 0));
    });

    const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    
    // Stats cache
    const [stats, setStats] = useState<Record<string, { views: number, likes: number, comments: number }>>({});
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setAlbums([...initialAlbums].sort((a, b) => (a.entry.priority || 0) - (b.entry.priority || 0)));
    }, [initialAlbums]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require movement of 8px to start drag (prevents accidental drags on click)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch stats on mount
    useEffect(() => {
        let isMounted = true;
        const fetchStats = async () => {
            const newStats: Record<string, any> = {};
            
            // We'll fetch one by one for now as it's an admin panel with limited items
            // Optimally, we would use a Supabase RPC or view for grouped counts
            for (const album of initialAlbums) {
                if (!isMounted) break;
                const slug = album.slug;
                
                try {
                    // Likes
                    const { count: likesCount, error: likesError } = await supabase
                        .from('likes')
                        .select('*', { count: 'exact', head: true })
                        .eq('project_slug', slug);

                    if (likesError) throw likesError;

                    // Comments
                    const { count: commentsCount, error: commentsError } = await supabase
                        .from('comments')
                        .select('*', { count: 'exact', head: true })
                        .eq('project_slug', slug);
                    
                    if (commentsError) throw commentsError;

                    // Views - currently not tracked in DB, using 0
                    // If you have a 'views' table, add similar logic here
                    
                    newStats[slug] = {
                        views: 0, 
                        likes: likesCount || 0,
                        comments: commentsCount || 0
                    };
                } catch (error) {
                    console.warn(`[Stats] Failed to fetch for ${slug}:`, error);
                    // Keep defaults (0)
                    newStats[slug] = { views: 0, likes: 0, comments: 0 };
                }
            }
            if (isMounted) {
                setStats(newStats);
            }
        };
        
        if (initialAlbums.length > 0) {
            fetchStats();
        }

        return () => {
            isMounted = false;
        };
    }, [initialAlbums]);

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

    const handleDeleteSelected = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (selectedSlugs.length === 0) return;
        
        const message = `Are you sure you want to PERMANENTLY delete ${selectedSlugs.length} project(s)? This action cannot be undone and will remove files from the server.`;

        // Synchronous blocking confirm
        if (!window.confirm(message)) return;
        
        // Start animation ONLY after confirmation
        console.log('User confirmed deletion, starting animation...');
        setDeletingIds(selectedSlugs);

        // Wait for animation to complete (approx 500ms)
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const res = await fetch('/api/portfolio/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    slugs: selectedSlugs, 
                    action: 'hard' 
                })
            });
            
            let data;
            try {
                data = await res.json();
            } catch (e) {
                console.error("Failed to parse delete response JSON", e);
                data = { error: "Invalid server response" };
            }
            
            if (res.ok && data.success) {
                // Remove from local state
                setAlbums(prev => prev.filter(a => !selectedSlugs.includes(a.slug)));
                setSelectedSlugs([]);
                setDeletingIds([]);
                
                if (data.errors) {
                    alert(`Some projects had errors: ${data.errors.join(', ')}`);
                }
                
                if (onBatchAction) onBatchAction(selectedSlugs, 'hard');
            } else {
                console.error('Delete failed. Status:', res.status, 'Data:', data);
                const errorMessage = data.error || (data.errors ? data.errors.join(', ') : 'Unknown error');
                alert(`Failed to delete projects: ${errorMessage}`);
                setDeletingIds([]); // Revert animation state if failed
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert(`Error deleting projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setDeletingIds([]);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            setAlbums((items) => {
                const oldIndex = items.findIndex((item) => item.slug === active.id);
                const newIndex = items.findIndex((item) => item.slug === over.id);
                
                const newOrder = arrayMove(items, oldIndex, newIndex);
                
                // Update priorities in background
                // We assign priority based on index * 10 to allow future insertions
                const updates = newOrder.map((item, index) => ({
                    slug: item.slug,
                    priority: index * 10
                }));

                // Notify parent
                if (onReorder) {
                    onReorder(newOrder);
                }

                // Call API to save order
                fetch('/api/portfolio/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: updates })
                }).catch(err => console.error("Failed to save order:", err));

                return newOrder;
            });
        }
    };

    const toggleHidden = async (e: React.MouseEvent, slug: string, currentHidden: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        
        const album = albums.find(a => a.slug === slug);
        if (!album) return;

        const updatedAlbum = { ...album, entry: { ...album.entry, hidden: !currentHidden } };

        // Optimistic update
        setAlbums(prev => prev.map(a => a.slug === slug ? updatedAlbum : a));
        
        // Notify parent immediately for optimistic UI update
        if (onAlbumUpdate) {
             onAlbumUpdate(updatedAlbum);
        }

        try {
            const res = await fetch('/api/portfolio/toggle-hidden', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, hidden: !currentHidden })
            });
            if (!res.ok) {
                const text = await res.text();
                console.error('Toggle hidden failed:', text);
                throw new Error(`Server returned ${res.status}: ${text.substring(0, 50)}`);
            }
        } catch (err) {
            console.error('Toggle hidden error:', err);
            // Revert
            const revertedAlbum = { ...album, entry: { ...album.entry, hidden: currentHidden } };
            setAlbums(prev => prev.map(a => a.slug === slug ? revertedAlbum : a));
            
            // Notify parent of revert
            if (onAlbumUpdate) onAlbumUpdate(revertedAlbum);
            
            alert('Failed to update visibility. Check console for details.');
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
                        {selectedSlugs.length === albums.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
            </div>

            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className={styles.grid}>
                    <Link 
                        href={`/admin/portfolio/create${activeTab === 'hidden' ? '?hidden=true' : ''}`} 
                        className={styles.newCard}
                    >
                        <Plus className={styles.plusIcon} />
                        <span className={styles.newText}>
                            {activeTab === 'hidden' ? 'Create New Hidden Project' : 'Create New Project'}
                        </span>
                    </Link>

                    {isMounted ? (
                        <SortableContext 
                            items={albums.map(a => a.slug)}
                            strategy={rectSortingStrategy}
                        >
                            {albums.map((album) => (
                                <PortfolioProjectCard
                                    key={album.slug}
                                    album={album}
                                    isSelected={selectedSlugs.includes(album.slug)}
                                    toggleSelection={toggleSelection}
                                    toggleHidden={toggleHidden}
                                    stats={stats[album.slug]}
                                    isBeingDeleted={deletingIds.includes(album.slug)}
                                    isMounted={isMounted}
                                    isInTrash={false} // Explicitly pass false as we don't have trash tab logic yet
                                    onNavigate={(slug: string) => router.push(`/admin/portfolio/${slug}`)}
                                />
                            ))}
                        </SortableContext>
                    ) : (
                        /* Server-side / Hydration fallback - non-draggable static list */
                        albums.map((album) => (
                            <Link href={`/admin/portfolio/${album.slug}`} key={album.slug} className={styles.projectCard} style={{ display: 'block', textDecoration: 'none' }}>
                                <div className={styles.cardImageContainer}>
                                    <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '8px', zIndex: 20 }}>
                                        <div 
                                            className={styles.visibilityToggle}
                                            style={{
                                                padding: '4px',
                                                background: 'rgba(0,0,0,0.5)',
                                                borderRadius: '4px',
                                                color: album.entry.hidden ? '#ff4d4d' : 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: album.entry.hidden ? '1px solid #ff4d4d' : 'none'
                                            }}
                                        >
                                            {album.entry.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </div>
                                        <div className={styles.selectorCircle} style={{ cursor: 'default' }} />
                                    </div>
                                     {album.entry.publishing?.cover ? (
                                        <img src={album.entry.publishing.cover} alt={album.entry.title} className={styles.cardImage} />
                                     ) : (
                                        <div style={{ width: '100%', height: '100%', background: '#282a36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Circle size={40} color="#3a3a45" />
                                        </div>
                                     )}
                                </div>
                                <div className={styles.cardMeta}>
                                    <div className={styles.cardTitle}>{album.entry.title}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                        <span 
                                            style={{ 
                                                fontSize: '12px', 
                                                padding: '2px 6px', 
                                                borderRadius: '4px',
                                                background: album.entry.hidden ? 'rgba(255, 77, 77, 0.1)' : '#282a36',
                                                color: album.entry.hidden ? '#ff4d4d' : '#9a9cab',
                                                border: album.entry.hidden ? '1px solid rgba(255, 77, 77, 0.2)' : 'none'
                                            }}
                                        >
                                            {album.entry.hidden ? 'Hidden' : 'Published'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
                
                <DragOverlay adjustScale={true}>
                    {activeId ? (
                        <ProjectCard 
                            album={albums.find(a => a.slug === activeId)}
                            isSelected={selectedSlugs.includes(activeId)}
                            toggleSelection={() => {}} 
                            toggleHidden={() => {}} 
                            stats={stats[activeId] || { views: 0, likes: 0, comments: 0 }}
                            isBeingDeleted={false}
                            isInTrash={false}
                            isOverlay
                            isDragging
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </>
    );
}

function PortfolioProjectCard({ 
    album, 
    isSelected, 
    toggleSelection, 
    toggleHidden,
    stats, 
    isBeingDeleted,
    isInTrash,
    isMounted,
    onNavigate
}: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        node 
    } = useSortable({ 
        id: album.slug,
        animateLayoutChanges: (args) => 
            defaultAnimateLayoutChanges({ ...args, wasDragging: true }), 
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : (isBeingDeleted ? 0 : 'auto'),
        touchAction: 'none',
    };
    
    return (
        <ProjectCard
            album={album}
            isSelected={isSelected}
            toggleSelection={toggleSelection}
            toggleHidden={toggleHidden}
            stats={stats}
            isBeingDeleted={isBeingDeleted}
            isInTrash={isInTrash}
            isDragging={isDragging}
            innerRef={setNodeRef}
            style={style}
            dragHandleProps={{ ...attributes, ...listeners }}
            domNode={node}
            onNavigate={onNavigate}
        />
    );
}

function ProjectCard({
    album,
    isSelected,
    toggleSelection,
    toggleHidden,
    stats,
    isBeingDeleted,
    isInTrash,
    isDragging,
    isOverlay,
    dragHandleProps,
    innerRef,
    style,
    domNode,
    onNavigate
}: any) {
    // Animation variants
    const getExitAnimation = () => {
        return {
            opacity: 0,
            scale: 0.9,
            filter: "blur(10px)",
        };
    };

    return (
        <motion.article
            ref={innerRef}
            style={style} 
            initial={false}
            animate={
                isBeingDeleted
                    ? getExitAnimation()
                    : {
                        scale: isOverlay ? 1.1 : (isDragging ? 0.95 : 1), 
                        boxShadow: isOverlay
                             ? "0 20px 40px rgba(0,0,0,0.6), 0 0 0 2px #1e90ff" 
                             : "0 4px 12px rgba(0,0,0,0.2)",
                        opacity: isDragging && !isOverlay ? 0.3 : 1, 
                        rotate: isOverlay ? 3 : 0,
                        filter: isDragging && !isOverlay ? "grayscale(100%) blur(1px)" : "blur(0px)",
                        zIndex: isOverlay ? 9999 : 1,
                    }
            }
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`${styles.projectCard} ${isInTrash ? styles.trashCard : ''} ${isSelected ? styles.projectCardSelected : ''}`}
        >
            <div className={styles.cardImageContainer}>
                {/* Drag Handle */}
                <div 
                    {...dragHandleProps}
                    className={styles.dragHandle}
                    style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        zIndex: 20,
                        cursor: isOverlay ? 'grabbing' : 'grab',
                        padding: '4px',
                        background: 'rgba(0,0,0,0.5)',
                        borderRadius: '4px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <GripVertical size={16} />
                </div>

                {/* Right Side Icons Group */}
                <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '8px', zIndex: 20 }}>
                    {/* Visibility Toggle */}
                    <div 
                        className={styles.visibilityToggle}
                        onClick={(e) => toggleHidden && toggleHidden(e, album.slug, album.entry.hidden)}
                        style={{
                            cursor: 'pointer',
                            padding: '4px',
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: '4px',
                            color: album.entry.hidden ? '#ff4d4d' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: album.entry.hidden ? '1px solid #ff4d4d' : 'none'
                        }}
                    >
                        {album.entry.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                    </div>

                    <div 
                        className={`${styles.selectorCircle} ${isSelected ? styles.selectorCircleActive : ''}`}
                        onClick={(e) => toggleSelection && toggleSelection(e, album.slug)}
                    >
                        {isSelected ? <Check size={14} color="#1e90ff" strokeWidth={3} /> : null}
                    </div>
                </div>

                <div style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
                    {/* If overlay, don't use Link, just show image */}
                    {isOverlay ? (
                        album.entry.publishing?.cover ? (
                            <img 
                                src={album.entry.publishing.cover} 
                                alt={album.entry.title} 
                                className={styles.cardImage} 
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#282a36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Circle size={40} color="#3a3a45" />
                            </div>
                        )
                    ) : (
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
                    )}
                </div>
            </div>
            
            <div 
                className={styles.cardMeta} 
                style={{ textDecoration: 'none', cursor: isOverlay ? 'default' : 'pointer' }}
                onClick={(e) => {
                    if (!isOverlay && !isDragging && onNavigate) {
                        onNavigate(album.slug);
                    }
                }}
            >
                <div className={styles.cardTitle}>{album.entry.title}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span 
                        className={`${styles.statusBadge} ${styles.statusPublished}`}
                        style={{ 
                            background: album.entry.hidden ? 'rgba(255, 77, 77, 0.1)' : undefined,
                            color: album.entry.hidden ? '#ff4d4d' : undefined,
                            border: album.entry.hidden ? '1px solid rgba(255, 77, 77, 0.2)' : undefined
                        }}
                    >
                        {album.entry.hidden ? 'Hidden' : 'Published'}
                    </span>
                    
                    <div className={styles.cardStats}>
                        <span className={styles.statItem}>
                            <Eye size={12} /> {stats?.views || 0}
                        </span>
                        <span className={styles.statItem}>
                            <Heart size={12} /> {stats?.likes || 0}
                        </span>
                        <span className={styles.statItem}>
                            <MessageSquare size={12} /> {stats?.comments || 0}
                        </span>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
