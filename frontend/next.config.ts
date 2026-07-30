import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.agent.cvm.dev"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/deployed-addresses.json",
        destination: `${BACKEND_URL}/deployed-addresses.json`,
      },
    ];
  },
};

export default nextConfig;
