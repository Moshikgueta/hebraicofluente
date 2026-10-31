/* Os vídeos do "Me explica, Moshik" (28/10/2026): só arquivos com nome de
   letra, em mp4, até 25 MiB, legenda só de vídeo que existe; atrás do
   portão; e servidos com Range, porque o Safari não toca vídeo sem 206. */
import { mkdtempSync, readFileSync, truncateSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS das ferramentas, sem tipos
import { prepararVideos, TETO_DO_VIDEO } from '../../tools/videos.mjs';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import { isGatedPath } from '../../worker/src/gate.js';
import { VIDEO_MANIFEST } from '@/lib/video-manifest';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';

const LETRAS = new Set(['alef', 'mem']);
const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };

function pasta(arquivos: Record<string, string | number>) {
  const d = mkdtempSync(join(tmpdir(), 'video-'));
  for (const [nome, c] of Object.entries(arquivos)) {
    const p = join(d, nome);
    if (typeof c === 'number') { writeFileSync(p, ''); truncateSync(p, c); } else writeFileSync(p, c);
  }
  return d;
}
const destino = () => join(mkdtempSync(join(tmpdir(), 'pub-')), 'video');

describe('a pasta video/', () => {
  it('copia o vídeo e a legenda e monta o manifesto', () => {
    const d = destino();
    const m = prepararVideos(pasta({ 'alef.mp4': 'x', 'alef.vtt': 'WEBVTT', 'mem.mp4': 'y', 'README.md': '#' }), d, LETRAS);
    expect(m).toEqual([{ letra: 'alef', legenda: true }, { letra: 'mem', legenda: false }]);
    expect(existsSync(join(d, 'alef.vtt'))).toBe(true);
  });
  it('para com nome que não é letra, formato errado, legenda sozinha ou arquivo grande', () => {
    expect(() => prepararVideos(pasta({ 'bet.mp4': 'x' }), destino(), LETRAS)).toThrow(/bet\.mp4/);
    expect(() => prepararVideos(pasta({ 'alef.mov': 'x' }), destino(), LETRAS)).toThrow(/alef\.mov/);
    expect(() => prepararVideos(pasta({ 'Alef.mp4': 'x' }), destino(), LETRAS)).toThrow();
    expect(() => prepararVideos(pasta({ 'mem.vtt': 'WEBVTT' }), destino(), LETRAS)).toThrow(/legenda/);
    expect(() => prepararVideos(pasta({ 'alef.mp4': TETO_DO_VIDEO + 1 }), destino(), LETRAS)).toThrow(/25 MiB/);
  });
  it('o manifesto da build é o da pasta: hoje, nenhum vídeo', () => {
    expect(VIDEO_MANIFEST).toEqual([]);
    expect(readFileSync(new URL('../../video/README.md', import.meta.url), 'utf8')).toContain('25 MB');
  });
});

describe('o vídeo no site', () => {
  const MP4 = new Uint8Array(10);
  const ASSETS = { fetch: async () => new Response(MP4, { headers: { 'Content-Type': 'video/mp4', 'Content-Length': '10' } }) };

  it('fica atrás do portão', async () => {
    expect(isGatedPath('/video/alef.mp4')).toBe(true);
    const r = await worker.fetch(new Request(`${SITE}/video/alef.mp4`, { headers: { 'Sec-Fetch-Dest': 'video' } }),
      envDeTeste({ ASSETS }), ctx) as Response;
    expect(r.status).not.toBe(200);
    expect(r.status).not.toBe(206);
  });

  it('quem tem o curso recebe 206 a um Range', async () => {
    const env = envDeTeste({ ASSETS });
    // @ts-expect-error - módulo JS do Worker, sem tipos
    const auth = await import('../../worker/src/api/auth.js');
    // @ts-expect-error - idem
    const { grantAccess } = await import('../../worker/src/lib/db.js');
    const s = await auth.signup({
      request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, declarouIdade: true, name: 'Ana', email: 'ana@exemplo.com', password: 'senha-boa-123' }), env, ctx
    });
    const { account } = await s.json() as { account: { id: number } };
    await grantAccess(env, { accountId: account.id, courseSlug: 'alfabetizacao', orderId: 'T', months: 12 });
    const r = await worker.fetch(new Request(`${SITE}/video/alef.mp4`, {
      headers: { Cookie: cookieDe(s), Range: 'bytes=0-1', 'Sec-Fetch-Dest': 'video' }
    }), env, ctx) as Response;
    expect(r.status).toBe(206);
    expect(r.headers.get('content-range')).toBe('bytes 0-1/10');
  });

  it('a folha só mostra o vídeo que existe, e só em português', () => {
    const c = readFileSync(new URL('../src/components/learn/VideoDoMoshik.tsx', import.meta.url), 'utf8');
    expect(c).toMatch(/LOCALE === 'pt'/);
    expect(c).toMatch(/if \(!v\) return null/);
    expect(c).toMatch(/preload="none"/);
  });
});
