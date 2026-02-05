import fs from 'fs';
import path from 'path';

const SECRETS_FILE = path.join(process.cwd(), 'secrets.json');

export interface Secrets {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SECRET_2FA?: string;
  RECOVERY_CODE_HASH?: string;
  [key: string]: string | undefined;
}

export function getSecrets(): Secrets {
  if (!fs.existsSync(SECRETS_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(SECRETS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read secrets file:', error);
    return {};
  }
}

export function saveSecrets(secrets: Secrets) {
  try {
    const current = getSecrets();
    const updated = { ...current, ...secrets };
    fs.writeFileSync(SECRETS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to save secrets file:', error);
    return false;
  }
}

// Helper to get a specific secret, falling back to process.env
export function getSecret(key: keyof Secrets): string | undefined {
  const secrets = getSecrets();
  return secrets[key] || process.env[key as string];
}
