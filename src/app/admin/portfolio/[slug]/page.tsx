
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../editor.module.css';
import { 
    Image as ImageIcon, Video, Box, Globe, Upload, Trash2, 
    ChevronLeft, Save, Eye, Check 
} from 'lucide-react';

interface ProjectEditorProps {
    params: Promise<{ slug: string }>;
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
    categorization?: {
        medium?: string[];
        software?: string[];
        tags?: string[];
    };
    images?: Array<{ discriminant: string; value: MediaItemValue }>;
    publishing?: { cover?: string };
}

export default function ProjectEditor({ params }: ProjectEditorProps) {
    const router = useRouter();
    const [slug, setSlug] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [mediums, setMediums] = useState<string[]>([]);
    const [software, setSoftware] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [coverImage, setCoverImage] = useState('');
    
    // Unwrapping params
    useEffect(() => {
        params.then(unwrapped => {
            setSlug(unwrapped.slug);
            if (unwrapped.slug !== 'create') {
                loadProject(unwrapped.slug);
            } else {
                setLoading(false);
            }
        });
    }, [params]);

    const loadProject = async (slug: string) => {
        try {
            const res = await fetch(`/api/portfolio/get?slug=${slug}`);
            if (res.ok) {
                const data: ProjectData = await res.json();
                
                setTitle(data.title || '');
                setDescription(data.content || '');
                
                // Categorization
                if (data.categorization) {
                    setMediums(data.categorization.medium || []);
                    setSoftware(data.categorization.software || []);
                    setTags(data.categorization.tags || []);
                }

                // Images
                if (data.images && Array.isArray(data.images)) {
                    const items = data.images.map((img) => ({
                        id: Math.random(),
                        type: img.discriminant,
                        value: img.value
                    }));
                    setMediaItems(items);
                }

                // Publishing
                if (data.publishing) {
                    setCoverImage(data.publishing.cover || '');
                }
            } else {
                console.error('Failed to load project');
            }
            setLoading(false); 
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const data = {
            slug: slug === 'create' ? title.toLowerCase().replace(/ /g, '-') : slug,
            title,
            description, // This needs to be MDOC content? Or structured? Keystatic uses document field.
            // We'll save it as content for now.
            content: description, 
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
            // Upload
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `/api/upload?filename=${encodeURIComponent(file.name)}&type=${type}`, true);
            
            // Use Promise to handle XHR
            const response = await new Promise<{ success: boolean; path: string }>((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
                    else reject(xhr.statusText);
                };
                xhr.onerror = () => reject('Network Error');
                xhr.send(file);
            });

            if (response.success) {
                const newItem = {
                    id: Date.now() + Math.random(),
                    type,
                    value: {
                        src: response.path,
                        caption: '',
                        width: '100%',
                        height: '600px',
                        manualPath: response.path // For Marmoset compatibility
                    }
                };
                setMediaItems(prev => [...prev, newItem]);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert(`Failed to upload ${file.name}`);
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
                    <button className={styles.btnSecondary}>Preview</button>
                    <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
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
                    <h2 className={styles.sectionTitle}>
                        <ImageIcon size={20} /> Media
                    </h2>
                    
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
                            Files {'>'} 100MB are automatically handled.
                        </p>
                    </div>

                    <div className={styles.mediaGrid} style={{ marginTop: '24px' }}>
                        {mediaItems.map((item, index) => (
                            <div key={item.id} className={styles.mediaCard}>
                                <div className={styles.mediaPreview}>
                                    {item.type === 'marmoset' ? (
                                        <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#1a1a1a'}}>
                                            <Box size={48} color="#555" />
                                            <span style={{marginLeft:8, color:'#777'}}>Marmoset Viewer</span>
                                        </div>
                                    ) : item.type === 'video' ? (
                                        <video src={item.value.src} style={{width:'100%', height:'100%', objectFit:'contain'}} controls>
                                            <track kind="captions" />
                                        </video>
                                    ) : item.type === 'image' ? (
                                        <img src={item.value.src} alt={item.value.caption} style={{width:'100%', height:'100%', objectFit:'contain'}} />
                                    ) : (
                                        <div style={{ color: '#555', display:'flex', flexDirection:'column', alignItems:'center' }}>
                                            <Globe size={32} />
                                            <span>{item.type} Embed</span>
                                        </div>
                                    )}
                                    <button className={styles.deleteButton} onClick={() => {
                                        const newItems = [...mediaItems];
                                        newItems.splice(index, 1);
                                        setMediaItems(newItems);
                                    }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className={styles.cardControls}>
                                    <input 
                                        type="text" 
                                        className={styles.input} 
                                        placeholder="Caption" 
                                        value={item.value.caption || ''}
                                        onChange={(e) => {
                                            const newItems = [...mediaItems];
                                            newItems[index].value.caption = e.target.value;
                                            setMediaItems(newItems);
                                        }}
                                    />
                                    {item.type === 'marmoset' && (
                                        <input 
                                            type="text" 
                                            className={styles.input} 
                                            placeholder="MView Path" 
                                            value={item.value.src || ''}
                                            readOnly
                                        />
                                    )}
                                    {(item.type === 'youtube' || item.type === 'sketchfab') && (
                                        <input 
                                            type="text" 
                                            className={styles.input} 
                                            placeholder={`${item.type === 'youtube' ? 'YouTube' : 'Sketchfab'} URL`} 
                                            value={item.value.url || item.value.src || ''}
                                            onChange={(e) => {
                                                const newItems = [...mediaItems];
                                                newItems[index].value.url = e.target.value;
                                                // Sync src for consistency if needed, but url is primary for embeds
                                                newItems[index].value.src = e.target.value; 
                                                setMediaItems(newItems);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
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
        </div>
    );
}
