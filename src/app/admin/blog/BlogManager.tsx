"use client";

import React, { useState } from 'react';
import styles from '../portfolio/portfolio.module.css'; // Reusing styles
import { Search } from 'lucide-react';
import BlogGrid from './BlogGrid';

interface BlogManagerProps {
    initialPosts: any[];
}

export default function BlogManager({ initialPosts }: BlogManagerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Filter posts
    const filteredPosts = initialPosts.filter(post => {
        if (!post) return false;
        const query = searchQuery.toLowerCase();
        return (
            (post.entry.title && post.entry.title.toLowerCase().includes(query)) ||
            (post.entry.summary && post.entry.summary.toLowerCase().includes(query))
        );
    });

    return (
        <div className={styles.mainLayout}>
            {/* Sidebar - Optional, reusing structure if needed, or simplified */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarSection}>
                    <div className={styles.sidebarHeader}>Blog Management</div>
                    <div className={styles.sidebarInfo}>
                        Manage your blog posts.
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.contentArea}>
                <div className={styles.portfolioHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Blog Posts</h1>
                        <p className={styles.subText}>Manage your articles and updates.</p>
                    </div>
                    
                    <div className={styles.searchBar}>
                        <Search size={16} />
                        <input 
                            type="text" 
                            placeholder="Search posts..." 
                            style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <BlogGrid posts={filteredPosts} />
            </div>
        </div>
    );
}
