"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../editor.module.css';
import { 
    Image as ImageIcon, Video, Box, Globe, Upload, Trash2, 
    ChevronLeft, Save, Eye, Check, GripVertical, X, Star, EyeOff 
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
import { motion } from 'framer-motion';
import { uploadFileUnified } from '@/utils/largeFileUpload';

interface ProjectEditorProps {
    slug: string;
    initialData?: ProjectData | null;
}

interface MediaItemValue {
    src: string;
    url?: string;
    caption?: string;
    width?: string;
    height?: string;
    manualPath?: string;
}

interface MediaItem {
    id: number;
    type: string;
    value: MediaItemValue;
}

interface ProjectData {
    title?: string;
    content?: string;
    description?: string; // Keystatic often stores it here
    hidden?: boolean;
    categorization?: {
        medium?: string[];
        software?: string[];
        tags?: string[];
    };
    images?: Array<{ discriminant: string; value: MediaItemValue }>;
    publishing?: { cover?: string };
}

type DeletionStyle = 'dissolve' | 'trash';

function SortableMediaItem({ 
    item, 
    index, 
    onDelete, 
    onChange, 
    onExpand,
    isBeingDeleted,
    deletionStyle,
    isOverlay,
    isCover,
    onSetCover
}: { 
    item: MediaItem, 
    index?: number, 
    onDelete: () => void, 
    onChange: (item: MediaItem) => void,
    onExpand: (item: MediaItem) => void,
    isBeingDeleted: boolean,
    deletionStyle: DeletionStyle,
    isOverlay?: boolean,
    isCover?: boolean,
    onSetCover?: () => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ 
        id: item.id,
        animateLayoutChanges: (args) => 
            defaultAnimateLayoutChanges({ ...args, wasDragging: true }),
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isOverlay ? 9999 : (isDragging ? 999 : (isBeingDeleted ? 0 : 'auto')),
        touchAction: 'none'
    };

    // Animation variants
    const getExitAnimation = () => {
        if (deletionStyle === 'trash') {
            return {
                opacity: 0,
                scale: 0.6,
                x: 120, 
                y: 80,
                rotate: -12,
            };
        }
        return {
            opacity: 0,
            scale: 0.7,
            y: 40,
            filter: "blur(4px)",
        };
    };

    return (
        <motion.div 
            ref={setNodeRef} 
            style={style as any} 
            className={styles.mediaCard}
            // layout prop removed to prevent conflict with dnd-kit
            initial={false}
            animate={
                isBeingDeleted
                    ? getExitAnimation()
                    : {
                        scale: isOverlay ? 1.05 : (isDragging ? 0.95 : 1),
                        boxShadow: isOverlay
                            ? "0 20px 40px rgba(0,0,0,0.6), 0 0 0 2px #1e90ff" 
                            : "0 2px 10px rgba(0,0,0,0.2)",
                        opacity: isDragging && !isOverlay ? 0.3 : 1,
                        y: 0,
                        x: 0,
                        rotate: isOverlay ? 3 : 0,
                        filter: isDragging && !isOverlay ? "grayscale(100%) blur(1px)" : "blur(0px)",
                    }
            }
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
            {/* Card Header (Drag Handle + Actions) */}
            <div 
                className={styles.cardHeader}
                {...attributes} 
                {...listeners}
                style={{ cursor: isOverlay ? 'grabbing' : 'grab' }}
            >
                <div className={styles.cardHeaderLeft}>
                    <GripVertical size={16} />
                    <span>
                        {item.type === 'image' ? 'Image' : 
                         item.type === 'video' ? 'Video' : 
                         item.type === 'marmoset' ? 'Marmoset' : 'Embed'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onPointerDown={(e) => e.stopPropagation()}>
                    {/* Set Cover Button */}
                    {onSetCover && (
                         <button
                            type="button"
                            className={styles.headerActionBtn || styles.headerDeleteBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSetCover();
                            }}
                            title="Set as Main Image"
                            style={{ 
                                color: isCover ? '#ffd700' : '#555',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Star size={14} fill={isCover ? '#ffd700' : 'none'} />
                        </button>
                    )}
                    <button 
                        className={styles.headerDeleteBtn} 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Preview */}
            <div 
                className={styles.mediaPreview} 
                onClick={() => onExpand(item)}
            >
                {item.type === 'marmoset' ? (
                    <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#1a1a1a'}}>
                        <Box size={48} color="#555" />
                        <span style={{marginLeft:8, color:'#777'}}>Marmoset Viewer</span>
                    </div>
                ) : item.type === 'video' ? (
                    <video src={item.value.src} style={{width:'100%', height:'100%'}} muted />
                ) : item.type === 'image' ? (
                    <img src={item.value.src} alt={item.value.caption} style={{width:'100%', height:'100%', objectFit: 'cover'}} />
                ) : (
                    <div style={{ color: '#555', display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <Globe size={32} />
                        <span>{item.type} Embed</span>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className={styles.cardControls}>
                <textarea 
                    className={styles.captionInput} 
                    placeholder="Caption" 
                    value={item.value.caption || ''}
                    onChange={(e) => {
                        onChange({
                            ...item,
                            value: { ...item.value, caption: e.target.value }
                        });
                    }}
                />
                {item.type === 'marmoset' && (
                    <input 
                        type="text" 
                        className={styles.input} 
                        placeholder="MView Path" 
                        value={item.value.src || ''}
                        readOnly
                        style={{ marginTop: 8 }}
                    />
                )}
                {(item.type === 'youtube' || item.type === 'sketchfab') && (
                    <input 
                        type="text" 
                        className={styles.input} 
                        placeholder={`${item.type === 'youtube' ? 'YouTube' : 'Sketchfab'} URL`} 
                        value={item.value.url || item.value.src || ''}
                        onChange={(e) => {
                             onChange({
                                ...item,
                                value: { ...item.value, url: e.target.value, src: e.target.value }
                            });
                        }}
                        style={{ marginTop: 8 }}
                    />
                )}
            </div>
        </motion.div>
    );
}

export default function ProjectEditor({ slug: initialSlug, initialData }: ProjectEditorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [slug, setSlug] = useState<string>(initialSlug);
    const [loading, setLoading] = useState(!initialData && initialSlug !== 'create');
    const [saving, setSaving] = useState(false);
    
    // Deletion animation state
    const [deletingIds, setDeletingIds] = useState<number[]>([]);
    const [deletionStyle, setDeletionStyle] = useState<DeletionStyle>('dissolve');
    const [activeId, setActiveId] = useState<number | null>(null);

    // Form State
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || initialData?.content || '');
    const [hidden, setHidden] = useState(initialData?.hidden || false);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
        if (initialData?.images && Array.isArray(initialData.images)) {
             return initialData.images.map((img) => ({
                id: Math.random(),
                type: img.discriminant,
                value: img.value
            }));
        }
        return [];
    });
    const [mediums, setMediums] = useState<string[]>(initialData?.categorization?.medium || []);
    const [software, setSoftware] = useState<string[]>(initialData?.categorization?.software || []);
    const [tags, setTags] = useState<string[]>(initialData?.categorization?.tags || []);
    const [coverImage, setCoverImage] = useState(initialData?.publishing?.cover || '');
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (slug === 'create') {
            const isHidden = searchParams.get('hidden') === 'true';
            if (isHidden) setHidden(true);
            setLoading(false);
        }
    }, [slug, searchParams]);

    const transliterate = (text: string) => {
        const ru: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
            'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
            'я': 'ya'
        };
        
        return text.toLowerCase().split('').map(char => {
            return ru[char] || char;
        }).join('').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    };

    const handleSave = async () => {
        setSaving(true);
        const generatedSlug = slug === 'create' ? transliterate(title) : slug;
        
        const data = {
            slug: generatedSlug,
            title,
            description, // This needs to be MDOC content? Or structured? Keystatic uses document field.
            // We'll save it as content for now.
            content: description, 
            hidden,
            categorization: {
                medium: mediums,
                software: software,
                tags: tags
            },
            images: mediaItems.map(item => ({
                discriminant: item.type,
                value: item.value
            })),
            publishing: {
                date: new Date().toISOString().split('T')[0],
                cover: coverImage
            }
        };

        try {
            const res = await fetch('/api/portfolio/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (res.ok) {
                alert('Project saved successfully!');
                if (slug === 'create') {
                    router.push(`/admin/portfolio/${data.slug}`);
                }
            } else {
                alert('Failed to save project.');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving project.');
        } finally {
            setSaving(false);
        }
    };

    // Hidden file input ref
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [fileType, setFileType] = React.useState<string>('image');

    const handleFileSelect = (type: string) => {
        setFileType(type);
        if (fileInputRef.current) {
            // Set accept attribute based on type
            if (type === 'image') fileInputRef.current.accept = 'image/*';
            else if (type === 'video') fileInputRef.current.accept = 'video/*';
            else if (type === 'marmoset') fileInputRef.current.accept = '.mview';
            
            fileInputRef.current.click();
        }
    };

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Process all selected files
        for (let i = 0; i < files.length; i++) {
            await uploadFile(files[i], fileType);
        }
        
        // Reset input
        e.target.value = '';
    };

    const addMedia = (type: string) => {
        if (type === 'image' || type === 'video' || type === 'marmoset') {
            handleFileSelect(type);
        } else {
            // Embeds (YouTube, Sketchfab)
            const newItem = {
                id: Date.now() + Math.random(),
                type,
                value: {
                    src: '', // This will be used for URL in embeds
                    url: '', // Alias for embeds
                    caption: '',
                    width: '100%',
                    height: '600px',
                }
            };
            setMediaItems(prev => [...prev, newItem]);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        for (const file of files) {
            // Auto-detect type for drag & drop
            let type = 'image';
            if (file.name.toLowerCase().endsWith('.mview')) type = 'marmoset';
            else if (file.type.startsWith('video/')) type = 'video';
            
            await uploadFile(file, type);
        }
    };

    const uploadFile = async (file: File, type: string) => {
        try {
            // Use Unified Large File Upload (Chunked)
            const path = await uploadFileUnified(file);

            if (path) {
                const newItem = {
                    id: Date.now() + Math.random(),
                    type,
                    value: {
                        src: path,
                        caption: '',
                        width: '100%',
                        height: '600px',
                        manualPath: path // For Marmoset compatibility
                    }
                };
                setMediaItems(prev => [...prev, newItem]);
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(`Failed to upload ${file.name}: ${error.message || 'Unknown error'}`);
        }
    };

    const handleDeleteMedia = async (id: number) => {
        setDeletingIds(prev => [...prev, id]);
        await new Promise(resolve => setTimeout(resolve, 500));
        setMediaItems(prev => prev.filter(item => item.id !== id));
        setDeletingIds(prev => prev.filter(did => did !== id));
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as number);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            setMediaItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    if (loading) return <div className={styles.editorContainer} style={{justifyContent:'center', alignItems:'center'}}>Loading...</div>;

    return (
        <div className={styles.editorContainer}>
            {/* ... Header ... */}
            <header className={styles.header}>
                <div className={styles.breadcrumb}>
                    <Link href="/admin/portfolio" className={styles.breadcrumbLink}>Manage Portfolio</Link>
                    <span style={{ color: '#3a3a45' }}>/</span>
                    <span style={{ color: '#fff' }}>{slug === 'create' ? 'New Project' : 'Editing Artwork'}</span>
                </div>
                <div className={styles.actions}>
                    <button 
                        type="button" 
                        className={styles.btnSecondary}
                        onClick={() => setHidden(!hidden)}
                        title={hidden ? "Project is hidden" : "Project is public"}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        {hidden ? <EyeOff size={16} color="#ff4d4d" /> : <Eye size={16} />}
                        <span>{hidden ? 'Hidden' : 'Public'}</span>
                    </button>

                    {slug && slug !== 'create' ? (
                        <a 
                            href={`/gallery/${slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.btnSecondary}
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            Preview
                        </a>
                    ) : (
                        <button 
                            type="button"
                            className={styles.btnSecondary}
                            onClick={() => alert('Please save the project first to preview.')}
                        >
                            Preview
                        </button>
                    )}
                    <button type="button" className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Publish'}
                    </button>
                </div>
            </header>

            <main className={styles.mainContent}>
                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    multiple 
                    onChange={handleFileInputChange} 
                />

                {/* Title Section */}
                <div className={styles.section}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title-input" className={styles.label}>Artwork Title</label>
                        <input 
                            id="title-input"
                            type="text" 
                            className={styles.input} 
                            placeholder="Enter project title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>

                {/* Media Section */}
                <div className={styles.section}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                            <ImageIcon size={20} /> Media
                        </h2>
                    </div>
                    
                    <div className={styles.mediaToolbar}>
                        <button className={styles.mediaButton} onClick={() => addMedia('image')}>
                            <ImageIcon size={16} /> HQ Images
                        </button>
                        <button className={styles.mediaButton} onClick={() => addMedia('video')}>
                            <Video size={16} /> Video Clip
                        </button>
                        <button className={styles.mediaButton} onClick={() => addMedia('youtube')}>
                            <Video size={16} /> Video Embed
                        </button>
                        <button className={styles.mediaButton} onClick={() => addMedia('sketchfab')}>
                            <Globe size={16} /> Sketchfab
                        </button>
                        <button className={styles.mediaButton} onClick={() => addMedia('marmoset')}>
                            <Box size={16} /> Marmoset Viewer
                        </button>
                    </div>

                    <div 
                        className={styles.dragDropZone}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={handleDrop}
                    >
                        <Upload size={48} color="#9a9cab" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>Upload media files or drag and drop here</h3>
                        <p style={{ color: '#9a9cab', fontSize: '14px' }}>
                            JPG, PNG, GIF, MP4, MVIEW. <br/>
                            Large files (Unlimited size) are supported via Chunked Upload.
                        </p>
                    </div>

                    <div className={styles.mediaGrid} style={{ marginTop: '24px' }}>
                        <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            {isMounted ? (
                                <SortableContext 
                                    items={mediaItems.map(item => item.id)}
                                    strategy={rectSortingStrategy}
                                >
                                    {mediaItems.map((item, index) => (
                                        <SortableMediaItem 
                                            key={item.id} 
                                            item={item} 
                                            index={index}
                                            onDelete={() => handleDeleteMedia(item.id)}
                                            onChange={(updatedItem: MediaItem) => {
                                                const newItems = [...mediaItems];
                                                newItems[index] = updatedItem;
                                                setMediaItems(newItems);
                                            }}
                                            onExpand={(item) => setSelectedMedia(item)}
                                            isBeingDeleted={deletingIds.includes(item.id)}
                                            deletionStyle={deletionStyle}
                                            isCover={coverImage === item.value.src}
                                            onSetCover={() => setCoverImage(item.value.src)}
                                        />
                                    ))}
                                </SortableContext>
                            ) : (
                                mediaItems.map((item) => (
                                    <div key={item.id} className={styles.mediaCard}>
                                        <div className={styles.mediaPreview}>
                                            {item.type === 'image' && <img src={item.value.src} style={{width:'100%', height:'100%'}} />}
                                        </div>
                                    </div>
                                ))
                            )}
                            <DragOverlay adjustScale={true}>
                                {activeId ? (
                                    <SortableMediaItem
                                        item={mediaItems.find(i => i.id === activeId)!}
                                        index={0}
                                        onDelete={() => {}}
                                        onChange={() => {}}
                                        onExpand={() => {}}
                                        isBeingDeleted={false}
                                        deletionStyle={deletionStyle}
                                        isOverlay
                                        isCover={coverImage === mediaItems.find(i => i.id === activeId)?.value.src}
                                    />
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                </div>

                {/* Categorization */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Categorization</h2>
                    
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Medium (Choose up to 3)</label>
                        <div className={styles.checkboxGrid}>
                            {['Digital 3D', 'Texturing', 'Modeling', 'Concept Art', 'Game Art', 'Level Design'].map(m => (
                                <label key={m} className={styles.checkboxLabel}>
                                    <input 
                                        type="checkbox" 
                                        className={styles.checkboxInput}
                                        checked={mediums.includes(m)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                if (mediums.length < 3) setMediums([...mediums, m]);
                                            } else {
                                                setMediums(mediums.filter(x => x !== m));
                                            }
                                        }}
                                    />
                                    {m}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="software-input" className={styles.label}>Software Used</label>
                        <input 
                            id="software-input"
                            type="text" 
                            className={styles.input} 
                            placeholder="Add software (comma separated)"
                            value={software.join(', ')}
                            onChange={(e) => setSoftware(e.target.value.split(',').map(s => s.trim()))}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="tags-input" className={styles.label}>Tags</label>
                        <input 
                            id="tags-input"
                            type="text" 
                            className={styles.input} 
                            placeholder="Add tags (comma separated)"
                            value={tags.join(', ')}
                            onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))}
                        />
                    </div>
                </div>

                {/* Description */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Description</h2>
                    <textarea 
                        aria-label="Project Description"
                        className={styles.textarea}
                        placeholder="Describe your project..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </main>

            {selectedMedia && (
                <div className={styles.lightboxOverlay} onClick={() => setSelectedMedia(null)}>
                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.lightboxClose} onClick={() => setSelectedMedia(null)}>
                            <X size={32} />
                        </button>
                        {selectedMedia.type === 'video' ? (
                            <video src={selectedMedia.value.src} controls autoPlay style={{maxWidth:'100%', maxHeight:'90vh'}} />
                        ) : selectedMedia.type === 'marmoset' ? (
                             <div style={{width:'80vw', height:'80vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>
                                Marmoset Viewer Preview Not Available in Lightbox
                             </div>
                        ) : (
                            <img src={selectedMedia.value.src} alt={selectedMedia.value.caption} />
                        )}
                        {selectedMedia.value.caption && (
                            <div style={{position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', color:'white', padding:20, textAlign:'center'}}>
                                {selectedMedia.value.caption}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}