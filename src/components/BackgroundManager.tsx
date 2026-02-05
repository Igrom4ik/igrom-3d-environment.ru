"use client";

import React from "react";
import { ConstellationBackground } from "./backgrounds/Constellation";
import { InteractiveGridBackground } from "./backgrounds/InteractiveGrid";
import { VortexBackground } from "./backgrounds/Vortex";
import { TopographyBackground } from "./backgrounds/Topography";
import { WaveGridBackground } from "./backgrounds/WaveGrid";
import { AnimatedBeamsBackground } from "./backgrounds/Beams";
import { SnowBackground } from "./backgrounds/Snow";
import { MusicPlayer } from "./MusicPlayer";

interface BackgroundSettings {
  discriminant: string;
  value?: any;
}

interface MusicSettings {
  file?: string | null;
  autoplay?: boolean;
  volume?: number | null;
}

interface DesignSettings {
  background?: BackgroundSettings | string;
  backgroundMusic?: MusicSettings;
  // ... other fields
}

export const BackgroundManager = ({ settings }: { settings: DesignSettings | null }) => {
  if (!settings) return null;

  const { background, backgroundMusic } = settings;

  // Determine active background
  let ActiveBackground = null;
  let type = 'none';
  let config = {};

  if (typeof background === 'string') {
    type = background;
  } else if (background && typeof background === 'object') {
    type = background.discriminant;
    config = background.value || {};
  }

  switch (type) {
    case 'constellation':
      ActiveBackground = ConstellationBackground;
      break;
    case 'interactive-grid':
      ActiveBackground = InteractiveGridBackground;
      break;
    case 'vortex':
      ActiveBackground = VortexBackground;
      break;
    case 'topography':
      ActiveBackground = TopographyBackground;
      break;
    case 'wave-grid':
      ActiveBackground = WaveGridBackground;
      break;
    case 'beams':
      ActiveBackground = AnimatedBeamsBackground;
      break;
    case 'snow':
      ActiveBackground = SnowBackground;
      break;
    // Legacy support or simple selects
    case 'grid': // Old grid or just grid
       // If it's the old 'grid', maybe map to interactive-grid or leave empty if code missing
       // The user asked for "Interactive Grid" which is new.
       // The old config had 'grid'. I'll map 'grid' to 'interactive-grid' for fun, or just ignore.
       // Let's map it to InteractiveGridBackground for now.
       ActiveBackground = InteractiveGridBackground;
       break;
    case 'particles':
        // Map to Constellation if similar, or Snow?
        ActiveBackground = ConstellationBackground;
        break;
    case 'aurora':
        // Not implemented yet, user didn't ask code for this specific one or I missed it in the list of NEW ones.
        // The user list: Constellation, Interactive Grid, Vortex, Topography, Wave Grid, Beams, Snow.
        // Aurora was in old config. I'll leave it empty.
        break;
    default:
      ActiveBackground = null;
  }

  return (
    <>
      {ActiveBackground && <ActiveBackground {...config} />}
      
      {backgroundMusic?.file && (
        <MusicPlayer 
          src={backgroundMusic.file} 
          autoplay={backgroundMusic.autoplay} 
          volume={backgroundMusic.volume ?? undefined} 
        />
      )}
    </>
  );
};
