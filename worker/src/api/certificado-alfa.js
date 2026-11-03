/* O certificado do alfabeto, emitido pelo servidor (03/11/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Até aqui ele era desenhado no navegador a partir do progresso que o
 * próprio navegador guarda, e a trava do prazo de desistência só existia na
 * tela: quem soubesse mexer no navegador desenhava o certificado dentro dos
 * sete dias e desistia. Agora o desenho só acontece com um registro daqui,
 * na mesma tabela `certificados` do A1, e o registro só nasce:
 *
 *   · com o curso comprado e o prazo de desistência encerrado
 *     (`desistivelAte`, lib/db.js); presente e liberação à mão não têm prazo;
 *   · com o exame final aprovado no progresso que o SERVIDOR guarda;
 *   · com o nome confirmado pelo aluno, que depois não muda (o código
 *     público aponta para ele).
 *
 * E o progresso não grava o exame dentro do prazo (api/progress.js), então
 * passar no exame burlando a tela não deixa rastro aqui.
 *
 * O exame continua corrigido no navegador: as perguntas saem do conteúdo
 * das lições, que o aluno já tem. O que tem valor fora do curso - o
 * certificado, com código conferível - é o que fica no servidor.
 *
 *   GET  /api/certificado/alfabetizacao   a situação e o certificado, se houver
 *   POST /api/certificado/alfabetizacao   emite, com `{ nome, publico? }`
 *
 * A verificação pública é a mesma do A1 (`GET /api/certificado?id=`), que
 * aceita os dois prefixos.
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import { desistivelAte, getProgress, hasEntitlement } from '../lib/db.js';
import { requireAccount } from './auth.js';
import { EXAM_PASS } from '../../../app/src/lib/engine/nota-do-exame.ts';

export const CURSO_ALFA = 'alfabetizacao';

/* Sem 0/O, 1/I/L, como o do A1: para ser ditado e digitado. */
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const codigo = () => 'HF-' + [...crypto.getRandomValues(new Uint8Array(8))].map(b => ALFABETO[b % ALFABETO.length]).join('');

/* O mesmo nome que o A1 aceita: letras (com acento), espaço, hífen,
   apóstrofo e ponto; de 3 a 80 caracteres. */
const NOME = /^[\p{L}][\p{L} '.-]{1,78}[\p{L}.]$/u;

/* O nome do curso como o catálogo o chama, no idioma do site. */
export const publicoDoAlfa = (c, env) => ({
  id: c.id, nome: c.nome, curso: env && env.LOCALE === 'en' ? 'Learn to Read Hebrew' : 'Alfabetização em Hebraico',
  aprovadoEm: new Date(Number(c.aprovado_em)).toISOString(),
  emitidoEm: new Date(Number(c.emitido_em)).toISOString(),
  publico: !!c.publico, nota: Number(c.nota)
});

/** O exame aprovado, no progresso do servidor: `{ quando, nota }` ou null. */
async function aprovacao(env, accountId) {
  const p = await getProgress(env, accountId);
  const f = p?.state?.finalChallenge;
  const quando = f?.passedAt ? Date.parse(f.passedAt) : NaN;
  const nota = Number(f?.best);
  if (!Number.isFinite(quando) || !Number.isFinite(nota) || nota < EXAM_PASS) return null;
  return { quando, nota };
}

async function situacao(env, account) {
  const c = await env.DB.prepare('SELECT * FROM certificados WHERE account_id = ? AND curso = ?')
    .bind(account.id, CURSO_ALFA).first();
  if (c) return { situacao: 'emitido', certificado: publicoDoAlfa(c, env) };
  const ate = await desistivelAte(env, account.id, CURSO_ALFA);
  if (ate !== null) return { situacao: 'prazo', abreEm: new Date(ate + 1).toISOString() };
  if (!await aprovacao(env, account.id)) return { situacao: 'falta' };
  return { situacao: 'pode', nomeSugerido: account.name || '' };
}

async function comCurso(request, env) {
  const account = await requireAccount(request, env);
  if (!account) return { erro: notSignedIn() };
  if (!await hasEntitlement(env, account.id, CURSO_ALFA)) return { erro: fail('not-owned', 403) };
  return { account };
}

export async function meu({ request, env }) {
  const { account, erro } = await comCurso(request, env);
  if (erro) return erro;
  return json(await situacao(env, account));
}

export async function emitir({ request, env }) {
  const { account, erro } = await comCurso(request, env);
  if (erro) return erro;
  const b = await readJson(request, 2048);
  const nome = typeof b?.nome === 'string' ? b.nome.normalize('NFC').replace(/\s+/g, ' ').trim() : '';
  if (!NOME.test(nome)) return fail('nome-invalido', 400);

  const s = await situacao(env, account);
  if (s.situacao === 'emitido') return json(s, 200);
  if (s.situacao === 'prazo') return json({ error: 'no-prazo', abreEm: s.abreEm }, 403);
  if (s.situacao === 'falta') return fail('nao-aprovado', 403);

  const ap = await aprovacao(env, account.id);
  await env.DB.prepare(
    `INSERT INTO certificados (id, account_id, curso, nome, nota, aprovado_em, emitido_em, publico)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (account_id, curso) DO NOTHING`
  ).bind(codigo(), account.id, CURSO_ALFA, nome, ap.nota, ap.quando, Date.now(), b?.publico === false ? 0 : 1).run();
  return json(await situacao(env, account), 201);
}
