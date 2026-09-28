/* O teste A/B da capa (28/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O site não coleta analítica (ver app/src/lib/analytics.ts: os eventos
 * ficam no navegador). Este é o único contador, e é mínimo de propósito:
 * só TOTAIS por dia - quantos viram cada versão do hero, clicaram no botão,
 * chegaram ao checkout e compraram. Sem cookie, sem conta, sem IP guardado
 * (o IP só entra na chave do freio, que expira em um minuto).
 *
 * Aceita apenas o experimento, a versão e o evento conhecidos; qualquer
 * outra coisa é recusada. O relatório sai pela Action "Relatório do teste
 * A/B" (.github/workflows/relatorio-ab.yml), que lê a tabela `ab_contagens`.
 */

import { json, fail, readJson } from '../lib/http.js';
import { throttled } from '../lib/db.js';

export const EXPERIMENTOS = { 'hero-2026-09': ['a', 'b'] };
const EVENTOS = new Set(['visto', 'clique', 'checkout', 'compra']);

export async function registrar({ request, env }) {
  /* Um evento cabe em poucas dezenas de bytes. O teto de 1 KB impede que um
     anônimo faça o Worker ler e interpretar megabytes antes de recusar
     (auditoria de 28/09, SEC-005). */
  const b = await readJson(request, 1024);
  if (!b) return fail('bad-request');
  const versoes = EXPERIMENTOS[b?.exp];
  if (!versoes || !versoes.includes(b?.v) || !EVENTOS.has(b?.evento)) return fail('bad-request');

  /* Um freio contra quem quisesse inflar um lado: 30 por minuto por IP é
     muito mais do que um visitante de verdade gera. Estourado, a resposta é
     a mesma - não há o que o cliente fazer com um erro aqui. */
  const ip = (request.headers.get('CF-Connecting-IP') || '').trim() || 'desconhecido';
  if (await throttled(env, `ab:${ip}`, 30)) return json({ ok: true });

  const dia = new Date().toISOString().slice(0, 10);
  try {
    await env.DB.prepare(
      `INSERT INTO ab_contagens (exp, variante, evento, dia, n) VALUES (?, ?, ?, ?, 1)
       ON CONFLICT(exp, variante, evento, dia) DO UPDATE SET n = n + 1`
    ).bind(b.exp, b.v, b.evento, dia).run();
  } catch (e) {
    /* Um contador fora do ar não pode virar erro na capa. */
    console.error('ab', e && e.stack || e);
  }
  return json({ ok: true });
}
