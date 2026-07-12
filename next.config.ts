import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {//Отключение блокировки действий
        serverActions:{
            allowedOrigins:[
                "localhost:3000",
                "*.local",
            ]
        }
    }
};

export default nextConfig;
