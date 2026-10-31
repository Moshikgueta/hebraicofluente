/* A página "Comece aqui" (/comece-aqui, 24/10/2026, decisão do dono).
 *
 * O link da bio do Instagram leva para lá em vez do teste grátis. O que este
 * arquivo trava:
 *  - /bio vai para /comece-aqui com a parceria, e continua contando a visita;
 *  - a página é pública, fora do portão, da busca e do sitemap;
 *  - não mostra preço, checkout nem compra do livro (que segue "Em breve");
 *  - os caminhos são os dois que existem: o teste grátis e a prévia;
 *  - guarda a parceria e conta só os eventos `comece-*`, que o painel lê.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import { isGatedPath } from '../../worker/src/gate.js';
// @ts-expect-error - idem
import { EVENTOS_DO_PORTAL, PARA_O_COMECE_AQUI } from '../../worker/src/api/estatisticas.js';
// @ts-expect-error - módulo .mjs, sem tipos
import { classificar } from '../seo.mjs';
import { anunciavel } from '@/lib/seo';
import { isPublicRoute } from '@/lib/rotas';
import { EVENTOS_DO_COMECE_PT, funilDoComece } from '@/lib/painel-estatisticas';
import { envDeTeste } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
const fonte = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8');
/** O código sem os comentários: "sem checkout" numa nota não é checkout. */
const codigo = (rel: string) => fonte(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '');
const PAGINA = '../src/app/comece-aqui/ComeceAquiClient.tsx';

describe('o link da bio', () => {
  /* 27/10/2026: o site é só o curso de alfabetização, e a bio deixou de ir
     para a Comece aqui (que agora leva à capa): vai direto ao curso. */
  it('leva à página do curso com a parceria', async () => {
    const env = envDeTeste();
    const r = await worker.fetch(new Request(`${SITE}/bio`, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (iPhone) Instagram' } }), env, ctx) as Response;
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe(`${SITE}/curso-de-hebraico/?parceria=bio#experimente`);
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect([...PARA_O_COMECE_AQUI]).toEqual([]);
  });
});

describe('os links curtos levam o nome da campanha junto', () => {
  /* growth, 23/10/2026: o desvio jogava fora o utm_campaign, e nenhuma compra
     se ligava à peça do Instagram que a trouxe. */
  const desvio = async (caminho: string) => {
    const r = await worker.fetch(new Request(`${SITE}${caminho}`, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (iPhone) Instagram' } }), envDeTeste(), ctx) as Response;
    expect(r.status).toBe(302);
    return r.headers.get('location');
  };

  it('a bio e os stories repassam o utm_campaign', async () => {
    expect(await desvio('/bio?utm_campaign=p01')).toBe(`${SITE}/curso-de-hebraico/?parceria=bio&utm_campaign=p01#experimente`);
    expect(await desvio('/stories?utm_campaign=Reel%20A1')).toBe(`${SITE}/curso-de-hebraico/?parceria=stories&utm_campaign=reel-a1#experimente`);
  });

  it('campanha fora do formato e o resto da consulta ficam para trás', async () => {
    expect(await desvio('/dm?utm_campaign=%3Cscript%3E&utm_source=x')).toBe(`${SITE}/curso-de-hebraico/?parceria=dm#experimente`);
    expect(await desvio(`/dm?utm_campaign=${'a'.repeat(41)}`)).toBe(`${SITE}/curso-de-hebraico/?parceria=dm#experimente`);
  });
});

describe('a página', () => {
  it('é pública, fora do portão, da busca e do sitemap', () => {
    expect(isGatedPath('/comece-aqui/')).toBe(false);
    expect(isPublicRoute('/comece-aqui/')).toBe(true);
    expect(anunciavel('/comece-aqui/')).toBe(false);
    const { listadas, ocultas } = classificar(['/', '/comece-aqui/']);
    expect(listadas).toEqual(['/']);
    expect(ocultas).toEqual(['/comece-aqui/']);
  });

  it('não vende nada: sem preço, checkout nem página de venda do livro', () => {
    const c = codigo(PAGINA);
    expect(c).not.toMatch(/R\$|brl\(|\/checkout|\/cursos\/israel|precoDe|price/);
  });

  it('os dois caminhos são o teste grátis e a prévia, e a parceria fica guardada', () => {
    const c = codigo(PAGINA);
    expect(c).toContain('#experimente');
    expect(c).toContain("'/previa/'");
    expect(c).toContain('guardarParceriaDaUrl()');
    /* O livro: o status sai do catálogo, nunca escrito à mão. */
    expect(c).toMatch(/livro\?\.status === 'em-breve'/);
  });

  it('o hebraico da página é só o que já existe (a palavra da capa e as letras das jornadas)', () => {
    /* O Álef da rubrica, o mesmo da capa; as letras dos cartões vêm de JORNADAS. */
    const c = codigo(PAGINA).replace('<Rubrica letra="א">', '');
    expect(c).not.toMatch(/[֐-׿]/);
  });
});

describe('a contagem', () => {
  it('os eventos comece-* existem nos dois lados e o painel dá nome a todos', () => {
    const doServidor = EVENTOS_DO_PORTAL.filter((e: string) => e.startsWith('comece-')).sort();
    expect(doServidor).toEqual(['comece-curso', 'comece-israel', 'comece-ler', 'comece-palavra', 'comece-visto']);
    expect(EVENTOS_DO_COMECE_PT.map(e => e.evento).sort()).toEqual(doServidor);
    const app = fonte('../src/lib/funil-portal.ts');
    for (const e of doServidor) expect(app).toContain(`'${e}'`);
    const usados = [...codigo(PAGINA).matchAll(/contarNoPortal\('([a-z-]+)'/g)].map(m => m[1]);
    for (const e of usados) expect(doServidor).toContain(e);
  });

  it('a porcentagem é sobre quem abriu a página', () => {
    const f = funilDoComece([{ evento: 'comece-visto', n: 20 }, { evento: 'comece-ler', n: 5 }]);
    expect(f.find(l => l.evento === 'comece-ler')!.deQuemAbriu).toBe(0.25);
    expect(f.find(l => l.evento === 'comece-israel')!.n).toBe(0);
    expect(funilDoComece([])[0]!.deQuemAbriu).toBeNull();
  });

  it('o servidor aceita os eventos novos, sem dado pessoal', async () => {
    const env = envDeTeste();
    const ev = (evento: string) => worker.fetch(new Request(`${SITE}/api/portal`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: SITE, 'user-agent': 'Mozilla/5.0 (iPhone)', 'CF-Connecting-IP': '203.0.113.9' },
      body: JSON.stringify({ evento })
    }), env, ctx) as Promise<Response>;
    expect((await ev('comece-visto')).status).toBe(204);
    await ev('comece-ler');
    const n = (c: string) => ((env as any).DB.bruto.prepare('SELECT n FROM estatisticas WHERE chave = ?').get(c) as { n: number } | undefined)?.n ?? 0;
    expect(n('p|comece-visto')).toBe(1);
    expect(n('p|comece-ler')).toBe(1);
  });
});
