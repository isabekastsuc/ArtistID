import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable static export for GitHub Pages
  output: "export",
  // Configure base path and asset prefix for project pages
  basePath: isProd ? "/artistID" : undefined,
  assetPrefix: isProd ? "/artistID/" : undefined,
  // Avoid 404s on GitHub Pages by generating trailing slash paths
  trailingSlash: true,
