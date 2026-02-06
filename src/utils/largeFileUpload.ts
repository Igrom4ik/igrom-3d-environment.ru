
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONCURRENT = 3;

export async function uploadFileUnified(file: File): Promise<string> {
    try {
        // 1. Init
        const initRes = await fetch('/api/upload/unified', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'init',
                filename: file.name,
                size: file.size,
                type: file.name.toLowerCase().endsWith('.mview') ? 'marmoset' : 'misc'
            })
        });
        
        if (!initRes.ok) throw new Error('Failed to initialize upload');
        const { uploadId } = await initRes.json();

        // 2. Chunk Upload
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
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
                body: formData
            });
            
            if (!res.ok) throw new Error(`Chunk ${chunkIndex} failed`);
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
            })
        });

        if (!completeRes.ok) {
            const errorText = await completeRes.text();
            let errorMessage = 'Failed to finalize upload';
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error) errorMessage = errorJson.error;
            } catch (e) {
                errorMessage += `: ${errorText.substring(0, 100)}`;
            }
            throw new Error(errorMessage);
        }
        const { path } = await completeRes.json();

        return path;

    } catch (err: any) {
        console.error('Unified upload failed:', err);
        throw err;
    }
}
