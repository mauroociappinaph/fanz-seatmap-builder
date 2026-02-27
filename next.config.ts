import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      // Force the root to the project directory to avoid home directory package resolution issues
      root: path.resolve(__dirname),
    },
  },
};

export default nextConfig;
