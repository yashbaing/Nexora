import type { NextConfig } from "next";
import path from "path";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

const nextConfig: NextConfig = {
  turbopack: {
    // The monorepo root (one level up) is where the shared package-lock.json
    // and hoisted node_modules/next live.
    root: path.join(__dirname, ".."),
  },
  // Avoids Next.js dev-mode blocking the HMR websocket (and, as a side effect,
  // delaying client effects) when the site is accessed via 127.0.0.1 or a
  // forwarded/tunnelled dev host instead of "localhost".
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
