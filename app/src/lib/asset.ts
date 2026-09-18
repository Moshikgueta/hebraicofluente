/* Asset URLs under a base path.
 *
 * GitHub Pages serves a project site from /<repo>/, so every absolute URL the
 * app builds by hand — an audio clip, a stroke-order SVG — has to carry that
 * prefix. Next rewrites what it controls (its own chunks, next/font, next/image
 * with the default loader); it cannot rewrite a string this code concatenates.
 *
 * NEXT_PUBLIC_BASE_PATH is empty in development and on a root-domain host, so
 * this is a no-op everywhere except Pages. */

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const asset = (path: string): string =>
  `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
