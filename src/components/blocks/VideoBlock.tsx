import React from 'react';
import { Column, Heading } from "@once-ui-system/core";

interface VideoBlockProps {
  data: {
    title?: string;
    url: string;
    autoplay?: boolean;
  };
}

export function VideoBlock({ data }: VideoBlockProps) {
  const { title, url, autoplay } = data;
  
  // Simple check for YouTube/Vimeo vs Direct file
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
}
