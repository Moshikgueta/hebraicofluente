/* O endereço público, e quem pode ser anunciado.
 * ─────────────────────────────────────────────────────────────────────────
 * Até aqui o site não tinha nada disto: nenhuma página declarava canonical,
 * nenhuma tinha Open Graph, não havia robots.txt nem sitemap. O efeito mais
 * caro não era no Google - era no WhatsApp. Um link colado numa conversa
 * aparecia pelado, sem título, sem imagem e sem uma linha do que é, num país
 * onde é assim que um curso se espalha. A primeira impressão do produto
 * chegava antes do produto, e era um endereço cru.
 *
 * ── três regras ─────────────────────────────────────────────────────────
 *
 * 1. O ENDEREÇO MORA NUM LUGAR SÓ. `SITE_ORIGIN`, em wrangler.toml [vars] -
 *    o mesmo valor que o Worker usa. Uma mudança de domínio é uma edição, e
 *    não uma caçada por strings. Aqui ele chega por variável de build, e o
 *    `checa-seo.mjs` reprova se as duas divergirem.
 *
 * 2. PÁGINA PAGA NUNCA É ANUNCIADA. Ela nasce fora do sitemap e com
 *    `noindex` pelo mesmo motivo que nasce atrás do login. A lista aqui é uma
 *    cópia do `GATED` de worker/src/gate.js - o portão é a fonte, este
 *    arquivo é o eco, e `tests/seo.test.ts` reprova se os dois divergirem.
 *    (A cópia existe porque gate.js puxa sessão e banco: importá-lo do lado
 *    do cliente arrastaria o Worker inteiro para dentro do pacote.)
 *
 * 3. PÚBLICA NÃO É O MESMO QUE ANUNCIÁVEL. /entrar, /criar-conta,
 *    /nova-senha, /perfil e /checkout são abertas e não devem aparecer numa
 *    busca. Recebem `noindex` - e NÃO um `Disallow` no robots: uma URL
 *    bloqueada é uma URL em que nenhum rastreador chega a ler o `noindex`.
 */

import type { Metadata } from 'next';

/** O domínio público. O mesmo `SITE_ORIGIN` que o Worker usa. */
export const ORIGEM = (process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://hebraicofluente.com.br')
  .replace(/\/+$/, '');

/** Eco do `GATED` do portão. Conferido por tests/seo.test.ts. */
export const PAGAS = [
  '/licao', '/modulo', '/checkpoint', '/extra', '/revisao', '/academia',
  '/mapa', '/desafio-final', '/certificado', '/concluido', '/conquistas',
  '/historia', '/workbook', '/inicio', '/onboarding', '/meu-hebraico',
  '/audio'
] as const;

/**
 * As rotas abertas que não devem ser indexadas.
 *
 * Nenhuma delas responde a uma busca: ninguém procura "entrar hebraico
 * fluente", e quem cair num resultado de /checkout sem contexto vê um
 * formulário de pagamento sem ter lido a oferta.
 */
export const NAO_LISTADAS = [
  '/entrar', '/criar-conta', '/esqueci-senha', '/nova-senha', '/perfil', '/checkout'
] as const;

/** A rota, na forma canônica que o portão também usa para comparar. */
function limpa(rota: string): string {
  const p = ('/' + rota).replace(/\/{2,}/g, '/').replace(/\/+$/, '').toLowerCase();
  return p || '/';
}

const casa = (rota: string, lista: readonly string[]): boolean => {
  const p = limpa(rota);
  return lista.some(x => p === x || p.startsWith(x + '/'));
};

export const ehPaga = (rota: string): boolean => casa(rota, PAGAS);
export const naoListada = (rota: string): boolean => casa(rota, NAO_LISTADAS);

/** Esta rota pode entrar no sitemap? */
export const anunciavel = (rota: string): boolean => !ehPaga(rota) && !naoListada(rota);

/** A URL absoluta de uma rota, na forma que o site serve (com barra no fim). */
export function url(rota: string): string {
  const p = ('/' + rota).replace(/\/{2,}/g, '/');
  if (p === '/') return ORIGEM + '/';
  return ORIGEM + (p.endsWith('/') ? p : p + '/');
}

/* A imagem de compartilhamento. É a mesma para o site inteiro, e é escolha,
   não preguiça: o que a pessoa reconhece numa conversa é a marca, não a
   seção. Uma por página exigiria gerar dezenas de arquivos que ninguém
   revisaria. Gerada por tools/og.mjs. */
export const OG = { src: '/media/og.jpg', largura: 1200, altura: 630 } as const;

/**
 * O metadata de uma página pública.
 *
 * Um lugar só monta canonical, Open Graph e Twitter, porque escrevê-los à
 * mão em vinte páginas produz vinte versões e a primeira a ficar velha é a
 * que ninguém abre. `noindex` não é argumento: sai das regras acima, para
 * que não dependa de quem escreveu a página lembrar.
 */
export function meta({
  rota, title, description, tipo = 'website'
}: {
  /** A rota, começando com barra. '/' para a capa. */
  rota: string;
  title: string;
  description: string;
  tipo?: 'website' | 'article';
}): Metadata {
  const canonical = url(rota);

  return {
    title,
    description,
    alternates: { canonical },
    ...(anunciavel(rota) ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: tipo,
      url: canonical,
      siteName: 'Hebraico Fluente',
      locale: 'pt_BR',
      title,
      description,
      images: [{ url: OG.src, width: OG.largura, height: OG.altura, alt: 'Hebraico Fluente' }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG.src]
    }
  };
}
