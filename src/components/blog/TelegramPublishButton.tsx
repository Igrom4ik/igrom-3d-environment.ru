"use client";

import { Button, Text, Row, Spinner } from '@once-ui-system/core';
import { useState } from 'react';
import { baseURL } from '@/resources';

interface TelegramPublishButtonProps {
    content?: string;
    chatId: string;
    title?: string;
    slug?: string;
    image?: string;
    summary?: string;
    compact?: boolean;
}

export function TelegramPublishButton({ content, chatId, title, slug, image, summary, compact = false }: TelegramPublishButtonProps) {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSend = async () => {
        if (!chatId) {
            setStatus('error');
            setMessage('Chat ID not configured');
            return;
        }

        setStatus('sending');
        setMessage('');

        try {
            let contentToSend = content;
            let titleToSend = title;
            let imageToSend = image;
            let summaryToSend = summary;

            // If slug is provided but content/title are missing, fetch them
            if (slug && (!content || !title)) {
                const res = await fetch(`/api/posts/${slug}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch post data. Did you save?');
                }
                const data = await res.json();
                contentToSend = data.content;
                titleToSend = data.metadata.title;
                summaryToSend = data.metadata.summary;
                // Use cover image if available
                if (data.metadata.cover) {
                    imageToSend = data.metadata.cover;
                }
            }

            if (!contentToSend || !titleToSend) {
                throw new Error('No content or title to send');
            }

            const res = await fetch('/api/telegram/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    chatId, 
                    content: contentToSend, // Send raw content
                    title: titleToSend,
                    summary: summaryToSend,
                    image: imageToSend,
                    slug
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setStatus('success');
                setMessage('Successfully published to Telegram!');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to send');
            }
        } catch (e: unknown) {
            setStatus('error');
            if (e instanceof Error) {
                setMessage(e.message);
            } else {
                setMessage('Network error');
            }
        }
    };

    return (
        <Row gap="16" vertical="center">
            <Button 
                onClick={handleSend} 
                disabled={status === 'sending' || status === 'success'}
                variant={status === 'error' ? 'danger' : 'primary'}
                size={compact ? 's' : 'm'}
            >
                {status === 'sending' ? (
                    <Row gap="8" vertical="center">
                        <Spinner size="s" />
                        <Text>{compact ? '...' : 'Sending...'}</Text>
                    </Row>
                ) : status === 'success' ? (
                    'Published!'
                ) : (
                    compact ? 'Publish' : 'Publish to Telegram'
                )}
            </Button>
            {!compact && message && (
                <Text 
                    variant="body-default-s" 
                    style={{ 
                        color: status === 'error' ? 'var(--danger-content-strong)' : 
                               status === 'success' ? 'var(--success-content-strong)' : 'inherit' 
                    }}
                >
                    {message}
                </Text>
            )}
        </Row>
    );
}
