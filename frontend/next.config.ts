import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "https://notification-app-gzic.vercel.app/:path*" }
    ]
  },
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
