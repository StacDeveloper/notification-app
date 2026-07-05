import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const destination:string = process.env.NEXT_PUBLIC_PRDUCTION_BACKEND_URL! 
    return [
      { source: "/api/:path*", destination: `${destination}/api/:path*` }
    ]
  },
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
