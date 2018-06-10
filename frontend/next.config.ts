import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable static export for GitHub Pages
  output: "export",
  // Configure base path and asset prefix for project pages
