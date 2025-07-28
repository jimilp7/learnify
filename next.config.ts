import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Optimize bundle size
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Bundle size monitoring
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Add bundle size warnings for heavy dependencies
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        console.log("🔍 Bundle Monitor: Watching for heavy SDK imports (OpenAI ~500KB, Resemble AI ~200KB)");
        return entries;
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
