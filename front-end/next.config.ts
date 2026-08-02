import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "**", // Tanda bintang dua ini akan mengizinkan sementara SEMUA link gambar dari internet
      },
    ],
  },
};

export default nextConfig;
