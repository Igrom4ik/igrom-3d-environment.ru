"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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
    // 1. Try IP-based geolocation for accuracy
    fetch("/api/geo/ip")
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`geo:${res.status}`)))
      .then(data => {
         if (data.city) {
             setLocation(data.city); // e.g. "Saint Petersburg"
         } else if (data.region) {
             setLocation(data.region);
         }
      })
      .catch(e => {
        // 2. Fallback to Timezone-based
        try {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (timeZone) {
            const city = timeZone.split("/").pop()?.replace(/_/g, " ") || "";
            setLocation(city);
          }
        } catch (err) {
        }
      });
  }, []);

  if (!location) return null;
  return <>{location}</>;
};

export default TimeDisplay;

export type HeaderLink = {
  href: string;
  label?: string;
  prefixIcon?: string;
  exact?: boolean;
};

export const Header = ({
  preset,
  links,
  customActions,
  menuMaxVisibleItems,
}: {
  preset?: string;
  links?: HeaderLink[];
  customActions?: React.ReactNode;
  menuMaxVisibleItems?: number;
}) => {
  const pathname = usePathname() ?? "";
  const { t } = useLanguage();
  const isLiquid = preset === 'ios-liquid-glass';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuBaseId = useMemo(() => {
    const safePath = pathname
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
    const safePreset = (preset ?? "default")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
    return `header-${safePath || "root"}-${safePreset}`;
  }, [pathname, preset]);

  const mobileMenuId = `${menuBaseId}-mobile-menu`;
  const desktopMenuId = `${menuBaseId}-desktop-menu`;

  const desktopScrollerRef = useRef<HTMLDivElement | null>(null);

  const shouldUseCompactMenu =
    typeof menuMaxVisibleItems === "number" &&
    Number.isFinite(menuMaxVisibleItems) &&
    menuMaxVisibleItems > 0 &&
    !!links &&
    links.length > menuMaxVisibleItems;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Enable horizontal scrolling with mouse wheel
  useEffect(() => {
    const el = desktopScrollerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      // Prevent default vertical scroll and scroll horizontally instead
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [shouldUseCompactMenu]);

  const handleDesktopMenuKeyDown = (e: React.KeyboardEvent) => {
    if (!shouldUseCompactMenu) return;
    if (
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Home" &&
      e.key !== "End" &&
      e.key !== "PageUp" &&
      e.key !== "PageDown"
    ) {
      return;
    }

    const container = desktopScrollerRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-menuitem='true']"));
    if (items.length === 0) return;

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = active ? items.indexOf(active) : -1;
    const clampIndex = (i: number) => Math.min(items.length - 1, Math.max(0, i));

    const nextIndex = (() => {
      if (e.key === "Home") return 0;
      if (e.key === "End") return items.length - 1;
      if (e.key === "PageUp") return clampIndex(currentIndex - (menuMaxVisibleItems ?? 5));
      if (e.key === "PageDown") return clampIndex(currentIndex + (menuMaxVisibleItems ?? 5));
      if (e.key === "ArrowLeft") return clampIndex((currentIndex === -1 ? 0 : currentIndex) - 1);
      return clampIndex((currentIndex === -1 ? 0 : currentIndex) + 1);
    })();

    const nextEl = items[nextIndex];
    if (!nextEl) return;
    e.preventDefault();
    nextEl.focus();
    if (typeof nextEl.scrollIntoView === "function") {
      nextEl.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };

  return (
    <>
      {!isLiquid && <Fade s={{ hide: true }} fillWidth position="fixed" height="80" style={{ zIndex: 1001 }} />}
      {!isLiquid && <Fade
        hide
        s={{ hide: false }}
        fillWidth
        position="fixed"
        bottom="0"
        to="top"
        height="80"
        style={{ zIndex: 1001 }}
      />}
      <Row
        fitHeight
        className={isLiquid ? undefined : styles.position}
        position="sticky"
        as="header"
        style={{ zIndex: 1001 }}
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
            <Row gap="4" vertical="center" textVariant="body-default-s" suppressHydrationWarning fillWidth s={{ minWidth: 0 }}>
              {/* Desktop Navigation */}
              <Row s={{ hide: true }} vertical="center" gap="4" fillWidth s={{ minWidth: 0 }}>
                  {links && links.length > 0 ? (
                    <>
                      {shouldUseCompactMenu ? (
                        <div
                          className={styles.compactMenu}
                        >
                          <div
                            id={desktopMenuId}
                            ref={desktopScrollerRef}
                            className={styles.menuScroller}
                            role="menu"
                            onKeyDown={handleDesktopMenuKeyDown}
                            aria-label="Навигация"
                            data-compact="true"
                            data-header-menu="true"
                            data-testid="header-desktop-menu"
                          >
                            {links.map((link) => (
                              <ToggleButton
                                key={link.href}
                                className={styles.navItem}
                                prefixIcon={link.prefixIcon}
                                href={link.href}
                                label={link.label}
                                selected={link.exact ? pathname === link.href : pathname.startsWith(link.href)}
                                role="menuitem"
                                data-menuitem="true"
                                data-header-menuitem="true"
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <ToggleButton
                            prefixIcon={links[0]?.prefixIcon}
                            href={links[0]?.href}
                            label={links[0]?.label}
                            selected={links[0]?.exact ? pathname === links[0]?.href : pathname.startsWith(links[0]?.href ?? '')}
                          />
                          {links.length > 1 && <Line background="neutral-alpha-medium" vert maxHeight="24" />}
                          {links.slice(1).map((link) => (
                            <ToggleButton
                              key={link.href}
                              className={styles.navItem}
                              prefixIcon={link.prefixIcon}
                              href={link.href}
                              label={link.label}
                              selected={link.exact ? pathname === link.href : pathname.startsWith(link.href)}
                            />
                          ))}
                        </>
                      )}
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
              </Row>

              {/* Mobile Navigation Trigger */}
              <Row hide s={{ hide: false }}>
                <ToggleButton 
                  prefixIcon={isMobileMenuOpen ? "close" : "menu"}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  selected={isMobileMenuOpen}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls={mobileMenuId}
                  aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
                />
              </Row>

              {customActions && (
                <>
                  <Line background="neutral-alpha-medium" vert maxHeight="24" />
                  {customActions}
                </>
              )}
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
            zIndex={2}
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
          id={mobileMenuId}
          position="fixed"
          zIndex={8}
            fillWidth
          fillHeight
          background="page"
          padding="24"
          direction="column"
          gap="32"
          style={{ top: 0, left: 0, bottom: 0, right: 0 }}
          role="menu"
          aria-hidden={!isMobileMenuOpen}
          aria-label="Мобильная навигация"
          data-header-menu="true"
        >
          <Flex direction="column" gap="16" fillWidth vertical="center">
            {links && links.length > 0 ? (
              <>
                {links.map((link) => (
                  <div key={link.href} style={{ width: "100%" }}>
                    <ToggleButton
                      prefixIcon={link.prefixIcon}
                      href={link.href}
                      label={link.label}
                      selected={link.exact ? pathname === link.href : pathname.startsWith(link.href)}
                      fillWidth
                      role="menuitem"
                      data-header-menuitem="true"
                    />
                  </div>
                ))}
              </>
            ) : (
              <>
                {routes["/"] && (
                  <div style={{ width: "100%" }}>
                    <ToggleButton prefixIcon="home" href="/" label={t("nav.home") || "Home"} selected={pathname === "/"} fillWidth role="menuitem" data-header-menuitem="true" />
                  </div>
                )}
                {routes["/about"] && (
                  <div style={{ width: "100%" }}>
                    <ToggleButton prefixIcon="person" href="/about" label={t("nav.about")} selected={pathname === "/about"} fillWidth role="menuitem" data-header-menuitem="true" />
                  </div>
                )}
                {routes["/work"] && (
                  <div style={{ width: "100%" }}>
                    <ToggleButton prefixIcon="grid" href="/work" label={t("nav.work")} selected={pathname.startsWith("/work")} fillWidth role="menuitem" data-header-menuitem="true" />
                  </div>
                )}
                {routes["/blog"] && (
                  <div style={{ width: "100%" }}>
                    <ToggleButton prefixIcon="book" href="/blog" label={t("nav.blog")} selected={pathname.startsWith("/blog")} fillWidth role="menuitem" data-header-menuitem="true" />
                  </div>
                )}
                {routes["/gallery"] && (
                  <div style={{ width: "100%" }}>
                    <ToggleButton prefixIcon="gallery" href="/gallery" label={t("nav.gallery")} selected={pathname.startsWith("/gallery")} fillWidth role="menuitem" data-header-menuitem="true" />
                  </div>
                )}
                {routes["/coding"] && (
                  <div style={{ width: "100%" }}>
                    <ToggleButton prefixIcon="terminal" href="/coding" label={t("nav.coding")} selected={pathname.startsWith("/coding")} fillWidth role="menuitem" data-header-menuitem="true" />
                  </div>
                )}
              </>
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
