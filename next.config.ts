import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - turbopack is a valid key in Next.js 15+ but types might be missing in some versions
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
