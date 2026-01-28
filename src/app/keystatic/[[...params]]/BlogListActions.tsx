"use client";

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TelegramPublishButton } from '@/components/blog/TelegramPublishButton';

interface BlogListActionsProps {
    chatId: string;
}

export function BlogListActions({ chatId }: BlogListActionsProps) {
    const [rows, setRows] = useState<{ slug: string; element: HTMLElement }[]>([]);
    const [openMenuSlug, setOpenMenuSlug] = useState<string | null>(null);

    useEffect(() => {
        const findRows = () => {
            // Selector based on the user provided data-key attribute
            const elements = document.querySelectorAll('[data-key^="@@slug"]');
            const newRows: { slug: string; element: HTMLElement }[] = [];

            elements.forEach((el) => {
                const key = el.getAttribute('data-key');
                if (key) {
                    const slug = key.replace('@@slug', '');
                    newRows.push({ slug, element: el as HTMLElement });
                }
            });

            if (newRows.length !== rows.length) {
                setRows(newRows);
            }
        };

        const observer = new MutationObserver(findRows);
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Initial check
        findRows();

        return () => observer.disconnect();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!chatId) return null;

    return (
        <>
            {rows.map(({ slug, element }) => (
                <ListActionPortal 
                    key={slug} 
                    container={element} 
                    slug={slug} 
                    chatId={chatId}
                    isOpen={openMenuSlug === slug}
                    onToggle={() => setOpenMenuSlug(openMenuSlug === slug ? null : slug)}
                    onClose={() => setOpenMenuSlug(null)}
                />
            ))}
        </>
    );
}

function ListActionPortal({ 
    container, 
    slug, 
    chatId, 
    isOpen, 
    onToggle,
    onClose
}: { 
    container: HTMLElement; 
    slug: string; 
    chatId: string;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Ensure container is relative so we can position absolutely
    useEffect(() => {
        if (container.style.position !== 'relative') {
            container.style.position = 'relative';
        }
    }, [container]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    return createPortal(
        <div 
            style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                zIndex: 20 
            }}
            onClick={(e) => e.stopPropagation()} 
        >
            <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                    type="button"
                    onClick={onToggle}
                    style={{
                        background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none',
                        color: '#e0e0e0',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => {
                        if (!isOpen) e.currentTarget.style.background = 'transparent';
                    }}
                    title="Actions"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                </button>

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '8px',
                        background: '#222',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        padding: '8px',
                        minWidth: '200px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        zIndex: 30,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '4px 8px'
                        }}>
                             <span style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>TELEGRAM</span>
                        </div>
                        <div style={{ padding: '4px 8px' }}>
                            <TelegramPublishButton 
                                chatId={chatId} 
                                slug={slug} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>,
        container
    );
}
