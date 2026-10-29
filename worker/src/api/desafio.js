/* O desafio com um amigo (28/10/2026, pedido do dono: "faz tudo", item 8).
 * ─────────────────────────────────────────────────────────────────────────
 * O aluno escolhe cinco palavras que já lê e manda um link; a pessoa que o
 * recebe tenta lê-las numa página pública (/desafio-amigo), sem conta.
 *
 *   POST /api/desafio {palavras: [he, ...]}  → {token}   (aluno com o curso)
 *   GET  /api/desafio?t=<token>              → {palavras: [{he, translit, pt}]}
 *
 * Por que assinado: a página é pública e leva o nome do curso. Se as palavras
 * viajassem soltas no link, qualquer um montaria um link que põe na nossa
 * página o texto que quisesse. Aqui o token só carrega palavras que EXISTEM no
 * vocabulário do curso, e a assinatura (HMAC com prefixo de domínio, como em
 * lib/crypto.js) é conferida antes de mostrar qualquer coisa. A leitura e o
 * sentido saem do conteúdo do curso no servidor, nunca do link.
 *
 * Nada é gravado: nem quem mandou, nem quem abriu. O token não leva a conta.
 * Sem áudio: as gravações estão atrás do portão.
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import { hasEntitlement } from '../lib/db.js';
import { b64url, b64urlDecode, hmacB64, timingSafeEqual } from '../lib/crypto.js';
import { requireAccount } from './auth.js';
import letters from '../../../app/content/letters.json';

const COURSE = 'alfabetizacao';
export const QUANTAS = 5;
const PREFIXO = 'desafio:v1:';

const limpa = s => String(s ?? '').replace(/[​-‏‪-‮⁦-⁩﻿]/g, '').normalize('NFC');

/* O vocabulário do curso, uma vez cada palavra: a mesma conta de
   `vocabularioDoCurso` no app (lib/engine/palavras.ts). */
let VOCAB = null;
export function vocabulario() {
  if (VOCAB) return VOCAB;
  VOCAB = new Map();
  for (const L of [...letters].sort((a, b) => a.order - b.order)) {
    for (const w of [...(L.wordsToRead || []), ...(L.wordsToRecognize || [])]) {
      const k = limpa(w.he);
      if (!VOCAB.has(k)) VOCAB.set(k, { he: w.he, translit: w.translit, pt: w.pt });
    }
  }
  return VOCAB;
}

export async function criar({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();
  if (!await hasEntitlement(env, account.id, COURSE)) return fail('no-access', 403);
  const b = await readJson(request, 2048);
  const lista = Array.isArray(b && b.palavras) ? b.palavras.map(limpa) : [];
  const unicas = [...new Set(lista)];
  if (unicas.length !== QUANTAS || unicas.length !== lista.length) return fail('bad-request');
  const vocab = vocabulario();
  if (!unicas.every(he => vocab.has(he))) return fail('bad-request');
  /* Dois sentidos iguais fariam duas opções iguais na página do amigo. */
  if (new Set(unicas.map(he => vocab.get(he).pt)).size !== QUANTAS) return fail('bad-request');
  const corpo = b64url(new TextEncoder().encode(JSON.stringify(unicas)));
  const sig = await hmacB64(env.SESSION_SECRET, PREFIXO + corpo);
  return json({ token: `${corpo}.${sig}` });
}

export async function abrir({ request, env }) {
  const t = new URL(request.url).searchParams.get('t') || '';
  if (t.length > 1024) return fail('bad-request');
  const [corpo, sig] = t.split('.');
  if (!corpo || !sig) return fail('bad-request');
  if (!timingSafeEqual(sig, await hmacB64(env.SESSION_SECRET, PREFIXO + corpo))) return fail('assinatura', 400);
  let lista;
  try { lista = JSON.parse(new TextDecoder().decode(b64urlDecode(corpo))); } catch { return fail('bad-request'); }
  const vocab = vocabulario();
  if (!Array.isArray(lista) || lista.length !== QUANTAS || !lista.every(he => vocab.has(limpa(he)))) return fail('bad-request');
  return json({ palavras: lista.map(he => vocab.get(limpa(he))) });
}
