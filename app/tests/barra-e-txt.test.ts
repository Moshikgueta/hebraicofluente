/* O 308 da barra final e o noindex dos .txt (auditoria de 01/10/2026,
 * SEO-002 e SEO-003), pelo Worker de verdade, com um servidor de ativos de
 * mentira que responde como o da Cloudflare: 307 para a forma com barra. */

import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
import { envDeTeste } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };

const ASSETS = {
  fetch: async (r: Request) => {
    const p = new URL(r.url).pathname;
    if (p === '/cursos') return new Response(null, { status: 307, headers: { Location: '/cursos/' } });
    if (p.endsWith('.txt')) return new Response('1:"x"', { headers: { 'Content-Type': 'text/plain' } });
    return new Response('<html><body>ok</body></html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};

const abrir = (path: string) =>
  worker.fetch(new Request(SITE + path, { redirect: 'manual' }), envDeTeste({ ASSETS }), ctx) as Promise<Response>;

describe('o redirecionamento da barra final', () => {
  it('sai 308 (permanente), com o mesmo destino', async () => {
    const r = await abrir('/cursos');
    expect(r.status).toBe(308);
    expect(r.headers.get('location')).toBe('/cursos/');
    expect(r.headers.get('strict-transport-security')).toContain('max-age');
  });

  it('o resto passa intocado', async () => {
    const r = await abrir('/cursos/');
    expect(r.status).toBe(200);
  });
});

describe('os .txt do export', () => {
  it('o payload RSC sai com noindex', async () => {
    const r = await abrir('/faq/index.txt');
    expect(r.headers.get('x-robots-tag')).toBe('noindex');
  });

  it('o robots.txt não', async () => {
    const r = await abrir('/robots.txt');
    expect(r.headers.get('x-robots-tag')).toBeNull();
  });
});
