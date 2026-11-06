/* A licença do e-book Israel Além do Óbvio (22/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * A versão web do livro (/israel/) é uma página estática: não passa pelo app
 * e não tem a sessão em memória. Para pôr a marca d'água na margem, como nas
 * aulas (components/shell/MarcaDagua.tsx), ela pede aqui o e-mail da conta,
 * parcialmente escondido, e o número da cópia: o mesmo número da marca
 * invisível do curso (lib/marca.js), que o painel /admin/marca reconhece.
 * Num print compartilhado vai o número, que só o dono liga à conta.
 *
 * Só responde a quem tem o direito do livro. Escreve no máximo uma linha por
 * conta em toda a vida dela (a marca, criada no primeiro pedido), e por isso
 * não tem freio próprio.
 */

import { notSignedIn, fail, json } from '../lib/http.js';
import { requireAccount } from './auth.js';
import { hasEntitlement } from '../lib/db.js';
import { marcaDaConta } from '../lib/marca.js';
import { caudaMarcada, textoDaMarca } from '../lib/pdf-marca.js';

export const LIVRO = 'israel-alem-do-roteiro';

/** O começo do e-mail e o domínio, como na marca d'água das aulas
 *  (app/src/lib/marca-dagua.ts). */
export function mascarar(email) {
  const [local = '', dominio = ''] = String(email || '').split('@');
  return `${local.slice(0, 2)}•••@${dominio}`;
}

export async function licenca({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();
  if (!await hasEntitlement(env, account.id, LIVRO)) return fail('not-owned', 403);
  const marca = await marcaDaConta(env, account.id);
  return json({ email: mascarar(account.email), copia: marca ? marca.toUpperCase() : null });
}

/* O PDF do livro, com a mesma marca em toda página (22/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Ver lib/pdf-marca.js: o PDF original sai do servidor de ativos sem ser
 * lido, seguido da cauda que a publicação montou (scripts/pdf-marca.mjs),
 * com o texto da conta escrito nela. Roda DEPOIS do portão, que já conferiu
 * o direito. Devolve null quando não há como marcar (cauda ausente ou de
 * outro PDF, conta sem marca no banco): quem chama serve o PDF como está,
 * como o curso sai sem marca e nunca sem aula quando o banco cai. */
export const CAMINHO_DO_PDF = '/israel/israel-alem-do-roteiro.pdf';

export async function pdfMarcado(request, env, ctx) {
  const account = await requireAccount(request, env);
  if (!account) return null;
  const ativo = (caminho, method = 'GET') => env.ASSETS.fetch(new Request(new URL(caminho, request.url), { method }));
  const [rMeta, rCauda] = await Promise.all([ativo(CAMINHO_DO_PDF + '.cauda.json'), ativo(CAMINHO_DO_PDF + '.cauda')]);
  if (!rMeta.ok || !rCauda.ok) return null;
  const meta = await rMeta.json();
  const pdf = await ativo(CAMINHO_DO_PDF, request.method);
  const tamanho = pdf.headers.get('Content-Length');
  const cancelar = () => pdf.body ? pdf.body.cancel() : null;
  if (!pdf.ok || (request.method === 'GET' && !pdf.body) || (tamanho !== null && Number(tamanho) !== meta.tamanho)) {
    await cancelar();
    return null;
  }
  const marca = await marcaDaConta(env, account.id);
  const cauda = caudaMarcada(new Uint8Array(await rCauda.arrayBuffer()), meta,
    textoDaMarca(mascarar(account.email), marca ? marca.toUpperCase() : null));
  const total = meta.tamanho + cauda.length;
  const headers = {
    'Content-Type': 'application/pdf',
    'Content-Length': String(total),
    'Content-Disposition': 'inline; filename="israel-alem-do-obvio.pdf"'
  };
  if (request.method === 'HEAD') {
    await cancelar();
    return new Response(null, { headers });
  }
  /* FixedLengthStream (Workers) manda o Content-Length; fora dele (testes),
     um TransformStream comum. O original passa por pipeTo, sem ser lido. */
  const { readable, writable } = typeof FixedLengthStream === 'function'
    ? new FixedLengthStream(total) : new TransformStream();
  const envio = pdf.body.pipeTo(writable, { preventClose: true }).then(async () => {
    const w = writable.getWriter();
    await w.write(cauda);
    await w.close();
  }).catch(e => console.error('pdf-marca', e && e.stack || e));
  if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(envio);
  return new Response(readable, { headers });
}
