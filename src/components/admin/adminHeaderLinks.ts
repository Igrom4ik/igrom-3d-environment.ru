import type { HeaderLink } from "@/components/Header";

export const adminHeaderLinks: HeaderLink[] = [
  { href: "/admin", prefixIcon: "home", label: "Dashboard", exact: true },
  { href: "/keystatic", prefixIcon: "edit", label: "Content Editor" },
  { href: "/keystatic/collection/posts", prefixIcon: "book", label: "Posts" },
  { href: "/keystatic/collection/albums", prefixIcon: "grid", label: "Portfolio" },
  { href: "/keystatic/collection/telegramPosts", prefixIcon: "terminal", label: "Telegram Posts" },
  { href: "/keystatic/singleton/home", prefixIcon: "home", label: "Edit Home" },
  { href: "/keystatic/singleton/work", prefixIcon: "grid", label: "Edit Work" },
  { href: "/keystatic/singleton/gallery", prefixIcon: "gallery", label: "Edit Gallery" },
  { href: "/keystatic/singleton/design", prefixIcon: "grid", label: "Edit Design" },
  { href: "/keystatic/singleton/settings", prefixIcon: "person", label: "Edit Settings" },
  { href: "/admin/about", prefixIcon: "person", label: "About Editor" },
  { href: "/admin/blog", prefixIcon: "book", label: "Blog Manager" },
  { href: "/admin/portfolio", prefixIcon: "grid", label: "Portfolio Manager" },
  { href: "/admin/branding", prefixIcon: "grid", label: "Branding" },
  { href: "/admin/secrets", prefixIcon: "document", label: "Secrets" },
];
