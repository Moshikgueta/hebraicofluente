/* A prévia grátis do e-book em /previa (23/10/2026, pedido do dono).
 *
 * O link vai no direct a quem comenta EBOOK no Instagram. A página é o app do
 * livro montado pelo editorial (scripts/ebook-no-site.sh, web.mjs --previa) e
 * não mora no git; o que este arquivo trava é o que o SITE promete sobre ela:
 * abre sem login e sem conta, fica fora da busca e do sitemap, não oferece a
 * compra do livro (nem com a venda aberta: a prévia é só a amostra) e conta só os cinco eventos.
 * Quando a cópia montada existe (app/public/previa, depois da publicação ou do
 * script), o conteúdo dela também é conferido. */

import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { gate, isGatedPath } from '../../worker/src/gate.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { EVENTOS_DO_PORTAL } from '../../worker/src/api/estatisticas.js';
// @ts-expect-error - módulo .mjs, sem tipos
import { classificar } from '../seo.mjs';
import { anunciavel } from '@/lib/seo';
import { EVENTOS_DA_PREVIA_PT, funilDaPrevia } from '@/lib/painel-estatisticas';
import { envDeTeste } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };
const fonte = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8');

/* Um servidor de ativos de mentira que entrega um HTML qualquer. */
const ASSETS = {
  fetch: async () => new Response('<html><head><meta name="robots" content="noindex, nofollow"></head><body>ok</body></html>', {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
};
const abrir = (path: string, headers: Record<string, string> = {}) =>
  worker.fetch(new Request(SITE + path, { redirect: 'manual', headers }), envDeTeste({ ASSETS }), ctx) as Promise<Response>;

describe('/previa abre sem login', () => {
  it('fica fora do portão: sem cookie, o portão não recusa', async () => {
    expect(isGatedPath('/previa')).toBe(false);
    expect(isGatedPath('/previa/')).toBe(false);
    expect(isGatedPath('/previa/assets/fontes/literata.woff2')).toBe(false);
    expect(await gate(new Request(`${SITE}/previa/`, { headers: { 'Sec-Fetch-Dest': 'document' } }), envDeTeste())).toBeNull();
  });

  it('o Worker entrega a página a quem não tem conta, com noindex no cabeçalho', async () => {
    const r = await abrir('/previa/', { 'Sec-Fetch-Dest': 'document' });
    expect(r.status).toBe(200);
    expect(r.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(r.headers.get('content-security-policy')).toBeTruthy();
  });

  it('fica fora do sitemap', () => {
    expect(anunciavel('/previa/')).toBe(false);
    const { listadas, ocultas } = classificar(['/', '/previa/']);
    expect(listadas).toEqual(['/']);
    expect(ocultas).toEqual(['/previa/']);
  });
});

describe('/previa não oferece a compra do livro', () => {
  it('a montagem pede só a prévia e leva ao curso, não ao livro', () => {
    const script = fonte('../../scripts/ebook-no-site.sh');
    expect(script).toContain('--previa');
    expect(script).toContain('PREVIA=app/public/previa');
  });

  const montada = new URL('../public/previa/index.html', import.meta.url);
  it.skipIf(!existsSync(montada))('a cópia montada: sem preço, sem checkout, sem o nome antigo, só os blocos pedidos', () => {
    const h = readFileSync(montada, 'utf8');
    expect(h).toMatch(/<meta name="robots" content="noindex/);
    /* o cartão do link no direct */
    expect(h).toContain('<meta property="og:image" content="https://hebraicofluente.com.br/media/og-previa.jpg"');
    expect(h).not.toMatch(/R\$|\/checkout|\/cursos\/israel/);
    expect(h).not.toMatch(/al[eé]m do roteiro/i);
    expect(h).toContain('/curso-de-hebraico/?utm_source=ig&utm_medium=dm&utm_content=previa-ebook');
    const D = JSON.parse(h.match(/<script type="application\/json" id="dados">([\s\S]*?)<\/script>/)![1]!);
    expect(D.capitulos).toEqual([]);
    expect(D.producao).toBeNull();
    const tipos = D.previa.secoes.flatMap((s: { blocos: { tipo: string; jogo?: string }[] }) => s.blocos.map(b => b.jogo ? `${b.tipo}:${b.jogo}` : b.tipo));
    expect(tipos).toEqual(['mochila', 'monte', 'jogo:roleta']);
    /* o monte a sua comida, à vontade: sem recusa nem limite (pedido do dono) */
    expect(D.previa.secoes.find((s: { id: string }) => s.id === 'comida').blocos[0].livre).toBe(true);
    const roleta = D.previa.secoes.find((s: { id: string }) => s.id === 'roleta').blocos[0];
    expect(roleta.itens).toHaveLength(5);
    expect(D.previa.diario.blocos.map((b: { titulo: string }) => b.titulo)).toEqual(['Lugares que desejo conhecer', 'Palavras em hebraico que aprendi']);
  });
});

describe('o contador da prévia', () => {
  it('os cinco eventos estão na lista do servidor', () => {
    for (const e of ['previa-visto', 'previa-mochila-cheia', 'previa-prato-pronto', 'previa-diario-aberto', 'previa-clique-curso']) {
      expect(EVENTOS_DO_PORTAL).toContain(e);
    }
    expect(EVENTOS_DA_PREVIA_PT.map(e => e.evento).sort()).toEqual(EVENTOS_DO_PORTAL.filter((e: string) => e.startsWith('previa-')).sort());
  });

  it('o painel mostra a porcentagem sobre quem abriu a prévia', () => {
    const f = funilDaPrevia([{ evento: 'previa-visto', n: 10 }, { evento: 'previa-mochila-cheia', n: 4 }, { evento: 'visto', n: 99 }]);
    expect(f[0]).toMatchObject({ evento: 'previa-visto', n: 10, deQuemAbriu: 1 });
    expect(f[1]).toMatchObject({ evento: 'previa-mochila-cheia', n: 4, deQuemAbriu: 0.4 });
    expect(f.find(l => l.evento === 'previa-clique-curso')?.deQuemAbriu).toBe(0);
  });

  it('a prévia soma pelo mesmo POST /api/portal, sem conta', async () => {
    const env = envDeTeste() as ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
    const r = await worker.fetch(new Request(`${SITE}/api/portal`, {
      method: 'POST', body: JSON.stringify({ evento: 'previa-mochila-cheia' }),
      headers: { 'content-type': 'application/json', origin: SITE, 'user-agent': 'Mozilla/5.0 (iPhone)', 'cf-connecting-ip': '203.0.113.7' }
    }), env, ctx);
    expect(r.status).toBe(204);
    expect(env.DB.bruto.prepare("SELECT n FROM estatisticas WHERE chave = 'p|previa-mochila-cheia'").get()).toEqual({ n: 1 });
  });

  it('a Privacidade conta a prévia', () => {
    expect(fonte('../src/app/privacidade/page.tsx')).toContain('Na prévia gratuita do e-book');
  });
});
