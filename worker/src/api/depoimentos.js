/* Os depoimentos dos alunos (29/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O dono do curso não tinha como pedir um depoimento, nem como provar depois
 * que quem aparece na página autorizou aparecer. Aqui ficam as duas coisas:
 *
 *   · QUEM ESCREVE: só conta com o curso liberado. Um depoimento de quem não
 *     estudou não é depoimento - e publicar opinião que não existe é
 *     publicidade enganosa (CDC, art. 37).
 *   · UM POR CONTA: o aluno edita o dele quando quiser. Editar volta o estado
 *     para 'novo': o dono aprovou um texto, não o que vier depois.
 *   · A AUTORIZAÇÃO é uma caixa à parte, desmarcada no começo. Sem ela, o
 *     texto vale como opinião para o dono ler, e nunca vai ao ar.
 *   · RETIRAR apaga a linha, sem pergunta e sem freio. O depoimento sai de
 *     onde estiver publicado em até 7 dias (é o prazo dito na página).
 *   · O DONO lê em /admin/depoimentos e marca aprovado ou recusado. O texto
 *     não é editado por ninguém além do aluno.
 *   · APAGAR A CONTA apaga o depoimento (lib/db.js, deleteAccount).
 *
 * Nada aqui publica em lugar nenhum: pôr um depoimento aprovado na vitrine é
 * um passo do dono, que escolhe quais e onde.
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import { hasEntitlement, log, throttled } from '../lib/db.js';
import { exigirAdmin } from '../lib/admin.js';
import { requireAccount } from './auth.js';

const COURSE = 'alfabetizacao';
export const TEXTO_MIN = 20;
export const TEXTO_MAX = 1200;
const CURTO_MAX = 60;
const FORMAS = new Set(['nome', 'iniciais', 'anonimo']);
const ESTADOS = new Set(['aprovado', 'recusado', 'novo']);

/* Texto de uma linha: sem quebras, sem caracteres de controle, sem espaço
   sobrando. O depoimento em si mantém as quebras de parágrafo. */
const linha = s => String(s ?? '').replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim();
const paragrafos = s => String(s ?? '').replace(/\r\n?/g, '\n')
  .replace(/[\u0000-\u0009\u000B-\u001F\u007F]+/g, ' ')
  .split('\n').map(l => l.replace(/\s+/g, ' ').trim()).join('\n')
  .replace(/\n{3,}/g, '\n\n').trim();

/** O que o aluno mandou, conferido. `{erro}` com o código se não serve. */
export function validar(b) {
  if (!b || typeof b !== 'object') return { erro: 'bad-request' };
  const texto = paragrafos(b.texto);
  if ([...texto].length < TEXTO_MIN) return { erro: 'texto-curto' };
  if ([...texto].length > TEXTO_MAX) return { erro: 'texto-longo' };
  const forma = String(b.forma || '');
  if (!FORMAS.has(forma)) return { erro: 'bad-request' };
  const nomePublico = linha(b.nomePublico);
  const cidade = linha(b.cidade);
  if ([...nomePublico].length > CURTO_MAX || [...cidade].length > CURTO_MAX) return { erro: 'bad-request' };
  if (forma === 'nome' && !nomePublico) return { erro: 'nome-faltando' };
  if (typeof b.publicar !== 'boolean' || typeof b.contato !== 'boolean') return { erro: 'bad-request' };
  return {
    ok: {
      texto, forma,
      /* Anônimo não guarda nome nem cidade: o que não vai aparecer não precisa existir. */
      nomePublico: forma === 'anonimo' ? '' : nomePublico,
      cidade: forma === 'anonimo' ? '' : cidade,
      publicar: b.publicar, contato: b.contato
    }
  };
}

/** Como o depoimento aparece assinado: "Ana Souza, Recife", "A. S.", "Aluno do curso". */
export function assinatura({ forma, nomePublico, cidade }) {
  if (forma === 'anonimo') return 'Aluno do curso';
  const nome = forma === 'iniciais'
    ? nomePublico.split(/\s+/).filter(Boolean).map(p => `${[...p][0].toUpperCase()}.`).join(' ')
    : nomePublico;
  return [nome || 'Aluno do curso', cidade].filter(Boolean).join(', ');
}

const deLinha = r => r && {
  texto: r.texto, forma: r.forma, nomePublico: r.nome_publico, cidade: r.cidade,
  publicar: !!r.publicar, contato: !!r.contato, estado: r.estado,
  criadoEm: r.criado_em, atualizadoEm: r.atualizado_em
};

async function aluno(request, env) {
  const account = await requireAccount(request, env);
  if (!account) return { erro: notSignedIn() };
  if (!await hasEntitlement(env, account.id, COURSE)) return { erro: fail('no-access', 403) };
  return { account };
}

/** GET /api/depoimento - o do próprio aluno, ou null. */
export async function ler({ request, env }) {
  const { account, erro } = await aluno(request, env);
  if (erro) return erro;
  let r = null;
  try {
    r = await env.DB.prepare('SELECT * FROM depoimentos WHERE account_id = ?').bind(account.id).first();
  } catch { /* tabela ainda não criada: não há depoimento */ }
  return json({ depoimento: deLinha(r) });
}

/** PUT /api/depoimento - cria ou troca o do próprio aluno. */
export async function salvar({ request, env }) {
  const { account, erro } = await aluno(request, env);
  if (erro) return erro;
  if (await throttled(env, `depoimento:${account.id}`, 10, 3_600_000)) return fail('rate-limited', 429);
  const v = validar(await readJson(request, 16 * 1024));
  if (v.erro) return fail(v.erro);
  const d = v.ok, agora = Date.now();
  await env.DB.prepare(
    `INSERT INTO depoimentos (account_id, texto, forma, nome_publico, cidade, publicar, contato, estado, criado_em, atualizado_em)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'novo', ?8, ?8)
     ON CONFLICT(account_id) DO UPDATE SET
       texto = ?2, forma = ?3, nome_publico = ?4, cidade = ?5, publicar = ?6, contato = ?7,
       estado = 'novo', atualizado_em = ?8`
  ).bind(account.id, d.texto, d.forma, d.nomePublico, d.cidade, d.publicar ? 1 : 0, d.contato ? 1 : 0, agora).run();
  /* A trilha guarda a autorização (sim ou não) e quando: é a prova de que a
     pessoa consentiu, se um dia alguém perguntar. */
  await log(env, account.id, 'depoimento-salvo', `publicar=${d.publicar ? 'sim' : 'nao'} forma=${d.forma}`);
  return json({ ok: true });
}

/** DELETE /api/depoimento - retirar. Sem freio: retirar um consentimento
 *  nunca pode esbarrar num "tente mais tarde". */
export async function retirar({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();
  try {
    await env.DB.prepare('DELETE FROM depoimentos WHERE account_id = ?').bind(account.id).run();
  } catch { /* tabela ausente: nada a retirar */ }
  await log(env, account.id, 'depoimento-retirado', '');
  return json({ ok: true });
}

/** GET /api/admin/depoimentos - todos, os novos primeiro. */
export async function listar({ request, env }) {
  const { erro } = await exigirAdmin(request, env);
  if (erro) return erro;
  let results = [];
  try {
    ({ results } = await env.DB.prepare(
      `SELECT d.*, a.email, a.name FROM depoimentos d JOIN accounts a ON a.id = d.account_id
        ORDER BY CASE d.estado WHEN 'novo' THEN 0 ELSE 1 END, d.atualizado_em DESC LIMIT 500`
    ).all());
  } catch { /* tabela ausente */ }
  return json({
    depoimentos: (results || []).map(r => ({
      id: r.account_id, email: r.email, nomeConta: r.name, ...deLinha(r), assinatura: assinatura(deLinha(r))
    }))
  });
}

/** PUT /api/admin/depoimentos {id, estado} - aprovar ou recusar. Aprovar só
 *  o que o aluno autorizou publicar. */
export async function julgar({ request, env }) {
  const { account, erro } = await exigirAdmin(request, env);
  if (erro) return erro;
  const b = await readJson(request);
  const id = Number(b && b.id);
  const estado = String(b && b.estado || '');
  if (!Number.isInteger(id) || id <= 0 || !ESTADOS.has(estado)) return fail('bad-request');
  const r = await env.DB.prepare('SELECT publicar FROM depoimentos WHERE account_id = ?').bind(id).first();
  if (!r) return fail('not-found', 404);
  if (estado === 'aprovado' && !r.publicar) return fail('sem-autorizacao', 409);
  await env.DB.prepare('UPDATE depoimentos SET estado = ? WHERE account_id = ?').bind(estado, id).run();
  await log(env, account.id, 'depoimento-julgado', `${id} ${estado}`);
  return json({ ok: true });
}

/** Os que o dono ainda não leu, para o aviso diário (alertas.js). */
export async function novosDesde(env, desde) {
  try {
    const r = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM depoimentos WHERE estado = 'novo' AND atualizado_em >= ?"
    ).bind(desde).first();
    return (r && r.n) || 0;
  } catch { return 0; }
}
