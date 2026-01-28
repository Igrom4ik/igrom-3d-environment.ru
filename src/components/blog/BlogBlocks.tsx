import type { FC } from 'react';
import { Column, Text, CodeBlock as OnceCodeBlock, Icon, Row, Grid, Media, Heading } from "@once-ui-system/core";

// Re-use or re-implement ImageGallery from ProjectBlocks if needed, 
// but defining here for clarity and specific blog styling if needed.

export interface BlogImageGalleryProps {
    images: string[];
    columns?: '2' | '3' | '4';
}

export const BlogImageGallery: FC<BlogImageGalleryProps> = ({ images, columns = '2' }) => {
    if (!images || images.length === 0) return null;

    return (
        <Column fillWidth marginBottom="32">
             <Grid columns={columns} gap="16" s={{ columns: 1 }}>
                {images.map((img) => (
          <Media 
            key={img} 
            src={img} 
            alt="Gallery Image" 
            radius="l" 
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }} 
          />
        ))}
            </Grid>
        </Column>
    );
};

export interface BlogYoutubeProps {
    url: string;
}

export const BlogYoutube: FC<BlogYoutubeProps> = ({ url }) => {
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

export interface BlogCalloutProps {
    type?: 'info' | 'warning' | 'error' | 'success';
    title?: string;
    content: string;
}

export const BlogCallout: FC<BlogCalloutProps> = ({ type = 'info', title, content }) => {
    const getIcon = () => {
        switch(type) {
            case 'warning': return 'warning';
            case 'error': return 'error';
            case 'success': return 'checkCircle';
            default: return 'infoCircle';
        }
    };

    const getColor = () => {
        switch(type) {
            case 'warning': return 'warning-weak';
            case 'error': return 'danger-weak';
            case 'success': return 'success-weak';
            default: return 'info-weak';
        }
    };

    return (
        <Column 
            fillWidth 
            padding="24" 
            radius="l" 
            background={getColor()} 
            border="neutral-alpha-weak"
            gap="8"
            marginBottom="32"
        >
            <Row gap="12" vertical="center">
                <Icon name={getIcon()} size="m" />
                {title && <Text variant="label-strong-m">{title}</Text>}
            </Row>
            <Text variant="body-default-m">{content}</Text>
        </Column>
    );
};

export interface BlogCodeBlockProps {
    code: string;
    language?: string;
    label?: string;
}

export const BlogCodeBlock: FC<BlogCodeBlockProps> = ({ code, language = 'typescript', label }) => {
    return (
        <Column fillWidth marginBottom="32">
            <OnceCodeBlock 
                codes={[{
                    code: code,
                    language: language,
                    label: label || language
                }]}
                copyButton
            />
        </Column>
    );
};

export interface BlogVideoProps {
    title?: string;
    url: string;
    autoplay?: boolean;
}

export const BlogVideoBlock: FC<BlogVideoProps> = ({ title, url, autoplay }) => {
  const isEmbed = url.includes('youtube') || url.includes('vimeo') || url.includes('youtu.be');
  
  return (
    <Column fillWidth gap="m" paddingY="32">
      {title && <Heading variant="heading-strong-m">{title}</Heading>}
      
      <div style={{ 
        position: 'relative', 
        paddingBottom: '56.25%', /* 16:9 */
        height: 0, 
        overflow: 'hidden', 
        borderRadius: 'var(--radius-l)',
        background: 'var(--neutral-on-background-weak)'
      }}>
        {isEmbed ? (
          <iframe 
            src={url} 
            title={title || 'Embedded Video'}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        ) : (
          <video 
            src={url} 
            controls 
            autoPlay={autoplay}
            muted={autoplay}
            loop={autoplay}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
    </Column>
  );
};

export interface BlogSpacerProps {
    height: 'small' | 'medium' | 'large' | 'xlarge';
}

export const BlogSpacer: FC<BlogSpacerProps> = ({ height }) => {
    const heights = {
        small: '32px',
        medium: '64px',
        large: '128px',
        xlarge: '256px',
    };
    
    return <div style={{ height: heights[height] || '64px', width: '100%' }} />;
};
