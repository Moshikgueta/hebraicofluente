/* A camada de SEO, e a única cópia que ela tem.
 *
 * `lib/seo.ts` carrega um eco do `GATED` de worker/src/gate.js. A cópia
 * existe por um motivo de empacotamento - gate.js importa sessão e banco, e
 * puxá-lo do lado do cliente arrastaria o Worker inteiro para dentro do
 * pacote -, e cópia que ninguém confere é cópia que diverge.
 *
 * Divergir aqui tem uma direção cara: uma rota nova do curso entra no
 * `GATED` (e passa a exigir login), mas fica fora do `PAGAS`, e o gerador do
 * sitemap a anuncia. O endereço de uma aula paga num sitemap que o Google
 * lê.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PAGAS, NAO_LISTADAS, ESPELHOS, ORIGEM, anunciavel, canonicaDe, ehPaga, meta, naoListada, url } from '@/lib/seo';

/* Lido como TEXTO, e não importado: gate.js é módulo de Worker. O array é
   uma lista literal de strings, então extraí-lo é honesto. */
function gatedDoPortao(): string[] {
  const fonte = readFileSync(new URL('../../worker/src/gate.js', import.meta.url), 'utf8');
  const bloco = fonte.match(/const GATED = \[([\s\S]*?)\n\];/);
  if (!bloco) throw new Error('gate.js: array GATED não encontrado');
  return [...bloco[1]!.matchAll(/'([^']+)'/g)].map(m => m[1]!);
}

describe('as rotas pagas', () => {
  it('são exatamente as mesmas do portão do Worker', () => {
    expect([...PAGAS].sort()).toEqual(gatedDoPortao().sort());
  });

  it('nunca são anunciáveis, em nenhuma grafia', () => {
    for (const p of PAGAS) {
      expect(ehPaga(p), p).toBe(true);
      expect(ehPaga(p + '/'), p).toBe(true);
      expect(ehPaga(p.toUpperCase()), p).toBe(true);
      expect(ehPaga(p + '/alef/'), p).toBe(true);
      expect(anunciavel(p), p).toBe(false);
    }
  });

  it('não engolem uma rota livre que só começa parecido', () => {
    /* `/licao` não pode capturar `/licoes-de-casa`: um prefixo comparado com
       startsWith puro transformaria uma página de vendas nova em rota paga,
       e ela sumiria do sitemap sem ninguém entender por quê. */
    expect(ehPaga('/licoes')).toBe(false);
    expect(ehPaga('/mapas')).toBe(false);
    expect(ehPaga('/inicio-rapido')).toBe(false);
  });
});

describe('as rotas que não respondem a busca', () => {
  it('recebem noindex e ficam fora do sitemap', () => {
    for (const p of NAO_LISTADAS) {
      expect(naoListada(p), p).toBe(true);
      expect(anunciavel(p), p).toBe(false);
    }
    /* O checkout de um curso específico também, não só o prefixo. */
    expect(anunciavel('/checkout/alfabetizacao')).toBe(false);
  });
});

describe('a vitrine', () => {
  it('é anunciável inteira', () => {
    for (const r of ['/', '/metodo', '/cursos', '/sobre', '/faq', '/biblia', '/alfabeto-hebraico']) {
      expect(anunciavel(r), r).toBe(true);
    }
  });

  /* 31/10/2026: a capa É a página do curso, e /curso-de-hebraico mostrava as
     mesmas 1.573 palavras com o canonical em si mesmo. Fica no ar, fora do
     sitemap, com o canonical na capa e sem noindex. */
  it('/curso-de-hebraico é espelho da capa: fora do sitemap, canonical na capa, sem noindex', () => {
    expect(anunciavel('/curso-de-hebraico')).toBe(false);
    expect(anunciavel('/curso-de-hebraico/')).toBe(false);
    expect(canonicaDe('/curso-de-hebraico')).toBe('/');
    const m = meta({ rota: '/curso-de-hebraico', title: 't', description: 'd' });
    expect(m.alternates?.canonical).toBe(`${ORIGEM}/`);
    expect(m.robots).toBeUndefined();
    expect((m.openGraph as { url?: string }).url).toBe(`${ORIGEM}/`);
  });

  it('a lista de espelhos é a mesma no gerador do sitemap', () => {
    /* Lido como texto, como o gate.js: seo.mjs lê o build ao carregar. */
    const linha = readFileSync(new URL('../seo.mjs', import.meta.url), 'utf8').match(/export const ESPELHOS = (\{[^}]*\});/);
    expect(linha, 'ESPELHOS em seo.mjs').toBeTruthy();
    expect(JSON.parse(linha![1]!.replace(/'/g, '"'))).toEqual(ESPELHOS);
  });

  it('monta URLs absolutas com barra no fim, como o site serve', () => {
    expect(url('/')).toBe(`${ORIGEM}/`);
    expect(url('/faq')).toBe(`${ORIGEM}/faq/`);
    expect(url('/faq/')).toBe(`${ORIGEM}/faq/`);
    expect(url('//cursos//alfabetizacao')).toBe(`${ORIGEM}/cursos/alfabetizacao/`);
  });
});
