
import React, { useRef } from 'react';
import { useLargeFileUploader } from '@/hooks/useLargeFileUploader';
import styles from './LargeFileUploadField.module.css';

interface LargeFileUploadFieldProps {
    onUploadComplete: (path: string) => void;
    label?: string;
    accept?: string;
}

export const LargeFileUploadField: React.FC<LargeFileUploadFieldProps> = ({ 
    onUploadComplete, 
    label = "Upload File",
    accept = ".mview"
}) => {
    const { uploadFile, status, progress, error, url } = useLargeFileUploader();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            try {
                const path = await uploadFile(e.target.files[0]);
                if (path) onUploadComplete(path);
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>
            
            {status === 'idle' && (
                <div className={styles.dropzone} onClick={() => inputRef.current?.click()}>
                    <input 
                        ref={inputRef}
                        type="file" 
                        accept={accept} 
                        onChange={handleChange} 
                        style={{ display: 'none' }} 
                    />
                    <span>Click to select file</span>
                </div>
            )}

            {(status === 'uploading' || status === 'completed') && (
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progressFill} 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                    <span className={styles.progressText}>
                        {status === 'completed' ? 'Upload Complete!' : `${progress.toFixed(0)}%`}
                    </span>
                    {url && <div className={styles.result}>{url}</div>}
                </div>
            )}

            {status === 'error' && (
                <div className={styles.error}>
                    {error}
                    <button onClick={() => window.location.reload()} className={styles.retryBtn}>Retry</button>
                </div>
            )}
        </div>
    );
};
