/* A lista de interessados (23/10/2026, plano de marketing, decisão 1).
 * O que estes testes travam:
 *  - só entra quem marcou a caixa (o servidor exige `consentiu`), e só vale
 *    depois de confirmar pelo link; sem confirmar, nada mais sai e a linha
 *    some em 7 dias;
 *  - a resposta não diz quem já está na lista; há freio por IP e por e-mail;
 *  - o token de confirmar não serve para sair, e vice-versa; sair APAGA;
 *  - no fim do teste grátis, sem a caixa nada é gravado (como antes); com
 *    ela, o e-mail do Mem leva o link de confirmação;
 *  - a sequência: cinco e-mails nos dias certos, um por vez, com o link de
 *    saída no corpo e no List-Unsubscribe, o preço do catálogo só no último,
 *    e nada para quem já comprou ou só pediu um aviso;
 *  - todo hebraico dos e-mails é do curso.
 * Ver worker/src/api/interessados.js e worker/src/sequencia.js.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { envDeTeste } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import { DIAS_DA_SEQUENCIA, linkDeConfirmacao, linkDeSaida, token } from '../../worker/src/api/interessados.js';
// @ts-expect-error - idem
import { runSequencia } from '../../worker/src/sequencia.js';
// @ts-expect-error - idem
import { ASSUNTOS_DA_SEQUENCIA, TERCEIRA_LETRA, mensagemDaSequencia } from '../../worker/src/lib/mail.js';
import { getCourse } from '@/lib/catalog';

const SITE = 'https://hebraicofluente.com.br';
const DIA = 86_400_000;
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = Record<string, unknown> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
type Mail = { to: string[]; subject: string; text: string; html: string; headers?: Record<string, string> };
let enviados: Mail[];

beforeEach(() => {
  enviados = [];
  vi.stubGlobal('fetch', async (_u: string, init?: RequestInit) => {
    enviados.push(JSON.parse(String(init?.body ?? '{}')));
    return new Response('{"id":"m"}', { status: 200 });
  });
});
afterEach(() => { vi.unstubAllGlobals(); });

const novoEnv = () => envDeTeste({
  RESEND_API_KEY: 're_teste', EMAIL_FROM: 'Hebraico Fluente <contato@hebraicofluente.com.br>',
  SUPPORT_EMAIL: 'contato@hebraicofluente.com.br', SITE_ORIGIN: SITE
}) as Env;
const post = (env: Env, rota: string, corpo: unknown, ip = '203.0.113.30') => worker.fetch(new Request(`${SITE}${rota}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: SITE, 'CF-Connecting-IP': ip },
  body: JSON.stringify(corpo)
}), env, ctx);
const linhas = (env: Env) => env.DB.bruto.prepare('SELECT * FROM interessados ORDER BY id').all() as Record<string, unknown>[];
const tokenDoLink = (link: string) => decodeURIComponent(new URL(link).searchParams.get('t')!);
const linkNoEmail = (m: Mail) => m.text.match(/https:\/\/\S+confirmar-lista\/\?t=\S+/)![0];

describe('entrar na lista', () => {
  it('exige a caixa marcada, um interesse da lista e um e-mail válido', async () => {
    const env = novoEnv();
    expect(await (await post(env, '/api/interessados', { email: 'ana@exemplo.com', interesse: 'israel' })).json()).toEqual({ error: 'consentimento' });
    expect(await (await post(env, '/api/interessados', { email: 'ana@exemplo.com', interesse: 'israel', consentiu: 'sim' })).json()).toEqual({ error: 'consentimento' });
    expect((await post(env, '/api/interessados', { email: 'ana@exemplo.com', interesse: 'cassino', consentiu: true })).status).toBe(400);
    expect(await (await post(env, '/api/interessados', { email: 'nao-e-email', interesse: 'israel', consentiu: true })).json()).toEqual({ error: 'email-invalido' });
    expect(linhas(env)).toHaveLength(0);
    expect(enviados).toHaveLength(0);
  });

  it('grava sem confirmar, manda o link, e responde igual para quem já estava', async () => {
    const env = novoEnv();
    const r1 = await post(env, '/api/interessados', { email: 'Ana@Exemplo.com', interesse: 'israel', consentiu: true, origem: 'bio' });
    expect(await r1.json()).toEqual({ ok: true });
    expect(linhas(env)).toMatchObject([{ email: 'ana@exemplo.com', interesses: 'israel', origem: 'bio', confirmado_em: null, passo: 0 }]);
    expect(enviados).toHaveLength(1);
    expect(enviados[0]!.subject).toBe('Confirme sua inscrição - Hebraico Fluente');
    expect(enviados[0]!.text).toContain('o aviso de quando Israel Além do Óbvio abrir');
    expect(enviados[0]!.text).toMatch(/\/confirmar-lista\/\?t=i\d+\./);
    expect(enviados[0]!.text).toContain('Não foi você? É só ignorar.');

    const r2 = await post(env, '/api/interessados', { email: 'ana@exemplo.com', interesse: 'raizes', consentiu: true, origem: 'inventada' });
    expect(await r2.json()).toEqual({ ok: true });
    expect(linhas(env)).toHaveLength(1);
    expect(linhas(env)[0]).toMatchObject({ interesses: 'israel,raizes', origem: 'bio' });
  });

  it('freia por e-mail (3 por dia, em silêncio) e por IP (10 por hora)', async () => {
    const env = novoEnv();
    for (let i = 0; i < 5; i++) await post(env, '/api/interessados', { email: 'ana@exemplo.com', interesse: 'israel', consentiu: true });
    expect(enviados).toHaveLength(3);
    for (let i = 0; i < 8; i++) await post(env, '/api/interessados', { email: `p${i}@exemplo.com`, interesse: 'a1', consentiu: true });
    const r = await post(env, '/api/interessados', { email: 'ultimo@exemplo.com', interesse: 'a1', consentiu: true });
    expect(r.status).toBe(429);
  });
});

describe('confirmar e sair', () => {
  it('confirma com o token certo; o de sair não confirma, e o de confirmar não tira', async () => {
    const env = novoEnv();
    await post(env, '/api/interessados', { email: 'ana@exemplo.com', interesse: 'israel', consentiu: true });
    const id = Number(linhas(env)[0]!.id);
    const tConfirmar = tokenDoLink(linkNoEmail(enviados[0]!));
    const tSair = tokenDoLink(await linkDeSaida(env, id));

    expect((await post(env, '/api/interessados/confirmar', { t: tSair })).status).toBe(400);
    expect((await post(env, '/api/interessados/confirmar', { t: `i${id}.assinatura-falsa-com-tamanho-ok` })).status).toBe(400);
    expect(linhas(env)[0]!.confirmado_em).toBeNull();

    const ok = await post(env, '/api/interessados/confirmar', { t: tConfirmar });
    expect(await ok.json()).toEqual({ ok: true, interesses: ['israel'] });
    expect(linhas(env)[0]!.confirmado_em).not.toBeNull();
    expect(linhas(env)[0]!.passo).toBe(0);   // só pediu o aviso: nada de sequência

    expect((await post(env, '/api/interessados/sair', { t: tConfirmar })).status).toBe(400);
    expect(linhas(env)).toHaveLength(1);
    expect(await (await post(env, '/api/interessados/sair', { t: tSair })).json()).toEqual({ ok: true });
    expect(linhas(env)).toHaveLength(0);
    const saidas = env.DB.bruto.prepare("SELECT SUM(n) AS n FROM estatisticas WHERE chave = 'l|saiu'").get() as { n: number };
    expect(saidas.n).toBe(1);
    expect((await post(env, '/api/interessados/confirmar', { t: tConfirmar })).status).toBe(400);
  });

  it('a faxina apaga quem não confirmou em 7 dias, e só esses', async () => {
    const env = novoEnv();
    const agora = Date.now();
    env.DB.bruto.prepare(`INSERT INTO interessados (email, interesses, criado_em) VALUES ('velho@exemplo.com', 'a1', ?)`).run(agora - 8 * DIA);
    env.DB.bruto.prepare(`INSERT INTO interessados (email, interesses, criado_em) VALUES ('novo@exemplo.com', 'a1', ?)`).run(agora - 2 * DIA);
    env.DB.bruto.prepare(`INSERT INTO interessados (email, interesses, criado_em, confirmado_em) VALUES ('ok@exemplo.com', 'a1', ?, ?)`).run(agora - 30 * DIA, agora - 30 * DIA);
    await runSequencia(env, agora);
    expect(linhas(env).map(l => l.email)).toEqual(['novo@exemplo.com', 'ok@exemplo.com']);
  });
});

describe('o fim do teste grátis', () => {
  it('sem a caixa, nada é gravado; com ela, o e-mail do Mem leva a confirmação', async () => {
    const env = novoEnv();
    await post(env, '/api/segunda-letra', { email: 'semcaixa@exemplo.com' });
    expect(linhas(env)).toHaveLength(0);
    expect(enviados[0]!.text).toContain('o endereço não fica guardado');

    await post(env, '/api/segunda-letra', { email: 'comcaixa@exemplo.com', lista: true, origem: 'stories' });
    expect(linhas(env)).toMatchObject([{ email: 'comcaixa@exemplo.com', interesses: 'curso', origem: 'stories', confirmado_em: null }]);
    const m = enviados[1]!;
    expect(m.subject).toContain('Mem');
    expect(m.text).toMatch(/\/confirmar-lista\/\?t=i\d+\./);
    expect(m.text).not.toContain('o endereço não fica guardado');
    expect(m.text).toContain('Sem a confirmação, não mandamos mais nada');
  });
});

describe('a sequência das letras', () => {
  async function inscritoConfirmado(env: Env, email = 'ana@exemplo.com') {
    await post(env, '/api/segunda-letra', { email, lista: true });
    const t = tokenDoLink(linkNoEmail(enviados.at(-1)!));
    await post(env, '/api/interessados/confirmar', { t });
    return Number(env.DB.bruto.prepare('SELECT confirmado_em FROM interessados WHERE email = ?').get(email)!.confirmado_em as number);
  }
  const rodar = async (env: Env, at: number) => { enviados = []; await runSequencia(env, at); return enviados; };

  it('cinco e-mails, nos dias certos, um de cada vez, com o link de saída', async () => {
    const env = novoEnv();
    const c = await inscritoConfirmado(env);
    expect(await rodar(env, c + DIA)).toHaveLength(0);
    const recebidos: Mail[] = [];
    for (const d of DIAS_DA_SEQUENCIA) {
      const m = await rodar(env, c + d * DIA + 3_600_000);
      expect(m.map(x => x.subject), `dia ${d}`).toHaveLength(1);
      recebidos.push(m[0]!);
    }
    expect(recebidos.map(m => m.subject)).toEqual(ASSUNTOS_DA_SEQUENCIA);
    for (const m of recebidos) {
      expect(m.text).toMatch(/\/sair-da-lista\/\?t=i\d+\./);
      expect(m.headers?.['List-Unsubscribe']).toMatch(/^<https:\/\/hebraicofluente\.com\.br\/sair-da-lista\/\?t=i/);
    }
    const curso = getCourse('alfabetizacao')!;
    for (const m of recebidos.slice(0, 4)) expect(m.text, m.subject).not.toMatch(/R\$/);
    expect(recebidos[4]!.text).toContain(`R$ ${curso.price.brl}`);
    expect(await rodar(env, c + 40 * DIA)).toHaveLength(0);
  });

  it('quem já tem o curso sai da sequência sem receber nada', async () => {
    const env = novoEnv();
    const c = await inscritoConfirmado(env, 'aluna@exemplo.com');
    env.DB.bruto.prepare(`INSERT INTO accounts (email, name, pass_hash, pass_salt, created_at) VALUES ('aluna@exemplo.com', 'A', 'x', 'y', 1)`).run();
    const id = (env.DB.bruto.prepare("SELECT id FROM accounts WHERE email = 'aluna@exemplo.com'").get() as { id: number }).id;
    env.DB.bruto.prepare(`INSERT INTO entitlements (account_id, course_slug, granted_at, expires_at, order_id) VALUES (?, 'alfabetizacao', 1, ?, 'X')`).run(id, c + 365 * DIA);
    expect(await rodar(env, c + 2 * DIA + 3_600_000)).toHaveLength(0);
    expect(await rodar(env, c + 15 * DIA)).toHaveLength(0);
  });

  it('quem saiu não recebe mais nada', async () => {
    const env = novoEnv();
    const c = await inscritoConfirmado(env);
    const id = Number(linhas(env)[0]!.id);
    await post(env, '/api/interessados/sair', { t: tokenDoLink(await linkDeSaida(env, id)) });
    expect(await rodar(env, c + 2 * DIA + 3_600_000)).toHaveLength(0);
  });
});

describe('o texto dos e-mails', () => {
  const dados = JSON.parse(readFileSync(new URL('../../data/letters.json', import.meta.url), 'utf8')) as Record<string, any>[];
  const tav = dados.find(l => l.id === 'tav')!;

  it('o Tav do e-mail é o Tav do curso', () => {
    expect(TERCEIRA_LETRA.letra).toBe(tav.letter);
    expect(TERCEIRA_LETRA.nome).toBe(tav.namePt);
    for (const [he, t] of TERCEIRA_LETRA.silabas) {
      expect(tav.syllables.some((s: { he: string; translit: string }) => s.he === he && s.translit === t)).toBe(true);
    }
    const [he, t, pt] = TERCEIRA_LETRA.palavra;
    expect(tav.wordsToRead.some((w: { he: string; translit: string; pt: string }) => w.he === he && w.translit === t && w.pt === pt)).toBe(true);
  });

  it('sem travessão, com o nome escapado e o link de saída em todos', () => {
    for (let passo = 1; passo <= 5; passo++) {
      const m = mensagemDaSequencia({ passo, site: SITE, sair: `${SITE}/sair-da-lista/?t=i1.x`, preco: { brl: 147, listBrl: 197, pixPct: 10, parcelas: 12, meses: 12, desistir: 7 } });
      const tudo = `${m.subject}${m.text}${m.html}`;
      expect(tudo).not.toMatch(new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`));
      expect(m.html).toContain('Sair da lista');
    }
  });

  it('os tokens têm o formato que a página de saída reconhece', async () => {
    const env = novoEnv();
    expect(await token(env, 'sair', 7)).toMatch(/^i7\.[A-Za-z0-9_-]{20,}$/);
    expect(await linkDeConfirmacao(env, 7)).toMatch(/^https:\/\/hebraicofluente\.com\.br\/confirmar-lista\/\?t=i7\./);
  });
});
