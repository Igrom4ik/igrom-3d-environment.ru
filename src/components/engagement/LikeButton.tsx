
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, Check } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { useToast } from "@once-ui-system/core";

interface LikeButtonProps {
    projectSlug: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ projectSlug }) => {
    const { addToast } = useToast();
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [email, setEmail] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchLikes();
        const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '[]');
        if (likedProjects.includes(projectSlug)) {
            setIsLiked(true);
        }
        
        // Pre-fill email if available
        const storedEmail = localStorage.getItem('user_email');
        if (storedEmail) setEmail(storedEmail);
    }, [projectSlug]);

    useEffect(() => {
        if (showEmailInput && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showEmailInput]);

    const fetchLikes = async () => {
        const { count, error } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('project_slug', projectSlug);

        if (!error && count !== null) {
            setLikes(count);
        }
        setLoading(false);
    };

    const handleLikeClick = () => {
        if (isLiked) return;
        
        const storedEmail = localStorage.getItem('user_email');
        if (storedEmail) {
            submitLike(storedEmail);
        } else {
            setShowEmailInput(true);
        }
    };

    const submitLike = async (emailToUse: string) => {
        if (!emailToUse || !emailToUse.includes('@')) {
            addToast({
                variant: 'danger',
                message: 'Please enter a valid email address.'
            });
            return;
        }

        setLoading(true);
        
        // Try to insert like
        const { error } = await supabase
            .from('likes')
            .insert([{ project_slug: projectSlug, email: emailToUse }]);

        if (error) {
            // Postgres unique violation code
            if (error.code === '23505') {
                console.log('User already liked this project (23505)');
                setIsLiked(true);
                updateLocalLikes();
                addToast({
                    variant: 'success',
                    message: 'You have already liked this project.'
                });
            } else {
                console.error('Error liking:', error);
                addToast({
                    variant: 'danger',
                    message: 'Failed to submit like. Please try again.'
                });
            }
        } else {
            console.log('Like submitted successfully');
            setLikes(prev => prev + 1);
            setIsLiked(true);
            updateLocalLikes();
            localStorage.setItem('user_email', emailToUse);
            addToast({
                variant: 'success',
                message: 'Thanks for your like!'
            });
        }
        
        setLoading(false);
        setShowEmailInput(false);
    };

    const updateLocalLikes = () => {
        const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '[]');
        if (!likedProjects.includes(projectSlug)) {
            likedProjects.push(projectSlug);
            localStorage.setItem('likedProjects', JSON.stringify(likedProjects));
        }
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitLike(email);
    };

    if (showEmailInput) {
        return (
            <form 
                onSubmit={handleEmailSubmit}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    height: '40px'
                }}
            >
                <input
                    ref={inputRef}
                    type="email"
                    placeholder="Enter email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        outline: 'none',
                        fontSize: '14px',
                        width: '120px'
                    }}
                />
                <button 
                    type="submit"
                    disabled={loading}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#4caf50',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <Check size={16} />
                </button>
                <button 
                    type="button"
                    onClick={() => setShowEmailInput(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ff4d4d',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <X size={16} />
                </button>
            </form>
        );
    }

    return (
        <button 
            onClick={handleLikeClick}
            disabled={isLiked || loading}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isLiked ? 'rgba(255, 77, 77, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isLiked ? '#ff4d4d' : 'rgba(255, 255, 255, 0.1)'}`,
                padding: '8px 16px',
                borderRadius: '20px',
                color: isLiked ? '#ff4d4d' : '#9a9cab',
                cursor: isLiked ? 'default' : 'pointer',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: '600',
                height: '40px'
            }}
        >
            <Heart size={18} fill={isLiked ? "#ff4d4d" : "none"} />
            <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
        </button>
    );
};
