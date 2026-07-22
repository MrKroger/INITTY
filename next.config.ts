import type { NextConfig } from "next";

const defaultOrigins = ["localhost:3000", "*.local"];

const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : defaultOrigins;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: envOrigins,
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;