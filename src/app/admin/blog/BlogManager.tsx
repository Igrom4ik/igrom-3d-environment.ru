"use client";

import React, { useState, useEffect, useMemo } from 'react';
import styles from '../portfolio/portfolio.module.css'; // Reusing styles
import { Search, Trash2, FileText, Filter, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import BlogGrid from './BlogGrid';

interface BlogManagerProps {
    initialPosts: any[];
    initialTrashPosts?: any[];
}

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';
type TabOption = 'active' | 'trash';

export default function BlogManager({ initialPosts, initialTrashPosts = [] }: BlogManagerProps) {
    const [posts, setPosts] = useState(initialPosts);
    const [trashPosts, setTrashPosts] = useState(initialTrashPosts);
    
    // UI State
    const [activeTab, setActiveTab] = useState<TabOption>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');
    const [selectedTag, setSelectedTag] = useState<string>('all');
    
    // Load preferences from localStorage
    useEffect(() => {
        const savedSort = localStorage.getItem('blog_sortBy');
        const savedTag = localStorage.getItem('blog_selectedTag');
        if (savedSort) setSortBy(savedSort as SortOption);
        if (savedTag) setSelectedTag(savedTag);
    }, []);

    // Save preferences
    useEffect(() => {
        localStorage.setItem('blog_sortBy', sortBy);
    }, [sortBy]);

    useEffect(() => {
        localStorage.setItem('blog_selectedTag', selectedTag);
    }, [selectedTag]);

    // Extract all unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        [...posts, ...trashPosts].forEach(p => {
            if (p.entry.tag) {
                // Split by comma if multiple tags
                p.entry.tag.split(',').forEach((t: string) => tags.add(t.trim()));
            }
        });
        return Array.from(tags).sort();
    }, [posts, trashPosts]);

    // Filter and Sort Logic
    const currentList = activeTab === 'active' ? posts : trashPosts;

    const filteredAndSortedPosts = useMemo(() => {
        let result = [...currentList];

        // 1. Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(post => 
                (post.entry.title && post.entry.title.toLowerCase().includes(query)) ||
                (post.entry.summary && post.entry.summary.toLowerCase().includes(query))
            );
        }

        // 2. Filter by Tag
        if (selectedTag !== 'all') {
            result = result.filter(post => 
                post.entry.tag && post.entry.tag.includes(selectedTag)
            );
        }

        // 3. Sort
        result.sort((a, b) => {
            if (sortBy === 'date-desc') {
                return new Date(b.entry.publishedAt || 0).getTime() - new Date(a.entry.publishedAt || 0).getTime();
            }
            if (sortBy === 'date-asc') {
                return new Date(a.entry.publishedAt || 0).getTime() - new Date(b.entry.publishedAt || 0).getTime();
            }
            if (sortBy === 'title-asc') {
                return (a.entry.title || '').localeCompare(b.entry.title || '');
            }
            if (sortBy === 'title-desc') {
                return (b.entry.title || '').localeCompare(a.entry.title || '');
            }
            return 0;
        });

        return result;
    }, [currentList, searchQuery, selectedTag, sortBy]);

    // Handlers
    const handleMoveToTrash = (slugs: string[]) => {
        // Move from posts to trashPosts
        const moved = posts.filter(p => slugs.includes(p.slug));
        setPosts(prev => prev.filter(p => !slugs.includes(p.slug)));
        setTrashPosts(prev => [...prev, ...moved]);
    };

    const handleRestore = (slugs: string[]) => {
        // Move from trashPosts to posts
        const restored = trashPosts.filter(p => slugs.includes(p.slug));
        setTrashPosts(prev => prev.filter(p => !slugs.includes(p.slug)));
        setPosts(prev => [...prev, ...restored]);
    };

    const handlePermanentDelete = (slugs: string[]) => {
        setTrashPosts(prev => prev.filter(p => !slugs.includes(p.slug)));
    };

    return (
        <div className={styles.mainLayout}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarSection}>
                    <div className={styles.sidebarHeader}>Blog Management</div>
                    
                    {/* Tabs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        <button 
                            className={activeTab === 'active' ? styles.tabActive : styles.tab}
                            style={{ 
                                background: activeTab === 'active' ? 'rgba(30, 144, 255, 0.1)' : 'transparent',
                                color: activeTab === 'active' ? '#1e90ff' : '#9a9cab',
                                border: activeTab === 'active' ? '1px solid rgba(30, 144, 255, 0.2)' : '1px solid transparent',
                                padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                            onClick={() => setActiveTab('active')}
                        >
                            <FileText size={16} /> All Posts ({posts.length})
                        </button>
                        <button 
                            className={activeTab === 'trash' ? styles.tabActive : styles.tab}
                            style={{ 
                                background: activeTab === 'trash' ? 'rgba(255, 77, 77, 0.1)' : 'transparent',
                                color: activeTab === 'trash' ? '#ff4d4d' : '#9a9cab',
                                border: activeTab === 'trash' ? '1px solid rgba(255, 77, 77, 0.2)' : '1px solid transparent',
                                padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                            onClick={() => setActiveTab('trash')}
                        >
                            <Trash2 size={16} /> Trash ({trashPosts.length})
                        </button>
                    </div>

                    <div className={styles.sidebarHeader} style={{ marginTop: '24px' }}>Filters</div>
                    
                    {/* Tag Filter */}
                    <select 
                        style={{ width: '100%', background: '#1e2028', color: '#fff', border: '1px solid #282a36', padding: '8px', borderRadius: '4px', outline: 'none', marginTop: '8px' }}
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {allTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>

                    <div className={styles.sidebarHeader} style={{ marginTop: '24px' }}>Sort By</div>
                    <select 
                        style={{ width: '100%', background: '#1e2028', color: '#fff', border: '1px solid #282a36', padding: '8px', borderRadius: '4px', outline: 'none', marginTop: '8px' }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                    >
                        <option value="date-desc">Date (Newest)</option>
                        <option value="date-asc">Date (Oldest)</option>
                        <option value="title-asc">Title (A-Z)</option>
                        <option value="title-desc">Title (Z-A)</option>
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.contentArea}>
                <div className={styles.portfolioHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            {activeTab === 'active' ? 'Blog Posts' : 'Trash'}
                        </h1>
                        <p className={styles.subText}>
                            {activeTab === 'active' ? 'Manage your articles.' : 'Recover or permanently delete items.'}
                        </p>
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

                <BlogGrid 
                    posts={filteredAndSortedPosts} 
                    isTrash={activeTab === 'trash'}
                    onMoveToTrash={handleMoveToTrash}
                    onRestore={handleRestore}
                    onPermanentDelete={handlePermanentDelete}
                />
            </div>
        </div>
    );
}
