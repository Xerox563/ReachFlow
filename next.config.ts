import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // @ts-ignore
    allowedDevOrigins: ['10.128.13.28'],
  },
};

export default nextConfig;
