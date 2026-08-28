import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve(__dirname, "../.."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;