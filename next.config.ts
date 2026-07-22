import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions:{
            allowedOrigins:[
                "localhost:3000",
                "*.local",
                "172.26.48.1"
            ],
            bodySizeLimit: "8mb",
        }
    }
};

export default nextConfig;
