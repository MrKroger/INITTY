import type { NextConfig } from "next";

// Дефолтные значения на случай, если переменная в .env не задана
const defaultOrigins = ["localhost:3000", "*.local"];

// Считываем переменную окружения и разбиваем её по запятой
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