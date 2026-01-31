import Link from 'next/link';
import { LayoutGrid, FileText, Send, Upload } from 'lucide-react';
import styles from './portfolio/portfolio.module.css'; // Reuse styles

export default function AdminDashboard() {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentArea} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '40px', color: '#fff' }}>Welcome to Admin Panel</h1>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', maxWidth: '800px', width: '100%' }}>
                    <Link href="/admin/portfolio" className={styles.projectCard} style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textDecoration: 'none', color: '#f4f4f6' }}>
                        <div style={{ padding: '16px', background: 'rgba(30, 144, 255, 0.1)', borderRadius: '50%', color: '#1e90ff' }}>
                            <LayoutGrid size={32} />
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>Portfolio</span>
                        <span style={{ fontSize: '14px', color: '#9a9cab', textAlign: 'center' }}>Manage projects, albums, and gallery visibility.</span>
                    </Link>

                    <Link href="/admin/blog" className={styles.projectCard} style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textDecoration: 'none', color: '#f4f4f6' }}>
                        <div style={{ padding: '16px', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '50%', color: '#2ecc71' }}>
                            <FileText size={32} />
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>Blog</span>
                        <span style={{ fontSize: '14px', color: '#9a9cab', textAlign: 'center' }}>Write and publish articles, manage categories.</span>
                    </Link>

                    <Link href="/admin/telegram" className={styles.projectCard} style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textDecoration: 'none', color: '#f4f4f6' }}>
                        <div style={{ padding: '16px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '50%', color: '#3498db' }}>
                            <Send size={32} />
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>Telegram</span>
                        <span style={{ fontSize: '14px', color: '#9a9cab', textAlign: 'center' }}>Broadcast messages to your Telegram channel.</span>
                    </Link>

                    <Link href="/admin/upload" className={styles.projectCard} style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textDecoration: 'none', color: '#f4f4f6' }}>
                        <div style={{ padding: '16px', background: 'rgba(155, 89, 182, 0.1)', borderRadius: '50%', color: '#9b59b6' }}>
                            <Upload size={32} />
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>Uploads</span>
                        <span style={{ fontSize: '14px', color: '#9a9cab', textAlign: 'center' }}>Upload large files and manage assets.</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
