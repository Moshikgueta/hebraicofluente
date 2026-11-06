/* O conteúdo de Raízes Sefarditas, para quem tem o direito (21/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * A mesma rota de api/content-a1.js, com o direito de OUTRO produto:
 * raizes-sefarditas. Juntar este material ao molde de um dos cursos de
 * hebraico o entregaria a quem comprou só o hebraico.
 *
 * Tudo o mais é igual e pelos mesmos motivos (ver api/content.js): JSON do
 * pacote do Worker, `private` com ETag e `Vary: Cookie`, o direito lido do
 * banco a cada pedido, a marca invisível da conta no texto em português.
 *
 * Hoje NINGUÉM tem esse direito: o produto não está no catálogo de venda
 * (data/courses.json) e só o dono pode concedê-lo, à mão, para revisar.
 */

import { notSignedIn, fail } from '../lib/http.js';
import { requireAccount } from './auth.js';
import { hasEntitlement, registrarConteudo } from '../lib/db.js';
import { marcaDaConta, invisivel } from '../lib/marca.js';
import { CACHE_DO_CONTEUDO } from './content.js';

import raizes from '../../../app/content/raizes.json';

export const CURSO_RAIZES = 'raizes-sefarditas';

const MARCADOR = '', MARCADOR_VISIVEL = '';
const marcar = s => (typeof s === 'string' && s ? s + MARCADOR : s);

/* A marca entra no fim de cada parágrafo narrativo (blocos `texto`):
   português que o aluno só lê e que nenhuma atividade compara. */
const marcarBloco = b => (b.tipo === 'texto' ? { ...b, paragrafos: b.paragrafos.map(marcar) } : b);

const MOLDE = JSON.stringify({
  _licenca: `Conteúdo de Raízes Sefarditas (Hebraico Fluente), licenciado para uso pessoal de uma conta. ` +
    `Proibido copiar ou redistribuir: violação de direito autoral (Lei 9.610/1998; Código Penal, ` +
    `art. 184), sujeita a responsabilização civil e criminal (Termos de Uso, artigo 5). ` +
    `Cópia ${MARCADOR_VISIVEL}.`,
  ...raizes,
  conteudo: raizes.conteudo.map(m => ({
    ...m,
    etapas: m.etapas.map(e => ({ ...e, blocos: e.blocos.map(marcarBloco) }))
  }))
});

const VERSAO = (() => {
  let h = 0x811c9dc5;
  for (let i = 0; i < MOLDE.length; i++) {
    h ^= MOLDE.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
})();

export async function contentRaizes({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();

  if (!await hasEntitlement(env, account.id, CURSO_RAIZES)) {
    return fail('not-owned', 403);
  }

  const marca = await marcaDaConta(env, account.id);
  const etag = `"rz-${VERSAO}-${marca || 'sem-marca'}"`;
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
export const conteudoRaizesBruto = () => MOLDE.replaceAll(MARCADOR, '').replaceAll(MARCADOR_VISIVEL, '-');
