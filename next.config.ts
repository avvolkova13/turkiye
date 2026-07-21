import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/turkiye",
  distDir: "dist",
  images: {
    unoptimized: true,
  },
  output: "export",
  trailingSlash: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
