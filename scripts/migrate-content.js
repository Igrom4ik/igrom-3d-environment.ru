const fs = require('fs');
const path = require('path');

const albumsDir = path.join(process.cwd(), 'src/content/albums');

console.log('Checking albums directory:', albumsDir);

if (!fs.existsSync(albumsDir)) {
  console.log('Albums directory not found:', albumsDir);
  process.exit(0);
}

const items = fs.readdirSync(albumsDir);

items.forEach(item => {
  const fullPath = path.join(albumsDir, item);
  const stats = fs.statSync(fullPath);

  if (stats.isFile() && item.endsWith('.mdoc')) {
    const slug = item.replace('.mdoc', '');
    const newDir = path.join(albumsDir, slug);
    const newPath = path.join(newDir, 'index.mdoc');

    console.log(`Migrating ${item} -> ${slug}/index.mdoc`);

    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir);
    }

    fs.renameSync(fullPath, newPath);
  }
});

console.log('Migration complete.');
