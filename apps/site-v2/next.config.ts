import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@coworking-cafe/database",
    "@coworking-cafe/email",
    "@coworking-cafe/shared",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
