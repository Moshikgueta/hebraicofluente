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
import { readFileSync } from 'node:fs';
import { getCourse } from '@/lib/catalog';
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
    for (const rel of ['../src/app/israel-alem-do-roteiro/page.tsx', '../src/app/raizes-sefarditas/page.tsx',
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
