import type { ReactNode } from 'react';
import { Providers, Header, Footer } from "@/components";
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";
import { Flex, Column, Background, RevealFx } from "@once-ui-system/core";
import type { opacity, SpacingToken } from "@once-ui-system/core";
import classNames from "classnames";
import { fonts, effects, style, dataStyle } from "@/resources";
import { getDesignSettings } from "@/utils/reader";

export default async function PreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
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
                {children}
             </Flex>
          </Flex>

          <Footer />
        </Column>
      </Providers>
    </Flex>
  );
}
