import type { FC } from "react";
import { Media, Text, Column, Grid } from "@once-ui-system/core";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function normalizePath(file: string) {
  if (!file || file.startsWith('http')) return file;
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

interface ImageFullProps {
  src: string;
  caption?: string;
}

export const ImageFull: FC<ImageFullProps> = ({ src, caption }) => {
  if (!src) return null;
  const normalizedSrc = normalizePath(src);
  return (
    <Column fillWidth gap="8" marginBottom="4" horizontal="center">
      <Media src={normalizedSrc} alt={caption || 'Project Image'} style={{ width: '100%' }} />
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
  const normalizedSrc = normalizePath(src);
  return (
    <Column fillWidth gap="8" marginBottom="4" horizontal="center">
      <video
        src={normalizedSrc}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        controls={!autoPlay}
        style={{ width: '100%', display: 'block' }}
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
    <Column fillWidth marginBottom="4" style={{ aspectRatio: '16/9' }}>
      <iframe
        src={getEmbedUrl(url)}
        style={{ width: '100%', height: '100%', border: 0 }}
        allowFullScreen
        title="Video Embed"
      />
    </Column>
  );
};

export const SketchfabEmbed: React.FC<EmbedProps> = ({ url }) => {
    if (!url) return null;
    return (
        <Column fillWidth marginBottom="4" style={{ aspectRatio: '16/9' }}>
            <iframe
                src={`${url}/embed`}
                style={{ width: '100%', height: '100%', border: 0 }}
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

export const MarmosetViewer: FC<MarmosetViewerProps> = ({
  src,
  width = "100%",
  height = "600px",
  autoStart = false,
}) => {
  if (!src) return null;

  const fileParam = normalizePath(src);
  const viewerPath = `${basePath || ""}/marmoset-viewer.html?file=${encodeURIComponent(
    fileParam,
  )}&autoStart=${autoStart}`;

  return (
    <Column fillWidth marginBottom="4" horizontal="center">
      <div style={{ width, height, position: "relative" }}>
        <iframe
          src={viewerPath}
          width="100%"
          height="100%"
          allowFullScreen
          style={{ border: 0, display: 'block' }}
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
    
    const normalizedLeft = normalizePath(leftImage);
    const normalizedRight = normalizePath(rightImage);

    return (
        <Column fillWidth gap="8" marginBottom="32">
             <Grid columns="2" gap="16" s={{ columns: 1 }}>
                <Column gap="4">
                    <Media src={normalizedLeft} alt="Before" radius="l" aspectRatio="16/9" objectFit="cover" />
                    <Text variant="body-default-xs" align="center" onBackground="neutral-weak">Before</Text>
                </Column>
                <Column gap="4">
                    <Media src={normalizedRight} alt="After" radius="l" aspectRatio="16/9" objectFit="cover" />
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
    const normalizedImage = normalizePath(image);
    return (
        <Column fillWidth gap="8" marginBottom="32" horizontal="center" position="relative">
            <Media src={normalizedImage} alt={caption || '360 Panorama'} radius="l" style={{ width: '100%' }} />
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
                {images.map((img, idx) => {
                    const normalizedImg = normalizePath(img);
                    return (
                        <Media 
                            key={img} 
                            src={normalizedImg} 
                            alt={`Gallery Image ${idx + 1}`} 
                            radius="l" 
                            style={{ width: '100%', height: 'auto', objectFit: 'cover' }} 
                        />
                    );
                })}
            </Grid>
        </Column>
    );
};
