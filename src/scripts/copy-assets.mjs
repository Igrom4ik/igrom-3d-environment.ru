
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
// Define source files and their destination subfolder in 'public'
// Example: { src: "C:/Downloads/MyModel.mview", dest: "marmoset/MyModel.mview" }
const ASSETS_TO_COPY = [
    // Uncomment and edit lines below to copy files
    { src: "d:/igrom-3d-environment.ru/temp_source_220MB.mview", dest: "marmoset/MikitarHat.mview" },
];

// --- LOGIC ---
const projectRoot = path.resolve(__dirname, '..', '..');
const publicDir = path.join(projectRoot, 'public');

console.log(`Starting asset copy...`);
console.log(`Project Root: ${projectRoot}`);
console.log(`Public Dir: ${publicDir}`);

if (ASSETS_TO_COPY.length === 0) {
    console.log("No assets defined in ASSETS_TO_COPY. Please edit scripts/copy-assets.mjs to add files.");
    process.exit(0);
}

ASSETS_TO_COPY.forEach(asset => {
    try {
        const sourcePath = path.resolve(asset.src);
        const destPath = path.join(publicDir, asset.dest);
        const destFolder = path.dirname(destPath);

        if (!fs.existsSync(sourcePath)) {
            console.error(`[ERROR] Source file not found: ${sourcePath}`);
            return;
        }

        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }

        console.log(`Copying: ${sourcePath} -> ${destPath}`);
        
        // Use copyFile for efficient copying
        fs.copyFileSync(sourcePath, destPath);
        
        const stats = fs.statSync(destPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`[SUCCESS] Copied ${sizeMB} MB`);

    } catch (error) {
        console.error(`[ERROR] Failed to copy ${asset.src}:`, error.message);
    }
});
