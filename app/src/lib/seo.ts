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
  '/historia', '/inicio', '/onboarding', '/meu-hebraico',
  '/vocabulario', '/meu-nome', '/teclado-hebraico',
  /* 11/10/2026: o Laboratório de Leitura e a Minha Primeira Leitura. */
  '/leitura',
  '/audio', '/stroke-order', '/som', '/loja', '/bonus', '/nikud-biblico', '/depoimento',
  /* 06/10/2026: o curso Hebraico A1 (outro curso; ver worker/src/gate.js). */
  '/a1',
  /* 21/10/2026: o e-book Israel Além do Óbvio (outro produto). */
  '/israel',
  /* 21/10/2026: Raízes Sefarditas (outro produto; ver worker/src/gate.js). */
  '/raizes'
] as const;

/**
 * As rotas abertas que não devem ser indexadas.
 *
 * Nenhuma delas responde a uma busca: ninguém procura "entrar hebraico
 * fluente", e quem cair num resultado de /checkout sem contexto vê um
 * formulário de pagamento sem ter lido a oferta.
 */
export const NAO_LISTADAS = [
  '/entrar', '/criar-conta', '/esqueci-senha', '/nova-senha', '/confirmar-email', '/perfil',
  '/checkout',
  /* A confirmação de que a conta foi apagada. É pública porque a pessoa chega
     nela SEM sessão - foi a exclusão que a tirou -, e por isso mesmo não pode
     ser indexada: "conta apagada" saindo numa busca pelo nome do curso é a
     pior vitrine possível. */
  '/conta-apagada',
  '/sair-da-lista',
  /* A prévia grátis do e-book (23/10/2026, scripts/ebook-no-site.sh): só para
     quem recebe o link no direct do Instagram, sem conta e fora da busca. */
  '/previa',
  /* As cópias fixas de cada versão das políticas (app/versoes.mjs, LEGAL-104).
     Existem para quem aceitou aquela versão; na busca, só a de hoje. */
  '/termos/v', '/reembolso/v', '/privacidade/v',
  /* O painel de gravação do dono do curso (/admin/gravar). Nada nele serve a
     quem busca, e o Worker já o marca `noindex` - fora do sitemap também. */
  '/admin',
  /* A conferência pública de um certificado do A1 (06/10/2026). Aberta, para
     quem recebe o código poder conferir sem conta; fora da busca, porque cada
     página mostra o nome de uma pessoa. */
  '/verificar-certificado',
  /* A página de venda antiga do curso: o Worker responde 301 para
     /curso-de-hebraico (23/10/2026). Anunciar as duas era dividir o curso
     em dois endereços na busca. */
  '/cursos/alfabetizacao'
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

/* A imagem de compartilhamento (o cartão que aparece no WhatsApp e no
   Instagram). Uma por PORTA DE ENTRADA, não por página (23/10/2026, pedido
   do dono): a capa, que é o portal das três jornadas; o curso; e o livro.
   Gerados por tools/og.mjs. A prévia grátis (/previa) é montada pelo
   editorial e usa /media/og-previa.jpg, do mesmo gerador. */
/* Nome novo a cada cartão novo: /media sai com cache de um ano, e o WhatsApp
   e o Instagram guardam a imagem pelo endereço. */
export const OG = { src: '/media/og-portal.jpg', largura: 1200, altura: 630 } as const;
const OG_POR_PORTA: readonly { prefixos: readonly string[]; src: string; alt: string }[] = [
  { prefixos: ['/curso-de-hebraico', '/aprender-hebraico', '/metodo', '/checkout', '/biblia', '/cursos/alfabetizacao'],
    src: '/media/og-curso.jpg', alt: 'Hebraico Fluente: aprenda a ler hebraico do zero' },
  { prefixos: ['/israel-alem-do-obvio', '/descobrir-israel'],
    src: '/media/og-livro.jpg', alt: 'Israel Além do Óbvio, de Moshik Gueta: em breve' }
];

/** O cartão de compartilhamento de uma rota. */
export function ogDaRota(rota: string): { src: string; alt: string } {
  const r = ('/' + rota).replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
  const porta = OG_POR_PORTA.find(p => p.prefixos.some(x => r === x || r.startsWith(x + '/')));
  return porta ? { src: porta.src, alt: porta.alt } : { src: OG.src, alt: 'Hebraico Fluente: aprender hebraico, descobrir Israel e as raízes sefarditas' };
}

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
  const og = ogDaRota(rota);

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
      images: [{ url: og.src, width: OG.largura, height: OG.altura, alt: og.alt }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [og.src]
    }
  };
}
