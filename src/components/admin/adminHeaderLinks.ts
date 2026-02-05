import type { HeaderLink } from "@/components/Header";

export const adminHeaderLinks: HeaderLink[] = [
  { href: "/keystatic", prefixIcon: "home", exact: true },
  { href: "/admin/portfolio", prefixIcon: "grid", label: "Portfolio" },
  { href: "/admin/blog", prefixIcon: "book", label: "Blog" },
  { href: "/keystatic/collection/telegramPosts", prefixIcon: "terminal", label: "Telegram" },
  { href: "/admin/upload", prefixIcon: "gallery", label: "Uploads" },
  { href: "/keystatic/singleton/settings", prefixIcon: "person", label: "Settings" },
  { href: "/keystatic/singleton/design", prefixIcon: "grid", label: "Design" },
];
