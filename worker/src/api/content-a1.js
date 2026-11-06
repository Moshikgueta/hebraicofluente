/* O conteúdo do curso Hebraico A1, para quem comprou o A1 (06/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * A mesma rota de api/content.js, com UMA diferença que é o motivo de ela
 * existir separada: o direito conferido é o do hebraico-a1. Juntar o A1 no
 * molde do alfabeto entregaria o A1 a quem comprou só o alfabeto (e o
 * contrário não aconteceria, porque a rota do alfabeto confere o alfabeto).
 *
 * Tudo o mais é igual e pelos mesmos motivos (ver o comentário de
 * api/content.js): JSON do pacote do Worker, `private` com ETag e
 * `Vary: Cookie`, o direito lido do banco a cada pedido, a marca invisível
 * da conta no texto em português.
 */

import { notSignedIn, fail } from '../lib/http.js';
import { requireAccount } from './auth.js';
import { hasEntitlement, registrarConteudo } from '../lib/db.js';
import { marcaDaConta, invisivel } from '../lib/marca.js';
import { CACHE_DO_CONTEUDO } from './content.js';

import a1 from '../../../app/content/a1.json';

export const CURSO_A1 = 'hebraico-a1';

const MARCADOR = '', MARCADOR_VISIVEL = '';
const marcar = s => (typeof s === 'string' && s ? s + MARCADOR : s);

/* A marca entra no fim do objetivo de cada unidade: português, lido pelo
   aluno, e que nenhum exercício compara. */
const MOLDE = JSON.stringify({
  _licenca: `Conteúdo do curso Hebraico Fluente, licenciado para uso pessoal de uma conta. ` +
    `Proibido copiar ou redistribuir: violação de direito autoral (Lei 9.610/1998; Código Penal, ` +
    `art. 184), sujeita a responsabilização civil e criminal (Termos de Uso, artigo 5). ` +
    `Cópia ${MARCADOR_VISIVEL}.`,
  ...a1,
  unidades: a1.unidades.map(u => ({ ...u, objetivoPt: marcar(u.objetivoPt) }))
});

const VERSAO = (() => {
  let h = 0x811c9dc5;
  for (let i = 0; i < MOLDE.length; i++) {
    h ^= MOLDE.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
})();

export async function contentA1({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();

  if (!await hasEntitlement(env, account.id, CURSO_A1)) {
    return fail('not-owned', 403);
  }

  const marca = await marcaDaConta(env, account.id);
  const etag = `"a1-${VERSAO}-${marca || 'sem-marca'}"`;
  const cabecalhos = {
    'Cache-Control': CACHE_DO_CONTEUDO,
    'ETag': etag,
    'Vary': 'Cookie'
  };
  const jaTem = (request.headers.get('If-None-Match') || '')
    .split(',').map(t => t.trim().replace(/^W\//, ''));
  if (jaTem.includes(etag)) return new Response(null, { status: 304, headers: cabecalhos });

  await registrarConteudo(env, account.id);
  const corpo = MOLDE
    .replaceAll(MARCADOR, marca ? invisivel(marca) : '')
    .replaceAll(MARCADOR_VISIVEL, marca ? marca.toUpperCase() : '-');

  return new Response(corpo, {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cabecalhos }
  });
}

/* Só para o teste poder conferir a forma sem subir um Worker. */
export const conteudoA1Bruto = () => MOLDE.replaceAll(MARCADOR, '').replaceAll(MARCADOR_VISIVEL, '-');
