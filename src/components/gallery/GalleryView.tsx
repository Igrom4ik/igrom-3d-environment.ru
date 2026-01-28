"use client";

import { gallery } from "@/resources";
import { MasonryGrid, Media, Column, Text } from "@once-ui-system/core";

interface GalleryViewProps {
  images?: any[];
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function normalizeMarmosetFilePath(file: string) {
  if (!file) return "";
  let normalized = file.replace(/\\/g, "/");
  const publicIndex = normalized.indexOf("/public/");
  if (publicIndex !== -1) {
    normalized = normalized.slice(publicIndex + "/public".length);
  }
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (basePath && !normalized.startsWith(basePath)) {
    normalized = `${basePath}${normalized}`;
  }
  return normalized;
}

const getYoutubeEmbedUrl = (inputUrl: string) => {
    try {
        if (inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be')) {
            let id = '';
            if (inputUrl.includes('youtu.be')) {
                id = inputUrl.split('/').pop() || '';
            } else {
                const urlParams = new URLSearchParams(new URL(inputUrl).search);
                id = urlParams.get('v') || '';
            }
            return `https://www.youtube.com/embed/${id}`;
        }
        if (inputUrl.includes('vimeo.com')) {
            const id = inputUrl.split('/').pop();
            return `https://player.vimeo.com/video/${id}`;
        }
        return inputUrl;
    } catch (e) {
        return inputUrl;
    }
};

export default function GalleryView({ images = gallery.images }: GalleryViewProps) {
  return (
    <MasonryGrid columns={2} s={{ columns: 1 }}>
      {images.map((image, index) => {
        // Handle Keystatic Blocks (discriminant)
        if (image.discriminant) {
            switch(image.discriminant) {
                case 'image':
                    return (
                        <Media
                            key={index}
                            enlarge
                            priority={index < 10}
                            sizes="(max-width: 560px) 100vw, 50vw"
                            radius="m"
                            aspectRatio={image.value.orientation === "horizontal" ? "16 / 9" : "3 / 4"}
                            src={image.value.src}
                            alt={image.value.alt || ''}
                            style={{ marginBottom: '16px' }}
                        />
                    );
                case 'video':
                    return (
                        <div key={index} style={{ marginBottom: '16px', borderRadius: 'var(--radius-m)', overflow: 'hidden' }}>
                            <video
                                src={image.value.src}
                                autoPlay={image.value.autoPlay}
                                muted={image.value.muted}
                                loop={image.value.loop}
                                playsInline
                                controls={!image.value.autoPlay}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </div>
                    );
                case 'youtube':
                    return (
                        <div key={index} style={{ marginBottom: '16px', aspectRatio: '16/9', borderRadius: 'var(--radius-m)', overflow: 'hidden' }}>
                            <iframe
                                src={getYoutubeEmbedUrl(image.value.url)}
                                style={{ width: '100%', height: '100%', border: 0 }}
                                allowFullScreen
                                title="Video Embed"
                            />
                        </div>
                    );
                case 'sketchfab':
                    return (
                        <div key={index} style={{ marginBottom: '16px', aspectRatio: '16/9', borderRadius: 'var(--radius-m)', overflow: 'hidden' }}>
                            <iframe
                                src={`${image.value.url}/embed`}
                                style={{ width: '100%', height: '100%', border: 0 }}
                                allowFullScreen
                                allow="autoplay; fullscreen; vr"
                                title="Sketchfab Embed"
                            />
                        </div>
                    );
                case 'marmoset':
                    const mviewPath = normalizeMarmosetFilePath(image.value.src || image.value.manualPath);
                    const viewerUrl = `${basePath}/marmoset-viewer.html?file=${encodeURIComponent(mviewPath)}&autoStart=false`;
                    const aspectRatio = image.value.orientation === "horizontal" ? "16 / 9" : "3 / 4";
                    
                    return (
                        <div key={index} style={{ marginBottom: '16px', aspectRatio, borderRadius: 'var(--radius-m)', overflow: 'hidden', background: '#000', position: 'relative' }}>
                            <iframe
                                src={viewerUrl}
                                width="100%"
                                height="100%"
                                allowFullScreen
                                style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                                title="Marmoset Viewer"
                            />
                        </div>
                    );
                case 'pano':
                    return (
                        <div key={index} style={{ marginBottom: '16px', position: 'relative' }}>
                            <Media 
                                src={image.value.image} 
                                alt={image.value.caption || '360 Panorama'} 
                                radius="m" 
                                style={{ width: '100%' }} 
                            />
                             <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'rgba(0,0,0,0.6)',
                                padding: '8px 16px',
                                borderRadius: '32px',
                                pointerEvents: 'none'
                             }}>
                                 <Text variant="body-default-s" style={{ color: 'white' }}>360° Pano</Text>
                             </div>
                        </div>
                    );
                default:
                    return null;
            }
        }

        // Legacy / Flat Structure Support
        const isMarmoset = image.src?.endsWith('.mview');
        
        if (isMarmoset) {
           return (
             <div 
                key={image.src || index}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: image.orientation === "horizontal" ? "16 / 9" : "3 / 4",
                  borderRadius: 'var(--radius-m)',
                  overflow: 'hidden',
                  background: '#000',
                  marginBottom: '16px'
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
          key={image.src || index}
          radius="m"
          aspectRatio={image.orientation === "horizontal" ? "16 / 9" : "3 / 4"}
          src={image.src}
          alt={image.alt}
          style={{ marginBottom: '16px' }}
        />
      )})}
    </MasonryGrid>
  );
}
