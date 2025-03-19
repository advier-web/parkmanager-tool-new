import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // ESLint errors tijdens productie build worden warnings in plaats van errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript errors tijdens productie build worden warnings in plaats van errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
