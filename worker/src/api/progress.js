/* O progresso do aluno, no servidor.
 * ─────────────────────────────────────────────────────────────────────────
 * Três rotas e nenhuma regra de aprendizagem: este arquivo guarda e devolve.
 * Quem decide o que é "mais adiantado" quando dois aparelhos discordam é o
 * app (lib/state/merge.ts), e isso é de propósito - a regra de fusão é parte
 * do curso, muda com ele, e duplicá-la aqui em JavaScript sem tipos seria
 * garantir que um dia as duas discordem.
 *
 * O servidor contribui com a única coisa que o app não consegue fazer
 * sozinho: a troca atômica. `rev` sobe a cada escrita aceita, toda escrita
 * declara a revisão que leu, e quem escrever por cima de uma revisão vencida
 * leva 409 com o estado atual junto - o suficiente para fundir e repetir.
 *
 * Por que não deixar o servidor fundir e acabar com o 409: porque a fusão
 * precisa saber o que é um "primeiro", o que é uma caixa de Leitner e por que
 * XP é máximo e não soma. Isso é conhecimento do curso, não do banco.
 *
 * O corpo é limitado a 256 KB. Um estado completo das 22 letras, com fila de
 * revisão e histórico de dias, fica na casa das dezenas de KB; o limite existe
 * para que uma conta não vire um balde onde se guarda qualquer coisa.
 */

import { json, fail, notSignedIn, readJson } from '../lib/http.js';
import { requireAccount } from './auth.js';
import { clearProgress, getProgress, putProgress, throttled } from '../lib/db.js';

const MAX_BYTES = 256 * 1024;

/** GET /api/progress → `{ state, rev, updatedAt }`, ou `rev: 0` se não há. */
export async function read({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();

  /* `uid` vai junto porque o aparelho precisa saber de QUEM é o cache local
     que ele tem guardado. Sem isso, duas pessoas que usam o mesmo notebook
     acabam com o progresso de uma fundido na conta da outra. */
  const row = await getProgress(env, account.id);
  if (!row) return json({ uid: account.id, state: null, rev: 0, updatedAt: null });
  return json({ uid: account.id, state: row.state, rev: row.rev, updatedAt: row.updatedAt });
}

/**
 * PUT /api/progress com `{ state, rev, version }`.
 *
 * `rev` é a revisão que este aparelho leu (0 = nunca leu nada). Responde
 * `{ ok: true, rev }` quando gravou, ou 409 `{ error: 'conflito', state, rev }`
 * quando alguém escreveu no meio - e aí o estado devolvido é o que se deve
 * fundir antes de tentar de novo.
 */
export async function write({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();

  /* Um aparelho com um laço maluco não pode consumir a cota de escrita do
     D1 da plataforma inteira. O app grava no máximo a cada 250 ms e só
     quando algo mudou, então 60 por minuto é folgado para o uso real. */
  if (await throttled(env, `prog:${account.id}`, 60)) return fail('devagar', 429);

  const body = await readJson(request, MAX_BYTES);
  if (!body || typeof body !== 'object') return fail('corpo', 400);

  const { state, rev, version } = body;
  /* O estado tem de ser um objeto com `version` - não um número, não uma
     string, não `null`. Gravar lixo aqui é apagar o progresso de alguém. */
  if (!state || typeof state !== 'object' || Array.isArray(state)) return fail('estado', 400);
  if (typeof state.version !== 'number') return fail('estado', 400);

  const r = await putProgress(env, account.id, {
    state, version: version ?? state.version, expected: Number(rev) || 0
  });

  if (r.ok) return json({ ok: true, rev: r.rev, updatedAt: r.updatedAt });
  return json({
    error: 'conflito',
    state: r.atual ? r.atual.state : null,
    rev: r.atual ? r.atual.rev : 0
  }, 409);
}

/** DELETE /api/progress - o "apagar meu progresso" do perfil. */
export async function drop({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();
  await clearProgress(env, account.id);
  return json({ ok: true, rev: 0 });
}
