/* Onde os alunos erram e onde param (30/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O dono do curso não tinha como saber qual exercício trava a turma nem em
 * que lição as pessoas desistem: os eventos de aprendizagem ficavam no
 * navegador de cada aluno. Agora o app manda, em lote, só CONTAGENS:
 *
 *   · resposta   - tipo do exercício, lição, certa ou errada;
 *   · etapa      - lição e etapa, só na PRIMEIRA vez que ela é concluída
 *                  (repetir uma etapa não conta de novo: o funil é de
 *                  alunos, não de cliques).
 *
 * O que é guardado é uma linha por dia e por chave, com um contador:
 * `estatisticas (dia, chave, n)`. Nenhuma linha tem conta, e-mail, IP,
 * aparelho ou horário - somar os contadores de um dia não diz quem fez o
 * quê. A sessão só é conferida para barrar lixo de fora; ela não é gravada.
 * As linhas saem depois de um ano (alertas.js).
 *
 * Quem lê é o dono, em /admin/estatisticas.
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import { throttled } from '../lib/db.js';
import { exigirAdmin } from '../lib/admin.js';
import { requireAccount } from './auth.js';

const ID = /^[a-z0-9-]{1,40}$/;
const MAX_EVENTOS = 60;
export const GUARDA_DIAS = 365;
const DIA_MS = 86_400_000;

const hojeBrasilia = (at = Date.now()) => new Date(at - 3 * 3_600_000).toISOString().slice(0, 10);

/** O evento do app vira uma chave de contador, ou null se não serve. */
export function chaveDe(ev) {
  if (!ev || typeof ev !== 'object') return null;
  const l = String(ev.l ?? '');
  if (!ID.test(l)) return null;
  if (ev.e === 'resposta') {
    const k = String(ev.k ?? '');
    if (!ID.test(k) || typeof ev.c !== 'boolean') return null;
    return `r|${k}|${l}|${ev.c ? 1 : 0}`;
  }
  if (ev.e === 'etapa') {
    const s = Number(ev.s);
    if (!Number.isInteger(s) || s < 1 || s > 5) return null;
    return `e|${l}|${s}`;
  }
  return null;
}

/** POST /api/estatisticas {eventos:[...]} - sempre 204, a não ser sem sessão. */
export async function registrar({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();
  if (await throttled(env, `estat:${account.id}`, 30, 60_000)) return new Response(null, { status: 204 });
  const b = await readJson(request, 16 * 1024);
  const eventos = b && Array.isArray(b.eventos) ? b.eventos.slice(0, MAX_EVENTOS) : [];
  const soma = new Map();
  for (const ev of eventos) {
    const k = chaveDe(ev);
    if (k) soma.set(k, (soma.get(k) || 0) + 1);
  }
  if (!soma.size) return new Response(null, { status: 204 });
  const dia = hojeBrasilia();
  try {
    await env.DB.batch([...soma].map(([chave, n]) => env.DB.prepare(
      `INSERT INTO estatisticas (dia, chave, n) VALUES (?1, ?2, ?3)
       ON CONFLICT(dia, chave) DO UPDATE SET n = n + ?3`
    ).bind(dia, chave, n)));
  } catch (e) {
    /* Estatística perdida não é problema do aluno. */
    console.error('estatisticas', e && e.stack || e);
  }
  return new Response(null, { status: 204 });
}

/** GET /api/admin/estatisticas?dias=30 - as somas do período. */
export async function ler({ request, env }) {
  const { erro } = await exigirAdmin(request, env);
  if (erro) return erro;
  const dias = Math.min(GUARDA_DIAS, Math.max(1, Number(new URL(request.url).searchParams.get('dias')) || 30));
  const desde = hojeBrasilia(Date.now() - (dias - 1) * DIA_MS);
  let linhas = [];
  try {
    ({ results: linhas } = await env.DB.prepare(
      'SELECT chave, SUM(n) AS n FROM estatisticas WHERE dia >= ? GROUP BY chave'
    ).bind(desde).all());
  } catch { /* tabela ausente: nada ainda */ }
  const respostas = new Map();
  const etapas = [];
  for (const { chave, n } of linhas || []) {
    const p = String(chave).split('|');
    if (p[0] === 'r' && p.length === 4) {
      const k = `${p[1]}|${p[2]}`;
      const r = respostas.get(k) || { kind: p[1], licao: p[2], total: 0, erros: 0 };
      r.total += n;
      if (p[3] === '0') r.erros += n;
      respostas.set(k, r);
    } else if (p[0] === 'e' && p.length === 3) {
      etapas.push({ licao: p[1], etapa: Number(p[2]), n });
    }
  }
  return json({ dias, desde, respostas: [...respostas.values()], etapas });
}

/** As linhas de mais de um ano (chamado pela varredura, em alertas.js). */
export async function estatisticasPurge(env, at = Date.now()) {
  try {
    await env.DB.prepare('DELETE FROM estatisticas WHERE dia < ?').bind(hojeBrasilia(at - GUARDA_DIAS * DIA_MS)).run();
  } catch { /* tabela ausente */ }
}
