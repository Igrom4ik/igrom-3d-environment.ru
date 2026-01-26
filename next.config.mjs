import mdx from "@next/mdx";

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
};

export default withMDX(nextConfig);
