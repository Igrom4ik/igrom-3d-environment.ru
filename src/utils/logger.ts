import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'debug_logs.txt');

export function log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}${data ? ' | Data: ' + JSON.stringify(data, null, 2) : ''}\n`;

    // 1. Log to console
    console.log(`[DEBUG] ${message}`, data || '');

    // 2. Save to txt file
    try {
        fs.appendFileSync(LOG_FILE, logMessage, 'utf8');
    } catch (err) {
        console.error('Failed to write to log file:', err);
    }
}
