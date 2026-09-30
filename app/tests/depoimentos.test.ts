/* Os depoimentos dos alunos (worker/src/api/depoimentos.js, 29/09/2026). */
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { createOrder, grantAccess, deleteAccount } from '../../worker/src/lib/db.js';
// @ts-expect-error - idem
import { assinatura as assinaturaServidor, validar } from '../../worker/src/api/depoimentos.js';
// @ts-expect-error - idem
import { runAlertas } from '../../worker/src/alertas.js';
// @ts-expect-error - idem
import { isGatedPath } from '../../worker/src/gate.js';
import { assinatura } from '@/lib/depoimento';
import { PAGAS } from '@/lib/seo';
import { cookieDe, envDeTeste, pedido, comoAdmin } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };

async function aluno(env: Env, email: string, comprou = true) {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, name: 'Ana Souza', email, password: 'senha-boa-123' }), env, ctx
  });
  const cookie = cookieDe(r);
  const { id } = env.DB.bruto.prepare('SELECT id FROM accounts WHERE email = ?').get(email) as { id: number };
  if (comprou) {
    const order = await createOrder(env, { accountId: id, courseSlug: 'alfabetizacao', amountCents: 14700, method: 'pix' });
    await grantAccess(env, { accountId: id, courseSlug: 'alfabetizacao', orderId: order.id, months: 12 });
  }
  return { cookie, id };
}

const chamar = (env: Env, metodo: string, path: string, cookie: string, body?: unknown) =>
  worker.fetch(new Request(`${SITE}${path}`, {
    method: metodo,
    headers: { cookie, Origin: SITE, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  }), env, ctx);

const BOM = {
  texto: 'Eu nunca tinha lido uma palavra em hebraico. Hoje leio as placas da viagem.',
  forma: 'nome', nomePublico: 'Ana Souza', cidade: 'Recife', publicar: true, contato: false
};
const linha = (env: Env, id: number) =>
  env.DB.bruto.prepare('SELECT * FROM depoimentos WHERE account_id = ?').get(id) as Record<string, unknown> | undefined;

describe('o aluno escreve, autoriza e retira', () => {
  it('salva, lê de volta e edita um só por conta', async () => {
    const env = envDeTeste() as Env;
    const ana = await aluno(env, 'ana@exemplo.com');
    expect((await chamar(env, 'PUT', '/api/depoimento', ana.cookie, BOM)).status).toBe(200);
    const r = await (await chamar(env, 'GET', '/api/depoimento', ana.cookie)).json() as { depoimento: Record<string, unknown> };
    expect(r.depoimento).toMatchObject({ texto: BOM.texto, forma: 'nome', cidade: 'Recife', publicar: true, estado: 'novo' });
    await chamar(env, 'PUT', '/api/depoimento', ana.cookie, { ...BOM, publicar: false, texto: `${BOM.texto} Recomendo.` });
    expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM depoimentos').get()).toEqual({ n: 1 });
    expect(linha(env, ana.id)).toMatchObject({ publicar: 0 });
    /* A autorização fica na trilha: é a prova do consentimento. */
    const trilha = env.DB.bruto.prepare("SELECT detail FROM access_log WHERE action = 'depoimento-salvo' ORDER BY id").all() as { detail: string }[];
    expect(trilha.map(t => t.detail)).toEqual(['publicar=sim forma=nome', 'publicar=nao forma=nome']);
  });

  it('editar volta para "novo": o dono aprovou um texto, não o seguinte', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: 'dono@exemplo.com' }) as Env;
    const ana = await aluno(env, 'ana@exemplo.com');
    const dono = await aluno(env, 'dono@exemplo.com', false);
    dono.cookie = await comoAdmin(env, dono.cookie);
    await chamar(env, 'PUT', '/api/depoimento', ana.cookie, BOM);
    expect((await chamar(env, 'PUT', '/api/admin/depoimentos', dono.cookie, { id: ana.id, estado: 'aprovado' })).status).toBe(200);
    expect(linha(env, ana.id)).toMatchObject({ estado: 'aprovado' });
    await chamar(env, 'PUT', '/api/depoimento', ana.cookie, { ...BOM, texto: 'Mudei de ideia sobre o que escrever aqui.' });
    expect(linha(env, ana.id)).toMatchObject({ estado: 'novo' });
  });

  it('retirar apaga, e apagar a conta também', async () => {
    const env = envDeTeste() as Env;
    const ana = await aluno(env, 'ana@exemplo.com');
    await chamar(env, 'PUT', '/api/depoimento', ana.cookie, BOM);
    expect((await chamar(env, 'DELETE', '/api/depoimento', ana.cookie)).status).toBe(200);
    expect(linha(env, ana.id)).toBeUndefined();
    await chamar(env, 'PUT', '/api/depoimento', ana.cookie, BOM);
    await deleteAccount(env, ana.id);
    expect(linha(env, ana.id)).toBeUndefined();
  });

  it('só quem tem o curso escreve; sem sessão, nada', async () => {
    const env = envDeTeste() as Env;
    const bia = await aluno(env, 'bia@exemplo.com', false);
    expect((await chamar(env, 'PUT', '/api/depoimento', bia.cookie, BOM)).status).toBe(403);
    expect((await chamar(env, 'PUT', '/api/depoimento', '', BOM)).status).toBe(401);
    expect((await chamar(env, 'GET', '/api/depoimento', '')).status).toBe(401);
  });

  it('confere o que chega', () => {
    expect(validar({ ...BOM, texto: 'curto' }).erro).toBe('texto-curto');
    expect(validar({ ...BOM, texto: 'x'.repeat(1201) }).erro).toBe('texto-longo');
    expect(validar({ ...BOM, nomePublico: '  ' }).erro).toBe('nome-faltando');
    expect(validar({ ...BOM, forma: 'outra' }).erro).toBe('bad-request');
    expect(validar({ ...BOM, publicar: 'sim' }).erro).toBe('bad-request');
    /* Anônimo não guarda nome nem cidade. */
    expect(validar({ ...BOM, forma: 'anonimo' }).ok).toMatchObject({ nomePublico: '', cidade: '' });
    /* Quebras de parágrafo ficam; controle e espaço sobrando, não. */
    expect(validar({ ...BOM, texto: 'Primeira linha boa.\r\n\r\n\r\nSegunda\u0007 linha   boa.' }).ok!.texto)
      .toBe('Primeira linha boa.\n\nSegunda linha boa.');
  });

  it('a assinatura da prévia é a mesma do painel', () => {
    for (const d of [
      { forma: 'nome', nomePublico: 'Ana Souza', cidade: 'Recife' },
      { forma: 'iniciais', nomePublico: 'ana  souza', cidade: 'Recife' },
      { forma: 'iniciais', nomePublico: 'Élida', cidade: '' },
      { forma: 'anonimo', nomePublico: 'Ana', cidade: 'Recife' }
    ] as const) {
      const limpo = validar({ ...BOM, ...d }).ok!;
      expect(assinatura(d), d.forma).toBe(assinaturaServidor(limpo));
    }
    expect(assinatura({ forma: 'iniciais', nomePublico: 'ana souza', cidade: 'Recife' })).toBe('A. S., Recife');
    expect(assinatura({ forma: 'anonimo', nomePublico: 'Ana', cidade: 'Recife' })).toBe('Aluno do curso');
  });
});

describe('o dono lê e aprova', () => {
  it('lista para o dono, e só para ele', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: 'dono@exemplo.com' }) as Env;
    const ana = await aluno(env, 'ana@exemplo.com');
    const dono = await aluno(env, 'dono@exemplo.com', false);
    dono.cookie = await comoAdmin(env, dono.cookie);
    await chamar(env, 'PUT', '/api/depoimento', ana.cookie, BOM);
    const r = await chamar(env, 'GET', '/api/admin/depoimentos', dono.cookie);
    const { depoimentos } = await r.json() as { depoimentos: { email: string; assinatura: string }[] };
    expect(depoimentos).toHaveLength(1);
    expect(depoimentos[0]).toMatchObject({ email: 'ana@exemplo.com', assinatura: 'Ana Souza, Recife' });
    expect((await chamar(env, 'GET', '/api/admin/depoimentos', ana.cookie)).status).toBe(403);
    expect((await chamar(env, 'PUT', '/api/admin/depoimentos', ana.cookie, { id: ana.id, estado: 'aprovado' })).status).toBe(403);
  });

  it('não aprova o que o aluno não autorizou publicar', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: 'dono@exemplo.com' }) as Env;
    const ana = await aluno(env, 'ana@exemplo.com');
    const dono = await aluno(env, 'dono@exemplo.com', false);
    dono.cookie = await comoAdmin(env, dono.cookie);
    await chamar(env, 'PUT', '/api/depoimento', ana.cookie, { ...BOM, publicar: false });
    expect((await chamar(env, 'PUT', '/api/admin/depoimentos', dono.cookie, { id: ana.id, estado: 'aprovado' })).status).toBe(409);
    expect((await chamar(env, 'PUT', '/api/admin/depoimentos', dono.cookie, { id: ana.id, estado: 'recusado' })).status).toBe(200);
  });

  it('um e-mail por dia avisa o dono, só com a contagem', async () => {
    const enviados: { subject: string; text: string }[] = [];
    const env = envDeTeste({ SUPPORT_EMAIL: 'dono@exemplo.com', RESEND_API_KEY: 're_teste', EMAIL_FROM: 'site@exemplo.com' }) as Env;
    const antes = globalThis.fetch;
    globalThis.fetch = (async (_u: RequestInfo, init?: RequestInit) => {
      enviados.push(JSON.parse(String(init?.body)));
      return new Response('{"id":"x"}', { status: 200 });
    }) as typeof fetch;
    try {
      const ana = await aluno(env, 'ana@exemplo.com');
      await chamar(env, 'PUT', '/api/depoimento', ana.cookie, BOM);
      await runAlertas(env);
      await runAlertas(env);
    } finally { globalThis.fetch = antes; }
    const aviso = enviados.filter(m => /depoimento/.test(m.subject));
    expect(aviso).toHaveLength(1);
    expect(aviso[0]!.text).not.toContain(BOM.texto);
    expect(aviso[0]!.text).not.toContain('ana@exemplo.com');
  });

  it('a página é paga, no portão e no eco do SEO', () => {
    expect(isGatedPath('/depoimento/')).toBe(true);
    expect(PAGAS).toContain('/depoimento');
  });
});
