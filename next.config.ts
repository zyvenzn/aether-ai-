import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.1.2:3000", "localhost:3000"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
