import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECRETS_PATH = path.join(process.cwd(), 'secrets.json');

function getSecrets() {
    if (!fs.existsSync(SECRETS_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(SECRETS_PATH, 'utf-8'));
    } catch (e) {
        console.error("❌ Error reading secrets:", e);
        return {};
    }
}

function saveSecrets(secrets) {
    try {
        fs.writeFileSync(SECRETS_PATH, JSON.stringify(secrets, null, 2), { mode: 0o600 });
        console.log("✅ Secrets updated successfully.");
    } catch (e) {
        console.error("❌ Error saving secrets:", e);
    }
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log(`
Usage:
  npm run manage:admin reset-password <email> <password>
  npm run manage:admin generate-recovery
  npm run manage:admin show-2fa-secret
  npm run manage:admin remove-2fa
  npm run manage:admin setup-2fa <email>
  npm run manage:admin verify-password <password>

Commands:
  reset-password <email> <password>  Sets a new admin email and password (hashed).
  generate-recovery                  Generates a new One-Time Recovery Code.
  show-2fa-secret                    Displays the current 2FA secret (if any).
  remove-2fa                         Removes the 2FA secret, disabling 2FA.
  setup-2fa <email>                  Generate new 2FA secret and QR code.
  verify-password <password>         Verify if password matches stored hash.
        `);
        process.exit(0);
    }

    const secrets = getSecrets();

    if (command === 'reset-password') {
        const email = args[1];
        const password = args[2];
        
        if (!email || !password) {
            console.error("❌ Usage: reset-password <email> <password>");
            process.exit(1);
        }

        if (password.length < 8) {
            console.error("❌ Password must be at least 8 characters long.");
            process.exit(1);
        }

        const hash = await hashPassword(password);
        
        secrets.ADMIN_EMAIL = email;
        secrets.ADMIN_PASSWORD_HASH = hash;
        delete secrets.ADMIN_PASSWORD;
        
        saveSecrets(secrets);
        console.log(`✅ Admin credentials set for: ${email}`);
        console.log("⚠️  Remember to restart the application: pm2 restart igrom-portfolio");
    } 
    
    else if (command === 'generate-recovery') {
        const code = Math.random().toString(36).slice(-12).toUpperCase();
        const hash = await hashPassword(code);
        
        secrets.RECOVERY_CODE_HASH = hash;
        saveSecrets(secrets);
        
        console.log("\n⚠️  KEEP THIS CODE SAFE! ⚠️");
        console.log("========================================");
        console.log(`RECOVERY CODE: ${code}`);
        console.log("========================================");
        console.log("Use this code as your PASSWORD to log in if you forget your main credentials.");
        console.log("The email can be anything when using this code.\n");
    }

    else if (command === 'show-2fa-secret') {
        const secret = secrets.ADMIN_SECRET_2FA || secrets.TOTP_SECRET;
        if (secret) {
            console.log("========================================");
            console.log(`Current 2FA Secret: ${secret}`);
            console.log("========================================");
            console.log("Add this to your Authenticator app manually if needed.");
        } else {
            console.log("❌ No 2FA secret is currently configured.");
            console.log("Run: npm run manage:admin setup-2fa <email>");
        }
    }

    else if (command === 'remove-2fa') {
        if (!secrets.ADMIN_SECRET_2FA && !secrets.TOTP_SECRET) {
            console.log("ℹ️  2FA is already disabled (no secrets found).");
        } else {
            delete secrets.ADMIN_SECRET_2FA;
            delete secrets.TOTP_SECRET;
            saveSecrets(secrets);
            console.log("✅ 2FA secrets removed. Two-factor authentication is now DISABLED.");
            console.log("⚠️  Remember to restart the application: pm2 restart igrom-portfolio");
        }
    }

    else if (command === 'setup-2fa') {
        const email = args[1] || secrets.ADMIN_EMAIL || 'admin@example.com';
        
        const secret = speakeasy.generateSecret({
            name: `Medieval Huntsman (${email})`,
            issuer: 'igrom-3d-environment.ru'
        });
        
        secrets.ADMIN_SECRET_2FA = secret.base32;
        secrets.TOTP_SECRET = secret.base32;
        saveSecrets(secrets);
        
        console.log("\n✅ New 2FA Secret generated!");
        console.log("========================================");
        console.log(`Secret: ${secret.base32}`);
        console.log("========================================");
        console.log("\n📱 Scan this QR code with your Authenticator app:\n");
        
        try {
            const qrCode = await QRCode.toString(secret.otpauth_url, { type: 'terminal' });
            console.log(qrCode);
        } catch (e) {
            console.log("QR Code URL:", secret.otpauth_url);
        }
        
        console.log("\n⚠️  Remember to restart: pm2 restart igrom-portfolio\n");
    }

    else if (command === 'verify-password') {
        const password = args[1];
        
        if (!password) {
            console.error("❌ Usage: verify-password <password>");
            process.exit(1);
        }
        
        const hash = secrets.ADMIN_PASSWORD_HASH;
        if (!hash) {
            console.error("❌ No password hash found in secrets.json");
            process.exit(1);
        }
        
        const isValid = await bcrypt.compare(password, hash);
        if (isValid) {
            console.log("✅ Password is correct!");
        } else {
            console.log("❌ Password is incorrect.");
        }
    }

    else {
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
}

main().catch(console.error);
