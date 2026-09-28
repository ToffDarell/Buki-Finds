import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Browsers must always fetch the newest service worker, so a fix to it reaches phones on the next visit.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
