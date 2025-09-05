import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', '10.108.119.202'], // Replace with your actual IP
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '10.108.119.202', // Replace with your actual IP
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
