import type { NextConfig } from "next";

const localDemo = process.env.NEXT_PUBLIC_LOCAL_DEMO === "true";
const demoBasePath = process.env.NEXT_PUBLIC_DEMO_BASE_PATH || "/Portfolio/demos/orcamentos";

const nextConfig: NextConfig = {
  ...(localDemo ? {
    output: "export" as const,
    basePath: demoBasePath,
    trailingSlash: true,
    experimental: { cpus: 2 },
  } : {}),
  images: {
    ...(localDemo ? { unoptimized: true } : {}),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
      }
    ],
  },
};

export default nextConfig;
