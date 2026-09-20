/* Respostas HTTP da API.
 * ─────────────────────────────────────────────────────────────────────────
 * Duas regras, e as duas já foram aprendidas do jeito difícil por outra
 * plataforma antes desta:
 *
 *   1. `Cache-Control: no-store` em TODA resposta de API. Uma delas carrega o
 *      nome, o e-mail e os cursos de um aluno; um proxy que guarde isso
 *      entrega a conta de uma pessoa para a próxima.
 *   2. O erro que sai daqui é um CÓDIGO, nunca uma frase. O texto em português
 *      vive no app (lib/account/types.ts), num lugar só. Servidor escrevendo
 *      texto de interface é como se acaba com duas mensagens diferentes para
 *      o mesmo problema.
 */

export function json(body, status = 200, headers = {}) {
  const h = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  for (const [k, v] of Object.entries(headers || {})) {
    /* Um array vira vários cabeçalhos em vez de um só - é assim que uma
       resposta consegue mandar mais de um Set-Cookie. Espalhar num objeto
       colapsaria para o último. */
    if (Array.isArray(v)) for (const one of v) h.append(k, one);
    else h.set(k, v);
  }
  return new Response(JSON.stringify(body), { status, headers: h });
}

/** Códigos fechados, iguais aos de app/src/lib/account/types.ts. */
export const fail = (code, status = 400) => json({ error: code }, status);

export const notSignedIn = () => fail('not-signed-in', 401);
export const serverError = () => fail('server', 500);

/**
 * Corpo JSON com limite de tamanho. Um POST de 10 MB não é um cadastro.
 *
 * O limite é em BYTES e é conferido duas vezes: antes de ler, pelo
 * `Content-Length` que o cliente declarou - o que poupa o trabalho de
 * materializar um corpo que já se sabe grande demais -, e depois de ler, em
 * bytes de verdade. A versão anterior media `raw.length`, que conta unidades
 * UTF-16: um corpo em hebraico passava com o dobro do tamanho nominal, e um
 * corpo de 100 MB era lido inteiro antes de ser recusado.
 */
export async function readJson(request, maxBytes = 8 * 1024) {
  const declarado = Number(request.headers.get('Content-Length') || 0);
  if (Number.isFinite(declarado) && declarado > maxBytes) return null;
  const raw = await request.text();
  if (raw.length > maxBytes || new TextEncoder().encode(raw).length > maxBytes) return null;
  try { return JSON.parse(raw || '{}'); } catch { return null; }
}
