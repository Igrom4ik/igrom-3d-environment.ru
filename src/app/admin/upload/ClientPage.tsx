
"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from '../portfolio/portfolio.module.css';
import { ChevronLeft, CheckCircle, Copy } from 'lucide-react';
import { LargeFileUploadField } from '@/components/admin/LargeFileUploadField';

export default function LargeFileUploader() {
    const [resultPath, setResultPath] = useState<string | null>(null);

    const copyToClipboard = () => {
        if (resultPath) {
            navigator.clipboard.writeText(resultPath);
            alert('Path copied to clipboard!');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.utilityPageHeader}>
                <div className={styles.headerLeft}>
                    <Link href="/admin/portfolio" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ChevronLeft size={16} /> Back to Portfolio
                    </Link>
                </div>
                <div className={styles.headerRight}>
                     <span style={{ color: '#9a9cab', fontSize: '14px' }}>Unified Large File Uploader v3.0</span>
                </div>
            </header>

            <div className={styles.mainLayout} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ 
                    background: '#181920', 
                    border: '1px solid #282a36', 
                    borderRadius: '12px', 
                    padding: '40px', 
                    width: '100%', 
                    maxWidth: '600px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '24px' 
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Upload Large Asset</h1>
                        <p style={{ color: '#9a9cab', fontSize: '14px' }}>
                            Supports files up to 5GB. Chunked upload with resume capability.
                            <br/>Files saved to <code>public/marmoset/</code>
                        </p>
                    </div>

                    <LargeFileUploadField 
                        onUploadComplete={(path) => setResultPath(path)} 
                        label="Select .mview File"
                        accept=".mview"
                    />

                    {resultPath && (
                        <div style={{ padding: '16px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2ecc71', fontWeight: 600 }}>
                                <CheckCircle size={16} /> Upload Complete
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" readOnly value={resultPath} style={{ flex: 1, background: '#0b0b10', border: '1px solid #2ecc71', padding: '8px', borderRadius: '4px', color: '#fff' }} />
                                <button onClick={copyToClipboard} style={{ background: '#2ecc71', border: 'none', borderRadius: '4px', padding: '0 12px', cursor: 'pointer', color: '#0b0b10' }}>
                                    <Copy size={16} />
                                </button>
                            </div>
                            <div style={{ fontSize: '12px', color: '#9a9cab' }}>
                                Copy this path and paste it into the "MView Path" field in your project.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
