"use client";

import React, { useState, useRef, type ChangeEvent } from 'react';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { uploadFileUnified } from '@/utils/largeFileUpload';
import { getImageUrl } from '@/lib/assets';

interface ImageUploaderProps {
    onUploadComplete: (path: string) => void;
    currentImage?: string;
    label?: string;
}

export default function ImageUploader({ onUploadComplete, currentImage, label = "Cover Image" }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        
        const file = e.target.files[0];
        setUploading(true);
        setError(null);

        try {
            // Use Unified Large File Upload
            const path = await uploadFileUnified(file);
            
            if (path) {
                onUploadComplete(path);
            } else {
                setError('Upload failed: No path returned');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Network error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: '#9a9cab', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </label>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {/* Preview Area */}
                <div 
                    style={{ 
                        width: '120px', 
                        height: '80px', 
                        borderRadius: '8px', 
                        background: '#1e1e24', 
                        border: '1px solid #282a36',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {currentImage ? (
                        <img 
                            src={getImageUrl(currentImage)} 
                            alt="Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    ) : (
                        <ImageIcon size={24} color="#3a3a45" />
                    )}
                </div>

                {/* Controls */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{
                                background: '#282a36',
                                border: '1px solid #3a3a45',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                color: '#fff',
                                fontSize: '13px',
                                cursor: uploading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flex: 1,
                                justifyContent: 'center'
                            }}
                        >
                            {uploading ? (
                                <span>Uploading...</span>
                            ) : (
                                <>
                                    <Upload size={14} /> Upload Image
                                </>
                            )}
                        </button>
                        
                        {currentImage && (
                            <button
                                type="button"
                                onClick={() => onUploadComplete('')}
                                style={{
                                    background: 'rgba(231, 76, 60, 0.1)',
                                    border: '1px solid #e74c3c',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    color: '#e74c3c',
                                    cursor: 'pointer'
                                }}
                                title="Remove Image"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    {/* Manual URL Input fallback */}
                    <input
                        type="text"
                        value={currentImage || ''}
                        onChange={(e) => onUploadComplete(e.target.value)}
                        placeholder="Or paste URL..."
                        style={{
                            background: 'transparent',
                            border: '1px solid #282a36',
                            borderRadius: '4px',
                            padding: '6px',
                            color: '#9a9cab',
                            fontSize: '12px',
                            width: '100%',
                            outline: 'none'
                        }}
                    />
                    
                    {error && <span style={{ color: '#e74c3c', fontSize: '11px' }}>{error}</span>}
                </div>
            </div>
        </div>
    );
}
