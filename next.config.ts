import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a server-less site for GitHub Pages (see .github/workflows/pages.yml).
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = isStatic ? (process.env.PAGES_BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  output: isStatic ? "export" : "standalone",
  basePath: basePath || undefined,
  trailingSlash: isStatic,
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: isStatic ? "1" : "0",
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
