/* O exame final do A1 e o certificado, corrigidos no servidor (06/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O que se prova aqui é o que o pedido do dono exige: não dá para gerar o
 * certificado mexendo no navegador.
 *   · a prova sai SEM gabarito (nenhum `certa`, `respostas`, `porque`), com
 *     as opções embaralhadas;
 *   · a nota é a do servidor, e a mesma prova não se entrega duas vezes;
 *   · sem prova aprovada, não há certificado; com ela, o código é público e
 *     confere nome, curso e data, e o aluno pode desligar a verificação;
 *   · a correção da escrita é a mesma régua do curso (hebraicoDigitadoCerto). */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as exameA1 from '../../worker/src/api/exame-a1.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { grantAccess } from '../../worker/src/lib/db.js';
import { corrigir, digitadoCerto, sortear, type Exame, type Sorteado } from '@/lib/a1-prova';
import { hebraicoDigitadoCerto } from '@/lib/engine/palavras';

const SITE = 'https://hebraicofluente.com.br';
const exame = JSON.parse(readFileSync(new URL('../content/a1-exame.json', import.meta.url), 'utf8')) as Exame;

type Env = Record<string, unknown> & { DB: { bruto: { prepare: (s: string) => { get: (...a: unknown[]) => unknown } } } };

async function conta(env: Env, cursos: string[], nome = 'Ana Souza') {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`,
      { aceitouTermos: true, declarouIdade: true, name: nome, email: 'ana@exemplo.com.br', password: 'senha-boa-123' }),
    env, ctx: {}
  });
  const { account } = await r.json() as { account: { id: number } };
  for (const c of cursos) await grantAccess(env, { accountId: account.id, courseSlug: c, orderId: `T-${c}`, months: 12 });
  return cookieDe(r);
}

const post = (caminho: string, cookie: string, corpo?: unknown) =>
  pedido(`${SITE}${caminho}`, corpo ?? {}, { cookie });
const get = (caminho: string, cookie?: string) =>
  new Request(`${SITE}${caminho}`, cookie ? { headers: { cookie } } : undefined);

/** As respostas certas de uma prova, a partir do sorteio guardado no banco. */
function gabarito(sorteio: Sorteado[]) {
  return sorteio.map(s => {
    const it = exame.partes[s.p]!.itens[s.i]!;
    if (s.perm && it.opcoes) return s.perm.indexOf(it.certa as number);
    if (it.t === 'vf') return it.certa as boolean;
    if (it.t === 'montar') return it.palavras!.map((_, k) => s.perm!.indexOf(k));
    return it.respostas![0]!;
  });
}

async function provaDe(env: Env, cookie: string) {
  const r = await exameA1.iniciar({ request: post('/api/a1/exame/iniciar', cookie), env, ctx: {} });
  expect(r.status).toBe(200);
  const corpo = await r.json() as { prova: string; partes: { id: string; itens: Record<string, unknown>[] }[]; fora: string[] };
  const row = env.DB.bruto.prepare('SELECT sorteio FROM provas_a1 WHERE id = ?').get(corpo.prova) as { sorteio: string };
  return { corpo, sorteio: JSON.parse(row.sorteio) as Sorteado[] };
}

describe('a prova do A1', () => {
  it('só quem tem o A1 começa o exame', async () => {
    const env = envDeTeste() as Env;
    const cookie = await conta(env, ['alfabetizacao']);
    const r = await exameA1.iniciar({ request: post('/api/a1/exame/iniciar', cookie), env, ctx: {} });
    expect(r.status).toBe(403);
  });

  it('sai sem gabarito: nenhum certa, respostas ou porque, em parte nenhuma', async () => {
    const env = envDeTeste() as Env;
    const cookie = await conta(env, ['hebraico-a1']);
    const { corpo, sorteio } = await provaDe(env, cookie);
    const texto = JSON.stringify(corpo);
    expect(texto).not.toMatch(/"certa"|"respostas"|"porque"/);
    expect(corpo.partes.length + corpo.fora.length).toBe(6);
    for (const p of corpo.partes) expect(p.itens.length).toBe(exame.sorteio);
    expect(sorteio.length).toBe(corpo.partes.length * exame.sorteio);
  });

  it('a nota é do servidor: tudo certo aprova, e a mesma prova não se entrega de novo', async () => {
    const env = envDeTeste() as Env;
    const cookie = await conta(env, ['hebraico-a1']);
    const { corpo, sorteio } = await provaDe(env, cookie);
    const r = await exameA1.entregar({ request: post('/api/a1/exame/entregar', cookie, { prova: corpo.prova, respostas: gabarito(sorteio) }), env, ctx: {} });
    expect(r.status).toBe(200);
    const c = await r.json() as { nota: number; aprovado: boolean; revisar: number[] };
    expect(c).toMatchObject({ nota: 1, aprovado: true, revisar: [] });
    const de_novo = await exameA1.entregar({ request: post('/api/a1/exame/entregar', cookie, { prova: corpo.prova, respostas: gabarito(sorteio) }), env, ctx: {} });
    expect(de_novo.status).toBe(409);
  });

  it('errar tudo reprova e aponta as unidades para revisar', async () => {
    const env = envDeTeste() as Env;
    const cookie = await conta(env, ['hebraico-a1']);
    const { corpo, sorteio } = await provaDe(env, cookie);
    const r = await exameA1.entregar({ request: post('/api/a1/exame/entregar', cookie, { prova: corpo.prova, respostas: sorteio.map(() => null) }), env, ctx: {} });
    const c = await r.json() as { nota: number; aprovado: boolean; revisar: number[] };
    expect(c.aprovado).toBe(false);
    expect(c.nota).toBe(0);
    expect(c.revisar.length).toBeGreaterThan(0);
  });
});

describe('o certificado do A1', () => {
  it('sem prova aprovada, não há certificado', async () => {
    const env = envDeTeste() as Env;
    const cookie = await conta(env, ['hebraico-a1']);
    const r = await exameA1.emitirCertificado({ request: post('/api/a1/certificado', cookie, { nome: 'Ana Souza' }), env, ctx: {} });
    expect(r.status).toBe(403);
  });

  it('com a prova aprovada: emite com código, confere em público, e o aluno pode esconder', async () => {
    const env = envDeTeste() as Env;
    const cookie = await conta(env, ['hebraico-a1']);
    const { corpo, sorteio } = await provaDe(env, cookie);
    await exameA1.entregar({ request: post('/api/a1/exame/entregar', cookie, { prova: corpo.prova, respostas: gabarito(sorteio) }), env, ctx: {} });

    const ruim = await exameA1.emitirCertificado({ request: post('/api/a1/certificado', cookie, { nome: '<script>' }), env, ctx: {} });
    expect(ruim.status).toBe(400);

    const r = await exameA1.emitirCertificado({ request: post('/api/a1/certificado', cookie, { nome: 'Ana Souza' }), env, ctx: {} });
    expect(r.status).toBe(201);
    const { certificado } = await r.json() as { certificado: { id: string; nome: string } };
    expect(certificado.id).toMatch(/^A1-[A-Z2-9]{8}$/);

    const v = await exameA1.verificar({ request: get(`/api/certificado?id=${certificado.id}`), env, ctx: {} });
    expect(v.status).toBe(200);
    const pub = await v.json() as Record<string, unknown>;
    expect(pub).toMatchObject({ id: certificado.id, nome: 'Ana Souza', curso: 'Hebraico A1' });
    expect(pub.nota).toBeUndefined();

    /* Emitir de novo devolve o mesmo, com o mesmo nome: o código público não muda de dono. */
    const outra = await exameA1.emitirCertificado({ request: post('/api/a1/certificado', cookie, { nome: 'Outro Nome' }), env, ctx: {} });
    expect((await outra.json() as { certificado: { id: string; nome: string } }).certificado).toMatchObject({ id: certificado.id, nome: 'Ana Souza' });

    await exameA1.trocarPublico({ request: post('/api/a1/certificado/publico', cookie, { publico: false }), env, ctx: {} });
    const escondido = await exameA1.verificar({ request: get(`/api/certificado?id=${certificado.id}`), env, ctx: {} });
    expect(escondido.status).toBe(404);
  });

  it('um código que não existe não confere nada', async () => {
    const env = envDeTeste() as Env;
    const v = await exameA1.verificar({ request: get('/api/certificado?id=A1-ABCDEFGH'), env, ctx: {} });
    expect(v.status).toBe(404);
  });
});

describe('o motor do exame (a1-prova.ts)', () => {
  it('a escrita é conferida com a mesma régua do curso', () => {
    const casos: [string, string[]][] = [
      ['אֲנִי מִבְּרָזִיל', ['אני מברזיל']], ['אני מברזיל', ['אני מברזיל']], ['אנימברזיל', ['אני מברזיל']],
      ['כמה זה עולה?', ['כמה זה עולה']], ['שלום', ['שלומ']], ['', ['שלום']], ['שלם', ['שלום']]
    ];
    for (const [d, a] of casos) expect(digitadoCerto(d, a), d).toBe(hebraicoDigitadoCerto(d, a));
  });

  it('as opções saem embaralhadas: a certa não fica sempre no mesmo lugar', () => {
    let seed = 1;
    const aleatorio = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const posicoes = new Set<number>();
    for (let k = 0; k < 20; k++) {
      for (const s of sortear(exame, aleatorio, () => true)) {
        const it = exame.partes[s.p]!.itens[s.i]!;
        if (s.perm && it.opcoes) posicoes.add(s.perm.indexOf(it.certa as number));
      }
    }
    expect(posicoes.size).toBeGreaterThan(1);
  });

  it('sem gravação, a escuta fica de fora, e a nota é das outras partes', () => {
    const s = sortear(exame, Math.random, () => false);
    const c = corrigir(exame, s, s.map(() => null));
    expect(c.fora).toContain('escuta');
    expect(c.partes.escuta).toBeUndefined();
  });
});
