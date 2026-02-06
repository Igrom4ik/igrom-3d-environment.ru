const DEFAULT_AVATAR = "/images/uploads/avatar.webp";

export function resolveAvatar(path?: string | null): string {
  if (!path) return DEFAULT_AVATAR;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;
  return `/images/uploads/${path}`;
}

export { DEFAULT_AVATAR };
