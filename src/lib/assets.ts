const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function normalizeAbsolutePublicPath(input: string): string {
  let normalized = input.replace(/\\/g, "/");

  const publicIndex = normalized.indexOf("/public/");
  if (publicIndex !== -1) {
    normalized = normalized.slice(publicIndex + "/public".length);
  }

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  if (basePath && !normalized.startsWith(basePath)) {
    normalized = `${basePath}${normalized}`;
  }

  return normalized;
}

export function getPublicUrl(filePath: string | null | undefined): string {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
  return normalizeAbsolutePublicPath(filePath);
}

export function getImageUrl(filePath: string | null | undefined): string {
  if (!filePath) return "";

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  if (filePath.startsWith("/")) {
    return normalizeAbsolutePublicPath(filePath);
  }

  const trimmed = filePath.replace(/^\/+/, "");

  if (trimmed.startsWith("public/")) {
    return normalizeAbsolutePublicPath(`/${trimmed.replace(/^public\/+/, "")}`);
  }

  if (trimmed.startsWith("images/") || trimmed.startsWith("uploads/")) {
    return normalizeAbsolutePublicPath(`/${trimmed}`);
  }

  return normalizeAbsolutePublicPath(`/images/uploads/${trimmed}`);
}

export function getMarmosetPackageUrl(filePath: string | null | undefined): string {
  if (!filePath) return "";

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  if (filePath.startsWith("/")) {
    return normalizeAbsolutePublicPath(filePath);
  }

  const trimmed = filePath.replace(/^\/+/, "");

  if (trimmed.startsWith("public/")) {
    return normalizeAbsolutePublicPath(`/${trimmed.replace(/^public\/+/, "")}`);
  }

  if (trimmed.startsWith("marmoset/")) {
    return normalizeAbsolutePublicPath(`/${trimmed}`);
  }

  return normalizeAbsolutePublicPath(`/marmoset/${trimmed}`);
}

