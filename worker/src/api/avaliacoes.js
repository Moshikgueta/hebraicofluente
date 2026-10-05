/* "Como foi esta lição?" (05/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * No fim de cada lição de letra, o aluno escolhe fácil, ok ou difícil e, se
 * quiser, escreve um comentário. O dono lê o resumo por lição e os
 * comentários em /admin/avaliacoes. Até aqui, ele só sabia que uma lição
 * travava alguém quando esse alguém desistia.
 *
 *   · QUEM AVALIA: só conta com o curso liberado, como o depoimento.
 *   · ANÔNIMA: a linha guarda a lição, a nota, o comentário e a data, e NÃO
 *     guarda a conta - o mesmo desenho dos relatos. O freio usa a conta,
 *     mas só na tabela de freios, que se apaga sozinha. Por isso a tela diz
 *     ao aluno que a resposta não fica ligada a ele, e por isso apagar a conta
 *     não precisa apagar nada daqui.
 *   · Nada aqui manda e-mail ou mensagem a ninguém.
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import { hasEntitlement, throttled } from '../lib/db.js';
import { exigirAdmin } from '../lib/admin.js';
import { requireAccount } from './auth.js';

const COURSE = 'alfabetizacao';
export const NOTAS = ['facil', 'ok', 'dificil'];
export const COMENTARIO_MAX = 600;
const LICAO = /^[a-z][a-z0-9-]{0,23}$/;

const umaLinhaOuMais = s => String(s ?? '').replace(/\r\n?/g, '\n')
  .replace(/[\u0000-\u0009\u000B-\u001F\u007F]+/g, ' ')
  .split('\n').map(l => l.replace(/\s+/g, ' ').trim()).join('\n')
  .replace(/\n{3,}/g, '\n\n').trim();

/** O que o aluno mandou, conferido. `{erro}` com o código se não serve. */
export function validar(b) {
  if (!b || typeof b !== 'object') return { erro: 'bad-request' };
  const licao = String(b.licao || '');
  const nota = String(b.nota || '');
  if (!LICAO.test(licao) || !NOTAS.includes(nota)) return { erro: 'bad-request' };
  const comentario = umaLinhaOuMais(b.comentario);
  if ([...comentario].length > COMENTARIO_MAX) return { erro: 'texto-longo' };
  return { ok: { licao, nota, comentario } };
}

/** POST /api/avaliacao {licao, nota, comentario?} */
export async function avaliar({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();
  if (!await hasEntitlement(env, account.id, COURSE)) return fail('no-access', 403);
  if (await throttled(env, `avaliacao:${account.id}`, 30, 3_600_000)) return fail('rate-limited', 429);
  const v = validar(await readJson(request, 8 * 1024));
  if (v.erro) return fail(v.erro);
  await env.DB.prepare(
    'INSERT INTO avaliacoes_licao (licao, nota, comentario, criado_em) VALUES (?, ?, ?, ?)'
  ).bind(v.ok.licao, v.ok.nota, v.ok.comentario, Date.now()).run();
  return json({ ok: true });
}

/** GET /api/admin/avaliacoes - o resumo por lição e os últimos comentários. */
export async function listar({ request, env }) {
  const { erro } = await exigirAdmin(request, env);
  if (erro) return erro;
  let contagens = [], comentarios = [];
  try {
    contagens = (await env.DB.prepare(
      'SELECT licao, nota, COUNT(*) AS n FROM avaliacoes_licao GROUP BY licao, nota'
    ).all()).results || [];
    comentarios = (await env.DB.prepare(
      `SELECT licao, nota, comentario, criado_em FROM avaliacoes_licao
        WHERE comentario <> '' ORDER BY criado_em DESC, id DESC LIMIT 100`
    ).all()).results || [];
  } catch { /* tabela ainda não criada: nada avaliado */ }

  const porLicao = new Map();
  for (const c of contagens) {
    const l = porLicao.get(c.licao) || { licao: c.licao, facil: 0, ok: 0, dificil: 0 };
    l[c.nota] = Number(c.n) || 0;
    porLicao.set(c.licao, l);
  }
  return json({
    licoes: [...porLicao.values()],
    comentarios: comentarios.map(c => ({ licao: c.licao, nota: c.nota, comentario: c.comentario, em: c.criado_em }))
  });
}
