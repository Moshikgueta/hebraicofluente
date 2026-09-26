/* "Achei um erro": o aluno aponta um exercício errado, e o dono do curso vê.
 * ─────────────────────────────────────────────────────────────────────────
 * Um curso de alfabetização não pode ter um sinal de vogal errado, e quem
 * mais vê exercício é o aluno. Este é o canal: um toque depois de responder,
 * um motivo, um comentário opcional - e o painel /admin/relatos agrupa por
 * exercício, para que três alunos apontando a mesma questão virem uma linha
 * com "3" do lado, e não três linhas soltas.
 *
 * ── o que é guardado, e o que não é ──────────────────────────────────────
 * O EXERCÍCIO, como o aluno o viu: o enunciado, o hebraico, as alternativas,
 * qual era a certa e qual ele escolheu. Sem isso o relato é inútil - os
 * exercícios são sorteados, e "a questão 4 da lição do Mem" não existe duas
 * vezes igual.
 *
 * A CONTA, não. O relato exige sessão (é conteúdo pago, e isso segura spam),
 * mas não grava quem mandou: um relato de erro não precisa de dono, e sem
 * vínculo com a conta ele não vira dado pessoal nem precisa ser apagado junto
 * com ela. O que fica pessoal é só o que o próprio aluno escrever no
 * comentário - e a política de privacidade diz isso.
 *
 * Freio: 20 relatos por hora por conta. Quem acha vinte erros numa hora achou
 * um problema maior, e um robô não passa disso.
 */

import { json, fail, notSignedIn, readJson } from '../lib/http.js';
import { throttled } from '../lib/db.js';
import { requireAccount } from './auth.js';
import { exigirAdmin } from '../lib/admin.js';

export const MOTIVOS = ['resposta', 'hebraico', 'audio', 'confuso', 'outro'];
const HORA = 3_600_000;

const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const lista = (v, max) => (Array.isArray(v) ? v.slice(0, 8).map(x => texto(x, max)) : []);

/** Só os campos conhecidos, cada um com teto: o que vem do navegador é dado, não esquema. */
export function limparRelato(corpo) {
  if (!corpo || typeof corpo !== 'object') return null;
  const motivo = MOTIVOS.includes(corpo.motivo) ? corpo.motivo : null;
  const exercicio = texto(corpo.exercicio, 120);
  if (!motivo || !exercicio) return null;
  return {
    exercicio,
    tipo: texto(corpo.tipo, 40),
    letra: texto(corpo.letra, 20),
    rota: texto(corpo.rota, 120),
    motivo,
    comentario: texto(corpo.comentario, 500),
    foto: {
      enunciado: texto(corpo.enunciado, 300),
      hebraico: texto(corpo.hebraico, 300),
      opcoes: lista(corpo.opcoes, 200),
      certa: texto(corpo.certa, 200),
      escolhida: texto(corpo.escolhida, 200),
      acertou: corpo.acertou === true
    }
  };
}

export async function enviar({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();
  if (await throttled(env, `relato-h:${account.id}`, 20, HORA)) return fail('rate-limited-hora', 429);

  const r = limparRelato(await readJson(request, 8 * 1024));
  if (!r) return fail('relato', 400);

  await env.DB.prepare(
    `INSERT INTO relatos (exercicio, tipo, letra, rota, motivo, comentario, foto, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(r.exercicio, r.tipo, r.letra, r.rota, r.motivo, r.comentario, JSON.stringify(r.foto), Date.now()).run();
  return json({ ok: true });
}

/** Os relatos, os abertos primeiro. `?todos=1` inclui os resolvidos. */
export async function listar({ request, env }) {
  const { erro } = await exigirAdmin(request, env);
  if (erro) return erro;
  const todos = new URL(request.url).searchParams.get('todos') === '1';
  const r = await env.DB.prepare(
    `SELECT id, exercicio, tipo, letra, rota, motivo, comentario, foto, criado_em, resolvido_em
       FROM relatos ${todos ? '' : 'WHERE resolvido_em IS NULL'}
      ORDER BY resolvido_em IS NOT NULL, criado_em DESC LIMIT 300`
  ).all();
  const relatos = (r.results || []).map(x => ({ ...x, foto: JSON.parse(x.foto || '{}') }));
  const abertos = await env.DB.prepare('SELECT COUNT(*) AS n FROM relatos WHERE resolvido_em IS NULL').first();
  return json({ relatos, abertos: Number(abertos?.n || 0) }, 200, { 'Cache-Control': 'no-store' });
}

/** Marca (ou desmarca) como resolvidos TODOS os relatos de um exercício. */
export async function resolver({ request, env }) {
  const { erro } = await exigirAdmin(request, env);
  if (erro) return erro;
  const corpo = await readJson(request);
  const exercicio = texto(corpo?.exercicio, 120);
  if (!exercicio) return fail('relato', 400);
  const quando = corpo.reabrir === true ? null : Date.now();
  const r = await env.DB.prepare('UPDATE relatos SET resolvido_em = ? WHERE exercicio = ?')
    .bind(quando, exercicio).run();
  return json({ ok: true, alterados: r.meta?.changes ?? 0 });
}
