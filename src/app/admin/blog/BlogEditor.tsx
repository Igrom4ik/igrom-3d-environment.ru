"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './editor.module.css';
import { 
    Save, ArrowLeft, Image as ImageIcon, Code, FileText, 
    Heading as HeadingIcon, Bold, Italic, List, Link as LinkIcon 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BlogEditorProps {
    initialData?: any;
    mode: 'create' | 'edit';
}

export default function BlogEditor({ initialData, mode }: BlogEditorProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.entry?.title || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [summary, setSummary] = useState(initialData?.entry?.summary || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [tags, setTags] = useState<string>(initialData?.entry?.tag || ''); // Keystatic uses 'tag' string or array? Assuming string based on previous code
    const [coverImage, setCoverImage] = useState(initialData?.entry?.image || '');
    const [isSaving, setIsSaving] = useState(false);
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-generate slug from title if creating
    useEffect(() => {
        if (mode === 'create' && title) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [title, mode]);

    const handleInsert = (template: string) => {
        if (!textareaRef.current) return;
        
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = textareaRef.current.value;
        
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        
        const newText = before + template + after;
        setContent(newText);
        
        // Restore cursor position
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + template.length;
                textareaRef.current.focus();
            }
        }, 0);
    };

    const handleSave = async () => {
        if (!title || !slug) {
            alert('Title and Slug are required');
            return;
        }

        setIsSaving(true);
        
        try {
            const res = await fetch('/api/blog/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalSlug: mode === 'edit' ? initialData.slug : undefined,
                    slug,
                    title,
                    summary,
                    content,
                    tag: tags,
                    image: coverImage,
                    publishedAt: initialData?.entry?.publishedAt || new Date().toISOString()
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                if (mode === 'create') {
                    router.push('/admin/blog');
                } else {
                    alert('Saved successfully!');
                }
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save post');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.editorContainer}>
            {/* Header */}
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/admin/blog" style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <input 
                        type="text" 
                        className={styles.titleInput}
                        placeholder="Post Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className={styles.statusBadge}>
                        {mode === 'edit' ? 'Editing' : 'Draft'}
                    </div>
                    <button 
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </header>

            {/* Main Editor Area */}
            <main className={styles.mainContent}>
                {/* Meta Fields */}
                <div className={styles.metaRow}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Slug</label>
                        <input 
                            className={styles.input}
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Tags (comma separated)</label>
                        <input 
                            className={styles.input}
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="UE5, Lighting, Devlog"
                        />
                    </div>
                     <div className={styles.inputGroup}>
                        <label className={styles.label}>Cover Image URL</label>
                        <input 
                            className={styles.input}
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="/images/blog/..."
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Summary</label>
                    <textarea 
                        className={styles.textarea}
                        style={{ minHeight: '80px' }}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Brief summary for the card..."
                    />
                </div>

                {/* Content Editor */}
                <div className={styles.editorBody}>
                    <textarea 
                        ref={textareaRef}
                        className={styles.contentEditor}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your MDX content here..."
                    />
                </div>
            </main>

            {/* Floating Mobile Toolbar */}
            <nav className={styles.floatingToolbar}>
                <button className={styles.toolbarBtn} onClick={() => handleInsert('\n## Subheading\n')}>
                    <HeadingIcon size={18} />
                </button>
                <button className={styles.toolbarBtn} onClick={() => handleInsert('**bold**')}>
                    <Bold size={18} />
                </button>
                 <button className={styles.toolbarBtn} onClick={() => handleInsert('*italic*')}>
                    <Italic size={18} />
                </button>
                <button className={styles.toolbarBtn} onClick={() => handleInsert('\n```tsx\n// code here\n```\n')}>
                    <Code size={18} />
                </button>
                <button className={styles.toolbarBtn} onClick={() => handleInsert('\n<HeroImage src="/path/to/img.jpg" alt="Description" />\n')}>
                    <ImageIcon size={18} />
                </button>
                <button className={styles.toolbarBtn} onClick={() => handleInsert('\n<Note type="tip">\n  Your tip here.\n</Note>\n')}>
                    <FileText size={18} />
                </button>
                 <button className={styles.toolbarBtn} onClick={() => handleInsert('\n- List item\n')}>
                    <List size={18} />
                </button>
            </nav>
        </div>
    );
}
