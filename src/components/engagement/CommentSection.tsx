
"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Mail, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
    id: string;
    nickname: string;
    content: string;
    created_at: string;
}

interface CommentSectionProps {
    projectSlug: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ projectSlug }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [content, setContent] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        fetchComments();
        const savedNickname = localStorage.getItem('comment_nickname');
        const savedEmail = localStorage.getItem('comment_email');
        if (savedNickname && savedEmail) {
            setNickname(savedNickname);
            setEmail(savedEmail);
            setIsRegistered(true);
        }
    }, [projectSlug]);

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select('id, nickname, content, created_at')
            .eq('project_slug', projectSlug)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setComments(data);
        }
        setLoading(false);
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim() && email.trim()) {
            localStorage.setItem('comment_nickname', nickname);
            localStorage.setItem('comment_email', email);
            setIsRegistered(true);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || submitting) return;

        setSubmitting(true);
        const { error } = await supabase
            .from('comments')
            .insert([{
                project_slug: projectSlug,
                nickname,
                email,
                content
            }]);

        if (!error) {
            setContent('');
            fetchComments();
        }
        setSubmitting(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('comment_nickname');
        localStorage.removeItem('comment_email');
        setIsRegistered(false);
        setNickname('');
        setEmail('');
    };

    return (
        <div style={{ marginTop: '48px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <MessageSquare size={24} color="#1e90ff" />
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Comments ({comments.length})</h2>
            </div>

            {!isRegistered ? (
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Join the discussion</h3>
                    <p style={{ color: '#9a9cab', fontSize: '14px', marginBottom: '20px' }}>Please provide your name and email to leave a comment.</p>
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                <input 
                                    type="text" 
                                    placeholder="Nickname"
                                    required
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px 10px 36px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
                                />
                            </div>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                <input 
                                    type="email" 
                                    placeholder="Email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px 10px 36px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
                                />
                            </div>
                        </div>
                        <button type="submit" style={{ padding: '10px', background: '#1e90ff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Continue
                        </button>
                    </form>
                </div>
            ) : (
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ fontSize: '14px', color: '#9a9cab' }}>
                            Posting as <span style={{ color: '#1e90ff', fontWeight: 'bold' }}>{nickname}</span>
                        </div>
                        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#555', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
                            Change info
                        </button>
                    </div>
                    <form onSubmit={handleSubmitComment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <textarea 
                            placeholder="Write your comment..."
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{ width: '100%', minHeight: '100px', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', resize: 'vertical' }}
                        />
                        <button 
                            type="submit" 
                            disabled={submitting}
                            style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#1e90ff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <Loader2 size={32} className="animate-spin" color="#1e90ff" />
                    </div>
                ) : comments.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#555', padding: '40px' }}>No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontWeight: 'bold', color: '#1e90ff' }}>{comment.nickname}</span>
                                <span style={{ fontSize: '12px', color: '#555' }}>
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </span>
                            </div>
                            <p style={{ margin: 0, color: '#f4f4f6', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
