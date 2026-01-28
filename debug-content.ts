
import { getAlbum } from './src/utils/reader';

async function run() {
  const slug = 'military-hat';
  console.log(`Fetching album: ${slug}`);
  const album = await getAlbum(slug);
  
  if (!album) {
    console.log('Album not found');
    return;
  }
  
  console.log('Album found:', album.title);
  console.log('Images raw:', JSON.stringify(album.images, null, 2));
  
  if (album.images) {
      console.log('Iterating images:');
      album.images.forEach((img: any, i: number) => {
          console.log(`Item ${i}: discriminant=${img.discriminant}`);
          if (img.discriminant === 'image') {
              console.log(`  src: ${img.value.src}`);
          } else if (img.discriminant === 'marmoset') {
              console.log(`  src: ${img.value.src}`);
              console.log(`  manualPath: ${img.value.manualPath}`);
          }
      });
  }
}

run();
