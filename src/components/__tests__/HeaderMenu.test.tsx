import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@once-ui-system/core", async () => {
  const React = await import("react");

  const Box = React.forwardRef<
    HTMLElement,
    React.PropsWithChildren<{ as?: any; className?: string; [k: string]: any }>
  >(({ as: As = "div", children, ...rest }, ref) => {
    return React.createElement(As, { ref, ...rest }, children);
  });

  const ToggleButton = React.forwardRef<
    HTMLButtonElement,
    React.PropsWithChildren<{
      label?: string;
      href?: string;
      selected?: boolean;
      className?: string;
      onClick?: () => void;
      [k: string]: any;
    }>
  >(({ label, children, ...rest }, ref) => {
    return (
      <button ref={ref} type="button" {...rest}>
        {label ?? children}
      </button>
    );
  });

  return {
    Fade: Box,
    Flex: Box,
    Row: Box,
    Line: (props: any) => <span {...props} />,
    Text: Box,
    ToggleButton,
  };
});

vi.mock("../LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="lang" />,
}));

vi.mock("../ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme" />,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/about",
}));

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("@/resources", () => ({
  display: { location: false, themeSwitcher: false, time: false },
  person: { timeZone: "UTC" },
  routes: {},
}));

import { Header, type HeaderLink } from "../Header";

const links: HeaderLink[] = Array.from({ length: 10 }).map((_, i) => ({
  href: `/admin/link-${i}`,
  label: `Link ${i}`,
  prefixIcon: "grid",
}));

describe("Header compact menu", () => {
  it("renders compact scroller when links exceed maxVisibleItems", async () => {
    render(<Header preset="ios-liquid-glass" links={links} menuMaxVisibleItems={5} />);
    const scroller = await screen.findByTestId("header-desktop-menu");
    expect(scroller).toHaveAttribute("role", "menu");
    expect(scroller).toHaveAttribute("data-compact", "true");
  });

  it("moves focus with arrow keys across menuitems", async () => {
    const user = userEvent.setup();
    render(<Header preset="ios-liquid-glass" links={links} menuMaxVisibleItems={5} />);
    const scroller = await screen.findByTestId("header-desktop-menu");

    const items = scroller.querySelectorAll<HTMLElement>("[data-menuitem='true']");
    expect(items.length).toBe(10);

    items[0]?.focus();
    expect(document.activeElement).toBe(items[0]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(items[1]);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(items[0]);
  });

  it("scroll buttons change scrollLeft when overflowed", async () => {
    const user = userEvent.setup();
    render(<Header preset="ios-liquid-glass" links={links} menuMaxVisibleItems={5} />);
    const scroller = await screen.findByTestId("header-desktop-menu");

    Object.defineProperty(scroller, "clientWidth", { value: 400, configurable: true });
    Object.defineProperty(scroller, "scrollWidth", { value: 1200, configurable: true });
    Object.defineProperty(scroller, "scrollLeft", { value: 0, writable: true, configurable: true });
    Object.defineProperty(scroller, "scrollTo", {
      value: ({ left }: { left: number }) => {
        scroller.scrollLeft = left;
        fireEvent.scroll(scroller);
      },
      configurable: true,
    });

    fireEvent(window, new Event("resize"));

    const compactMenu = scroller.parentElement;
    const leftButton = compactMenu?.querySelector<HTMLButtonElement>('button[aria-label="Прокрутить меню влево"]') ?? null;
    const rightButton = compactMenu?.querySelector<HTMLButtonElement>('button[aria-label="Прокрутить меню вправо"]') ?? null;

    expect(leftButton).not.toBeNull();
    expect(rightButton).not.toBeNull();

    expect(leftButton).toBeDisabled();
    expect(rightButton).not.toBeDisabled();

    await user.click(rightButton as HTMLButtonElement);
    expect(scroller.scrollLeft).toBeGreaterThan(0);

    await waitFor(() => {
      expect(leftButton).not.toBeDisabled();
    });
  });
});
