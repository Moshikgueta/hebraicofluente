import type { NextConfig } from 'next';

/* The whole course is static: 48 prerendered pages, and the only state is the
   learner's own, in their browser. So it exports to plain files and can be
   served from anywhere — no Node process, no server. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  reactStrictMode: true,
  /* Static export has no image optimiser. The only images here are the 27
     stroke-order SVGs, which need none. */
  images: { unoptimized: true },
  /* GitHub Pages resolves /a/b to /a/b/index.html, so directory-style URLs are
     what the export has to produce. */
  trailingSlash: true
};

export default nextConfig;
