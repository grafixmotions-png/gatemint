import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Lock the watch root specifically to the project folder to prevent scanning the home directory
    root: path.resolve(typeof __dirname !== 'undefined' ? __dirname : process.cwd()),
  },
};

export default nextConfig;
