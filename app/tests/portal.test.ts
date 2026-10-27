/* O portal da capa (23/10/2026, master prompt "Hebraico Fluente 2.0").
 * O que estes testes travam:
 *  - o status de cada produto sai do catálogo, nunca escrito à mão;
 *  - produto fora de venda não tem preço, botão de compra nem checkout em
 *    página nenhuma do portal;
 *  - os produtos que não existem (Sobrevivência, Antes de Embarcar,
 *    Biblioteca) não aparecem;
 *  - o contador do portal só aceita a lista fechada, sem dado pessoal;
 *  - a demonstração usa a palavra, a transliteração e o sentido do curso.
 */
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FichaDoProduto } from '@/components/portal/FichaDoProduto';
import { readFileSync } from 'node:fs';
import { getCourse, paginaDeVenda } from '@/lib/catalog';
import { EVENTOS_DO_PORTAL_PT, funilDoPortal } from '@/lib/painel-estatisticas';
import { JORNADAS, produtos, statusDoCatalogo, vendavel } from '@/lib/ecossistema';
import { AMOSTRA_AUDIO } from '@/lib/amostra-audio';
import { envDeTeste } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import { EVENTOS_DO_PORTAL } from '../../worker/src/api/estatisticas.js';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
const fonte = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8');
/** O código sem os comentários: o que importa é o que a página faz, não o
 *  que a nota explica ("sem checkout" num comentário não é checkout). */
const codigo = (rel: string) => fonte(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '');

describe('o status sai do catálogo', () => {
  it('cada produto tem o status que o catálogo dá', () => {
    expect(statusDoCatalogo(getCourse('alfabetizacao'))).toBe('disponivel');
    expect(statusDoCatalogo(getCourse('hebraico-a1'))).toBe('em-desenvolvimento');
    /* `aVenda: false` (decisão do dono de 22/10/2026) vira "Em breve". */
    expect(statusDoCatalogo(getCourse('israel-alem-do-roteiro'))).toBe(
      getCourse('israel-alem-do-roteiro')!.aVenda === false ? 'em-breve' : 'disponivel');
    const p = Object.fromEntries(produtos().map(x => [x.id, x]));
    expect(p['raizes-sefarditas']!.status).toBe('em-breve');
    expect(vendavel(p['alfabetizacao']!)).toBe(true);
    expect(vendavel(p['israel-alem-do-roteiro']!)).toBe(p['israel-alem-do-roteiro']!.status === 'disponivel');
  });

  it('só os produtos que existem: nada de guia, biblioteca ou produto planejado', () => {
    const ids = produtos().map(p => p.id).sort();
    expect(ids).toEqual(['alfabetizacao', 'hebraico-a1', 'israel-alem-do-roteiro', 'raizes-sefarditas'].sort());
    expect(JORNADAS.map(j => j.rota)).toEqual(['/aprender-hebraico', '/descobrir-israel', '/raizes-sefarditas']);
  });

  it('produto fora de venda nunca leva a checkout', () => {
    for (const p of produtos()) {
      expect(p.rota, p.id).not.toMatch(/checkout/);
      if (!vendavel(p)) expect(p.rota, p.id).not.toMatch(/^\/cursos\/israel/);
    }
  });
});

describe('as páginas "Em breve" não vendem', () => {
  it('sem preço, sem checkout e sem botão de compra no livro e no Raízes', () => {
    for (const rel of ['../src/app/israel-alem-do-obvio/page.tsx', '../src/app/raizes-sefarditas/page.tsx',
                       '../src/app/descobrir-israel/page.tsx']) {
      const t = codigo(rel);
      expect(t, rel).not.toMatch(/checkout/i);
      expect(t, rel).not.toMatch(/R\$|brl\(|precoDeVitrine|price\b/);
      expect(t, rel).not.toMatch(/Comprar|Garantir|Quero o livro/);
    }
  });

  it('a capa só mostra preço do produto à venda, e o lê do catálogo', () => {
    const capa = codigo('../src/app/PortalClient.tsx');
    expect(capa).not.toMatch(/R\$\s?\d/);
    expect(capa).toContain('precoDeVitrine()');
    /* Nada de número de alunos, nota ou contagem regressiva. */
    expect(capa).not.toMatch(/\d+\s*(alunos|estudantes)|estrelas|vagas|restam|termina em/i);
  });
});

describe('a palavra da demonstração', () => {
  it('é a do curso, com a gravação pública', () => {
    const t = fonte('../src/components/portal/PalavraDescoberta.tsx');
    const letras = JSON.parse(fonte('../../data/letters.json')) as { wordsToRead?: { he: string; translit: string; pt: string }[] }[];
    const doCurso = letras.flatMap(l => l.wordsToRead ?? []).find(w => w.he === 'שָׁלוֹם')!;
    expect(doCurso).toBeTruthy();
    expect(t).toContain(`'${doCurso.he}'`);
    expect(t).toContain(doCurso.translit);
    expect(AMOSTRA_AUDIO.shalom).toBe(doCurso.he);
    /* As partes, juntas, são a palavra. */
    expect('שָׁ' + 'לוֹם').toBe(doCurso.he);
  });
});

describe('o contador do portal', () => {
  it('só soma evento da lista, sem dado pessoal, com freio por endereço', async () => {
    const env = envDeTeste() as ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
    const mandar = (evento: unknown, ua = 'Mozilla/5.0 (iPhone)') => worker.fetch(new Request(`${SITE}/api/portal`, {
      method: 'POST', body: JSON.stringify({ evento }),
      headers: { 'content-type': 'application/json', origin: SITE, 'user-agent': ua, 'cf-connecting-ip': '203.0.113.9' }
    }), env, ctx);
    expect((await mandar('jornada-israel')).status).toBe(204);
    await mandar('jornada-israel');
    await mandar('meu-email@exemplo.com');
    await mandar('jornada-raizes', 'Googlebot/2.1');
    const linhas = env.DB.bruto.prepare("SELECT chave, n FROM estatisticas WHERE chave LIKE 'p|%'").all();
    expect(linhas).toEqual([{ chave: 'p|jornada-israel', n: 2 }]);
    for (let i = 0; i < 45; i++) await mandar('visto');
    const visto = env.DB.bruto.prepare("SELECT n FROM estatisticas WHERE chave = 'p|visto'").get() as { n: number };
    expect(visto.n).toBeLessThanOrEqual(40);
    expect(EVENTOS_DO_PORTAL.every((e: string) => /^[a-z0-9-]+$/.test(e))).toBe(true);
  });

  it('a lista do app e a do servidor são a mesma', () => {
    const app = fonte('../src/lib/funil-portal.ts');
    const doApp = [...app.slice(app.indexOf('export type EventoDoPortal'), app.indexOf(';', app.indexOf('export type EventoDoPortal')))
      .matchAll(/'([a-z0-9-]+)'/g)].map(m => m[1]).sort();
    expect(doApp).toEqual([...EVENTOS_DO_PORTAL].sort());
  });
});

describe('uma página de venda só (23/10/2026, decisão do dono)', () => {
  it('/cursos/alfabetizacao leva a /curso-de-hebraico com a consulta junto', async () => {
    const env = envDeTeste();
    for (const caminho of ['/cursos/alfabetizacao', '/cursos/alfabetizacao/', '/cursos/alfabetizacao/index.txt']) {
      const r = await worker.fetch(new Request(`${SITE}${caminho}?sem-acesso=1`), env, ctx);
      expect(r.status, caminho).toBe(301);
      expect(r.headers.get('location'), caminho).toBe(`${SITE}/curso-de-hebraico/?sem-acesso=1`);
      /* blindar() passa por toda resposta, inclusive esta. */
      expect(r.headers.get('x-content-type-options'), caminho).toBe('nosniff');
    }
    /* Os outros cursos continuam no catálogo. */
    const comAtivos = { ...env, ASSETS: { fetch: async () => new Response('<html></html>', { headers: { 'content-type': 'text/html' } }) } };
    const a1 = await worker.fetch(new Request(`${SITE}/cursos/hebraico-a1/`), comAtivos, ctx);
    expect(a1.status).not.toBe(301);
  });

  it('os links internos já apontam para o endereço novo', () => {
    expect(paginaDeVenda('alfabetizacao')).toBe('/curso-de-hebraico');
    expect(paginaDeVenda('hebraico-a1')).toBe('/cursos/hebraico-a1');
    for (const rel of ['../src/components/shell/CourseGate.tsx', '../src/lib/cta.ts', '../src/lib/jsonld.ts',
                       '../src/components/platform/CourseCard.tsx', '../src/app/cursos/CursosClient.tsx']) {
      expect(codigo(rel), rel).not.toMatch(/\/cursos\/alfabetizacao|`\/cursos\/\$\{/);
    }
  });
});

describe('o painel lê o portal inteiro', () => {
  it('cada evento do servidor tem nome no painel', () => {
    /* os `previa-*` têm a tabela própria (EVENTOS_DA_PREVIA_PT, tests/previa.test.ts) */
    /* e os `comece-*` também (EVENTOS_DO_COMECE_PT, tests/comece-aqui.test.ts) */
    expect(EVENTOS_DO_PORTAL_PT.map(e => e.evento).sort()).toEqual([...EVENTOS_DO_PORTAL].filter((e: string) => !e.startsWith('previa-') && !e.startsWith('comece-')).sort());
    const f = funilDoPortal([{ evento: 'visto', n: 10 }, { evento: 'jornada-israel', n: 4 }]);
    expect(f.find(l => l.evento === 'jornada-israel')!.deQuemViu).toBe(0.4);
  });
});

describe('a capa no telefone', () => {
  it('as jornadas estão na primeira tela e a mesa só aparece a partir de lg', () => {
    const capa = codigo('../src/app/PortalClient.tsx');
    expect(capa).toContain('<Atalhos />');
    expect(capa).toMatch(/hidden lg:block relative mx-auto/);
  });
});

describe('a ficha comum dos produtos', () => {
  const html = (id: string) => {
    const p = produtos().find(x => x.id === id)!;
    return renderToStaticMarkup(createElement(FichaDoProduto, { p })).replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ' ');
  };

  it('os três respondem as mesmas cinco perguntas, na mesma ordem', () => {
    const ROTULOS = ['Para quem é', 'O que você passa a conseguir', 'Formato', 'Quanto tempo', 'Situação'];
    for (const id of ['alfabetizacao', 'israel-alem-do-roteiro', 'raizes-sefarditas']) {
      const t = html(id);
      const posicoes = ROTULOS.map(r => t.indexOf(r));
      expect(posicoes.every(n => n >= 0), id).toBe(true);
      expect([...posicoes].sort((a, b) => a - b), id).toEqual(posicoes);
    }
  });

  it('o que é do catálogo sai do catálogo', () => {
    const livro = getCourse('israel-alem-do-roteiro')!;
    const t = html('israel-alem-do-roteiro');
    for (const o of [...livro.outcomesPt, ...livro.forWhomPt]) expect(t).toContain(o);
    expect(t).toContain(`${livro.modules.length} capítulos`);
  });

  it('só o produto à venda tem preço; "Em breve" não tem preço nem data', () => {
    expect(html('alfabetizacao')).toMatch(/R\$\s?\d/);
    for (const id of produtos().filter(p => !vendavel(p)).map(p => p.id)) {
      const t = html(id);
      /* "comprar" minúsculo é conteúdo (o A1 ensina a comprar num café);
         o que não pode é o botão. */
      expect(t, id).not.toMatch(/R\$|parcela|checkout|\bComprar\b/);
      expect(t, id).not.toMatch(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/);
      expect(t, id).toContain('Ainda não está à venda');
    }
  });
});

describe('o livro se chama Israel Além do Óbvio (23/10/2026)', () => {
  it('o catálogo tem o nome, o subtítulo, a descrição e o autor; o slug não muda', () => {
    const livro = getCourse('israel-alem-do-roteiro')!;
    expect(livro.titlePt).toBe('Israel Além do Óbvio');
    /* Subtítulo novo desde 23/10/2026 (decisão do dono, master prompt de preços). */
    expect(livro.taglinePt).toBe('O Olhar de um Israelense');
    expect(livro.descricaoPt).toBe('Uma jornada interativa pela história, cultura e lugares de Israel.');
    expect(livro.autorPt).toBe('Moshik Gueta');
  });

  /* 27/10/2026: o site é só o curso de alfabetização, e as páginas do
     portal levam à capa (que é a página do curso). */
  it('o endereço antigo da página do portal leva à capa', async () => {
    const env = envDeTeste();
    for (const c of ['/israel-alem-do-roteiro', '/israel-alem-do-roteiro/']) {
      const r = await worker.fetch(new Request(`${SITE}${c}`), env, ctx);
      expect(r.status, c).toBe(301);
      expect(r.headers.get('location'), c).toBe(`${SITE}/`);
    }
  });

  it('só o curso no site: as jornadas, as experiências e o Comece aqui levam à capa', async () => {
    const env = envDeTeste();
    for (const c of ['/aprender-hebraico/', '/descobrir-israel', '/israel-alem-do-obvio/', '/raizes-sefarditas/index.html',
                     '/comece-aqui/', '/descobrir-israel/index.txt']) {
      const r = await worker.fetch(new Request(`${SITE}${c}`), env, ctx);
      expect(r.status, c).toBe(301);
      expect(r.headers.get('location'), c).toBe(`${SITE}/`);
    }
    const comParceria = await worker.fetch(new Request(`${SITE}/comece-aqui/?parceria=bio`), env, ctx);
    expect(comParceria.headers.get('location')).toBe(`${SITE}/?parceria=bio`);
    /* /raizes/ (o produto, atrás do portão) e /israel/ não são afetados. */
    expect((await worker.fetch(new Request(`${SITE}/raizes/`), env, ctx)).headers.get('location') ?? '').not.toBe(`${SITE}/`);
  });

  it('nenhum texto público usa o nome antigo', () => {
    const publicos = ['../src/app/israel-alem-do-obvio/page.tsx', '../src/lib/ecossistema.ts', '../src/components/shell/PublicShell.tsx',
      '../src/app/checkout/[slug]/CheckoutClient.tsx', '../src/app/reembolso/page.tsx', '../../worker/src/lib/mail.js',
      '../../worker/src/api/livro.js', '../../data/courses.json'];
    for (const rel of publicos) expect(fonte(rel), rel).not.toMatch(/Além do Roteiro|alem-do-roteiro\.pdf"/);
  });
});
