/* A CSP estrita em observação (auditoria, SEC-003): tools/csp-hashes.mjs,
 * `blindar` em worker/src/worker.js e worker/src/api/csp.js. */
import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - script de build, sem tipos
import { hashesDoHtml, rotaDoArquivo } from '../../tools/csp-hashes.mjs';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };

const sha = (s: string) => 'sha256-' + createHash('sha256').update(s, 'utf8').digest('base64');
const MAPA = { '/': ['sha256-capa'], '/faq': ['sha256-faq1', 'sha256-faq2'], '404': ['sha256-erro'] };
const html = (status = 200) => new Response('<!doctype html><p>oi</p>', {
  status, headers: { 'Content-Type': 'text/html; charset=utf-8' }
});
const ASSETS = {
  fetch: async (r: Request) => {
    const p = new URL(r.url).pathname;
    if (p === '/_csp-hashes.json') return new Response(JSON.stringify(MAPA), { headers: { 'Content-Type': 'application/json' } });
    if (p === '/' || p.startsWith('/faq')) return html();
    if (p.endsWith('.js')) return new Response('1', { headers: { 'Content-Type': 'text/javascript' } });
    return html(404);
  }
};
const abrir = (path: string, env = envDeTeste({ ASSETS }) as Env) =>
  worker.fetch(new Request(SITE + path), env, ctx);

describe('o gerador de hashes', () => {
  it('pega só os scripts inline, com o texto exato', () => {
    const doc = '<script src="/_next/a.js"></script><script>self.a=1</script>'
      + '<script type="application/ld+json">{"x":1}</script><script id="t"> b() </script><script>self.a=1</script>';
    expect(hashesDoHtml(doc)).toEqual([sha('self.a=1'), sha(' b() ')]);
  });

  it('grava a rota como o Worker a vê', () => {
    expect(rotaDoArquivo('index.html')).toBe('/');
    expect(rotaDoArquivo('faq/index.html')).toBe('/faq');
    expect(rotaDoArquivo('404.html')).toBe('404');
    expect(rotaDoArquivo('404/index.html')).toBe('404');
  });
});

describe('a CSP estrita em observação', () => {
  it('sai em Report-Only, com os hashes da página e sem unsafe-inline', async () => {
    const r = await abrir('/faq/');
    const obs = r.headers.get('Content-Security-Policy-Report-Only')!;
    expect(obs).toContain("script-src 'self' 'report-sample' 'sha256-faq1' 'sha256-faq2'");
    expect(obs.match(/script-src [^;]*/)![0]).not.toContain('unsafe-inline');
    expect(obs).toContain("frame-ancestors 'none'");
    expect(obs).toMatch(/report-uri \/api\/csp-report$/);
    /* A política que vale continua a de sempre. */
    expect(r.headers.get('Content-Security-Policy')).toContain("script-src 'self' 'unsafe-inline'");
  });

  it('a capa e a página de erro usam as próprias listas', async () => {
    expect((await abrir('/')).headers.get('Content-Security-Policy-Report-Only')).toContain("'sha256-capa'");
    const erro = await abrir('/nao-existe');
    expect(erro.status).toBe(404);
    expect(erro.headers.get('Content-Security-Policy-Report-Only')).toContain("'sha256-erro'");
  });

  it('fora de HTML, não há observação', async () => {
    const r = await abrir('/_next/x.js');
    expect(r.headers.get('Content-Security-Policy-Report-Only')).toBeNull();
  });

  it('a lista de hashes não é servida ao visitante', async () => {
    expect((await abrir('/_csp-hashes.json')).status).toBe(404);
  });
});

describe('os relatos', () => {
  const relato = (env: Env, body: unknown, ip = '203.0.113.7') =>
    worker.fetch(pedido(`${SITE}/api/csp-report`, body, { 'CF-Connecting-IP': ip, 'Content-Type': 'application/csp-report' }), env, ctx);
  const trilha = (env: Env) =>
    env.DB.bruto.prepare("SELECT detail FROM access_log WHERE action = 'csp-violacao'").all() as { detail: string }[];
  const exemplo = {
    'csp-report': {
      'document-uri': 'https://hebraicofluente.com.br/sair-da-lista/?t=segredo',
      'effective-directive': 'script-src-elem',
      'blocked-uri': 'inline',
      'script-sample': 'alert(1)'
    }
  };

  it('vão para a trilha, sem a query da página', async () => {
    const env = envDeTeste() as Env;
    expect((await relato(env, exemplo)).status).toBe(204);
    const [l] = trilha(env);
    expect(l!.detail).toBe('/sair-da-lista/ | script-src-elem | inline | alert(1)');
  });

  it('aceitam o navegador mesmo quando ele declara outra origem, e ignoram lixo', async () => {
    const env = envDeTeste() as Env;
    const r = await worker.fetch(pedido(`${SITE}/api/csp-report`, exemplo, { Origin: 'null', 'Sec-Fetch-Site': 'same-site' }), env, ctx);
    expect(r.status).toBe(204);
    expect((await relato(env, 'lixo')).status).toBe(204);
    expect((await relato(env, { outra: 1 })).status).toBe(204);
    expect(trilha(env)).toHaveLength(1);
  });

  it('não viram texto livre no resumo público', async () => {
    const env = envDeTeste() as Env;
    await relato(env, { 'csp-report': { ...exemplo['csp-report'], 'document-uri': 'https://golpe.com/x' } });
    expect(trilha(env)).toHaveLength(0);
    await relato(env, { 'csp-report': {
      'document-uri': `${SITE}/faq/`, 'effective-directive': 'script-src`\n[clique](https://golpe.com)',
      'blocked-uri': 'https://cdn.golpe.com/a/b.js?x=1', 'script-sample': '```<b>oi</b>|'
    } });
    expect(trilha(env)[0]!.detail).toBe('/faq/ | script-srccliquehttpsgolpecom | https://cdn.golpe.com | boi/b');
  });

  it('têm freio por IP e teto por hora', async () => {
    const env = envDeTeste() as Env;
    for (let i = 0; i < 15; i++) await relato(env, exemplo);
    expect(trilha(env)).toHaveLength(10);
    for (let i = 0; i < 80; i++) await relato(env, exemplo, `198.51.100.${i}`);
    expect(trilha(env)).toHaveLength(60);
  });

  it('corpo grande é ignorado', async () => {
    const env = envDeTeste() as Env;
    const grande = { 'csp-report': { 'script-sample': 'x'.repeat(20_000) } };
    expect((await relato(env, grande)).status).toBe(204);
    expect(trilha(env)).toHaveLength(0);
  });
});
