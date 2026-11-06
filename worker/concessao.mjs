/* A liberação de um pagamento, com os três caminhos chegando JUNTOS.
 * ─────────────────────────────────────────────────────────────────────────
 * O webhook, a tela do comprador (/api/pay/verify, a cada três segundos) e a
 * varredura do cron podem ver o mesmo pagamento aprovado no mesmo instante.
 * Cada um passa por `applyPayment`, e a conferência "este pedido já concedeu?"
 * era uma leitura separada da concessão: dois caminhos liam "não" antes de
 * qualquer um gravar, e o pedido de 12 meses virava 24. Um estorno depois
 * recuava só 12 - o comprador ficava com um ano de graça.
 *
 * Este teste roda o `pay.js` de verdade contra um SQLite em memória com o
 * worker/schema.sql de verdade, e a Mercado Pago e a Resend de mentira. Cada
 * consulta ao "D1" cede a vez antes de executar, como uma ida à rede, para
 * que as chamadas simultâneas se intercalem como em produção.
 *
 *   node worker/concessao.mjs
 *
 * Precisa de Node 22.13+ (node:sqlite). Não precisa de wrangler nem de rede.
 */

import { register } from 'node:module';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

/* O Worker importa JSON sem atributo (o wrangler empacota); o Node exige o
   atributo. Este gancho entrega o JSON como um módulo comum. */
register('data:text/javascript,' + encodeURIComponent(`
  import { readFileSync } from 'node:fs';
  import { fileURLToPath } from 'node:url';
  export async function load(url, ctx, next) {
    if (url.endsWith('.json')) {
      return { format: 'module', shortCircuit: true,
        source: 'export default ' + readFileSync(fileURLToPath(url), 'utf8') };
    }
    return next(url, ctx);
  }
`));

const { settleFromPaymentId, settleFromProvider } = await import('./src/api/pay.js');
const { getCourse, priceCents } = await import('./src/lib/catalog.js');

/* ── um D1 de mentira sobre node:sqlite ─────────────────────────────────── */

const cede = () => new Promise(r => setImmediate(r));

function fakeD1() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const stmt = (sql, args) => ({
    sql, args,
    bind: (...a) => stmt(sql, a),
    async first() { await cede(); return db.prepare(sql).get(...args) ?? null; },
    async all() { await cede(); return { results: db.prepare(sql).all(...args) }; },
    async run() {
      await cede();
      const r = db.prepare(sql).run(...args);
      return { success: true, meta: { changes: Number(r.changes) } };
    }
  });
  return {
    raw: db,
    prepare: sql => stmt(sql, []),
    async batch(list) {
      await cede();
      db.exec('BEGIN');
      try {
        const out = list.map(s => {
          const r = db.prepare(s.sql).run(...s.args);
          return { success: true, meta: { changes: Number(r.changes) } };
        });
        db.exec('COMMIT');
        return out;
      } catch (e) { db.exec('ROLLBACK'); throw e; }
    }
  };
}

/* ── a Mercado Pago e a Resend de mentira ───────────────────────────────── */

let pagamento = null;
let emails = 0, assunto = '';
globalThis.fetch = async (url, init) => {
  const u = String(url);
  await cede();
  if (u.startsWith('https://api.mercadopago.com/v1/payments/search')) {
    return Response.json({ results: pagamento ? [pagamento] : [] });
  }
  if (u.startsWith('https://api.mercadopago.com/v1/payments/')) {
    return Response.json(pagamento);
  }
  if (u.startsWith('https://api.resend.com/')) {
    emails++;
    assunto = JSON.parse(init.body).subject;
    return Response.json({ id: 'fake' });
  }
  throw new Error('fetch inesperado: ' + u);
};

/* ── o cenário ──────────────────────────────────────────────────────────── */

let falhas = 0;
const confere = (bom, texto) => {
  if (!bom) falhas++;
  console.log(`  ${bom ? '✓' : '✗'} ${texto}`);
};

const MES = 30.44 * 86_400_000;

async function cenario(titulo, { jaTinhaMeses = 0, escalonar = 0 } = {}) {
  console.log(titulo);
  const D1 = fakeD1();
  const env = {
    DB: D1, MP_ACCESS_TOKEN: 'APP_USR-1-1-a-1',
    RESEND_API_KEY: 're_fake', EMAIL_FROM: 'Teste <t@example.invalid>',
    SITE_ORIGIN: 'https://example.invalid'
  };
  emails = 0;

  const course = getCourse('alfabetizacao');
  const cents = priceCents(course, 'pix');
  const agora = Date.now();

  D1.raw.prepare(`INSERT INTO accounts (id, email, name, pass_hash, pass_salt, pass_iter, created_at)
                  VALUES (1, 'a@example.invalid', 'Ana', 'x', 'y', 1, ?)`).run(agora);
  if (jaTinhaMeses) {
    D1.raw.prepare(`INSERT INTO entitlements (account_id, course_slug, granted_at, expires_at, order_id)
                    VALUES (1, 'alfabetizacao', ?, ?, 'HFANTIGO')`)
      .run(agora, Math.round(agora + jaTinhaMeses * MES));
  }
  D1.raw.prepare(`INSERT INTO orders (id, account_id, course_slug, amount_cents, currency, method,
                                      installments, status, provider, created_at)
                  VALUES ('HFNOVO', 1, 'alfabetizacao', ?, 'BRL', 'pix', 1, 'pending', 'mercadopago', ?)`)
    .run(cents, agora - 120_000);

  pagamento = {
    id: 987654321, status: 'approved', transaction_amount: cents / 100,
    transaction_amount_refunded: 0, currency_id: 'BRL', external_reference: 'HFNOVO'
  };

  /* O webhook, a tela e a varredura, todos de uma vez - duas vezes cada. */
  const order = D1.raw.prepare(`SELECT * FROM orders WHERE id = 'HFNOVO'`).get();
  /* `escalonar` atrasa cada caminho alguns passos em relação ao anterior:
     chegando exatamente juntos, as concessões leem a mesma validade e se
     sobrepõem; um pouco defasadas, cada uma estende a anterior. */
  const caminhos = [
    () => settleFromPaymentId(env, '987654321', 'webhook'),
    () => settleFromProvider(env, { ...order }, 'verify'),
    () => settleFromProvider(env, { ...order }, 'reconcile'),
    () => settleFromPaymentId(env, '987654321', 'webhook'),
    () => settleFromProvider(env, { ...order }, 'verify'),
    () => settleFromProvider(env, { ...order }, 'reconcile')
  ];
  const r = await Promise.all(caminhos.map(async (f, i) => {
    for (let k = 0; k < i * escalonar; k++) await cede();
    return f();
  }));

  const ent = D1.raw.prepare(`SELECT * FROM entitlements WHERE account_id = 1`).get();
  const pedido = D1.raw.prepare(`SELECT status FROM orders WHERE id = 'HFNOVO'`).get();
  const meses = (ent.expires_at - agora) / MES;
  const esperado = jaTinhaMeses + course.accessMonths;
  const pagos = D1.raw.prepare(`SELECT COUNT(*) AS n FROM access_log WHERE action = 'paid'`).get().n;
  const concessoes = D1.raw.prepare(`SELECT COUNT(*) AS n FROM access_log WHERE action = 'grant'`).get().n;

  confere(r.every(x => x === 'paid'), `os seis caminhos respondem 'paid' (${r.join(', ')})`);
  confere(pedido.status === 'paid', 'o pedido fica pago');
  confere(ent.order_id === 'HFNOVO', 'o acesso aponta para este pedido');
  confere(Math.abs(meses - esperado) < 0.5,
    `a validade é ${esperado.toFixed(1)} meses a partir de hoje (veio ${meses.toFixed(1)})`);
  confere(concessoes === 1, `uma concessão só (veio ${concessoes})`);
  confere(pagos === 1, `uma linha 'paid' na trilha (veio ${pagos})`);
  confere(emails === 1, `um recibo só (veio ${emails})`);
  const renovou = assunto.startsWith('Acesso renovado');
  confere(renovou === !!jaTinhaMeses,
    `o recibo diz ${jaTinhaMeses ? 'renovação' : 'primeira compra'} ("${assunto}")`);

  /* Um reenvio depois de tudo assentado não mexe em nada. */
  const antes = ent.expires_at;
  await settleFromPaymentId(env, '987654321', 'webhook');
  const depois = D1.raw.prepare(`SELECT expires_at FROM entitlements WHERE account_id = 1`).get().expires_at;
  confere(depois === antes, 'um aviso repetido depois não estende a validade');
  confere(emails === 1, 'nem manda outro recibo');
}

await cenario('Primeira compra, seis liberações simultâneas');
await cenario('Primeira compra, seis liberações quase simultâneas', { escalonar: 1 });
await cenario('Renovação com 20 dias sobrando, seis liberações simultâneas', { jaTinhaMeses: 20 / 30.44 });
await cenario('Renovação com 20 dias sobrando, seis liberações quase simultâneas',
  { jaTinhaMeses: 20 / 30.44, escalonar: 1 });

/* Uma liberação que caiu entre gravar o acesso e marcar o pedido: o reenvio
   tem de terminar o serviço sem conceder de novo. */
{
  console.log('Liberação interrompida, retomada pelo reenvio');
  const D1 = fakeD1();
  const env = {
    DB: D1, MP_ACCESS_TOKEN: 'APP_USR-1-1-a-1',
    RESEND_API_KEY: 're_fake', EMAIL_FROM: 'Teste <t@example.invalid>'
  };
  emails = 0;
  const course = getCourse('alfabetizacao');
  const cents = priceCents(course, 'pix');
  const agora = Date.now();
  D1.raw.prepare(`INSERT INTO accounts (id, email, name, pass_hash, pass_salt, pass_iter, created_at)
                  VALUES (1, 'a@example.invalid', 'Ana', 'x', 'y', 1, ?)`).run(agora);
  const vence = Math.round(agora + course.accessMonths * MES);
  D1.raw.prepare(`INSERT INTO entitlements (account_id, course_slug, granted_at, expires_at, order_id)
                  VALUES (1, 'alfabetizacao', ?, ?, 'HFNOVO')`).run(agora, vence);
  D1.raw.prepare(`INSERT INTO orders (id, account_id, course_slug, amount_cents, currency, method,
                                      installments, status, provider, created_at)
                  VALUES ('HFNOVO', 1, 'alfabetizacao', ?, 'BRL', 'pix', 1, 'pending', 'mercadopago', ?)`)
    .run(cents, agora - 60_000);
  pagamento = {
    id: 5, status: 'approved', transaction_amount: cents / 100,
    currency_id: 'BRL', external_reference: 'HFNOVO'
  };
  const r = await settleFromPaymentId(env, '5', 'webhook');
  const ent = D1.raw.prepare(`SELECT expires_at FROM entitlements WHERE account_id = 1`).get();
  const pedido = D1.raw.prepare(`SELECT status FROM orders WHERE id = 'HFNOVO'`).get();
  confere(r === 'paid' && pedido.status === 'paid', 'o pedido termina pago');
  confere(ent.expires_at === vence, 'a validade não muda');
  confere(emails === 1 && assunto.startsWith('Seu acesso está liberado'),
    `o recibo sai, como primeira compra ("${assunto}")`);
}

/* ── o estorno, com os três caminhos chegando JUNTOS ─────────────────────────
 * O mesmo defeito, do outro lado. O estorno lia "o pedido está pago?", recuava
 * os meses e só então marcava o pedido. Dois avisos de estorno simultâneos
 * liam "pago" os dois e recuavam duas vezes: quem tinha renovado perdia,
 * junto com os 12 meses devolvidos, os 12 da compra anterior, que ninguém
 * devolveu. */
async function estorno(titulo, { anterior = false, escalonar = 0 } = {}) {
  console.log(titulo);
  const D1 = fakeD1();
  const env = { DB: D1, MP_ACCESS_TOKEN: 'APP_USR-1-1-a-1' };
  const course = getCourse('alfabetizacao');
  const cents = priceCents(course, 'pix');
  const agora = Date.now();

  D1.raw.prepare(`INSERT INTO accounts (id, email, name, pass_hash, pass_salt, pass_iter, created_at)
                  VALUES (1, 'a@example.invalid', 'Ana', 'x', 'y', 1, ?)`).run(agora);

  /* Com `anterior`, a conta tinha 8 meses de uma compra antiga e renovou:
     a linha vale 8 + 12 = 20 meses e aponta para o pedido novo. */
  const sobra = anterior ? 8 : 0;
  const vale = new Date(agora);
  vale.setMonth(vale.getMonth() + sobra + course.accessMonths);
  D1.raw.prepare(`INSERT INTO entitlements (account_id, course_slug, granted_at, expires_at, order_id)
                  VALUES (1, 'alfabetizacao', ?, ?, 'HFNOVO')`).run(agora, vale.getTime());
  D1.raw.prepare(`INSERT INTO orders (id, account_id, course_slug, amount_cents, currency, method,
                                      installments, status, provider, provider_ref, paid_at, created_at)
                  VALUES ('HFNOVO', 1, 'alfabetizacao', ?, 'BRL', 'pix', 1, 'paid', 'mercadopago',
                          '777', ?, ?)`)
    .run(cents, agora, agora - 60_000);

  pagamento = {
    id: 777, status: 'refunded', transaction_amount: cents / 100,
    transaction_amount_refunded: cents / 100, currency_id: 'BRL', external_reference: 'HFNOVO'
  };

  const order = D1.raw.prepare(`SELECT * FROM orders WHERE id = 'HFNOVO'`).get();
  const caminhos = [
    () => settleFromPaymentId(env, '777', 'webhook'),
    () => settleFromProvider(env, { ...order }, 'verify'),
    () => settleFromProvider(env, { ...order }, 'reconcile'),
    () => settleFromPaymentId(env, '777', 'webhook'),
    () => settleFromProvider(env, { ...order }, 'verify'),
    () => settleFromProvider(env, { ...order }, 'reconcile')
  ];
  const r = await Promise.all(caminhos.map(async (f, i) => {
    for (let k = 0; k < i * escalonar; k++) await cede();
    return f();
  }));

  const ent = D1.raw.prepare(`SELECT * FROM entitlements WHERE account_id = 1`).get();
  const pedido = D1.raw.prepare(`SELECT status FROM orders WHERE id = 'HFNOVO'`).get();
  const estornos = D1.raw.prepare(`SELECT COUNT(*) AS n FROM access_log WHERE action = 'estorno'`).get().n;

  confere(r.every(x => x === 'refunded'), `os seis caminhos respondem 'refunded' (${r.join(', ')})`);
  confere(pedido.status === 'refunded', 'o pedido fica estornado');
  confere(estornos === 1, `um estorno só na trilha (veio ${estornos})`);
  if (anterior) {
    const esperado = new Date(agora);
    esperado.setMonth(esperado.getMonth() + sobra);
    confere(!!ent && ent.expires_at === esperado.getTime(),
      `sobram os ${sobra} meses da compra anterior (veio ${ent ? ((ent.expires_at - agora) / MES).toFixed(1) : 'nada'})`);
  } else {
    confere(!ent, 'o acesso some');
  }

  /* E um aviso de estorno repetido depois não tira mais nada. */
  await settleFromPaymentId(env, '777', 'webhook');
  const depois = D1.raw.prepare(`SELECT expires_at FROM entitlements WHERE account_id = 1`).get();
  confere((depois && depois.expires_at) === (ent && ent.expires_at),
    'um aviso repetido depois não recua de novo');
}

await estorno('Estorno da única compra, seis avisos simultâneos');
await estorno('Estorno de uma renovação, seis avisos simultâneos', { anterior: true });
await estorno('Estorno de uma renovação, seis avisos quase simultâneos', { anterior: true, escalonar: 1 });

console.log(falhas ? `\n${falhas} falha(s).` : '\nTudo certo.');
process.exit(falhas ? 1 : 0);
