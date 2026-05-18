import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  typescript: {
    // Ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://unschedule-backend-latest.onrender.com/:path*',
      },
    ];
  },

};

export default nextConfig;
