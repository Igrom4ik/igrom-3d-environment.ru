"use client";

import { useState, useEffect, use } from 'react';
import { Column, Button, Text, Heading, Spinner } from '@once-ui-system/core';

import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

const mdParser = new MarkdownIt();

export default function TelegramPostPreview({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [chatId, setChatId] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch draft content from Keystatic API or local file system if possible
        // Since we are in client component, we might need a server action or API route to get draft data
        // For now, let's try to fetch via a new API route we'll create: /api/keystatic/telegram-post/[slug]
        
        async function loadData() {
            try {
                // Fetch settings
                // In a real app, you might want to fetch this from your CMS API
                // For now, hardcode or fetch from a helper endpoint
                // We'll create a helper endpoint
                
                const res = await fetch(`/api/keystatic/telegram-draft/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setContent(data.content || '');
                    setChatId(data.chatId || '');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [slug]);

    const handleSend = async () => {
        setStatus('sending');
        setMessage('');
        try {
            const res = await fetch('/api/telegram/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId, content })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setMessage('Message sent successfully!');
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to send');
            }
        } catch (e) {
            setStatus('error');
            setMessage('Network error');
        }
    };

    if (loading) return <Column fillWidth horizontal="center" vertical="center" style={{height: '100vh'}}><Spinner size="l" /></Column>;

    return (
        <Column fillWidth padding="l" gap="l" maxWidth="m" horizontal="center" style={{ minHeight: '100vh' }}>
            <Heading variant="display-strong-s">Telegram Post Preview</Heading>
            
            <Column fillWidth gap="s">
                <Text variant="label-default-s">Target Channel: {chatId || 'Not set'}</Text>
            </Column>

            <Column fillWidth gap="s">
                <div style={{ 
                    height: '500px', 
                    width: '100%', 
                    border: '1px solid var(--neutral-border-medium)', 
                    borderRadius: 'var(--radius-l)', 
                    overflow: 'hidden'
                }}>
                    <style jsx global>{`
                        .rc-md-editor {
                            background: var(--neutral-background-medium) !important;
                            color: var(--neutral-on-background-strong) !important;
                            border: none !important;
                        }
                        .rc-md-editor .rc-md-navigation {
                            background: var(--neutral-background-strong) !important;
                            border-bottom: 1px solid var(--neutral-border-medium) !important;
                        }
                        .rc-md-editor .editor-container .section {
                            background: var(--neutral-background-medium) !important;
                        }
                        .rc-md-editor .editor-container .input {
                            background: var(--neutral-background-medium) !important;
                            color: var(--neutral-on-background-strong) !important;
                        }
                        .rc-md-editor .editor-container .custom-html-style {
                            color: var(--neutral-on-background-strong) !important;
                        }
                    `}</style>
                    <MdEditor 
                        style={{ height: '100%' }} 
                        renderHTML={(text) => mdParser.render(text)} 
                        onChange={({ text }) => setContent(text)}
                        value={content}
                        view={{ menu: true, md: true, html: false }}
                        canView={{ menu: true, md: true, html: false, fullScreen: true, hideMenu: true, both: false }}
                    />
                </div>
            </Column>

            <Button onClick={handleSend} disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending...' : 'Publish to Telegram'}
            </Button>

            {message && (
                <Text variant="body-default-m" style={{ color: status === 'error' ? 'var(--danger-content-strong)' : 'var(--success-content-strong)' }}>
                    {message}
                </Text>
            )}
        </Column>
    );
}
