/* "Achei um erro" e a comparação de pronúncia (26/09/2026).
 *
 *   · o relato exige sessão, NÃO guarda a conta, e leva a foto do exercício;
 *   · o que vem do navegador é limpo: motivo da lista, textos com teto;
 *   · o freio segura uma rajada; só o administrador lê e resolve;
 *   · a foto de um exercício de escolha diz qual era a certa e qual foi a escolhida;
 *   · as barras da comparação ficam na mesma escala de tempo.
 *
 * O banco é SQLite de verdade com o worker/schema.sql de produção.
 */

import { describe, expect, it } from 'vitest';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { limparRelato } from '../../worker/src/api/relatos.js';
import { fotoDoExercicio } from '@/lib/relato';
import { barrasDoTrecho } from '@/lib/gravador';
import type { Exercise } from '@/lib/engine/types';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
const ADMIN = 'dono@hebraicofluente.com.br';

async function conta(env: Record<string, unknown>, email: string) {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { name: 'Teste', email, password: 'senha-boa-123' }),
    env, ctx
  });
  expect(r.status).toBe(200);
  return cookieDe(r);
}

const RELATO = {
  exercicio: 'mem-frase-ani-lomed', tipo: 'sentence-reading', letra: 'mem', rota: '/licao/mem/',
  motivo: 'hebraico', comentario: 'O ponto do מ está no lugar errado',
  enunciado: 'Leia a frase inteira.', hebraico: 'אֲנִי לוֹמֵד',
  opcoes: ['eu estudo', 'ela é professora'], certa: 'eu estudo', escolhida: 'ela é professora', acertou: false
};

async function cenario() {
  const env = envDeTeste({ ADMIN_EMAILS: ADMIN });
  const admin = await conta(env, ADMIN);
  const aluno = await conta(env, 'aluna@exemplo.com.br');
  const chamar = (metodo: string, caminho: string, cookie?: string, body?: unknown) =>
    worker.fetch(new Request(`${SITE}${caminho}`, {
      method: metodo,
      headers: { 'content-type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    }), env, ctx) as Promise<Response>;
  const linhas = (sql: string) =>
    (env.DB as { bruto: { prepare(s: string): { all(): Record<string, unknown>[] } } }).bruto.prepare(sql).all();
  return { env, admin, aluno, chamar, linhas };
}

describe('achei um erro', () => {
  it('exige sessão, e o relato não guarda quem mandou', async () => {
    const { chamar, aluno, linhas } = await cenario();
    expect((await chamar('POST', '/api/relatos', undefined, RELATO)).status).toBe(401);
    expect((await chamar('POST', '/api/relatos', aluno, RELATO)).status).toBe(200);
    const [linha] = linhas('SELECT * FROM relatos');
    expect(linha).toMatchObject({ exercicio: RELATO.exercicio, motivo: 'hebraico', letra: 'mem' });
    expect(JSON.parse(String(linha!.foto))).toMatchObject({ hebraico: 'אֲנִי לוֹמֵד', certa: 'eu estudo', escolhida: 'ela é professora' });
    /* Nenhuma coluna aponta para a conta: nem id, nem e-mail, nem nome. */
    const colunas = Object.keys(linha!);
    for (const c of colunas) expect(c).not.toMatch(/account|conta|email|nome|name/);
    expect(JSON.stringify(linha)).not.toContain('aluna@exemplo.com.br');
  });

  it('recusa motivo fora da lista e corta o que passa do teto', () => {
    expect(limparRelato({ ...RELATO, motivo: 'qualquer' })).toBeNull();
    expect(limparRelato({ ...RELATO, exercicio: '' })).toBeNull();
    const r = limparRelato({ ...RELATO, comentario: 'x'.repeat(2000), opcoes: Array(20).fill('y') });
    expect(r.comentario).toHaveLength(500);
    expect(r.foto.opcoes).toHaveLength(8);
  });

  it('o freio segura uma rajada', async () => {
    const { chamar, aluno } = await cenario();
    const status: number[] = [];
    for (let i = 0; i < 22; i++) status.push((await chamar('POST', '/api/relatos', aluno, RELATO)).status);
    expect(status.filter(s => s === 200)).toHaveLength(20);
    expect(status.at(-1)).toBe(429);
  });

  it('só o administrador lê e resolve; resolver fecha todos os relatos da questão', async () => {
    const { chamar, aluno, admin } = await cenario();
    await chamar('POST', '/api/relatos', aluno, RELATO);
    await chamar('POST', '/api/relatos', aluno, { ...RELATO, motivo: 'resposta' });
    await chamar('POST', '/api/relatos', aluno, { ...RELATO, exercicio: 'outra' });
    expect((await chamar('GET', '/api/admin/relatos', aluno)).status).toBe(403);
    const antes = await (await chamar('GET', '/api/admin/relatos', admin)).json() as { relatos: unknown[]; abertos: number };
    expect(antes.abertos).toBe(3);
    expect((await chamar('POST', '/api/admin/relatos/resolver', aluno, { exercicio: RELATO.exercicio })).status).toBe(403);
    const r = await chamar('POST', '/api/admin/relatos/resolver', admin, { exercicio: RELATO.exercicio });
    expect(await r.json()).toMatchObject({ ok: true, alterados: 2 });
    const depois = await (await chamar('GET', '/api/admin/relatos', admin)).json() as { relatos: { exercicio: string }[]; abertos: number };
    expect(depois.abertos).toBe(1);
    expect(depois.relatos.map(x => x.exercicio)).toEqual(['outra']);
  });

  it('o painel de relatos fica fora de busca, com a casca de administrador', async () => {
    const env = envDeTeste({ ASSETS: { fetch: async () => new Response('<html></html>', { headers: { 'Content-Type': 'text/html' } }) } });
    const r = await worker.fetch(new Request(`${SITE}/admin/relatos/`), env, ctx) as Response;
    expect(r.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});

describe('a foto do exercício', () => {
  it('num exercício de escolha, diz qual era a certa e qual foi a escolhida', () => {
    const ex = {
      id: 'x', kind: 'word-meaning', letterId: 'mem', skill: 'ler', promptPt: 'O que quer dizer?',
      he: 'מַיִם', options: ['água', 'mar', 'mãe'], answer: 0, explainPt: ''
    } as unknown as Exercise;
    expect(fotoDoExercicio(ex, 2, false)).toMatchObject({
      exercicio: 'x', tipo: 'word-meaning', hebraico: 'מַיִם', certa: 'água', escolhida: 'mãe', acertou: false
    });
  });
});

describe('a comparação de pronúncia', () => {
  it('põe duas gravações na mesma escala: o dobro do tempo, o dobro de barras', () => {
    const taxa = 8000;
    const som = new Float32Array(taxa * 2).map((_, i) => Math.sin(i / 5) * 0.5);
    const curta = barrasDoTrecho(som, taxa, { inicio: 0, fim: 400 });
    const longa = barrasDoTrecho(som, taxa, { inicio: 0, fim: 800 });
    expect(curta).toHaveLength(16);
    expect(longa).toHaveLength(32);
    expect(Math.max(...longa)).toBeCloseTo(1, 5);
  });
});
