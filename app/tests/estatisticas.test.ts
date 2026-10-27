/* Onde os alunos erram e onde param (30/09/2026): o envio do app
 * (lib/estatisticas.ts), o servidor (worker/src/api/estatisticas.js) e as
 * tabelas do painel (lib/painel-estatisticas.ts). */
import { describe, expect, it } from 'vitest';
import { criarEnviador, LOTE_MAX, paraEnvio } from '@/lib/estatisticas';
import { funilDaDemo, ondeErram, ondeParam, ordemDoPlano } from '@/lib/painel-estatisticas';
import { course } from '@/lib/content-publico';
import { cookieDe, envDeTeste, pedido, comoAdmin } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { chaveDe, estatisticasPurge, ETAPAS_DA_DEMO } from '../../worker/src/api/estatisticas.js';
// @ts-expect-error - idem
import { grantAccess } from '../../worker/src/lib/db.js';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
const ev = (name: string, props: Record<string, unknown>) => ({ name, props, at: 0 }) as never;

describe('o que o app manda', () => {
  it('só resposta com tipo e lição, e etapa na primeira vez', () => {
    expect(paraEnvio(ev('exercise_answered', { letterId: 'alef', kind: 'match', correct: false, itemId: 'x' })))
      .toEqual({ e: 'resposta', k: 'match', l: 'alef', c: false });
    expect(paraEnvio(ev('stage_completed', { letterId: 'som-vet', stage: 3, primeira: true })))
      .toEqual({ e: 'etapa', l: 'som-vet', s: 3 });
    /* Etapa refeita, eventos de outra natureza e texto livre não saem. */
    expect(paraEnvio(ev('stage_completed', { letterId: 'alef', stage: 3, primeira: false }))).toBeNull();
    expect(paraEnvio(ev('demo_answered', { letterId: 'alef', correct: true }))).toBeNull();
    expect(paraEnvio(ev('exercise_answered', { letterId: 'alef', kind: 'olá mundo', correct: true }))).toBeNull();
    expect(paraEnvio(ev('exercise_wrong', { letterId: 'alef', chosen: 'ב' }))).toBeNull();
  });

  it('junta em lotes e manda o resto ao sair', () => {
    const lotes: { n: number; saindo: boolean }[] = [];
    const e = criarEnviador((lote, saindo) => lotes.push({ n: lote.length, saindo }));
    const r = ev('exercise_answered', { letterId: 'mem', kind: 'match', correct: true });
    e.receber(Array.from({ length: LOTE_MAX + 5 }, () => r));
    expect(lotes).toEqual([{ n: LOTE_MAX, saindo: false }]);
    e.esvaziar(true);
    expect(lotes[1]).toEqual({ n: 5, saindo: true });
    expect(e.pendentes()).toBe(0);
  });
});

describe('o servidor', () => {
  /* Com o curso liberado: desde 01/10/2026 (SEC-A-008) só aluno conta. */
  async function conta(env: Env, email = 'ana@exemplo.com', comCurso = true) {
    const r = await auth.signup({ request: pedido(`${SITE}/api/auth/signup`,
      { aceitouTermos: true, declarouIdade: true, name: 'Ana', email, password: 'senha-boa-123' }), env, ctx });
    const { account } = await r.clone().json() as { account: { id: string } };
    if (comCurso) await grantAccess(env, { accountId: Number(account.id), courseSlug: 'alfabetizacao', orderId: 'T', months: 12 });
    return cookieDe(r);
  }
  const mandar = (env: Env, cookie: string, eventos: unknown) =>
    worker.fetch(new Request(`${SITE}/api/estatisticas`, {
      method: 'POST', headers: { cookie, Origin: SITE, 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventos })
    }), env, ctx);

  it('soma por dia, sem guardar quem mandou', async () => {
    const env = envDeTeste() as Env;
    const a = await conta(env), b = await conta(env, 'bia@exemplo.com');
    const r = { e: 'resposta', k: 'match', l: 'alef', c: false };
    expect((await mandar(env, a, [r, r, { e: 'etapa', l: 'alef', s: 1 }])).status).toBe(204);
    expect((await mandar(env, b, [r])).status).toBe(204);
    const linhas = env.DB.bruto.prepare('SELECT * FROM estatisticas ORDER BY chave').all() as { dia: string; chave: string; n: number }[];
    expect(linhas.map(l => [l.chave, l.n])).toEqual([['e|alef|1', 1], ['r|match|alef|0', 3]]);
    /* A tabela só tem dia, chave e contador. */
    expect(Object.keys(linhas[0]!).sort()).toEqual(['chave', 'dia', 'n']);
  });

  it('sem sessão, nada; lixo é ignorado', async () => {
    const env = envDeTeste() as Env;
    expect((await mandar(env, '', [{ e: 'etapa', l: 'alef', s: 1 }])).status).toBe(401);
    const a = await conta(env);
    await mandar(env, a, [{ e: 'etapa', l: 'alef', s: 9 }, { e: 'resposta', k: '<b>', l: 'alef', c: true }, 'x', null]);
    expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM estatisticas').get()).toEqual({ n: 0 });
    expect(chaveDe({ e: 'resposta', k: 'match', l: 'alef', c: 'sim' })).toBeNull();
  });

  /* SEC-A-008 (auditoria de 01/10/2026): conta é de graça, e qualquer conta
     logada envenenava os números com que o dono decide o curso. */
  it('conta sem curso não conta, e não escreve nem o freio', async () => {
    const env = envDeTeste() as Env;
    const a = await conta(env, 'curiosa@exemplo.com', false);
    const antes = env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM throttle').get();
    expect((await mandar(env, a, [{ e: 'resposta', k: 'match', l: 'alef', c: false }])).status).toBe(204);
    expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM estatisticas').get()).toEqual({ n: 0 });
    expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM throttle').get()).toEqual(antes);
  });

  it('só o dono lê, e a leitura junta certo e errado', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: 'dono@exemplo.com' }) as Env;
    const a = await conta(env), dono = await comoAdmin(env, await conta(env, 'dono@exemplo.com'));
    await mandar(env, a, [{ e: 'resposta', k: 'match', l: 'alef', c: false }, { e: 'resposta', k: 'match', l: 'alef', c: true }]);
    const ler = (cookie: string) => worker.fetch(new Request(`${SITE}/api/admin/estatisticas?dias=7`, { headers: { cookie } }), env, ctx);
    expect((await ler(a)).status).toBe(403);
    const d = await (await ler(dono)).json() as { respostas: unknown[] };
    expect(d.respostas).toEqual([{ kind: 'match', licao: 'alef', total: 2, erros: 1 }]);
  });

  it('apaga o que passou de um ano', async () => {
    const env = envDeTeste() as Env;
    env.DB.bruto.exec("INSERT INTO estatisticas (dia, chave, n) VALUES ('2020-01-01', 'e|alef|1', 3), ('2099-01-01', 'e|alef|1', 1)");
    await estatisticasPurge(env);
    expect(env.DB.bruto.prepare('SELECT dia FROM estatisticas').all()).toEqual([{ dia: '2099-01-01' }]);
  });
});

describe('as tabelas do painel', () => {
  it('onde erram: só com respostas bastantes, maior taxa primeiro', () => {
    const t = ondeErram([
      { kind: 'match', licao: 'alef', total: 20, erros: 2 },
      { kind: 'type-answer', licao: 'mem', total: 12, erros: 9 },
      { kind: 'match', licao: 'tav', total: 3, erros: 3 }
    ]);
    expect(t.map(r => r.licao)).toEqual(['mem', 'alef']);
  });

  it('onde param: na ordem do curso, com a última etapa certa de cada lição', () => {
    const ordem = ordemDoPlano(course.modules);
    expect(ordem[0]).toEqual({ id: 'alef', etapas: 5 });
    expect(ordem.find(o => o.id === 'mod6')).toEqual({ id: 'mod6', etapas: 3 });
    expect(ordem.findIndex(o => o.id === 'som-contraste')).toBe(ordem.findIndex(o => o.id === 'som-fe') + 1);
    /* 22 letras, 8 lições de som (com a 20, a do contraste) e os módulos 6 e 7. */
    expect(ordem).toHaveLength(22 + 8 + 2);
    const p = ondeParam([{ licao: 'alef', etapa: 1, n: 10 }, { licao: 'alef', etapa: 5, n: 7 }], ordem);
    expect(p[0]).toEqual({ id: 'alef', comecaram: 10, terminaram: 7, taxa: 0.7 });
    expect(p[1]!.taxa).toBeNull();
  });

  it('o link /sefarad conta a visita e leva ao teste grátis', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: 'dono@exemplo.com' }) as Env;
    const ir = (ua: string, metodo = 'GET', caminho = '/sefarad') => worker.fetch(
      new Request(`${SITE}${caminho}`, { method: metodo, headers: { 'user-agent': ua } }), env, ctx);
    const r = await ir('Mozilla/5.0 (iPhone) Instagram');
    expect(r.status).toBe(302);
    expect(r.headers.get("location")).toBe(`${SITE}/curso-de-hebraico/?parceria=sefarad#experimente`);
    await ir('Mozilla/5.0 (iPhone)', 'GET', '/Sefarad/');
    await ir('facebookexternalhit/1.1');
    await ir('Mozilla/5.0', 'HEAD');
    expect(env.DB.bruto.prepare("SELECT n FROM estatisticas WHERE chave = 'o|sefarad'").get()).toEqual({ n: 2 });
    const r2 = await auth.signup({ request: pedido(`${SITE}/api/auth/signup`,
      { aceitouTermos: true, declarouIdade: true, name: 'Dono', email: 'dono@exemplo.com', password: 'senha-boa-123' }), env, ctx });
    const dono = await comoAdmin(env, cookieDe(r2));
    const d = await (await worker.fetch(new Request(`${SITE}/api/admin/estatisticas?dias=7`, { headers: { cookie: dono } }), env, ctx))
      .json() as { campanhas: unknown[] };
    expect(d.campanhas).toEqual([{ origem: 'sefarad', visitas: 2 }]);

    /* Os links do Instagram (04/10/2026): cada um conta à parte e leva o
       próprio nome no endereço, que é o que o pedido guarda. */
    /* 24/10/2026: a bio ia para a página "Comece aqui"; desde 27/10/2026 (só o
       curso no site) vai direto à página do curso, com a parceria. */
    const bio = await ir('Mozilla/5.0 (iPhone) Instagram', 'GET', '/bio');
    expect(bio.status).toBe(302);
    expect(bio.headers.get('location')).toBe(`${SITE}/curso-de-hebraico/?parceria=bio#experimente`);
    /* 23/10/2026: a capa virou o portal, e o link antigo `/?parceria=` (de
       posts já publicados) segue para a página de venda com a parceria. */
    const antigo = await ir('Mozilla/5.0', 'GET', '/?parceria=sefarad');
    expect(antigo.status).toBe(302);
    expect(antigo.headers.get('location')).toBe(`${SITE}/curso-de-hebraico/?parceria=sefarad#experimente`);
    expect((await ir('Mozilla/5.0', 'GET', '/contato')).headers.get('location')).toBe(`${SITE}/suporte/`);
    expect((await ir('Mozilla/5.0', 'GET', '/minha-conta/')).headers.get('location')).toBe(`${SITE}/meu-hebraico/`);
    /* Stories e direct continuam no teste grátis. */
    expect((await ir('Mozilla/5.0', 'GET', '/stories/')).headers.get('location')).toBe(`${SITE}/curso-de-hebraico/?parceria=stories#experimente`);
    expect((await ir('Mozilla/5.0', 'GET', '/dm')).headers.get('location')).toBe(`${SITE}/curso-de-hebraico/?parceria=dm#experimente`);
    const d2 = await (await worker.fetch(new Request(`${SITE}/api/admin/estatisticas?dias=7`, { headers: { cookie: dono } }), env, ctx))
      .json() as { campanhas: { origem: string; visitas: number }[] };
    expect(Object.fromEntries(d2.campanhas.map(c => [c.origem, c.visitas]))).toEqual({ sefarad: 2, bio: 1, stories: 1, dm: 1 });
  });

  it('o teste da capa conta as etapas, sem sessão, com freio e sem robô', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: 'dono@exemplo.com' }) as Env;
    const etapa = (e: unknown, ip = '203.0.113.7', ua = 'Mozilla/5.0 (iPhone)') => worker.fetch(new Request(`${SITE}/api/demo`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: SITE, 'user-agent': ua, 'CF-Connecting-IP': ip },
      body: JSON.stringify({ etapa: e })
    }), env, ctx);
    expect((await etapa('visto')).status).toBe(204);
    await etapa('visto', '198.51.100.9');
    await etapa('pronto');
    await etapa('inventada');
    await etapa({ x: 1 });
    await etapa('visto', '203.0.113.7', 'Googlebot/2.1');
    const conta = (c: string) => (env.DB.bruto.prepare('SELECT n FROM estatisticas WHERE chave = ?').get(c) as { n: number } | undefined)?.n ?? 0;
    expect(conta('d|visto')).toBe(2);
    expect(conta('d|pronto')).toBe(1);
    expect(env.DB.bruto.prepare("SELECT COUNT(*) AS n FROM estatisticas WHERE chave LIKE 'd|%'").get()).toEqual({ n: 2 });
    /* O freio: 40 por hora por endereço. */
    for (let i = 0; i < 45; i++) await etapa('cta', '192.0.2.1');
    expect(conta('d|cta')).toBe(40);
    /* De outro site, recusado antes de contar. */
    const fora = await worker.fetch(new Request(`${SITE}/api/demo`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://outro.exemplo' }, body: '{"etapa":"visto"}'
    }), env, ctx);
    expect(fora.status).toBe(403);

    const r2 = await auth.signup({ request: pedido(`${SITE}/api/auth/signup`,
      { aceitouTermos: true, declarouIdade: true, name: 'Dono', email: 'dono@exemplo.com', password: 'senha-boa-123' }), env, ctx });
    const dono = await comoAdmin(env, cookieDe(r2));
    const d = await (await worker.fetch(new Request(`${SITE}/api/admin/estatisticas?dias=7`, { headers: { cookie: dono } }), env, ctx))
      .json() as { demo: { etapa: string; n: number }[] };
    const f = funilDaDemo(d.demo);
    expect(f[0]).toMatchObject({ etapa: 'visto', n: 2, deQuemViu: 1 });
    expect(f.find(x => x.etapa === 'pronto')).toMatchObject({ n: 1, deQuemViu: 0.5 });
    expect(f.map(x => x.etapa)).toEqual(ETAPAS_DA_DEMO);
  });
});
