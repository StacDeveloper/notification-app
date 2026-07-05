import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const node_env = process.env.NODE_ENV! as string
    const dev_env: string = process.env.NEXT_PUBLIC_BACKEND_URL!
    const prod_env: string = process.env.NEXT_PUBLIC_PRDUCTION_BACKEND_URL!
    const destination: string = node_env === "development" ? dev_env : prod_env
    return [
      { source: "/api/:path*", destination: `${destination}/api/:path*` }
    ]
  },
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
