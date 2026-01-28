
"use client";

import { useState, useRef, type ChangeEvent } from 'react';
import Link from 'next/link';
import styles from '../portfolio/portfolio.module.css'; // Reuse styles
import { ChevronLeft, Upload, File as FileIcon, CheckCircle, AlertCircle, Copy } from 'lucide-react';

export default function LargeFileUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultPath, setResultPath] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResultPath(null);
            setProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            // Using XHR for progress tracking
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `/api/upload?filename=${encodeURIComponent(file.name)}`, true);
            
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    setResultPath(response.path);
                    setUploading(false);
                } else {
                    setError(`Upload failed: ${xhr.statusText}`);
                    setUploading(false);
                }
            };

            xhr.onerror = () => {
                setError('Upload failed (Network Error)');
                setUploading(false);
            };

            // Send raw file
            xhr.send(file);

        } catch (err) {
            console.error(err);
            setError('Upload failed');
            setUploading(false);
        }
    };

    const copyToClipboard = () => {
        if (resultPath) {
            navigator.clipboard.writeText(resultPath);
            alert('Path copied to clipboard!');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/admin/portfolio" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ChevronLeft size={16} /> Back to Portfolio
                    </Link>
                </div>
                <div className={styles.headerRight}>
                     <span style={{ color: '#9a9cab', fontSize: '14px' }}>Large File Uploader System</span>
                </div>
            </header>

            <div className={styles.mainLayout} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
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
                            Use this system to upload files larger than 100MB (e.g. Marmoset .mview files).
                            <br/>Files will be saved to <code>public/marmoset/</code>.
                        </p>
                    </div>

                    <button 
                        type="button"
                        aria-label="Click to select file for upload"
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                        style={{ 
                        border: '2px dashed #282a36', 
                        borderRadius: '8px', 
                        padding: '32px', 
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: file ? 'rgba(30, 144, 255, 0.05)' : 'transparent',
                        borderColor: file ? '#1e90ff' : '#282a36',
                        transition: 'all 0.2s',
                        width: '100%',
                        color: 'inherit',
                        font: 'inherit'
                    }} onClick={() => fileInputRef.current?.click()}>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            id="fileInput" 
                            aria-label="File upload"
                            onChange={handleFileChange} 
                            style={{ display: 'none' }} 
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            {file ? (
                                <FileIcon size={48} color="#1e90ff" />
                            ) : (
                                <Upload size={48} color="#9a9cab" />
                            )}
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>
                                {file ? file.name : 'Click to select file'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#9a9cab' }}>
                                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Any file size supported'}
                            </div>
                        </div>
                    </button>

                    {uploading && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                <span>Uploading...</span>
                                <span>{progress.toFixed(0)}%</span>
                            </div>
                            <div style={{ height: '6px', background: '#282a36', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: '#1e90ff', transition: 'width 0.2s' }} />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '12px', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', borderRadius: '6px', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {resultPath && (
                        <div style={{ padding: '16px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2ecc71', fontWeight: 600 }}>
                                <CheckCircle size={16} /> Upload Complete
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="text" 
                                    readOnly 
                                    aria-label="Uploaded file path"
                                    value={resultPath} 
                                    style={{ flex: 1, background: '#0b0b10', border: '1px solid #2ecc71', padding: '8px', borderRadius: '4px', color: '#fff' }} 
                                />
                                <button 
                                    type="button"
                                    onClick={copyToClipboard}
                                    aria-label="Copy path to clipboard"
                                    style={{ background: '#2ecc71', border: 'none', borderRadius: '4px', padding: '0 12px', cursor: 'pointer', color: '#0b0b10' }}
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <div style={{ fontSize: '12px', color: '#9a9cab' }}>
                                Copy this path and paste it into the "Large File Path" field in your project.
                            </div>
                        </div>
                    )}

                    <button 
                        type="button"
                        onClick={handleUpload} 
                        disabled={!file || uploading}
                        style={{ 
                            background: file ? '#1e90ff' : '#282a36', 
                            color: file ? 'white' : '#9a9cab',
                            border: 'none', 
                            padding: '12px', 
                            borderRadius: '6px', 
                            fontSize: '16px', 
                            fontWeight: 600, 
                            cursor: file ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s'
                        }}
                    >
                        {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                </div>
            </div>
        </div>
    );
}
