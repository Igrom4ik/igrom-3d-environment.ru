"use client";

import React from "react";
import { BackgroundManager } from "@/components/BackgroundManager";
import { Background, RevealFx, opacity, SpacingToken } from "@once-ui-system/core";
import { effects } from "@/resources";
import styles from "./ThemePreview.module.css";

interface ThemePreviewProps {
  settings: any;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ settings }) => {
  // Extract styles for preview container
  const { theme, brand, accent, neutral, solid, solidStyle, surface } = settings;

  const backgroundEffect = settings.background?.discriminant || 'none';

  return (
    <div
      className={styles.previewContainer}
      data-theme={theme === 'system' ? 'dark' : theme}
      data-brand={brand}
      data-accent={accent}
      data-neutral={neutral}
      data-solid={solid}
      data-solid-style={solidStyle}
      data-surface={surface}
    >
      {/* Background Layer */}
      <div className={styles.backgroundLayer}>
        {/* Dynamic Canvas Backgrounds */}
        <BackgroundManager settings={settings} />
        
        {/* Static Once UI Backgrounds */}
        <div className={styles.staticBackgroundWrapper}>
            <Background
              mask={{
                x: effects.mask.x,
                y: effects.mask.y,
                radius: effects.mask.radius,
                cursor: effects.mask.cursor,
              }}
              gradient={{
                display: backgroundEffect === 'aurora',
                opacity: effects.gradient.opacity as opacity,
                x: effects.gradient.x,
                y: effects.gradient.y,
                width: effects.gradient.width,
                height: effects.gradient.height,
                tilt: effects.gradient.tilt,
                colorStart: effects.gradient.colorStart,
                colorEnd: effects.gradient.colorEnd,
              }}
              dots={{
                display: backgroundEffect === 'particles', // or legacy 'particles'
                opacity: effects.dots.opacity as opacity,
                size: effects.dots.size as SpacingToken,
                color: effects.dots.color,
              }}
              grid={{
                display: backgroundEffect === 'grid', // legacy 'grid'
                opacity: effects.grid.opacity as opacity,
                color: effects.grid.color,
                width: effects.grid.width,
                height: effects.grid.height,
              }}
              lines={{
                display: false,
                opacity: effects.lines.opacity as opacity,
                size: effects.lines.size as SpacingToken,
                thickness: effects.lines.thickness,
                angle: effects.lines.angle,
                color: effects.lines.color,
              }}
            />
        </div>
      </div>

      {/* Content Layer (Fake UI for preview) */}
      <div className={styles.contentLayer}>
        <h1 className={styles.previewTitle}>Preview Title</h1>
        <p className={styles.previewText}>This is how your theme looks.</p>
        <button className={styles.actionButton}>
            Action Button
        </button>
      </div>
    </div>
  );
};
