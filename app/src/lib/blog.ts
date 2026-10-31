/* O blog (29/10/2026, pedido do dono). Os artigos moram em data/blog.json e
 * o exportador só deixa passar os aprovados (`revisado: true`), para
 * app/content/blog.json. Só componente de servidor importa daqui: o texto
 * dos artigos não vai no pacote do navegador. */

import dados from '@content/blog.json';

export type Palavra = { he: string; translit: string; pt: string };
export type Bloco =
  | { t: 'h2'; x: string }
  | { t: 'p'; x: string }
  | { t: 'lista'; itens: string[] }
  | { t: 'palavras'; itens: Palavra[] }
  | { t: 'veja'; href: string; x: string }
  | { t: 'cta' };

export type Artigo = {
  slug: string;
  titulo: string;
  descricao: string;
  resumo: string;
  atualizadoEm: string;
  revisado: boolean;
  /** Texto que não é artigo: vira seção desta página (31/10/2026). */
  destino?: string;
  blocos: Bloco[];
};

export const artigos = (): Artigo[] => (dados as { artigos: Artigo[] }).artigos;
/** As seções aprovadas de uma página do site (tools/export-content.mjs, `destino`). */
export const secoesDe = (rota: string): Bloco[] =>
  ((dados as { paginas?: Artigo[] }).paginas ?? []).filter(a => a.destino === rota).flatMap(a => a.blocos);
export const artigo = (slug: string): Artigo | undefined => artigos().find(a => a.slug === slug);

/** O texto sem as marcas {{...}}, para o <title>, a description e o JSON-LD. */
export const semMarcas = (t: string): string => t.replace(/\{\{([^}]*)\}\}/g, '$1');
