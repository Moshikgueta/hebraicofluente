/* O desafio com um amigo (28/10/2026): só quem tem o curso cria; o link só
   carrega palavras do curso, assinadas; a página pública confere a
   assinatura e tira a leitura e o sentido do conteúdo, nunca do link. */
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { createOrder, grantAccess } from '../../worker/src/lib/db.js';
// @ts-expect-error - idem
import { vocabulario } from '../../worker/src/api/desafio.js';
import { opcoesDe } from '@/app/desafio-amigo/DesafioAmigoClient';
import { sortearCinco } from '@/components/learn/DesafiarAmigo';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };

async function conta(env: Env, email: string, comprou = true) {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, declarouIdade: true, name: 'Ana', email, password: 'senha-boa-123' }), env, ctx
  });
  const cookie = cookieDe(r);
  const { id } = env.DB.bruto.prepare('SELECT id FROM accounts WHERE email = ?').get(email) as { id: number };
  if (comprou) {
    const order = await createOrder(env, { accountId: id, courseSlug: 'alfabetizacao', amountCents: 14700, method: 'pix' });
    await grantAccess(env, { accountId: id, courseSlug: 'alfabetizacao', orderId: order.id, months: 12 });
  }
  return cookie;
}
const criar = (env: Env, cookie: string, palavras: unknown) => worker.fetch(new Request(`${SITE}/api/desafio`, {
  method: 'POST', headers: { cookie, Origin: SITE, 'Content-Type': 'application/json' }, body: JSON.stringify({ palavras })
}), env, ctx);
const abrir = (env: Env, t: string) => worker.fetch(new Request(`${SITE}/api/desafio?t=${encodeURIComponent(t)}`), env, ctx);

const VOCAB = [...(vocabulario() as Map<string, { he: string; pt: string }>).values()];
const CINCO = VOCAB.filter((w, k) => VOCAB.findIndex(x => x.pt === w.pt) === k).slice(0, 5).map(w => w.he);

describe('o desafio com um amigo', () => {
  it('só quem tem o curso cria, com cinco palavras do curso', async () => {
    const env = envDeTeste() as Env;
    const ana = await conta(env, 'ana@exemplo.com');
    const bia = await conta(env, 'bia@exemplo.com', false);
    expect((await criar(env, '', CINCO)).status).toBe(401);
    expect((await criar(env, bia, CINCO)).status).toBe(403);
    expect((await criar(env, ana, CINCO.slice(0, 4))).status).toBe(400);
    expect((await criar(env, ana, [...CINCO.slice(0, 4), CINCO[0]])).status).toBe(400);
    expect((await criar(env, ana, [...CINCO.slice(0, 4), 'golpe'])).status).toBe(400);
    const r = await criar(env, ana, CINCO);
    expect(r.status).toBe(200);
    const { token } = await r.json() as { token: string };
    expect(token).toMatch(/^[\w-]+\.[\w-]+$/);
  });

  it('abre só com a assinatura certa, e o sentido vem do curso', async () => {
    const env = envDeTeste() as Env;
    const ana = await conta(env, 'ana@exemplo.com');
    const { token } = await (await criar(env, ana, CINCO)).json() as { token: string };
    const r = await abrir(env, token);
    expect(r.status).toBe(200);
    const { palavras } = await r.json() as { palavras: { he: string; translit: string; pt: string }[] };
    expect(palavras.map(p => p.he)).toEqual(CINCO);
    expect(palavras.every(p => p.translit && p.pt)).toBe(true);
    /* Trocar o corpo e manter a assinatura não passa. */
    const [corpo, sig] = token.split('.');
    const outro = Buffer.from(JSON.stringify([...CINCO].reverse())).toString('base64url');
    expect((await abrir(env, `${outro}.${sig}`)).status).toBe(400);
    expect((await abrir(env, `${corpo}.x${sig}`)).status).toBe(400);
    expect((await abrir(env, '')).status).toBe(400);
    /* Outro segredo, outra assinatura. */
    expect((await abrir(envDeTeste({ SESSION_SECRET: 'outro' }) as Env, token)).status).toBe(400);
  });

  it('as opções: quatro, sem repetir, com a certa', () => {
    const p = CINCO.map((he, k) => ({ he, translit: `t${k}`, pt: `sentido ${k}` }));
    for (let i = 0; i < 5; i++) {
      const o = opcoesDe(p, i);
      expect(o).toHaveLength(4);
      expect(new Set(o).size).toBe(4);
      expect(o).toContain(p[i]!.pt);
    }
    expect(new Set(sortearCinco(CINCO.map(he => ({ he })))).size).toBe(5);
    /* Sentido repetido não entra duas vezes. */
    const comRepetido = [...CINCO.map((he, k) => ({ he, pt: `s${k}` })), { he: 'X', pt: 's0' }];
    for (let k = 0; k < 20; k++) {
      const s = sortearCinco(comRepetido);
      expect(s.includes('X') && s.includes(CINCO[0]!)).toBe(false);
    }
  });
});
