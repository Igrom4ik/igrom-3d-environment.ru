import mdx from "@next/mdx";
import path from "node:path";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.IS_GITHUB_PAGES === 'true';

console.log('[NextConfig] NODE_ENV:', process.env.NODE_ENV);
console.log('[NextConfig] IS_GITHUB_PAGES:', process.env.IS_GITHUB_PAGES);
console.log('[NextConfig] isGitHubPages:', isGitHubPages);
console.log('[NextConfig] Setting output to:', isGitHubPages ? 'export' : 'standalone (default)');

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '*.localhost',
  ],
  output: undefined,
  basePath: isGitHubPages ? '/igrom-3d-environment.ru' : '',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  pageExtensions: isProd 
    ? ["ts", "tsx", "md", "mdx"] 
    : ["ts", "tsx", "md", "mdx", "local.ts"],
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/igrom-3d-environment.ru" : "",
  },
  transpilePackages: ["next-mdx-remote"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...(Array.isArray(config.watchOptions?.ignored) ? config.watchOptions.ignored : []),
        '**/public/images/projects/**',
        '**/public/marmoset/**',
        // Also add absolute paths with forward slashes to be safe
        path.posix.join(process.cwd().replace(/\\/g, '/'), 'public/images/projects/**'),
        path.posix.join(process.cwd().replace(/\\/g, '/'), 'public/marmoset/**'),
        ],
      };
      return config;
    },
};

export default withMDX(nextConfig);
