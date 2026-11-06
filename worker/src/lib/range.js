/* Pedidos parciais (`Range: bytes=...`) de um corpo que já está inteiro na mão.
 * ─────────────────────────────────────────────────────────────────────────
 * O Safari (e todo iPhone) só toca mídia de um servidor que responde a
 * `Range`: antes de tocar ele pede `bytes=0-1` e espera 206 com
 * `Content-Range`; um 200 no lugar faz o botão "Ouvir" ficar mudo. Isto já
 * estava resolvido para as gravações do painel (api/audio.js, que lê o blob
 * do D1). Este arquivo tira a conta de lá para um lugar só, e a põe também
 * na frente dos mp3 que saem do servidor de ativos pelo Worker (/audio/*,
 * atrás do portão).
 *
 * Em produção o servidor de ativos da Cloudflare já responde 206 sozinho; o
 * `wrangler dev` local não fatia (devolve 200 inteiro). Por isso
 * `comRange()` só age quando a resposta veio 200: um 206 ou 416 que já chegou
 * pronto passa intocado.
 *
 * Só a forma `bytes=de-ate`, `bytes=de-` e `bytes=-sufixo`, uma faixa por
 * pedido. Um navegador tocando áudio nunca manda mais de uma; multi-faixa
 * (resposta multipart) não vale o código que custaria.
 */

/**
 * O intervalo pedido, resolvido contra o tamanho total.
 *   null                  sem cabeçalho, ou forma que não é a nossa: 200 inteiro
 *   { de, ate }           inclusivos, já recortados ao tamanho
 *   { invalido: true }    começa depois do fim, ou de > ate: 416
 */
export function intervalo(range, total) {
  const m = range && String(range).match(/^bytes=(\d*)-(\d*)$/);
  if (!m || !(m[1] || m[2])) return null;
  let de, ate;
  if (m[1]) {
    de = Number(m[1]);
    ate = m[2] ? Math.min(Number(m[2]), total - 1) : total - 1;
  } else {
    /* `bytes=-3`: os ÚLTIMOS três bytes. */
    de = Math.max(0, total - Number(m[2]));
    ate = total - 1;
  }
  if (total === 0 || de >= total || de > ate) return { invalido: true };
  return { de, ate };
}

/**
 * A resposta a um pedido com `Range`, a partir dos bytes inteiros.
 * `base` são os cabeçalhos que valem em qualquer caso (tipo, ETag...).
 * Sem `Range` (ou com forma estranha), 200 com o corpo inteiro.
 */
export function responderRange(request, dados, base = {}) {
  const total = dados.length;
  const semCorpo = request.method === 'HEAD';
  const cabecalhos = { ...base, 'Accept-Ranges': 'bytes' };
  const faixa = intervalo(request.headers.get('Range'), total);
  if (faixa && faixa.invalido) {
    return new Response(null, {
      status: 416, headers: { ...cabecalhos, 'Content-Range': `bytes */${total}` }
    });
  }
  if (faixa) {
    const { de, ate } = faixa;
    return new Response(semCorpo ? null : dados.slice(de, ate + 1), {
      status: 206,
      headers: {
        ...cabecalhos,
        'Content-Range': `bytes ${de}-${ate}/${total}`,
        'Content-Length': String(ate - de + 1)
      }
    });
  }
  return new Response(semCorpo ? null : dados, {
    status: 200, headers: { ...cabecalhos, 'Content-Length': String(total) }
  });
}

/**
 * Fatia uma resposta 200 do servidor de ativos quando o pedido trouxe
 * `Range`. Qualquer outro caso (sem Range, resposta que não é 200, pedido
 * que não é GET/HEAD) devolve a resposta como veio.
 *
 * Lê o corpo inteiro na memória: os clipes têm dezenas de KB, e o maior
 * arquivo que passa por aqui é um mp3 de poucos segundos.
 */
export async function comRange(request, res) {
  if (res.status !== 200) return res;
  if (request.method !== 'GET' && request.method !== 'HEAD') return res;
  const range = request.headers.get('Range');
  if (!intervalo(range, Number.MAX_SAFE_INTEGER)) return res;

  /* Os cabeçalhos que descrevem o conteúdo seguem; os que descrevem o
     tamanho/corpo são recalculados pela fatia. */
  const base = {};
  for (const [k, v] of res.headers) {
    const nome = k.toLowerCase();
    if (nome === 'content-length' || nome === 'content-range' || nome === 'accept-ranges') continue;
    base[k] = v;
  }

  let dados;
  if (request.method === 'HEAD') {
    /* HEAD: o servidor de ativos manda o tamanho, não o corpo. Sem um
       Content-Length declarado não há como responder Content-Range, e um 416
       inventado seria pior que o 200 que veio (o `wrangler dev` omite o
       cabeçalho no HEAD). O Safari pede a fatia com GET. */
    const declarado = res.headers.get('Content-Length');
    const total = Number(declarado);
    if (declarado === null || !Number.isFinite(total) || total <= 0) return res;
    dados = new Uint8Array(total);
  } else {
    dados = new Uint8Array(await res.arrayBuffer());
  }
  return responderRange(request, dados, base);
}
