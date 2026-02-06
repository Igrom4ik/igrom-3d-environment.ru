export const DEFAULT_AVATAR_PATH = "/images/uploads/avatar.webp";

export function normalizeAvatarPath(p: string | null | undefined): string {
  if (!p) return DEFAULT_AVATAR_PATH;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return p;
  return `/images/uploads/${p}`;
}
