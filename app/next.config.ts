import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  /* The course is static content plus client-side state, so every route can be
     prerendered. Nothing here needs a server at runtime. */
  output: 'standalone'
};

export default nextConfig;
