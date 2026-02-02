import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // Turbopack configuration for Next.js 16
  turbopack: {
    resolveAlias: {
      '@scripts': '../../scripts',
    },
  },

  async rewrites() {
    return [
      {
        source: '/api/binance/:path*',
        destination: 'https://api.binance.us/:path*',
      },
    ];
  },
};

export default nextConfig;
