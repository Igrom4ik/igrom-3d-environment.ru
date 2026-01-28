"use client";

import { useState, useEffect } from 'react';
import { Column, Button, Input, Text, Heading, Spinner } from '@once-ui-system/core';
import { useRouter } from 'next/navigation';

import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

const mdParser = new MarkdownIt();

export default function TelegramAdminPage() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [chatId, setChatId] = useState('-1002536806613'); 
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const hasAccess = document.cookie.split('; ').some(row => row.startsWith('admin-access=true'));
        if (!hasAccess) {
            router.push('/secret-login');
        } else {
            setAuthorized(true);
        }
    }, [router]);

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
                setContent(''); 
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to send');
            }
        } catch (e) {
            setStatus('error');
            setMessage('Network error');
        }
    };

    if (!authorized) return <Column fillWidth horizontal="center" vertical="center" style={{height: '100vh'}}><Spinner size="l" /></Column>;

    return (
        <Column fillWidth padding="l" gap="l" maxWidth="m" horizontal="center" style={{ minHeight: '100vh', paddingTop: '80px' }}>
            <Heading variant="display-strong-s">Telegram Publisher</Heading>
            
            <Column fillWidth gap="s">
                <Text variant="label-default-s">Channel ID / Chat ID</Text>
                <Input 
                    id="chat-id"
                    label="Chat ID"
                    value={chatId} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatId(e.target.value)} 
                    placeholder="@channelname or -100xxxxx"
                />
            </Column>

            <Column fillWidth gap="s">
                <Text variant="label-default-s">Markdown Content</Text>
                
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

                <Text variant="body-default-xs" onBackground="neutral-weak">
                    Supports Markdown (Bold, Italic, Code Blocks, Links). Max 4096 chars.
                </Text>
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
