/* Cache dos ativos, Range nos mp3 e o reply_to dos e-mails.
 * ─────────────────────────────────────────────────────────────────────────
 * Três achados da auditoria de 01/10/2026 que moram no Worker:
 *
 *   PERF-001  os chunks de /_next/static saíam `max-age=0, must-revalidate`
 *             e todo pedido invocava o Worker. Agora: `immutable` em
 *             `blindar`, e uma lista no `run_worker_first` que deixa fora do
 *             Worker só o que é público e imutável, com os cabeçalhos em
 *             app/public/_headers.
 *   PERF-002  o Safari exige 206 a `Range: bytes=0-1` antes de tocar; o
 *             `wrangler dev` devolve 200 inteiro. lib/range.js fatia.
 *   LEGAL-101 "responda este e-mail" sem `reply_to` mandava a resposta para
 *             o remetente, e não para a caixa de suporte.
 *
 * Os clipes de /amostra-audio ficam no Worker de propósito, para o 206 não
 * depender do servidor de ativos de produção; worker/e2e.sh confere depois
 * de publicar.
 */

import { existsSync, readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import { intervalo, responderRange, comRange } from '../../worker/src/lib/range.js';
// @ts-expect-error - idem
import { sendMail, mailReplyTo } from '../../worker/src/lib/mail.js';
// @ts-expect-error - idem
import { isGatedPath } from '../../worker/src/gate.js';
import { envDeTeste } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
const raiz = (p: string) => new URL(`../../${p}`, import.meta.url);

/* Um servidor de ativos de mentira, com os cabeçalhos que o da Cloudflare
   devolve: `max-age=0, must-revalidate` em tudo, e 200 inteiro a um Range
   (que é o que o `wrangler dev` faz). */
const MP3 = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
const ASSETS = {
  fetch: async (r: Request) => {
    const p = new URL(r.url).pathname;
    const cache = { 'Cache-Control': 'public, max-age=0, must-revalidate' };
    if (p.startsWith('/_next/static/')) {
      return new Response('self.x=1', { headers: { 'Content-Type': 'text/javascript', ...cache } });
    }
    if (p.endsWith('.mp3')) {
      return new Response(r.method === 'HEAD' ? null : MP3, {
        headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(MP3.length), ETag: '"mp3"', ...cache }
      });
    }
    return new Response('<html><body>aula</body></html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...cache }
    });
  }
};

const abrir = (path: string, init: RequestInit = {}) =>
  worker.fetch(new Request(SITE + path, init), envDeTeste({ ASSETS }), ctx) as Promise<Response>;

/* ── PERF-001: cache ─────────────────────────────────────────────────────── */

describe('o cache dos ativos', () => {
  it('/_next/static sai imutável por um ano', async () => {
    const r = await abrir('/_next/static/chunks/x.js');
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    /* E continua blindado como tudo o mais. */
    expect(r.headers.get('x-content-type-options')).toBe('nosniff');
    expect(r.headers.get('strict-transport-security')).toContain('max-age=31536000');
  });

  it('uma página paga continua private, no-store (o portão vence)', async () => {
    /* Sem cookie o portão redireciona; o cabeçalho de cache da recusa é o
       que importa aqui: nunca `immutable`, nunca `public`. */
    const r = await abrir('/licao/alef/');
    expect(r.status).toBe(302);
    expect(r.headers.get('cache-control')).toBe('private, no-store');
    expect(r.headers.get('cache-control')).not.toContain('immutable');
  });

  it('uma página pública não ganha o immutable', async () => {
    const r = await abrir('/faq/');
    expect(r.headers.get('cache-control')).toBe('public, max-age=0, must-revalidate');
  });
});

describe('a lista do run_worker_first', () => {
  const toml = readFileSync(raiz('wrangler.toml'), 'utf8');
  const bloco = toml.match(/run_worker_first\s*=\s*\[([\s\S]*?)\]/);
  const regras = bloco ? [...bloco[1]!.matchAll(/"([^"]+)"/g)].map(m => m[1]!) : [];

  it('é uma lista que começa mandando tudo para o Worker', () => {
    expect(bloco, 'run_worker_first precisa ser uma lista, não `true`').toBeTruthy();
    expect(regras[0]).toBe('/*');
    expect(toml).not.toMatch(/run_worker_first\s*=\s*true/);
  });

  it('deixa fora do Worker só o que é público e imutável', () => {
    const fora = regras.filter(r => r.startsWith('!')).map(r => r.slice(1));
    expect(fora).toEqual(expect.arrayContaining(['/_next/static/*', '/fonts/*', '/media/*', '/tracado-amostra/*']));
    /* Cada caminho fora do Worker existe no export e não é rota paga. */
    for (const f of fora) {
      const dir = f.replace(/\/\*$/, '');
      expect(isGatedPath(dir), `${dir} é rota paga e não pode sair do Worker`).toBe(false);
      expect(isGatedPath(`${dir}/x`), `${dir}/x é rota paga e não pode sair do Worker`).toBe(false);
      expect(existsSync(raiz(`app/public${dir}`)) || existsSync(raiz(`app/out${dir}`)), `${dir} não existe no site`).toBe(true);
    }
  });

  it('nunca tira /audio nem /stroke-order do Worker', () => {
    for (const r of regras) {
      expect(r).not.toMatch(/^!\/audio/);
      expect(r).not.toMatch(/^!\/stroke-order/);
    }
    expect(isGatedPath('/audio/he-00000000.mp3')).toBe(true);
    expect(isGatedPath('/stroke-order/alef.svg')).toBe(true);
  });

  it('o _headers cobre cada caminho que saiu do Worker, com nosniff, HSTS e immutable', () => {
    const texto = readFileSync(raiz('app/public/_headers'), 'utf8');
    const blocos = new Map<string, string[]>();
    let atual: string | null = null;
    for (const linha of texto.split('\n')) {
      if (!linha.trim() || linha.trim().startsWith('#')) continue;
      if (!/^\s/.test(linha)) { atual = linha.trim(); blocos.set(atual, []); continue; }
      if (atual) blocos.get(atual)!.push(linha.trim());
    }
    for (const r of regras.filter(x => x.startsWith('!'))) {
      const cab = blocos.get(r.slice(1));
      expect(cab, `_headers sem bloco para ${r.slice(1)}`).toBeTruthy();
      expect(cab).toContain('Cache-Control: public, max-age=31536000, immutable');
      expect(cab).toContain('X-Content-Type-Options: nosniff');
      expect(cab!.some(c => c.startsWith('Strict-Transport-Security: max-age=31536000'))).toBe(true);
    }
    /* E o contrário: nada pago no _headers. */
    for (const caminho of blocos.keys()) {
      expect(isGatedPath(caminho.replace(/\/\*$/, '/x'))).toBe(false);
    }
  });
});

/* ── PERF-002: Range ─────────────────────────────────────────────────────── */

describe('o intervalo de um Range', () => {
  it('bytes=0-1 são os dois primeiros', () => {
    expect(intervalo('bytes=0-1', 10)).toEqual({ de: 0, ate: 1 });
  });
  it('bytes=5- vai até o fim', () => {
    expect(intervalo('bytes=5-', 10)).toEqual({ de: 5, ate: 9 });
  });
  it('bytes=-3 são os três últimos', () => {
    expect(intervalo('bytes=-3', 10)).toEqual({ de: 7, ate: 9 });
  });
  it('recorta um fim além do arquivo', () => {
    expect(intervalo('bytes=8-999', 10)).toEqual({ de: 8, ate: 9 });
  });
  it('um começo além do fim, ou invertido, é inválido (416)', () => {
    expect(intervalo('bytes=10-', 10)).toEqual({ invalido: true });
    expect(intervalo('bytes=7-3', 10)).toEqual({ invalido: true });
  });
  it('sem cabeçalho, ou forma que não é a nossa, é 200 inteiro', () => {
    expect(intervalo(null, 10)).toBeNull();
    expect(intervalo('bytes=-', 10)).toBeNull();
    expect(intervalo('bytes=0-1,3-4', 10)).toBeNull();
    expect(intervalo('items=0-1', 10)).toBeNull();
  });
});

describe('responderRange, a partir dos bytes inteiros', () => {
  const pedir = (range?: string, method = 'GET') =>
    new Request(`${SITE}/audio/x.mp3`, { method, headers: range ? { Range: range } : {} });

  it('206 com Content-Range, Accept-Ranges e Content-Length certos', async () => {
    const r = responderRange(pedir('bytes=0-1'), MP3, { 'Content-Type': 'audio/mpeg' });
    expect(r.status).toBe(206);
    expect(r.headers.get('content-range')).toBe('bytes 0-1/10');
    expect(r.headers.get('accept-ranges')).toBe('bytes');
    expect(r.headers.get('content-length')).toBe('2');
    expect(r.headers.get('content-type')).toBe('audio/mpeg');
    expect([...new Uint8Array(await r.arrayBuffer())]).toEqual([10, 20]);
  });

  it('sufixo e aberto', async () => {
    const a = responderRange(pedir('bytes=-3'), MP3);
    expect(a.headers.get('content-range')).toBe('bytes 7-9/10');
    expect([...new Uint8Array(await a.arrayBuffer())]).toEqual([80, 90, 100]);
    const b = responderRange(pedir('bytes=5-'), MP3);
    expect(b.headers.get('content-range')).toBe('bytes 5-9/10');
    expect(b.headers.get('content-length')).toBe('5');
  });

  it('416 com o tamanho total quando o intervalo não cabe', () => {
    const r = responderRange(pedir('bytes=10-'), MP3);
    expect(r.status).toBe(416);
    expect(r.headers.get('content-range')).toBe('bytes */10');
  });

  it('sem Range, 200 inteiro e anunciando que aceita Range', async () => {
    const r = responderRange(pedir(), MP3);
    expect(r.status).toBe(200);
    expect(r.headers.get('accept-ranges')).toBe('bytes');
    expect(r.headers.get('content-length')).toBe('10');
  });

  it('HEAD leva os cabeçalhos e nenhum corpo', async () => {
    const r = responderRange(pedir('bytes=0-1', 'HEAD'), MP3);
    expect(r.status).toBe(206);
    expect(r.body).toBeNull();
  });
});

describe('comRange, sobre a resposta do servidor de ativos', () => {
  const pedir = (range?: string, method = 'GET') =>
    new Request(`${SITE}/audio/x.mp3`, { method, headers: range ? { Range: range } : {} });

  it('fatia um 200 quando o pedido trouxe Range', async () => {
    const r = await comRange(pedir('bytes=0-1'), await ASSETS.fetch(pedir('bytes=0-1')));
    expect(r.status).toBe(206);
    expect(r.headers.get('content-range')).toBe('bytes 0-1/10');
    expect(r.headers.get('content-length')).toBe('2');
    expect(r.headers.get('etag')).toBe('"mp3"');
    expect([...new Uint8Array(await r.arrayBuffer())]).toEqual([10, 20]);
  });

  it('deixa um 206 pronto passar como veio', async () => {
    const pronto = new Response(MP3.slice(0, 2), { status: 206, headers: { 'Content-Range': 'bytes 0-1/10' } });
    expect(await comRange(pedir('bytes=0-1'), pronto)).toBe(pronto);
  });

  it('sem Range, não toca na resposta', async () => {
    const res = await ASSETS.fetch(pedir());
    expect(await comRange(pedir(), res)).toBe(res);
  });

  it('416 para um intervalo que não cabe', async () => {
    const r = await comRange(pedir('bytes=50-'), await ASSETS.fetch(pedir('bytes=50-')));
    expect(r.status).toBe(416);
    expect(r.headers.get('content-range')).toBe('bytes */10');
  });

  it('HEAD com Range usa o Content-Length do servidor', async () => {
    const r = await comRange(pedir('bytes=0-1', 'HEAD'), await ASSETS.fetch(pedir('bytes=0-1', 'HEAD')));
    expect(r.status).toBe(206);
    expect(r.headers.get('content-range')).toBe('bytes 0-1/10');
    expect(r.body).toBeNull();
  });

  it('HEAD sem Content-Length devolve o 200 como veio, e não um 416 inventado', async () => {
    const semTamanho = new Response(null, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
    const r = await comRange(pedir('bytes=0-1', 'HEAD'), semTamanho);
    expect(r.status).toBe(200);
  });

  it('o mp3 da capa passa pelo Worker e sai em 206, sem conta', async () => {
    const r = await abrir('/amostra-audio/sha.mp3', { headers: { Range: 'bytes=0-1' } });
    expect(r.status).toBe(206);
    expect(r.headers.get('content-range')).toBe('bytes 0-1/10');
  });
});

describe('o Worker fatia o mp3 do git atrás do portão', () => {
  /* Conta com acesso: o portão deixa passar, o painel não tem gravação
     (banco vazio), o arquivo vem do servidor de ativos de mentira. */
  async function comAcesso() {
    const env = envDeTeste({ ASSETS });
    // @ts-expect-error - módulo JS do Worker, sem tipos
    const auth = await import('../../worker/src/api/auth.js');
    // @ts-expect-error - idem
    const { grantAccess } = await import('../../worker/src/lib/db.js');
    const { pedido, cookieDe } = await import('./ajuda/d1');
    const r = await auth.signup({
      request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, declarouIdade: true, name: 'Teste', email: 'a@exemplo.com.br', password: 'senha-boa-123' }),
      env, ctx
    });
    expect(r.status).toBe(200);
    const body = await r.json() as { account: { id: number } };
    await grantAccess(env, { accountId: body.account.id, courseSlug: 'alfabetizacao', orderId: 'T', months: 12 });
    return { env, cookie: cookieDe(r) };
  }

  it('bytes=0-1 em /audio/he-….mp3 sai 206', async () => {
    const { env, cookie } = await comAcesso();
    const r = await worker.fetch(new Request(`${SITE}/audio/he-0064abb5.mp3`, {
      headers: { Cookie: cookie, Range: 'bytes=0-1', 'Sec-Fetch-Dest': 'audio' }
    }), env, ctx) as Response;
    expect(r.status).toBe(206);
    expect(r.headers.get('content-range')).toBe('bytes 0-1/10');
    expect(r.headers.get('accept-ranges')).toBe('bytes');
    /* Continua pago: nada de cache compartilhado. */
    expect(r.headers.get('cache-control')).toBe('private, no-store');
  });

  it('sem cookie, o portão continua na frente do Range', async () => {
    const r = await abrir('/audio/he-0064abb5.mp3', { headers: { Range: 'bytes=0-1', 'Sec-Fetch-Dest': 'audio' } });
    expect(r.status).toBe(403);
  });
});

/* ── LEGAL-101: reply_to ─────────────────────────────────────────────────── */

describe('o reply_to dos e-mails', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  const env = (extra: Record<string, unknown> = {}) => ({
    RESEND_API_KEY: 're_de_teste',
    EMAIL_FROM: 'Hebraico Fluente <contato@hebraicofluente.com.br>',
    RESEND_BASE: 'https://api.resend.test',
    ...extra
  });

  async function corpoEnviado(e: Record<string, unknown>) {
    let corpo: Record<string, unknown> = {};
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      corpo = JSON.parse(String(init.body)) as Record<string, unknown>;
      return new Response(JSON.stringify({ id: 'msg' }), { status: 200 });
    });
    const r = await sendMail(e, { to: 'aluno@exemplo.com.br', subject: 'Oi', text: 'oi', html: '<p>oi</p>' });
    expect(r.ok).toBe(true);
    return corpo;
  }

  it('o corpo enviado à Resend carrega reply_to com a caixa de suporte', async () => {
    const corpo = await corpoEnviado(env({ SUPPORT_EMAIL: ' languageswithmoshik@gmail.com ' }));
    expect(corpo.reply_to).toBe('languageswithmoshik@gmail.com');
    expect(corpo.from).toBe('Hebraico Fluente <contato@hebraicofluente.com.br>');
    expect(corpo.to).toEqual(['aluno@exemplo.com.br']);
  });

  it('sem SUPPORT_EMAIL, não inventa um reply_to', async () => {
    const corpo = await corpoEnviado(env());
    expect('reply_to' in corpo).toBe(false);
    expect(mailReplyTo({})).toBe('');
  });

  it('o wrangler.toml declara o SUPPORT_EMAIL que vai no reply_to', () => {
    const toml = readFileSync(raiz('wrangler.toml'), 'utf8');
    expect(toml).toMatch(/^SUPPORT_EMAIL\s*=\s*"[^"@]+@[^"]+"/m);
  });
});
