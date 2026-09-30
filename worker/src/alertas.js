/* Os alertas ao dono.
 * ─────────────────────────────────────────────────────────────────────────
 * Até 28/09/2026 o dono só descobria um problema quando um aluno reclamava
 * (auditoria, INFRA-002: "20 pagamentos falhando, webhook parando: só quando
 * o cliente reclamar"). Isto roda na mesma varredura de 5 em 5 minutos
 * (worker/src/worker.js → scheduled) e faz três coisas:
 *
 *   1. marca o BATIMENTO da varredura. /api/health responde `monitor: false`
 *      se ela parou há mais de 15 minutos - e o monitor externo de
 *      disponibilidade, que consulta /api/health, avisa. Um Worker fora do ar
 *      não consegue mandar e-mail sobre si mesmo; o monitor externo consegue.
 *
 *   2. ERROS DE PAGAMENTO na última hora: pedido que não nasceu na Mercado
 *      Pago, liberação que falhou, pagamento com valor errado, e-mail de
 *      compra que não saiu, estorno recusado, cobrança em dobro (o mesmo
 *      pedido pago duas vezes, ou dois pedidos do mesmo curso pagos em 24 h).
 *      Passou do limite, sai UM e-mail
 *      por hora com as contagens (nunca um a cada 5 minutos).
 *
 *   3. DESISTÊNCIAS sem estorno resolvido: manual, erro, ou mais de um dia
 *      sem a Mercado Pago confirmar. Um lembrete por dia, com a lista, até
 *      não sobrar nenhuma. É o que garante o prazo do CDC mesmo quando o
 *      estorno automático não pôde agir.
 *
 * Nada aqui lança: um alerta que falha não pode derrubar a varredura, que é
 * a rede de segurança dos pagamentos.
 */

import {
  avisosPurge, bater, contarAcoes, estornosAbertos, reservarAviso, soltarAviso
} from './lib/db.js';
import { mailReady, mensagemDeAlerta, reaisBR, sendMail } from './lib/mail.js';
import { novosDesde } from './api/depoimentos.js';
import { estatisticasPurge } from './api/estatisticas.js';

/** Quantas vezes, na última hora, cada erro precisa aparecer para virar
 *  alerta. Um só já basta para os que nunca deveriam acontecer. */
export const LIMITES = {
  'pay-create-failed': 3,       // o checkout não conseguiu criar a cobrança
  'settle-error': 1,            // a liberação de acesso falhou
  'pay-mismatch': 1,            // pagamento com valor ou moeda errados
  'compra-email-falhou': 1,     // o recibo da compra não saiu
  'estorno-falhou': 3,          // a Mercado Pago recusou estornos
  'reconcile-error': 3,         // a varredura não conseguiu consultar pedidos
  'webhook-bad-signature': 20,  // avisos com assinatura errada: segredo trocado?
  'pagamento-duplicado': 1,     // o mesmo pedido pago duas vezes
  'pedido-duplicado': 1         // dois pedidos do mesmo curso pagos em 24 h
};

const DESCRICAO = {
  'pay-create-failed': 'cobranças que não nasceram na Mercado Pago (checkout falhando)',
  'settle-error': 'liberações de acesso que falharam',
  'pay-mismatch': 'pagamentos com valor ou moeda diferentes do pedido',
  'compra-email-falhou': 'recibos de compra que não saíram',
  'estorno-falhou': 'estornos recusados pela Mercado Pago',
  'reconcile-error': 'erros da varredura de pagamentos',
  'webhook-bad-signature': 'avisos da Mercado Pago com assinatura inválida (o segredo do webhook mudou?)',
  'pagamento-duplicado': 'pedidos pagos duas vezes (estornar o segundo pagamento)',
  'pedido-duplicado': 'alunos que pagaram dois pedidos do mesmo curso em 24 h (confirmar e estornar um)'
};

/** O dia e a hora em Brasília, para as chaves dos avisos. */
const brasilia = ms => new Date(ms - 3 * 3_600_000).toISOString();

export async function runAlertas(env, at = Date.now()) {
  await bater(env, 'varredura', at);
  try { await alertaDeErros(env, at); } catch (e) { console.error('alertas', e && e.stack || e); }
  try { await lembreteDeDesistencias(env, at); } catch (e) { console.error('alertas', e && e.stack || e); }
  try { await alertaDeCompartilhamento(env, at); } catch (e) { console.error('alertas', e && e.stack || e); }
  try { await avisoDeDepoimentos(env, at); } catch (e) { console.error('alertas', e && e.stack || e); }
  try { await avisosPurge(env, at); } catch { /* idem */ }
  try { await estatisticasPurge(env, at); } catch { /* idem */ }
}

async function enviarAoDono(env, chave, msg) {
  const dono = String(env.SUPPORT_EMAIL || '').trim();
  if (!dono || !mailReady(env)) return false;
  if (!await reservarAviso(env, chave)) return false;   // já mandado nesta janela
  const r = await sendMail(env, { to: dono, ...msg });
  if (!r || !r.ok) { await soltarAviso(env, chave); return false; }
  return true;
}

async function alertaDeErros(env, at) {
  const contagem = await contarAcoes(env, Object.keys(LIMITES), at - 3_600_000);
  const acima = Object.entries(LIMITES).filter(([acao, lim]) => (contagem[acao] || 0) >= lim);
  if (!acima.length) return;
  const hora = brasilia(at).slice(0, 13);                  // 2026-09-28T14
  await enviarAoDono(env, `operacao:${hora}`, mensagemDeAlerta({
    assunto: 'problemas de pagamento na última hora',
    linhas: [
      'Na última hora o site registrou:',
      ...acima.map(([acao]) => `- ${contagem[acao]} ${DESCRICAO[acao]}`),
      '',
      'Para ver os detalhes: GitHub -> Actions -> Acesso -> Run workflow -> "pagamento".',
      'Este aviso sai no máximo uma vez por hora.'
    ]
  }));
}

/* Contas que entraram mais de seis vezes em 24 horas (lib/aparelhos.js): o
   rastro de um login dividido, com as pessoas se derrubando. Um e-mail por
   dia, com a lista. Nada é bloqueado: os Termos (artigo 4) pedem aviso ao
   aluno e 5 dias úteis para ele responder antes de qualquer suspensão. */
async function alertaDeCompartilhamento(env, at) {
  const { results } = await env.DB.prepare(
    `SELECT a.email, COUNT(*) AS dias
       FROM access_log l JOIN accounts a ON a.id = l.account_id
      WHERE l.action = 'aparelhos-rodizio' AND l.created_at >= ?
      GROUP BY l.account_id ORDER BY dias DESC LIMIT 20`
  ).bind(at - 86_400_000).all();
  if (!results || !results.length) return;
  const dia = brasilia(at).slice(0, 10);
  await enviarAoDono(env, `compartilhamento:${dia}`, mensagemDeAlerta({
    assunto: `${results.length} conta(s) com sinal de login dividido`,
    linhas: [
      'Estas contas entraram mais de seis vezes nas últimas 24 horas. Como cada conta',
      'fica conectada em no máximo três aparelhos, isso costuma ser um login dividido',
      'entre pessoas que se derrubam umas às outras:',
      ...results.map(r => `- ${r.email}`),
      '',
      'Nada foi bloqueado. Se quiser agir, os Termos (artigo 4) pedem: avisar o aluno por',
      'e-mail dizendo o que foi observado e esperar 5 dias úteis pela resposta. Para ver o',
      'histórico da conta: GitHub -> Actions -> Acesso -> "consultar".',
      'Este aviso sai no máximo uma vez por dia.'
    ]
  }));
}

/* Depoimentos novos ou editados nas últimas 24 horas (api/depoimentos.js).
   Um e-mail por dia, só com a contagem: o texto e o nome ficam no painel,
   que exige a conta de administrador. */
async function avisoDeDepoimentos(env, at) {
  const n = await novosDesde(env, at - 86_400_000);
  if (!n) return;
  const dia = brasilia(at).slice(0, 10);
  await enviarAoDono(env, `depoimentos:${dia}`, mensagemDeAlerta({
    assunto: `${n} depoimento(s) novo(s) para ler`,
    linhas: [
      `Nas últimas 24 horas chegaram ${n} depoimento(s) novo(s) ou editado(s).`,
      'Para ler e aprovar: /admin/depoimentos (entre com a conta de administrador).',
      'Só dá para aprovar o que o aluno autorizou publicar.',
      'Este aviso sai no máximo uma vez por dia.'
    ]
  }));
}

async function lembreteDeDesistencias(env, at) {
  const abertos = await estornosAbertos(env, at);
  if (!abertos.length) return;
  const dia = brasilia(at).slice(0, 10);                   // 2026-09-28
  const estadoPt = {
    manual: 'estorno com você', erro: 'o estorno automático falhou',
    pendente: 'estorno automático ainda tentando', pedido: 'a Mercado Pago ainda não confirmou'
  };
  await enviarAoDono(env, `desistencias:${dia}`, mensagemDeAlerta({
    assunto: `${abertos.length} desistência(s) sem estorno resolvido`,
    linhas: [
      'Desistências pedidas pelo site que ainda não terminaram com o dinheiro devolvido:',
      ...abertos.map(e =>
        `- pedido ${e.order_id} · ${e.email || 'conta apagada'} · ${reaisBR(e.amount_cents)} · ` +
        `${estadoPt[e.estado] || e.estado}${e.erro ? ` (${e.erro})` : ''}`),
      '',
      'O CDC pede a devolução imediata. Para os marcados "com você" ou "falhou": devolva pelo',
      'painel da Mercado Pago (Atividade -> o pagamento -> Devolver dinheiro); quando ela',
      'confirmar, o acesso fecha sozinho e o pedido sai desta lista.',
      'Este lembrete sai uma vez por dia enquanto houver pendência.'
    ]
  }));
}
