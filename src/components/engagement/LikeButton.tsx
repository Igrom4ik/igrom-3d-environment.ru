
"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/utils/supabase';

interface LikeButtonProps {
    projectSlug: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ projectSlug }) => {
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLikes();
        const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '[]');
        if (likedProjects.includes(projectSlug)) {
            setIsLiked(true);
        }
    }, [projectSlug]);

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

    const handleLike = async () => {
        if (isLiked) return;

        const { error } = await supabase
            .from('likes')
            .insert([{ project_slug: projectSlug }]);

        if (!error) {
            setLikes(prev => prev + 1);
            setIsLiked(true);
            const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '[]');
            likedProjects.push(projectSlug);
            localStorage.setItem('likedProjects', JSON.stringify(likedProjects));
        }
    };

    return (
        <button 
            onClick={handleLike}
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
                fontWeight: '600'
            }}
        >
            <Heart size={18} fill={isLiked ? "#ff4d4d" : "none"} />
            <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
        </button>
    );
};
