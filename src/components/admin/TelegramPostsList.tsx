"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { KeystaticLayout } from "@/components/admin/KeystaticLayout";
import { Search, Plus, Edit2, Trash2, Calendar, FileText } from "lucide-react";
import styles from "./TelegramPostsList.module.css";

interface Post {
  slug: string;
  title: string;
  publishedAt: string | null;
}

export const TelegramPostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/admin/telegram-posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setFilteredPosts(data.posts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load posts:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(lowerSearch) || 
        (post.publishedAt && post.publishedAt.includes(lowerSearch))
    );
    setFilteredPosts(filtered);
  }, [search, posts]);

  const handleDelete = async (slug: string) => {
      if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
      
      try {
          const res = await fetch(`/api/admin/telegram-posts/${slug}`, { method: 'DELETE' });
          if (res.ok) {
              setPosts(prev => prev.filter(p => p.slug !== slug));
          } else {
              const errorData = await res.json();
              alert(errorData.error || "Failed to delete post");
          }
      } catch (err) {
          console.error(err);
          alert("Error deleting post");
      }
  };

  if (loading) return (
    <KeystaticLayout>
        <div className={styles.loadingContainer}>
            <div className={styles.loadingDot} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Loading posts...</span>
        </div>
    </KeystaticLayout>
  );

  return (
    <KeystaticLayout>
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Telegram Posts</h1>
        <Link href="/keystatic/collection/telegramPosts/create" className={styles.createButton}>
            <Plus size={18} strokeWidth={2.5} />
            <span>Create New Post</span>
        </Link>
      </header>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
            <input 
                type="text" 
                placeholder="Search posts..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
            />
            <Search size={18} className={styles.searchIcon} />
        </div>
      </div>

      <div className={styles.content}>
        {filteredPosts.length === 0 ? (
            <div className={styles.emptyState}>
                <FileText size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
                <div style={{ fontSize: '16px', fontWeight: 500 }}>
                    {posts.length === 0 ? "No posts found" : "No results match your search"}
                </div>
                {posts.length === 0 && (
                     <Link href="/keystatic/collection/telegramPosts/create" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        Create your first post &rarr;
                     </Link>
                )}
            </div>
        ) : (
            <>
                {/* Desktop Table Layout */}
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead className={styles.tableHeader}>
                            <tr>
                                <th className={styles.tableHeaderCell} style={{ width: '60%' }}>Title</th>
                                <th className={styles.tableHeaderCell}>Date</th>
                                <th className={`${styles.tableHeaderCell} text-right`} style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map((post) => (
                                <tr key={post.slug} className={styles.tableRow}>
                                    <td className={styles.tableCell}>
                                        <Link href={`/keystatic/collection/telegramPosts/item/${post.slug}`} className={styles.postTitle}>
                                            {post.title}
                                        </Link>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={14} style={{ opacity: 0.5 }} />
                                            <span className={styles.postDate}>
                                                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <div className={styles.actions}>
                                            <Link href={`/keystatic/collection/telegramPosts/item/${post.slug}`} className={`${styles.actionButton} ${styles.editButton}`} title="Edit">
                                                <Edit2 size={18} />
                                            </Link>
                                            <button 
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent row click
                                                    handleDelete(post.slug);
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card Layout */}
                <div className={styles.cardLayout}>
                    {filteredPosts.map((post) => (
                         <div key={post.slug} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <Link href={`/keystatic/collection/telegramPosts/item/${post.slug}`} style={{ textDecoration: 'none' }}>
                                        <h3 className={styles.cardTitle}>{post.title}</h3>
                                    </Link>
                                    <div className={styles.cardDate}>
                                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.cardActions}>
                                <Link href={`/keystatic/collection/telegramPosts/item/${post.slug}`} className={styles.cardAction}>
                                    <Edit2 size={16} /> Edit
                                </Link>
                                <button 
                                    className={`${styles.cardAction} ${styles.delete}`} 
                                    onClick={() => handleDelete(post.slug)}
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                         </div>
                    ))}
                </div>
            </>
        )}
      </div>
    </div>
    </KeystaticLayout>
  );
};
