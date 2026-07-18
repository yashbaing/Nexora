import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5001/api/:path*",
      },
      {
        source: "/deployed-addresses.json",
        destination: "http://localhost:5001/deployed-addresses.json",
      },
    ];
  },
};

export default nextConfig;
