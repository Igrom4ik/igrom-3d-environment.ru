import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import classNames from "classnames";

import { Footer, Header, Providers, RouteGuard } from "@/components";
import { baseURL, dataStyle, effects, fonts, home, style } from "@/resources";
import { getDesignSettings } from "@/utils/reader";
import Script from "next/script";
import {
  Background,
  Column,
  Flex,
  Meta,
  RevealFx,
  type SpacingToken,
  type opacity,
} from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getDesignSettings();
  let activeStyle = settings ? { ...style, ...settings } : style;

  if (settings?.preset === 'ios-liquid-glass') {
    activeStyle = {
      ...activeStyle,
      theme: 'light',
      brand: 'blue',
      accent: 'blue',
      neutral: 'slate',
      border: 'playful',
      solid: 'contrast',
      solidStyle: 'flat',
      surface: 'translucent',
    };
  }

  const backgroundEffect = settings?.backgroundEffect ?? 'none';

  return (
    <Flex
      suppressHydrationWarning
      as="html"
      lang="en"
      fillWidth
      data-neutral={activeStyle.neutral}
      data-brand={activeStyle.brand}
      data-accent={activeStyle.accent}
      data-border={activeStyle.border}
      data-theme={activeStyle.theme}
      data-solid={activeStyle.solid}
      data-solid-style={activeStyle.solidStyle}
      data-surface={activeStyle.surface}
      data-transition={activeStyle.transition}
      data-scaling={activeStyle.scaling}
      data-preset={settings?.preset}
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function() {
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
              
              const styleKeys = Object.keys(config);
              // Commenting out local storage override to ensure preset settings take precedence
              /*
              styleKeys.forEach(key => {
                const value = localStorage.getItem('data-' + key);
                if (value) {
                  root.setAttribute('data-' + key, value);
                }
              });
              */
            } catch (e) {
              console.error('Failed to initialize theme:', e);
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();`}
        </Script>
      </head>
      <Providers>
        <Column
          as="body"
          background="page"
          fillWidth
          style={{ minHeight: "100vh" }}
          margin="0"
          padding="0"
          horizontal="center"
        >
          <RevealFx fill position="absolute">
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
                display: backgroundEffect === 'particles',
                opacity: effects.dots.opacity as opacity,
                size: effects.dots.size as SpacingToken,
                color: effects.dots.color,
              }}
              grid={{
                display: backgroundEffect === 'grid',
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
          </RevealFx>
          <Flex fillWidth minHeight="16" s={{ hide: true }} />
          <Header preset={settings?.preset} />
          <Flex zIndex={0} fillWidth padding="l" marginTop="l" horizontal="center" flex={1}>
            <Flex horizontal="center" fillWidth minHeight="0">
              <RouteGuard>{children}</RouteGuard>
            </Flex>
          </Flex>
          <Footer />
        </Column>
      </Providers>
    </Flex>
  );
}
