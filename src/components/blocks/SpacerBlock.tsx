import React from 'react';

interface SpacerBlockProps {
  data: {
    height: 'small' | 'medium' | 'large' | 'xlarge';
  };
}

export function SpacerBlock({ data }: SpacerBlockProps) {
  const heights = {
    small: '32px',
    medium: '64px',
    large: '128px',
    xlarge: '256px',
  };
  
  return <div style={{ height: heights[data.height] || '64px', width: '100%' }} />;
}
