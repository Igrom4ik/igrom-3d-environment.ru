"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Fade, Flex, Line, Row, ToggleButton, Text } from "@once-ui-system/core";

import { useLanguage } from "@/contexts/LanguageContext";
import { display, person, routes } from "@/resources";
import styles from "./Header.module.scss";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string; // Optionally allow locale, defaulting to 'en-GB'
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeZone, locale = "ru-RU" }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const timeString = new Intl.DateTimeFormat(locale, options).format(now);
      setCurrentTime(timeString);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, [locale]);

  return <>{currentTime}</>;
};

const LocationDisplay: React.FC = () => {
  const [location, setLocation] = useState("");

  useEffect(() => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone) {
        const city = timeZone.split("/").pop()?.replace(/_/g, " ") || "";
        setLocation(city);
      }
    } catch (e) {
      console.error("Failed to detect location", e);
    }
  }, []);

  if (!location) return null;
  return <>{location}</>;
};

export default TimeDisplay;

export const Header = ({ preset }: { preset?: string }) => {
  const pathname = usePathname() ?? "";
  const { t } = useLanguage();
  const isLiquid = preset === 'ios-liquid-glass';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      {!isLiquid && <Fade s={{ hide: true }} fillWidth position="fixed" height="80" zIndex={9} />}
      {!isLiquid && <Fade
        hide
        s={{ hide: false }}
        fillWidth
        position="fixed"
        bottom="0"
        to="top"
        height="80"
        zIndex={9}
      />}
      <Row
        fitHeight
        className={isLiquid ? undefined : styles.position}
        position="sticky"
        as="header"
        zIndex={9}
        fillWidth
        padding="8"
        horizontal="center"
        data-border={isLiquid ? undefined : "rounded"}
        background={isLiquid ? "transparent" : undefined}
        s={{
          position: "fixed",
          top: isLiquid ? "24" : undefined,
          background: isLiquid ? "transparent" : undefined,
        }}
      >
        <Row paddingLeft="12" fillWidth vertical="center" textVariant="body-default-s">
          {display.location && <Row s={{ hide: true }}><LocationDisplay /></Row>}
        </Row>
        <Row fillWidth horizontal="center">
          <Row
            background={isLiquid ? undefined : "page"}
            border={isLiquid ? undefined : "neutral-alpha-weak"}
            radius={isLiquid ? undefined : "m-4"}
            shadow={isLiquid ? undefined : "l"}
            padding={isLiquid ? undefined : "4"}
            className={isLiquid ? "navbar-liquid" : undefined}
            horizontal="center"
            zIndex={1}
          >
            <Row gap="4" vertical="center" textVariant="body-default-s" suppressHydrationWarning>
              {/* Desktop Navigation */}
              <Row s={{ hide: true }} vertical="center" gap="4">
                {routes["/"] && (
                  <ToggleButton prefixIcon="home" href="/" selected={pathname === "/"} />
                )}
                <Line background="neutral-alpha-medium" vert maxHeight="24" />
                {routes["/about"] && (
                  <ToggleButton
                    className={styles.navItem}
                    prefixIcon="person"
                    href="/about"
                    label={t("nav.about")}
                    selected={pathname === "/about"}
                  />
                )}
                {routes["/work"] && (
                  <ToggleButton
                    className={styles.navItem}
                    prefixIcon="grid"
                    href="/work"
                    label={t("nav.work")}
                    selected={pathname.startsWith("/work")}
                  />
                )}
                {routes["/blog"] && (
                  <ToggleButton
                    className={styles.navItem}
                    prefixIcon="book"
                    href="/blog"
                    label={t("nav.blog")}
                    selected={pathname.startsWith("/blog")}
                  />
                )}
                {routes["/gallery"] && (
                  <ToggleButton
                    className={styles.navItem}
                    prefixIcon="gallery"
                    href="/gallery"
                    label={t("nav.gallery")}
                    selected={pathname.startsWith("/gallery")}
                  />
                )}
                {routes["/coding"] && (
                  <ToggleButton
                    className={styles.navItem}
                    prefixIcon="terminal"
                    href="/coding"
                    label={t("nav.coding")}
                    selected={pathname.startsWith("/coding")}
                  />
                )}
              </Row>

              {/* Mobile Navigation Trigger */}
              <Row hide s={{ hide: false }}>
                <ToggleButton 
                  prefixIcon="menu" 
                  onClick={() => setIsMobileMenuOpen(true)} 
                  selected={isMobileMenuOpen}
                />
              </Row>

              {display.themeSwitcher && (
                <>
                  <Line background="neutral-alpha-medium" vert maxHeight="24" />
                  <ThemeToggle />
                </>
              )}
              <Line background="neutral-alpha-medium" vert maxHeight="24" />
              <LanguageSwitcher />
            </Row>
          </Row>
        </Row>
        <Flex fillWidth horizontal="end" vertical="center">
          <Flex
            paddingRight="12"
            horizontal="end"
            vertical="center"
            textVariant="body-default-s"
            gap="20"
          >
            <Flex s={{ hide: true }}>
              {display.time && <TimeDisplay timeZone={person.timeZone} />}
            </Flex>
          </Flex>
        </Flex>
      </Row>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <Flex
          position="fixed"
          zIndex={9}
            fillWidth
          fillHeight
          background="page"
          padding="24"
          direction="column"
          gap="32"
          style={{ top: 0, left: 0, bottom: 0, right: 0 }}
        >
          <Row fillWidth horizontal="end">
            <ToggleButton 
              prefixIcon="close" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
          </Row>
          <Flex direction="column" gap="16" fillWidth vertical="center">
            {routes["/"] && (
              <ToggleButton 
                prefixIcon="home" 
                href="/" 
                label={t("nav.home") || "Home"} 
                selected={pathname === "/"} 
                fillWidth
              />
            )}
            {routes["/about"] && (
              <ToggleButton
                prefixIcon="person"
                href="/about"
                label={t("nav.about")}
                selected={pathname === "/about"}
                fillWidth
              />
            )}
            {routes["/work"] && (
              <ToggleButton
                prefixIcon="grid"
                href="/work"
                label={t("nav.work")}
                selected={pathname.startsWith("/work")}
                fillWidth
              />
            )}
            {routes["/blog"] && (
              <ToggleButton
                prefixIcon="book"
                href="/blog"
                label={t("nav.blog")}
                selected={pathname.startsWith("/blog")}
                fillWidth
              />
            )}
            {routes["/gallery"] && (
              <ToggleButton
                prefixIcon="gallery"
                href="/gallery"
                label={t("nav.gallery")}
                selected={pathname.startsWith("/gallery")}
                fillWidth
              />
            )}
            {routes["/coding"] && (
              <ToggleButton
                prefixIcon="terminal"
                href="/coding"
                label={t("nav.coding")}
                selected={pathname.startsWith("/coding")}
                fillWidth
              />
            )}
          </Flex>
          <Flex direction="column" gap="16" fillWidth vertical="center" marginTop="m">
            {display.time && (
               <Text variant="body-default-s" onBackground="neutral-weak">
                 <TimeDisplay timeZone={person.timeZone} />
               </Text>
            )}
            {display.location && (
               <Text variant="body-default-s" onBackground="neutral-weak">
                 <LocationDisplay />
               </Text>
            )}
          </Flex>
        </Flex>
      )}
    </>
  );
};
