import type { NextConfig } from 'next';

/* The whole course is static: 48 prerendered pages, and the only state is the
   learner's own, in their browser. So it exports to plain files and can be
   served from anywhere - no Node process, no server. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Os módulos do layout raiz que o webpack copiava (ver `webpack` abaixo). */
export const BASE = /[\\/](content[\\/](course|courses|empresa)\.json|src[\\/]lib[\\/](catalog|content-publico|empresa|hebrew|raizes|state[\\/]raizes-estado|account[\\/](types|store|api))\.tsx?)$/;

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  reactStrictMode: true,
  /* Static export has no image optimiser. The only images here are the 27
     stroke-order SVGs, which need none. */
  images: { unoptimized: true },
  /* GitHub Pages resolves /a/b to /a/b/index.html, so directory-style URLs are
     what the export has to produce. */
  trailingSlash: true,
  /* Sem cópias repetidas (23/10/2026, velocidade no celular). O layout e a
     página são entradas separadas para o webpack, e um módulo pequeno usado
     pelas duas ficava abaixo do tamanho mínimo de pedaço e era COPIADO para
     as duas, baixadas na mesma página: uns 15 KB repetidos em toda visita.
     A lista abaixo junta esses módulos num pedaço só, `base`. Só entra aqui
     o que o layout raiz JÁ importa (tests/rotas-leves.test.ts confere), para
     nenhuma página passar a baixar algo que não usava. Uma regra geral
     (todo src/lib compartilhado, sem nome) tirava 3 KB a mais e dobrava o
     número de arquivos, o que no celular custa mais do que economiza. O
     conteúdo pago nunca chega ao pacote do navegador (tests/conteudo.test.ts). */
  webpack(config, { isServer }) {
    if (!isServer && config.optimization?.splitChunks) {
      const sc = config.optimization.splitChunks;
      sc.cacheGroups = {
        ...(sc.cacheGroups ?? {}),
        base: {
          test: BASE,
          name: 'base',
          chunks: 'all',
          enforce: true,
          priority: 50
        }
      };
    }
    return config;
  }
};

export default nextConfig;
