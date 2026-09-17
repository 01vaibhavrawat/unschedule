import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  experimental: {
    proxyTimeout: 120000,
  },
  async rewrites() {
    const backendUrl = process.env.INTERNAL_API_URL || (process.env.NODE_ENV === "production" ? "http://backend:8000" : "http://127.0.0.1:8000");
    return [
      {
        source: "/api/backend/:path*/",
        destination: `${backendUrl}/:path*/`,
      },
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
