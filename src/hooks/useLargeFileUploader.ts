
import { useState, useRef, useCallback } from 'react';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONCURRENT = 3;

interface UploadState {
    status: 'idle' | 'uploading' | 'completed' | 'error';
    progress: number;
    error: string | null;
    url: string | null;
}

export function useLargeFileUploader() {
    const [state, setState] = useState<UploadState>({
        status: 'idle',
        progress: 0,
        error: null,
        url: null,
    });
    
    const abortController = useRef<AbortController | null>(null);

    const uploadFile = useCallback(async (file: File) => {
        setState({ status: 'uploading', progress: 0, error: null, url: null });
        abortController.current = new AbortController();
        const signal = abortController.current.signal;

        try {
            // 1. Init
            const initRes = await fetch('/api/upload/unified', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'init',
                    filename: file.name,
                    size: file.size,
                    type: file.name.endsWith('.mview') ? 'marmoset' : 'misc'
                }),
                signal
            });
            
            if (!initRes.ok) throw new Error('Failed to initialize upload');
            const { uploadId } = await initRes.json();

            // 2. Chunk Upload
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            let uploadedChunks = 0;
            const queue = Array.from({ length: totalChunks }, (_, i) => i);
            
            const processChunk = async (chunkIndex: number) => {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);
                
                const formData = new FormData();
                formData.append('uploadId', uploadId);
                formData.append('chunkIndex', chunkIndex.toString());
                formData.append('chunk', chunk);

                const res = await fetch('/api/upload/unified', {
                    method: 'POST',
                    body: formData,
                    signal
                });
                
                if (!res.ok) throw new Error(`Chunk ${chunkIndex} failed`);
                uploadedChunks++;
                setState(prev => ({
                    ...prev,
                    progress: (uploadedChunks / totalChunks) * 100
                }));
            };

            // Run in parallel
            while (queue.length > 0) {
                const batch = queue.splice(0, MAX_CONCURRENT);
                await Promise.all(batch.map(processChunk));
            }

            // 3. Complete
            const completeRes = await fetch('/api/upload/unified', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'complete',
                    uploadId
                }),
                signal
            });

            if (!completeRes.ok) throw new Error('Failed to finalize upload');
            const { path } = await completeRes.json();

            setState({ status: 'completed', progress: 100, error: null, url: path });
            return path;

        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setState({ status: 'error', progress: 0, error: err.message, url: null });
            throw err;
        }
    }, []);

    const reset = () => setState({ status: 'idle', progress: 0, error: null, url: null });
    const cancel = () => abortController.current?.abort();

    return { ...state, uploadFile, reset, cancel };
}
