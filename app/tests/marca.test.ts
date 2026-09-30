/* A marca invisível por conta no conteúdo do curso (worker/src/lib/marca.js,
 * worker/src/api/content.js e worker/src/api/marca.js). */
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { createOrder, grantAccess, deleteAccount } from '../../worker/src/lib/db.js';
// @ts-expect-error - idem
import { invisivel, lerMarcas } from '../../worker/src/lib/marca.js';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };

async function aluno(env: Env, email: string, comprou = true) {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, name: 'Ana', email, password: 'senha-boa-123' }), env, ctx
  });
  const cookie = cookieDe(r);
  const { id } = env.DB.bruto.prepare('SELECT id FROM accounts WHERE email = ?').get(email) as { id: number };
  if (comprou) {
    const order = await createOrder(env, { accountId: id, courseSlug: 'alfabetizacao', amountCents: 14700, method: 'pix' });
    await grantAccess(env, { accountId: id, courseSlug: 'alfabetizacao', orderId: order.id, months: 12 });
  }
  return { cookie, id };
}

const baixar = async (env: Env, cookie: string) => {
  const r = await worker.fetch(new Request(`${SITE}/api/content`, { headers: { cookie } }), env, ctx);
  expect(r.status).toBe(200);
  return r.text();
};

describe('a marca', () => {
  it('ida e volta: o texto invisível devolve o número', () => {
    for (const m of ['00000000', 'ffffffff', '3fa9c01d']) {
      const s = `Um parágrafo qualquer.${invisivel(m)} E outro.`;
      expect(lerMarcas(s)).toEqual([m]);
      /* Invisível de verdade: só caracteres de largura zero. */
      expect(invisivel(m)).toMatch(/^[⁠​‌]+$/);
    }
    expect(lerMarcas('texto sem marca')).toEqual([]);
  });

  it('o número visível também serve: o da marca d\'água e o digitado', () => {
    expect(lerMarcas('Licenciado para an•••@gmail.com · cópia 636195AE')).toEqual(['636195ae']);
    expect(lerMarcas('  3FA9C01D ')).toEqual(['3fa9c01d']);
    expect(lerMarcas('abc 3FA9C01D def')).toEqual([]);
  });

  it('cada conta recebe o conteúdo com a sua marca, sempre a mesma', async () => {
    const env = envDeTeste() as Env;
    const ana = await aluno(env, 'ana@exemplo.com');
    const bia = await aluno(env, 'bia@exemplo.com');
    const a1 = await baixar(env, ana.cookie), a2 = await baixar(env, ana.cookie);
    const b1 = await baixar(env, bia.cookie);
    const [ma] = lerMarcas(a1), [mb] = lerMarcas(b1);
    expect(ma).toMatch(/^[0-9a-f]{8}$/);
    expect(mb).not.toBe(ma);
    expect(lerMarcas(a2)).toEqual([ma]);
    /* O aviso de uso pessoal mostra o número da cópia. */
    expect(JSON.parse(a1)._licenca).toContain(`Cópia ${ma!.toUpperCase()}.`);
  });

  it('só em texto que o aluno lê: hebraico, transliteração e respostas ficam intactos', async () => {
    const env = envDeTeste() as Env;
    const ana = await aluno(env, 'ana@exemplo.com');
    const c = JSON.parse(await baixar(env, ana.cookie));
    const tira = (s: string) => s.replace(/[⁠​‌]/g, '');
    /* Tirando a marca, tudo é idêntico ao conteúdo original. */
    const { _licenca, ...resto } = c;
    expect(JSON.parse(tira(JSON.stringify(resto)))).toEqual(JSON.parse(JSON.stringify(conteudoPago)));
    /* E a marca só aparece no fim do "Você sabia?" e dos parágrafos de cultura. */
    const semMarca = { ...resto,
      letters: resto.letters.map((l: { didYouKnow: string }) => ({ ...l, didYouKnow: '' })),
      culture: resto.culture.map((k: { bodyPt: string[] }) => ({ ...k, bodyPt: [] })) };
    expect(JSON.stringify(semMarca)).not.toMatch(/[⁠​‌]/);
    expect(c.letters[0].didYouKnow).toMatch(/⁠$/);
  });

  it('o banco fora do ar não tira a aula de quem pagou', async () => {
    const env = envDeTeste() as Env;
    const ana = await aluno(env, 'ana@exemplo.com');
    env.DB.bruto.exec('DROP TABLE marcas');
    const t = await baixar(env, ana.cookie);
    expect(lerMarcas(t)).toEqual([]);
    expect(JSON.parse(t).letters).toHaveLength(conteudoPago.letters.length);
  });

  it('some com a conta apagada', async () => {
    const env = envDeTeste() as Env;
    const ana = await aluno(env, 'ana@exemplo.com');
    await baixar(env, ana.cookie);
    await deleteAccount(env, ana.id);
    expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM marcas').get()).toEqual({ n: 0 });
  });
});

describe('identificar uma cópia', () => {
  const identificar = (env: Env, cookie: string, texto: unknown) =>
    worker.fetch(pedido(`${SITE}/api/admin/marca`, { texto }, { cookie }), env, ctx);

  it('diz ao dono de qual conta saiu um trecho colado', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: 'dono@exemplo.com' }) as Env;
    const ana = await aluno(env, 'ana@exemplo.com');
    const dono = await aluno(env, 'dono@exemplo.com', false);
    const c = JSON.parse(await baixar(env, ana.cookie));
    const trecho = `copiado de um grupo: ${c.culture[0].bodyPt[0]}`;
    const r = await identificar(env, dono.cookie, trecho);
    expect(r.status).toBe(200);
    const { marcas } = await r.json() as { marcas: { email: string; marca: string }[] };
    expect(marcas).toHaveLength(1);
    expect(marcas[0]!.email).toBe('ana@exemplo.com');
  });

  it('é só para o dono', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: 'dono@exemplo.com' }) as Env;
    const ana = await aluno(env, 'ana@exemplo.com');
    expect((await identificar(env, ana.cookie, 'x')).status).toBe(403);
    expect((await identificar(env, '', 'x')).status).toBe(401);
  });
});
