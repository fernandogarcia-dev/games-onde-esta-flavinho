import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cursor preview and direct IP both hit the app as 127.0.0.1 while
  // `next dev` binds as localhost — without this, client JS never hydrates.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.cursor.sh",
    "**.cursor.sh",
    "*.cursor.com",
    "**.cursor.com",
    "*.cursorapi.com",
    "**.cursorapi.com",
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
