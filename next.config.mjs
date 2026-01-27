import mdx from "@next/mdx";
import path from "node:path";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '*.localhost',
  ],
  output: isProd ? "export" : undefined,
  basePath: isProd ? "/igrom-3d-environment.ru" : undefined,
  pageExtensions: isProd 
    ? ["ts", "tsx", "md", "mdx"] 
    : ["ts", "tsx", "md", "mdx", "local.ts"],
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/igrom-3d-environment.ru" : "",
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
  },
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
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
    experimental: {
        serverActions: {
            bodySizeLimit: '500mb',
        },
    },
    images: {
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96],
    },
};

export default withMDX(nextConfig);
