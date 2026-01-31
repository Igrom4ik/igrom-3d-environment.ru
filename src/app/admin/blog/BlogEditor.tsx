"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './editor.module.css';
import { 
    Save, ArrowLeft, Image as ImageIcon, Code, FileText, 
    Heading as HeadingIcon, Bold, Italic, List, Eye, EyeOff, Check, X,
    Video, Mic, Send
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/admin/ImageUploader';

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
    const [tags, setTags] = useState<string>(initialData?.entry?.tag || '');
    const [coverImage, setCoverImage] = useState(initialData?.entry?.image || '');
    const [isHidden, setIsHidden] = useState(initialData?.entry?.hidden || false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Telegram State
    const [telegramChatId, setTelegramChatId] = useState('');
    const [isSendingTelegram, setIsSendingTelegram] = useState(false);

    // Fetch Telegram Settings
    useEffect(() => {
        fetch('/api/keystatic/telegram-settings')
            .then(res => res.json())
            .then(data => {
                if (data.chatId) setTelegramChatId(data.chatId);
            })
            .catch(() => {});
    }, []);
    
    // For inserting images into content
    const [showContentImageUploader, setShowContentImageUploader] = useState(false);
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

    // Auto-generate slug from title if creating
    useEffect(() => {
        if (mode === 'create' && title) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [title, mode]);

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

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

    const handleContentImageUpload = (path: string) => {
        handleInsert(`\n<HeroImage src="${path}" alt="Image" />\n`);
        setShowContentImageUploader(false);
    };

    const handleSave = async () => {
        if (!title || !slug) {
            alert('Заголовок и Slug обязательны');
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
                    publishedAt: initialData?.entry?.publishedAt || new Date().toISOString(),
                    hidden: isHidden
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                if (mode === 'create') {
                    router.push('/admin/blog');
                } else {
                    alert('Успешно сохранено!');
                }
            } else {
                alert(`Ошибка: ${data.error}`);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Не удалось сохранить пост');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreview = () => {
        window.open(`/blog/${slug}`, '_blank');
    };

    const handleSendToTelegram = async () => {
        if (!telegramChatId) {
            alert('Telegram Chat ID не настроен в Settings');
            return;
        }
        
        const confirmSend = window.confirm('Вы уверены, что хотите опубликовать это в Telegram?');
        if (!confirmSend) return;

        setIsSendingTelegram(true);
        try {
            const res = await fetch('/api/telegram/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: telegramChatId,
                    content,
                    title,
                    summary,
                    image: coverImage,
                    slug,
                    collection: 'posts'
                })
            });
            
            const data = await res.json();
            if (res.ok) {
                alert('Успешно опубликовано в Telegram!');
            } else {
                alert(`Ошибка отправки: ${data.error}`);
            }
        } catch (e) {
            alert('Ошибка сети при отправке в Telegram');
        } finally {
            setIsSendingTelegram(false);
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
                        placeholder="Заголовок поста..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     {/* Preview Button */}
                     <button 
                        onClick={handlePreview}
                        style={{ 
                            background: 'transparent', 
                            border: '1px solid #3a3a45', 
                            color: '#9a9cab',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px' 
                        }}
                        title="Открыть предпросмотр"
                    >
                        <Eye size={16} /> <span className={styles.hideOnMobile}>Предпросмотр</span>
                    </button>

                     {/* Telegram Button */}
                     <button 
                        onClick={handleSendToTelegram}
                        disabled={isSendingTelegram}
                        style={{ 
                            background: 'rgba(0, 136, 204, 0.1)', // Telegram blue
                            border: '1px solid rgba(0, 136, 204, 0.3)', 
                            color: '#0088cc',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            cursor: isSendingTelegram ? 'wait' : 'pointer',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px' 
                        }}
                        title="Опубликовать в Telegram"
                    >
                        <Send size={16} /> <span className={styles.hideOnMobile}>{isSendingTelegram ? 'Отправка...' : 'Telegram'}</span>
                    </button>

                    {/* Status Toggle */}
                    <button 
                        onClick={() => setIsHidden(!isHidden)}
                        style={{ 
                            background: isHidden ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)', 
                            border: `1px solid ${isHidden ? '#e74c3c' : '#2ecc71'}`, 
                            color: isHidden ? '#e74c3c' : '#2ecc71',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: 600
                        }}
                    >
                        {isHidden ? <EyeOff size={14} /> : <Check size={14} />}
                        {isHidden ? 'Черновик' : 'Опубликован'}
                    </button>

                    <button 
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <Save size={18} />
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </header>

            {/* Context Menu */}
            {contextMenu && (
                <div 
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: '#181920',
                        border: '1px solid #282a36',
                        borderRadius: '8px',
                        padding: '8px',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        minWidth: '160px',
                        color: '#fff'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => { handleInsert('**bold**'); setContextMenu(null); }} className={styles.contextBtn}>
                        <Bold size={14} /> Bold
                    </button>
                    <button onClick={() => { handleInsert('*italic*'); setContextMenu(null); }} className={styles.contextBtn}>
                        <Italic size={14} /> Italic
                    </button>
                    <button onClick={() => { handleInsert('\n## Heading\n'); setContextMenu(null); }} className={styles.contextBtn}>
                        <HeadingIcon size={14} /> Heading
                    </button>
                    <div style={{ height: '1px', background: '#282a36', margin: '4px 0' }} />
                    <button onClick={() => { handleInsert('\n```tsx\n// code here\n```\n'); setContextMenu(null); }} className={styles.contextBtn}>
                        <Code size={14} /> Code Block (TSX)
                    </button>
                    <button onClick={() => { handleInsert('\n```cpp\n// code here\n```\n'); setContextMenu(null); }} className={styles.contextBtn}>
                        <Code size={14} /> Code Block (C++)
                    </button>
                    <button onClick={() => { handleInsert('`code`'); setContextMenu(null); }} className={styles.contextBtn}>
                        <Code size={14} /> Inline Code
                    </button>
                    <div style={{ height: '1px', background: '#282a36', margin: '4px 0' }} />
                    <button onClick={() => { setShowContentImageUploader(true); setContextMenu(null); }} className={styles.contextBtn}>
                        <ImageIcon size={14} /> Insert Image
                    </button>
                    <button onClick={() => { handleInsert('\n<VideoPlayer src="" />\n'); setContextMenu(null); }} className={styles.contextBtn}>
                        <Video size={14} /> Insert Video
                    </button>
                    <button onClick={() => { handleInsert('\n<AudioPlayer src="" />\n'); setContextMenu(null); }} className={styles.contextBtn}>
                        <Mic size={14} /> Insert Audio
                    </button>
                </div>
            )}

            {/* Main Editor Area */}
            <main className={styles.mainContent}>
                {/* Meta Fields */}
                <div className={styles.metaRow}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Slug (URL адрес)</label>
                        <input 
                            className={styles.input}
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Теги (через запятую)</label>
                        <input 
                            className={styles.input}
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="UE5, Lighting, Devlog"
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                     <ImageUploader 
                        label="Обложка" 
                        currentImage={coverImage} 
                        onUploadComplete={setCoverImage} 
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Краткое описание</label>
                    <textarea 
                        className={styles.textarea}
                        style={{ minHeight: '80px' }}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Краткое описание для карточки..."
                    />
                </div>

                {/* Content Editor */}
                <div className={styles.editorBody} style={{ position: 'relative' }}>
                    <label className={styles.label}>Контент (MDX)</label>
                    
                    {/* Inline Image Uploader Modal */}
                    {showContentImageUploader && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '40px', 
                            left: '0', 
                            right: '0', 
                            zIndex: 10, 
                            background: '#181920', 
                            border: '1px solid #282a36', 
                            padding: '16px', 
                            borderRadius: '8px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Вставить Изображение</span>
                                <button onClick={() => setShowContentImageUploader(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
                            </div>
                            <ImageUploader 
                                label="Загрузить или вставить URL" 
                                onUploadComplete={handleContentImageUpload} 
                            />
                        </div>
                    )}

                    <textarea 
                        ref={textareaRef}
                        className={styles.contentEditor}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Пишите ваш MDX контент здесь..."
                        onContextMenu={handleContextMenu}
                    />
                </div>
            </main>

            {/* Floating Mobile Toolbar */}
            <nav className={styles.floatingToolbar}>
                <button className={styles.toolbarBtn} onClick={() => handleInsert('\n## Subheading\n')} title="Heading">
                    <HeadingIcon size={18} />
                </button>
                <button className={styles.toolbarBtn} onClick={() => handleInsert('**bold**')} title="Bold">
                    <Bold size={18} />
                </button>
                 <button className={styles.toolbarBtn} onClick={() => handleInsert('*italic*')} title="Italic">
                    <Italic size={18} />
                </button>
                <button className={styles.toolbarBtn} onClick={() => handleInsert('\n```tsx\n// code here\n```\n')} title="Code Block">
                    <Code size={18} />
                </button>
                <button 
                    className={styles.toolbarBtn} 
                    onClick={() => setShowContentImageUploader(!showContentImageUploader)} 
                    title="Insert Image"
                    style={{ color: showContentImageUploader ? '#1e90ff' : undefined }}
                >
                    <ImageIcon size={18} />
                </button>
                <button className={styles.toolbarBtn} onClick={() => handleInsert('\n<Note type="tip">\n  Your tip here.\n</Note>\n')} title="Note">
                    <FileText size={18} />
                </button>
                <button className={styles.toolbarBtn} onClick={() => handleInsert('\n<VideoPlayer src="/path/to/video.mp4" />\n')} title="Video">
                    <Video size={18} />
                </button>
                <button className={styles.toolbarBtn} onClick={() => handleInsert('\n<AudioPlayer src="/path/to/audio.mp3" />\n')} title="Audio">
                    <Mic size={18} />
                </button>
                 <button className={styles.toolbarBtn} onClick={() => handleInsert('\n- List item\n')} title="List">
                    <List size={18} />
                </button>
            </nav>
        </div>
    );
}
