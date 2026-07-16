import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions:{
            allowedOrigins:[
                "localhost:3000",
                "*.local",
            ],
            bodySizeLimit: "8mb",
        }
    }
};

export default nextConfig;
