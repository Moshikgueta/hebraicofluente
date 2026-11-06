#!/usr/bin/env node
/* paddle-confere.mjs - as chaves do Paddle estão certas? (PLANO-INGLES.md, etapa 5)
 * ─────────────────────────────────────────────────────────────────────────
 * Pergunta ao próprio Paddle, sem criar nada, o que costuma estar errado no
 * dia em que as chaves chegam:
 *
 *   1. a chave da API autentica (GET /event-types);
 *   2. o token do Paddle.js é do MESMO ambiente da chave (test_ com sandbox,
 *      live_ com produção): trocados, o checkout abre e recusa todo cartão;
 *   3. existe um destino de notificação ativo apontando para
 *      <SITE_ORIGIN>/api/pay/paddle, com os quatro eventos que o Worker lê;
 *   4. o SITE_ORIGIN não é o endereço provisório.
 *
 * O "default payment link" (Checkout > Checkout settings) não aparece na API:
 * fica no roteiro (TESTE-PADDLE.md) para conferir no painel.
 *
 * Uso (da raiz):
 *   PADDLE_API_KEY=pdl_sdbx_... PADDLE_CLIENT_TOKEN=test_... node scripts/paddle-confere.mjs
 *
 * O PADDLE_CLIENT_TOKEN e o SITE_ORIGIN vêm do wrangler.toml quando não estão
 * no ambiente. Sai com código 1 se algo estiver errado. Não imprime chave
 * nenhuma, só o prefixo.
 */

import { readFileSync } from 'node:fs';

export const EVENTOS = ['transaction.completed', 'transaction.paid', 'adjustment.created', 'adjustment.updated'];

const doToml = (toml, nome) => {
  const m = toml.match(new RegExp(`^\\s*${nome}\\s*=\\s*"([^"]*)"`, 'm'));
  return m ? m[1] : '';
};

/** Confere tudo e devolve as linhas do relatório e se passou. */
export async function conferir({ chave, token, origem, buscar = fetch }) {
  const linhas = [];
  let ok = true;
  const bom = m => linhas.push(`  ✓ ${m}`);
  const ruim = m => { linhas.push(`  ✗ ${m}`); ok = false; };

  chave = String(chave || '').trim();
  token = String(token || '').trim();
  origem = String(origem || '').replace(/\/+$/, '');

  if (!chave) return { ok: false, linhas: ['  ✗ PADDLE_API_KEY ausente'] };
  const sandbox = /^pdl_sdbx_/.test(chave);
  const producao = /^pdl_live_/.test(chave);
  if (!sandbox && !producao) ruim('a chave não tem o formato do Paddle Billing (pdl_sdbx_... ou pdl_live_...)');
  else bom(`chave de ${sandbox ? 'SANDBOX (teste, não cobra)' : 'PRODUÇÃO (cobra de verdade)'}`);

  if (!token) ruim('PADDLE_CLIENT_TOKEN vazio: o checkout fica desligado');
  else if (sandbox ? !token.startsWith('test_') : !token.startsWith('live_')) {
    ruim(`o token do Paddle.js (${token.slice(0, 5)}...) é de outro ambiente que a chave: troque um dos dois`);
  } else bom('o token do Paddle.js é do mesmo ambiente da chave');

  if (!origem || /\.invalid$/.test(new URL(origem || 'https://x.invalid').hostname)) {
    ruim(`SITE_ORIGIN ainda é o provisório (${origem || 'vazio'}): o aviso do Paddle não tem para onde ir`);
  } else bom(`SITE_ORIGIN: ${origem}`);

  const base = sandbox ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';
  const get = async caminho => {
    const r = await buscar(base + caminho, { headers: { Authorization: `Bearer ${chave}` } });
    let corpo = null;
    try { corpo = await r.json(); } catch { /* vazio */ }
    return { status: r.status, corpo };
  };

  const tipos = await get('/event-types');
  if (tipos.status !== 200) {
    const codigo = tipos.corpo && tipos.corpo.error && tipos.corpo.error.code;
    ruim(`o Paddle recusou a chave (${tipos.status}${codigo ? ` ${codigo}` : ''})`);
    return { ok: false, linhas };
  }
  bom('a chave autentica');

  const destinos = await get('/notification-settings');
  if (destinos.status !== 200) {
    ruim(`não deu para ler os destinos de notificação (${destinos.status}): a chave precisa de leitura em "notification settings"`);
    return { ok, linhas };
  }
  const alvo = `${origem}/api/pay/paddle`;
  const lista = (destinos.corpo && destinos.corpo.data) || [];
  const certo = lista.find(d => d && d.destination === alvo);
  if (!certo) {
    const outros = lista.map(d => d && d.destination).filter(Boolean);
    ruim(`nenhum destino de notificação aponta para ${alvo}${outros.length ? ` (há: ${outros.join(', ')})` : ''}`);
  } else {
    if (certo.active === false) ruim('o destino de notificação existe, mas está desativado');
    else bom(`o aviso vai para ${alvo}`);
    const tem = new Set((certo.subscribed_events || []).map(e => (typeof e === 'string' ? e : e && e.name)));
    const faltam = EVENTOS.filter(e => !tem.has(e));
    if (faltam.length) ruim(`faltam eventos no destino: ${faltam.join(', ')}`);
    else bom(`os quatro eventos estão marcados (${EVENTOS.join(', ')})`);
  }
  return { ok, linhas };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let toml = '';
  try { toml = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8'); } catch { /* sem toml */ }
  const r = await conferir({
    chave: process.env.PADDLE_API_KEY,
    token: process.env.PADDLE_CLIENT_TOKEN || doToml(toml, 'PADDLE_CLIENT_TOKEN'),
    origem: process.env.SITE_ORIGIN || doToml(toml, 'SITE_ORIGIN')
  });
  console.log('O Paddle desta implantação');
  console.log(r.linhas.join('\n'));
  console.log(r.ok ? '\ntudo certo.' : '\nhá o que consertar (acima).');
  process.exit(r.ok ? 0 : 1);
}
