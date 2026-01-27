"use client";

import { gallery } from "@/resources";
import { MasonryGrid, Media } from "@once-ui-system/core";

export default function GalleryView() {
  return (
    <MasonryGrid columns={2} s={{ columns: 1 }}>
      {gallery.images.map((image, index) => {
        const isMarmoset = image.src.endsWith('.mview');
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
        
        if (isMarmoset) {
           return (
             <div 
                key={image.src}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: image.orientation === "horizontal" ? "16 / 9" : "3 / 4",
                  borderRadius: 'var(--radius-m)',
                  overflow: 'hidden',
                  background: '#000'
                }}
             >
               <iframe
                 src={`${basePath}/marmoset-viewer.html?file=${image.src}&autoStart=false`}
                 width="100%"
                 height="100%"
                 allowFullScreen
                 title={image.alt}
                 style={{ display: 'block', border: 0 }}
               />
             </div>
           );
        }

        return (
        <Media
          enlarge
          priority={index < 10}
          sizes="(max-width: 560px) 100vw, 50vw"
          key={image.src}
          radius="m"
          aspectRatio={image.orientation === "horizontal" ? "16 / 9" : "3 / 4"}
          src={image.src}
          alt={image.alt}
        />
      )})}
    </MasonryGrid>
  );
}
