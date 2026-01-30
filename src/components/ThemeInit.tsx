import React from 'react';
import Script from 'next/script';

interface ThemeInitProps {
  settings: any;
  activeStyle: any;
  dataStyle: any;
}

export const ThemeInit: React.FC<ThemeInitProps> = ({ settings, activeStyle, dataStyle }) => {
  
  const scriptContent = `(function() {
            try {
              const root = document.documentElement;
              const defaultTheme = 'system';
              
              const config = ${JSON.stringify({
                preset: settings?.preset,
                brand: activeStyle.brand,
                accent: activeStyle.accent,
                neutral: activeStyle.neutral,
                solid: activeStyle.solid,
                "solid-style": activeStyle.solidStyle,
                border: activeStyle.border,
                surface: activeStyle.surface,
                transition: activeStyle.transition,
                scaling: activeStyle.scaling,
                "viz-style": dataStyle.variant,
              })};
              
              Object.entries(config).forEach(([key, value]) => {
                root.setAttribute('data-' + key, value);
              });
              
              const resolveTheme = (themeValue) => {
                if (!themeValue || themeValue === 'system') {
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                return themeValue;
              };
              
              const savedTheme = localStorage.getItem('data-theme');
              const resolvedTheme = resolveTheme(savedTheme);
              root.setAttribute('data-theme', resolvedTheme);
            } catch (e) {
              console.error('Failed to initialize theme:', e);
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();`;

  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {scriptContent}
    </Script>
  );
};
