import type { FC } from 'react';
import { Media, Text, Column, Grid } from '@once-ui-system/core';

interface ImageFullProps {
  src: string;
  caption?: string;
}

export const ImageFull: FC<ImageFullProps> = ({ src, caption }) => {
  if (!src) return null;
  return (
    <Column fillWidth gap="8" marginBottom="32" horizontal="center">
      <Media src={src} alt={caption || 'Project Image'} radius="l" style={{ width: '100%' }} />
      {caption && (
        <Text variant="body-default-s" onBackground="neutral-weak">
          {caption}
        </Text>
      )}
    </Column>
  );
};

interface VideoLoopProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  caption?: string;
}

export const VideoLoop: FC<VideoLoopProps> = ({ src, autoPlay, muted, loop, caption }) => {
  if (!src) return null;
  return (
    <Column fillWidth gap="8" marginBottom="32" horizontal="center">
      <video
        src={src}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        controls={!autoPlay}
        style={{ width: '100%', borderRadius: 'var(--radius-l)' }}
      />
       {caption && (
        <Text variant="body-default-s" onBackground="neutral-weak">
          {caption}
        </Text>
      )}
    </Column>
  );
};

interface EmbedProps {
  url: string;
}

export const YoutubeEmbed: FC<EmbedProps> = ({ url }) => {
  if (!url) return null;
  
  const getEmbedUrl = (inputUrl: string) => {
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

  return (
    <Column fillWidth marginBottom="32" style={{ aspectRatio: '16/9' }}>
      <iframe
        src={getEmbedUrl(url)}
        style={{ width: '100%', height: '100%', border: 0, borderRadius: 'var(--radius-l)' }}
        allowFullScreen
        title="Video Embed"
      />
    </Column>
  );
};

export const SketchfabEmbed: React.FC<EmbedProps> = ({ url }) => {
    if (!url) return null;
    return (
        <Column fillWidth marginBottom="32" style={{ aspectRatio: '16/9' }}>
            <iframe
                src={`${url}/embed`}
                style={{ width: '100%', height: '100%', border: 0, borderRadius: 'var(--radius-l)' }}
                allowFullScreen
                allow="autoplay; fullscreen; vr"
                title="Sketchfab Embed"
            />
        </Column>
    );
};

interface MarmosetViewerProps {
    src: string;
    width?: string;
    height?: string;
    autoStart?: boolean;
}

export const MarmosetViewer: FC<MarmosetViewerProps> = ({ src, width = '100%', height = '600px', autoStart = false }) => {
    if (!src) return null;
    
    // Note: Marmoset Viewer requires the script to be loaded. 
    // Ideally this should be in layout or loaded via useEffect hook
    
    return (
         <Column fillWidth marginBottom="32" horizontal="center">
            {/* We might need to ensure marmoset.js is loaded globally or via script tag */}
             {/* <script src="https://viewer.marmoset.co/main/marmoset.js"></script> */}
             {/* For now, we assume standard mviewer embedding which might need custom HTML structure */}
             
             <div style={{ width: width, height: height, position: 'relative' }}>
                 <iframe 
                    src={`/marmoset-viewer.html?file=${encodeURIComponent(src)}&autoStart=${autoStart}`}
                    width="100%" 
                    height="100%" 
                    allowFullScreen
                    style={{ border: 0, borderRadius: 'var(--radius-l)' }}
                    title="Marmoset Viewer"
                 />
             </div>
        </Column>
    );
};

interface ComparisonSliderProps {
    leftImage: string;
    rightImage: string;
}

export const ComparisonSlider: FC<ComparisonSliderProps> = ({ leftImage, rightImage }) => {
    if (!leftImage || !rightImage) return null;
    
    return (
        <Column fillWidth gap="8" marginBottom="32">
             <Grid columns="2" gap="16" s={{ columns: 1 }}>
                <Column gap="4">
                    <Media src={leftImage} alt="Before" radius="l" aspectRatio="16/9" objectFit="cover" />
                    <Text variant="body-default-xs" align="center" onBackground="neutral-weak">Before</Text>
                </Column>
                <Column gap="4">
                    <Media src={rightImage} alt="After" radius="l" aspectRatio="16/9" objectFit="cover" />
                    <Text variant="body-default-xs" align="center" onBackground="neutral-weak">After</Text>
                </Column>
            </Grid>
        </Column>
    );
};

interface Pano360Props {
    image: string;
    caption?: string;
}

export const Pano360: FC<Pano360Props> = ({ image, caption }) => {
    if (!image) return null;
    return (
        <Column fillWidth gap="8" marginBottom="32" horizontal="center" position="relative">
            <Media src={image} alt={caption || '360 Panorama'} radius="l" style={{ width: '100%' }} />
             <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0,0,0,0.6)',
                padding: '12px 24px',
                borderRadius: '32px',
                pointerEvents: 'none'
             }}>
                 <Text variant="body-default-m" style={{ color: 'white' }}>360° Pano</Text>
             </div>
            {caption && (
                <Text variant="body-default-s" onBackground="neutral-weak">
                    {caption}
                </Text>
            )}
        </Column>
    );
};

interface ImageGalleryProps {
    images: string[];
    columns?: '2' | '3' | '4';
}

export const ImageGallery: FC<ImageGalleryProps> = ({ images, columns = '2' }) => {
    if (!images || images.length === 0) return null;

    return (
        <Column fillWidth marginBottom="32">
             <Grid columns={columns} gap="16" s={{ columns: 1 }}>
                {images.map((img, idx) => (
                    <Media 
                        key={img} 
                        src={img} 
                        alt={`Gallery Image ${idx + 1}`} 
                        radius="l" 
                        style={{ width: '100%', height: 'auto', objectFit: 'cover' }} 
                    />
                ))}
            </Grid>
        </Column>
    );
};
