/* A fase 1 da auditoria jurídica de 01/10/2026 (audit/2026-10-01/C-legal.md).
 *
 *   LEGAL-103  Termos, FAQ e /suporte acompanham as formas de pagamento DESTA
 *              publicação (`pagamento.formas` e o modo), e não só o `soPix()`;
 *   LEGAL-106  depoimento APROVADO retirado (ou conta apagada) avisa o dono;
 *   LEGAL-102/109, CONV-013  uma frase só para parcelas, prazo de resposta e
 *              confirmação da desistência.
 *
 * As páginas são renderizadas de verdade (renderToStaticMarkup) com um
 * data/empresa.json trocado, que é o que o build faz quando a Mercado Pago
 * diz que o PIX não está habilitado.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import empresaReal from '../content/empresa.json';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { createOrder, grantAccess } from '../../worker/src/lib/db.js';

type Formas = { modo: 'mercadopago' | 'pix-direto'; pix: boolean; cartao: boolean };

/** O texto que a página renderiza com estas formas de pagamento. */
async function renderiza(rota: 'termos' | 'faq' | 'suporte' | 'reembolso', f: Formas): Promise<string> {
  vi.resetModules();
  vi.doMock('@content/empresa.json', () => ({
    default: {
      ...empresaReal,
      pagamento: { ...empresaReal.pagamento, modo: f.modo, formas: { pix: f.pix, cartao: f.cartao } }
    }
  }));
  /* O convite para começar depende da sessão (useAccount); aqui só o texto. */
  vi.doMock('@/components/platform/ProximoPasso', () => ({ FaixaCta: () => null, BotaoPasso: () => null }));
  const mod = await import(`../src/app/${rota}/page.tsx`);
  const html = renderToStaticMarkup(createElement(mod.default));
  vi.doUnmock('@content/empresa.json');
  vi.doUnmock('@/components/platform/ProximoPasso');
  return html.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}

describe('LEGAL-103: o contrato e a FAQ dizem o que o checkout cobra', () => {
  it('sem PIX na conta da Mercado Pago, nem Termos nem FAQ oferecem preço no PIX', async () => {
    const f = { modo: 'mercadopago', pix: false, cartao: true } as const;
    for (const rota of ['termos', 'faq', 'suporte', 'reembolso'] as const) {
      const t = await renderiza(rota, f);
      expect(t, rota).not.toMatch(/R\$ ?132,30|\bno PIX\b|pagando por PIX/);
    }
    const termos = await renderiza('termos', f);
    expect(termos).toContain('com juros da Mercado Pago');
    expect(termos).not.toMatch(/No PIX, o acesso/);
  });

  it('sem cartão, nada de parcelas', async () => {
    const t = await renderiza('termos', { modo: 'mercadopago', pix: true, cartao: false });
    expect(t).not.toMatch(/\d+x|parcel/i);
    expect(t).toMatch(/pagando por PIX/);
  });

  it('no PIX direto, nenhuma promessa de minutos: a liberação é à mão, no prazo do atendimento', async () => {
    const f = { modo: 'pix-direto', pix: true, cartao: true } as const;
    const termos = await renderiza('termos', f);
    expect(termos).not.toMatch(/normalmente em minutos/);
    expect(termos).toMatch(/liberação é feita à mão, em até \d+ dias? úte/);
    for (const rota of ['faq', 'suporte'] as const) {
      expect(await renderiza(rota, f), rota).not.toMatch(/em minutos|alguns minutos|estorno é pedido à Mercado Pago/);
    }
  });

  it('com tudo ligado, os Termos trazem PIX, cartão com juros e a renovação', async () => {
    const t = await renderiza('termos', { modo: 'mercadopago', pix: true, cartao: true });
    expect(t).toMatch(/no PIX, ou em até \d+x com juros da Mercado Pago no cartão/);
    expect(t).toContain('somados ao fim do acesso atual');
    expect(t).toContain('Pelo site, a confirmação chega no seu e-mail na hora. Por e-mail, respondemos confirmando');
  });
});

describe('uma frase só (LEGAL-102, LEGAL-109, CONV-013, PAY-B-011)', () => {
  it('as páginas não escrevem mais o prazo nem as parcelas à mão', async () => {
    const { readFileSync } = await import('node:fs');
    const ler = (f: string) => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8');
    for (const f of [
      'app/faq/page.tsx', 'app/termos/page.tsx', 'app/suporte/page.tsx', 'app/reembolso/page.tsx',
      'components/shell/PublicShell.tsx', 'app/cursos/[slug]/CourseClient.tsx',
      'app/checkout/[slug]/CheckoutClient.tsx', 'components/landing/Fecho.tsx',
      'components/landing/BarraFixa.tsx', 'components/platform/CourseCard.tsx',
      'i18n/telas/conta-public-shell.ts', 'i18n/telas/conta-checkout-client.ts',
      'i18n/telas/conta-course-card.ts'
    ]) {
      const s = ler(f);
      expect(s, f).not.toMatch(/em até \{?\$?\{?parcelas(Max\([^)]*\))?\}?[x×]/);
      expect(s, f).not.toMatch(/mesmo dia útil|resolve na hora|confirmação de recebimento chega na hora/);
    }
    expect(ler('lib/account/types.ts')).not.toContain('resolve na hora');
    expect(ler('i18n/telas/motor-account-types.ts')).not.toContain('resolve na hora');
  });
});

/* ── LEGAL-106 ─────────────────────────────────────────────────────────── */

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (p: Promise<unknown>) => { pendentes.push(p); } };
const pendentes: Promise<unknown>[] = [];
const assentar = async () => { await Promise.all(pendentes.splice(0)); };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };

let enviados: { to: string; subject: string; text: string }[] = [];
beforeEach(() => {
  enviados = [];
  vi.stubGlobal('fetch', async (_u: string, init?: RequestInit) => {
    const b = JSON.parse(String(init?.body ?? '{}'));
    enviados.push({ to: String(Array.isArray(b.to) ? b.to[0] : b.to), subject: b.subject, text: b.text });
    return new Response('{"id":"m"}', { status: 200 });
  });
});
afterEach(() => { vi.unstubAllGlobals(); });

const envMail = () => envDeTeste({
  RESEND_API_KEY: 're_x', EMAIL_FROM: 'HF <c@hebraicofluente.com.br>',
  RESEND_BASE: 'https://api.resend.test', SUPPORT_EMAIL: 'dono@exemplo.com'
}) as Env;

async function aluna(env: Env, email: string) {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, declarouIdade: true, name: 'Ana Souza', email, password: 'senha-boa-123' }), env, ctx
  });
  await assentar();
  const cookie = cookieDe(r);
  const { id } = env.DB.bruto.prepare('SELECT id FROM accounts WHERE email = ?').get(email) as { id: number };
  const order = await createOrder(env, { accountId: id, courseSlug: 'alfabetizacao', amountCents: 14700, method: 'pix' });
  await grantAccess(env, { accountId: id, courseSlug: 'alfabetizacao', orderId: order.id, months: 12 });
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
const aprovar = (env: Env, id: number) =>
  env.DB.bruto.prepare("UPDATE depoimentos SET estado = 'aprovado' WHERE account_id = ?").run(id);

describe('LEGAL-106: depoimento aprovado retirado avisa o dono', () => {
  it('retirar um APROVADO manda e-mail ao dono com a data-limite', async () => {
    const env = envMail();
    const ana = await aluna(env, 'ana@exemplo.com.br');
    await chamar(env, 'PUT', '/api/depoimento', ana.cookie, BOM);
    aprovar(env, ana.id);
    enviados = [];
    expect((await chamar(env, 'DELETE', '/api/depoimento', ana.cookie)).status).toBe(200);
    await assentar();
    const aviso = enviados.filter(e => e.to === 'dono@exemplo.com');
    expect(aviso).toHaveLength(1);
    expect(aviso[0]!.subject).toMatch(/retirar um depoimento do site até \d{2}\/\d{2}\/\d{4}/);
    expect(aviso[0]!.text).toContain('Ana Souza, Recife');
    expect(aviso[0]!.text).not.toContain('ana@exemplo.com.br');
    const trilha = env.DB.bruto.prepare("SELECT detail FROM access_log WHERE action = 'depoimento-aprovado-retirado'").all();
    expect(trilha).toEqual([{ detail: 'retirado' }]);
  });

  it('retirar um que NÃO foi aprovado não incomoda o dono', async () => {
    const env = envMail();
    const ana = await aluna(env, 'ana@exemplo.com.br');
    await chamar(env, 'PUT', '/api/depoimento', ana.cookie, BOM);
    enviados = [];
    await chamar(env, 'DELETE', '/api/depoimento', ana.cookie);
    await assentar();
    expect(enviados.filter(e => e.to === 'dono@exemplo.com')).toEqual([]);
  });

  it('apagar a conta com depoimento APROVADO também avisa', async () => {
    const env = envMail();
    const ana = await aluna(env, 'ana@exemplo.com.br');
    await chamar(env, 'PUT', '/api/depoimento', ana.cookie, BOM);
    aprovar(env, ana.id);
    enviados = [];
    const r = await chamar(env, 'POST', '/api/auth/delete', ana.cookie, { password: 'senha-boa-123' });
    expect(r.status).toBe(200);
    await assentar();
    const aviso = enviados.filter(e => e.to === 'dono@exemplo.com');
    expect(aviso).toHaveLength(1);
    expect(aviso[0]!.text).toContain('apagou a conta');
    expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM depoimentos').get()).toEqual({ n: 0 });
  });

  it('sem SUPPORT_EMAIL, vai para o primeiro administrador', async () => {
    const env = envDeTeste({
      RESEND_API_KEY: 're_x', EMAIL_FROM: 'HF <c@hebraicofluente.com.br>',
      RESEND_BASE: 'https://api.resend.test', ADMIN_EMAILS: 'admin1@exemplo.com, admin2@exemplo.com'
    }) as Env;
    const ana = await aluna(env, 'ana@exemplo.com.br');
    await chamar(env, 'PUT', '/api/depoimento', ana.cookie, BOM);
    aprovar(env, ana.id);
    enviados = [];
    await chamar(env, 'DELETE', '/api/depoimento', ana.cookie);
    await assentar();
    expect(enviados.map(e => e.to)).toContain('admin1@exemplo.com');
  });
});
