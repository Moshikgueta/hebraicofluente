/* O lembrete para estudar com a chave DESLIGADA (forçada por mock neste
   arquivo). Ligado desde 29/10/2026, com o parágrafo da Privacidade aprovado
   pelo dono; se um dia for desligado, nada dele pode existir: rota, campo no
   /api/me, envio, caixa do perfil e parágrafo. */
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../data/empresa.json', () => {
  const real = JSON.parse(readFileSync(new URL('../../data/empresa.json', import.meta.url), 'utf8'));
  return { default: { ...real, privacidade: { ...real.privacidade, lembreteDeEstudo: false } } };
});
/* O app lê a cópia de app/content (o alias @content), não data/. */
vi.mock('@content/empresa.json', () => {
  const real = JSON.parse(readFileSync(new URL('../content/empresa.json', import.meta.url), 'utf8'));
  return { default: { ...real, privacidade: { ...real.privacidade, lembreteDeEstudo: false } } };
});
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { runLembretes } from '../../worker/src/lembrete.js';
import empresa from '../../data/empresa.json';
import { lembreteLigado } from '@/lib/empresa';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };

describe('o lembrete desligado', () => {
  it('com a chave em false', () => {
    expect(empresa.privacidade.lembreteDeEstudo).toBe(false);
    expect(lembreteLigado()).toBe(false);
  });

  it('a rota responde 404 e o /api/me não fala dele', async () => {
    const env = envDeTeste({ RESEND_API_KEY: 're_teste', EMAIL_FROM: 'x <x@exemplo.com>' });
    const r = await auth.signup({
      request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, declarouIdade: true, name: 'Ana', email: 'ana@exemplo.com', password: 'senha-boa-123' }), env, ctx
    });
    const cookie = cookieDe(r);
    const put = await worker.fetch(new Request(`${SITE}/api/lembrete`, {
      method: 'PUT', headers: { cookie, Origin: SITE, 'Content-Type': 'application/json' }, body: '{"quero":true}'
    }), env, ctx);
    expect(put.status).toBe(404);
    const corpo = await (await worker.fetch(new Request(`${SITE}/api/me`, { headers: { cookie } }), env, ctx)).json() as { account: object };
    expect('lembrete' in corpo.account).toBe(false);
    expect(await runLembretes(env, Date.parse('2026-11-02T22:30:00Z'))).toEqual({ enviados: 0 });
  });

  it('em produção está ligado, e a Privacidade traz o parágrafo', () => {
    const real = JSON.parse(readFileSync(new URL('../../data/empresa.json', import.meta.url), 'utf8'));
    expect(real.privacidade.lembreteDeEstudo).toBe(true);
  });

  it('o perfil e a Privacidade só mostram com a chave', () => {
    const perfil = readFileSync(new URL('../src/app/perfil/PerfilClient.tsx', import.meta.url), 'utf8');
    expect(perfil).toMatch(/if \(!lembreteLigado\(\) \|\|/);
    const priv = readFileSync(new URL('../src/app/privacidade/page.tsx', import.meta.url), 'utf8');
    expect(priv).toMatch(/\{lembreteLigado\(\) && \(\s*<p>\s*<strong>O lembrete para estudar\./);
  });
});
