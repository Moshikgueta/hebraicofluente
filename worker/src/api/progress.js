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
import { ehCurso } from '../lib/catalog.js';
import {
  activeEntitlements, clearProgress, getProgress, hasProgress, putProgress, throttled
} from '../lib/db.js';

/* Em bytes de verdade, agora que `readJson` mede bytes. O limite antigo media
   unidades UTF-16 e deixava passar até o triplo em hebraico; 512 KB cobre o
   que passava antes sem reabrir a torneira. */
const MAX_BYTES = 512 * 1024;

/* ── só quem tem curso guarda progresso no servidor ────────────────────────
 * Auditoria de 24/09/2026. Qualquer conta - e criar conta é de graça - podia
 * gravar 512 KB aqui. O D1 do plano gratuito tem 500 MB: umas mil contas
 * descartáveis, criadas de uma máquina só em menos de duas horas, enchiam o
 * banco, e banco cheio é TODA escrita falhando (cadastro, login, pagamento)
 * até alguém apagar à mão. Medido contra o D1 local.
 *
 * Quem não comprou não tem lição para fazer progresso, então não perde nada:
 * o estado continua no aparelho (lib/state/worker.ts trata o 403 como "sem
 * sincronização", igual a estar deslogado) e sobe inteiro na primeira
 * abertura depois da compra, pela fusão de sempre. Ler continua aberto -
 * quem teve curso e deixou vencer continua vendo o que fez.
 *
 * A conferência vem ANTES do freio: o freio grava uma linha, e quem vai ser
 * recusado não pode custar escrita nenhuma. Ler o direito é uma leitura.
 */
const temCurso = async (env, accountId) => (await activeEntitlements(env, accountId)).some(e => ehCurso(e.courseSlug));

/* ── o que não é progresso ─────────────────────────────────────────────────
 * Três nomes que, como CHAVE de um objeto, mexem no protótipo de quem os
 * receber em vez de guardar um valor. O app já os descarta ao fundir
 * (app/src/lib/state/merge.ts), mas a defesa do cliente protege o cliente:
 * o que está guardado no banco é servido de volta para TODO aparelho daquela
 * conta, e para qualquer código futuro que leia esta coluna sem desconfiar.
 * Nenhuma letra, caixa de Leitner ou dia de estudo se chama `__proto__`.
 *
 * Em pilha, e não em recursão: um estado com dez mil níveis de aninhamento
 * derrubaria a pilha de chamadas, e um 500 no salvamento de progresso é
 * exatamente o que não pode acontecer no meio de uma lição.
 */
const PERIGOSAS = new Set(['__proto__', 'constructor', 'prototype']);

function temChavePerigosa(raiz) {
  const pilha = [raiz];
  let nos = 0;
  while (pilha.length) {
    const o = pilha.pop();
    if (!o || typeof o !== 'object') continue;
    /* Um teto de nós: progresso de verdade tem alguns milhares. Acima disso
       não é progresso, e percorrer o resto seria trabalho a pedido de quem
       mandou. */
    if (++nos > 50_000) return true;
    for (const k of Object.keys(o)) {
      if (PERIGOSAS.has(k)) return true;
      const v = o[k];
      if (v && typeof v === 'object') pilha.push(v);
    }
  }
  return false;
}

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

  if (!await temCurso(env, account.id)) return fail('sem-curso', 403);

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
  if (temChavePerigosa(state)) return fail('estado', 400);

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
  /* Sem linha, não há o que apagar - e responder sem gravar nada é o que
     impede este DELETE de virar uma escrita de freio por pedido para quem
     nunca teve progresso aqui. */
  if (!await hasProgress(env, account.id)) return json({ ok: true, rev: 0 });
  if (await throttled(env, `prog:${account.id}`, 60)) return fail('devagar', 429);
  await clearProgress(env, account.id);
  return json({ ok: true, rev: 0 });
}
