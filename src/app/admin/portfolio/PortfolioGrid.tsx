"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './portfolio.module.css';
import { 
    Eye, Heart, MessageSquare, Plus, Trash2, CheckCircle2, Circle, GripVertical
} from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/utils/supabase';

interface PortfolioGridProps {
    albums: any[];
}

export default function PortfolioGrid({ albums: initialAlbums }: PortfolioGridProps) {
    // Initialize sorted albums
    const [albums, setAlbums] = useState<any[]>(() => {
        return [...initialAlbums].sort((a, b) => (a.entry.priority || 0) - (b.entry.priority || 0));
    });

    const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
    
    // Stats cache
    const [stats, setStats] = useState<Record<string, { views: number, likes: number, comments: number }>>({});

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
        const fetchStats = async () => {
            const newStats: Record<string, any> = {};
            
            // We'll fetch one by one for now as it's an admin panel with limited items
            // Optimally, we would use a Supabase RPC or view for grouped counts
            for (const album of initialAlbums) {
                const slug = album.slug;
                
                // Likes
                const { count: likesCount } = await supabase
                    .from('likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('project_slug', slug);

                // Comments
                const { count: commentsCount } = await supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('project_slug', slug);

                // Views - currently not tracked in DB, using 0
                // If you have a 'views' table, add similar logic here
                
                newStats[slug] = {
                    views: 0, 
                    likes: likesCount || 0,
                    comments: commentsCount || 0
                };
            }
            setStats(newStats);
        };
        
        fetchStats();
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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

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

            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className={styles.grid}>
                    {/* New Project Card */}
                    <Link href="/admin/portfolio/create" className={styles.newCard}>
                        <Plus className={styles.plusIcon} />
                        <span className={styles.newText}>Create New Project</span>
                    </Link>

                    <SortableContext 
                        items={albums.map(a => a.slug)}
                        strategy={rectSortingStrategy}
                    >
                        {albums.map((album) => (
                            <SortableAlbumCard
                                key={album.slug}
                                album={album}
                                isSelected={selectedSlugs.includes(album.slug)}
                                toggleSelection={toggleSelection}
                                stats={stats[album.slug]}
                            />
                        ))}
                    </SortableContext>
                </div>
            </DndContext>
        </>
    );
}

// Separate component for Sortable Item
function SortableAlbumCard({ album, isSelected, toggleSelection, stats }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: album.slug });

    const style = {
        transform: CSS.Translate.toString(transform),
        // If dragging, kill transition to prevent CSS interference (no lag).
        // If swapping (transition exists), use it.
        // Otherwise (idle), let CSS hover effects apply.
        transition: isDragging ? 'none' : transition,
        zIndex: isDragging ? 999 : 'auto',
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none'
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={`${styles.projectCard} ${isSelected ? styles.projectCardSelected : ''}`}
        >
            <div className={styles.cardImageContainer}>
                {/* Drag Handle */}
                <div 
                    {...attributes} 
                    {...listeners}
                    className={styles.dragHandle}
                    style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        zIndex: 20,
                        cursor: 'grab',
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
            </Link>
        </div>
    );
}
