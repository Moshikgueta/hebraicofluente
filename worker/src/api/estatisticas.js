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
 * Só conta quem tem o curso liberado (auditoria de 01/10/2026, SEC-A-008).
 * Conta é de graça, e com qualquer conta logada um script mandava 30 lotes
 * de 60 eventos por minuto: o dono decide onde mexer no curso por estes
 * números, e eles eram envenenáveis por quem nunca estudou. Sem curso, a
 * resposta continua 204 (o app não tem o que fazer com um erro aqui) e nada
 * é escrito, nem o freio.
 *
 * Quem lê é o dono, em /admin/estatisticas.
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import { activeEntitlements, throttled } from '../lib/db.js';
import { exigirAdmin } from '../lib/admin.js';
import { ip, requireAccount } from './auth.js';

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
  /* Antes do freio: quem não tem curso não gasta nem a escrita dele. */
  if (!(await activeEntitlements(env, account.id)).length) return new Response(null, { status: 204 });
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

/* Links de campanha (02/10/2026): hebraicofluente.com.br/sefarad, o link da
   parceria com a associação sefardita. Conta só o total de visitas por dia,
   na mesma tabela e com a mesma regra das outras contagens: sem conta,
   e-mail, IP, horário nem cookie. A visita leva direto ao teste grátis. */
export const LINKS_DE_CAMPANHA = new Map([['/sefarad', 'sefarad']]);
const ROBO = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|curl|wget|python|headless/i;

export async function contarCampanha(env, origem, request) {
  if (request.method !== 'GET' || ROBO.test(request.headers.get('user-agent') || '')) return;
  try {
    await env.DB.prepare(
      `INSERT INTO estatisticas (dia, chave, n) VALUES (?1, ?2, 1)
       ON CONFLICT(dia, chave) DO UPDATE SET n = n + 1`
    ).bind(hojeBrasilia(), `o|${origem}`).run();
  } catch (e) {
    console.error('campanha', e && e.stack || e);
  }
}

/* O teste grátis da capa (03/10/2026): até onde os visitantes chegam.
   ─────────────────────────────────────────────────────────────────────────
   Quem faz o teste ainda não tem conta, então aqui não há sessão a conferir.
   O app manda só o NOME da etapa alcançada, uma vez por etapa e por visita
   (app/src/lib/funil-demo.ts), e o servidor soma por dia na mesma tabela,
   com a chave `d|<etapa>`: sem conta, e-mail, IP, horário nem cookie.

   Contra contagem inflada: nome fora da lista não conta, robô não conta, e
   cada endereço de IP conta no máximo 40 etapas por hora (o freio guarda o
   IP só durante a janela, como o do cadastro). Uma visita inteira usa 9. */
export const ETAPAS_DA_DEMO = ['visto', 'reconhecer', 'comparar', 'vogais', 'escrever', 'achar', 'ler', 'pronto', 'cta', 'segunda-letra'];
/* `segunda-letra` não vem do navegador: é contada pelo servidor quando o
   e-mail da segunda letra sai (api/segunda-letra.js). */
const SO_DO_SERVIDOR = new Set(['segunda-letra']);

/** POST /api/demo {etapa} - sempre 204. */
export async function contarDemo({ request, env }) {
  const nada = new Response(null, { status: 204 });
  if (ROBO.test(request.headers.get('user-agent') || '')) return nada;
  const b = await readJson(request, 1024);
  const etapa = String(b && b.etapa || '');
  if (!ETAPAS_DA_DEMO.includes(etapa) || SO_DO_SERVIDOR.has(etapa)) return nada;
  if (await throttled(env, `demo-ip:${ip(request)}`, 40, 3_600_000)) return nada;
  await contarEtapa(env, etapa);
  return nada;
}

/** Soma 1 na etapa do teste, hoje. Nunca lança. */
export async function contarEtapa(env, etapa) {
  try {
    await env.DB.prepare(
      `INSERT INTO estatisticas (dia, chave, n) VALUES (?1, ?2, 1)
       ON CONFLICT(dia, chave) DO UPDATE SET n = n + 1`
    ).bind(hojeBrasilia(), `d|${etapa}`).run();
  } catch (e) {
    console.error('demo', e && e.stack || e);
  }
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
  const campanhas = [];
  const demo = [];
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
    } else if (p[0] === 'o' && p.length === 2) {
      campanhas.push({ origem: p[1], visitas: n });
    } else if (p[0] === 'd' && p.length === 2) {
      demo.push({ etapa: p[1], n });
    }
  }
  return json({ dias, desde, respostas: [...respostas.values()], etapas, campanhas, demo });
}

/** As linhas de mais de um ano (chamado pela varredura, em alertas.js). */
export async function estatisticasPurge(env, at = Date.now()) {
  try {
    await env.DB.prepare('DELETE FROM estatisticas WHERE dia < ?').bind(hojeBrasilia(at - GUARDA_DIAS * DIA_MS)).run();
  } catch { /* tabela ausente */ }
}
