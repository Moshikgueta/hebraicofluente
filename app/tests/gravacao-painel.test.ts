/* O painel de gravação (/admin/gravar), de ponta a ponta.
 * ─────────────────────────────────────────────────────────────────────────
 * O que tem de ser verdade para o dono do curso gravar pelo iPhone e o som
 * entrar no ar no lugar certo:
 *
 *   · só administrador grava, substitui e remove;
 *   · o arquivo é conferido pelo conteúdo, e não pelo que o navegador declara;
 *   · o curso toca a gravação do painel no MESMO endereço de sempre, depois
 *     do portão, com `Range` (o Safari não toca mídia sem ele);
 *   · remover a gravação devolve o arquivo do estúdio;
 *   · os nomes organizados (`alef.mp4`) são únicos no catálogo inteiro;
 *   · o gravador acha a voz, escolhe o formato e converte o que não toca.
 *
 * O banco é SQLite de verdade com o worker/schema.sql de produção
 * (tests/ajuda/d1.ts), então a tabela `gravacoes` é a mesma que vai ao ar.
 */

import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { grantAccess } from '../../worker/src/lib/db.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { nomesOrganizados, idDoClipe } from '../../worker/src/lib/nomes-audio.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { conteudoBate, normalizarTipo, isAdmin } from '../../worker/src/api/audio.js';
import catalogo from '../../data/audio.json';
import letters from '../content/letters.json';
import {
  acharVoz, diagnosticar, escolherFormato, paraMono, precisaConverter, wavDoTrecho
} from '@/lib/gravador';
import { aplicarManifesto, temClipe, urlDoClipe } from '@/lib/audio-registro';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
const ADMIN = 'dono@hebraicofluente.com.br';

type Clip = { num: number; he: string; translit: string | null; gloss: string; kind: string; where: string[]; file: string };
const CLIPES = (catalogo as { clips: Clip[] }).clips;
const idDe = (translit: string) => idDoClipe(CLIPES.find(c => c.translit === translit)!);
const ALEF = idDe('Álef');

/* Um MP4 mínimo: o que o servidor confere são os bytes 4-8 (`ftyp`). */
const mp4 = (marca = 1) => {
  const b = new Uint8Array(64);
  b.set([0, 0, 0, 24], 0);
  b.set([...'ftypM4A '].map(c => c.charCodeAt(0)), 4);
  b[40] = marca;
  return b;
};

const ASSETS = {
  fetch: async (_r: Request) => new Response('do-estudio', {
    status: 200, headers: { 'Content-Type': 'audio/mpeg' }
  })
};

async function conta(env: Record<string, unknown>, email: string) {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { name: 'Teste', email, password: 'senha-boa-123' }),
    env, ctx
  });
  expect(r.status).toBe(200);
  const body = await r.json() as { account: { id: number } };
  await grantAccess(env, { accountId: body.account.id, courseSlug: 'alfabetizacao', orderId: 'T', months: 12 });
  return cookieDe(r);
}

async function cenario() {
  const env = envDeTeste({ ASSETS, ADMIN_EMAILS: ` ${ADMIN.toUpperCase()} , outro@x.com` });
  const admin = await conta(env, ADMIN);
  const aluno = await conta(env, 'aluna@exemplo.com.br');
  const chamar = (metodo: string, caminho: string, cookie?: string, body?: BodyInit, headers: Record<string, string> = {}) =>
    worker.fetch(new Request(`${SITE}${caminho}`, {
      method: metodo, body, headers: { ...(cookie ? { Cookie: cookie } : {}), ...headers }
    }), env, ctx) as Promise<Response>;
  const enviar = (id: string, dados: Uint8Array, tipo = 'audio/mp4', cookie = admin, extra = '') =>
    chamar('PUT', `/api/admin/audio?id=${id}${extra}`, cookie, dados as unknown as BodyInit, { 'Content-Type': tipo });
  return { env, admin, aluno, chamar, enviar };
}

describe('quem pode gravar', () => {
  it('sem sessão: 401; aluno: 403; administrador: grava', async () => {
    const { enviar, aluno, chamar } = await cenario();
    expect((await chamar('PUT', `/api/admin/audio?id=${ALEF}`, undefined, mp4() as unknown as BodyInit, { 'Content-Type': 'audio/mp4' })).status).toBe(401);
    expect((await enviar(ALEF, mp4(), 'audio/mp4', aluno)).status).toBe(403);
    expect((await chamar('GET', '/api/admin/audio', aluno)).status).toBe(403);
    const r = await enviar(ALEF, mp4());
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ ok: true, id: ALEF, tipo: 'audio/mp4', arquivo: 'alef.mp4' });
  });

  it('a lista de administradores ignora maiúsculas e espaços', () => {
    const env = { ADMIN_EMAILS: ' A@B.com ,c@d.com' };
    expect(isAdmin({ email: 'a@b.com' }, env)).toBe(true);
    expect(isAdmin({ email: 'x@b.com' }, env)).toBe(false);
    expect(isAdmin({ email: 'a@b.com' }, {})).toBe(false);
  });
});

describe('o arquivo é conferido pelo conteúdo', () => {
  it('recusa id fora do catálogo, tipo desconhecido, bytes que não batem e arquivo grande', async () => {
    const { enviar } = await cenario();
    expect((await enviar('he-00000000', mp4())).status).toBe(404);
    expect((await enviar(ALEF, mp4(), 'audio/flac')).status).toBe(415);
    expect((await enviar(ALEF, new TextEncoder().encode('<html>não é áudio</html>'))).status).toBe(422);
    expect((await enviar(ALEF, new Uint8Array(1_600_000))).status).toBe(413);
  });

  it('aceita os apelidos que cada navegador usa', () => {
    expect(normalizarTipo('audio/mp4;codecs=mp4a.40.2')).toBe('audio/mp4');
    expect(normalizarTipo('audio/x-m4a')).toBe('audio/mp4');
    expect(normalizarTipo('audio/x-wav')).toBe('audio/wav');
    expect(normalizarTipo('audio/flac')).toBeNull();
    const wav = new Uint8Array(wavDoTrecho(new Float32Array(100), 44100, null));
    expect(conteudoBate('audio/wav', wav)).toBe(true);
    expect(conteudoBate('audio/mp4', wav)).toBe(false);
  });
});

describe('o curso toca a gravação do painel no endereço de sempre', () => {
  it('serve do banco, com Range, e só depois do portão', async () => {
    const { enviar, chamar, aluno } = await cenario();
    await enviar(ALEF, mp4(7), 'audio/mp4', undefined, '&inicio=420&fim=1310&duracao=2000');

    const cheio = await chamar('GET', `/audio/${ALEF}.mp3`, aluno);
    expect(cheio.status).toBe(200);
    expect(cheio.headers.get('content-type')).toBe('audio/mp4');
    expect(cheio.headers.get('accept-ranges')).toBe('bytes');
    expect(new Uint8Array(await cheio.arrayBuffer())[40]).toBe(7);

    const parte = await chamar('GET', `/audio/${ALEF}.mp3`, aluno, undefined, { Range: 'bytes=0-1' });
    expect(parte.status).toBe(206);
    expect(parte.headers.get('content-range')).toBe('bytes 0-1/64');
    expect((await parte.arrayBuffer()).byteLength).toBe(2);

    /* Sem sessão, o portão continua na frente. */
    const fora = await chamar('GET', `/audio/${ALEF}.mp3`, undefined, undefined, { 'Sec-Fetch-Dest': 'audio' });
    expect(fora.status).toBe(403);
  });

  it('o manifesto público lista o id, a versão e o trecho da voz', async () => {
    const { enviar, chamar } = await cenario();
    await enviar(ALEF, mp4(), 'audio/mp4', undefined, '&inicio=420&fim=1310');
    const j = await (await chamar('GET', '/api/audio/manifest')).json() as { clips: Record<string, unknown[]> };
    expect(Object.keys(j.clips)).toEqual([ALEF]);
    expect(j.clips[ALEF]!.slice(1)).toEqual([420, 1310]);
  });

  it('gravar de novo substitui; remover devolve o arquivo do estúdio', async () => {
    const { enviar, chamar, aluno, admin } = await cenario();
    await enviar(ALEF, mp4(1));
    await enviar(ALEF, mp4(2));
    const lista = await (await chamar('GET', '/api/admin/audio', admin)).json() as { gravacoes: Record<string, unknown> };
    expect(Object.keys(lista.gravacoes)).toEqual([ALEF]);
    expect(new Uint8Array(await (await chamar('GET', `/audio/${ALEF}.mp3`, aluno)).arrayBuffer())[40]).toBe(2);

    expect((await chamar('DELETE', `/api/admin/audio?id=${ALEF}`, aluno)).status).toBe(403);
    expect((await chamar('DELETE', `/api/admin/audio?id=${ALEF}`, admin)).status).toBe(200);
    const volta = await chamar('GET', `/audio/${ALEF}.mp3`, aluno);
    expect(await volta.text()).toBe('do-estudio');
  });

  it('o painel baixa o arquivo com o nome organizado', async () => {
    const { enviar, chamar, admin } = await cenario();
    await enviar(ALEF, mp4());
    const r = await chamar('GET', `/api/admin/audio/arquivo?id=${ALEF}&baixar=1`, admin);
    expect(r.headers.get('content-disposition')).toBe('attachment; filename="alef.mp4"');
  });

  it('o microfone é liberado no painel, e o painel fica fora de busca', async () => {
    const { chamar } = await cenario();
    const r = await chamar('GET', '/admin/gravar/');
    expect(r.headers.get('permissions-policy')).toContain('microphone=(self)');
    expect(r.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    const home = await chamar('GET', '/');
    expect(home.headers.get('permissions-policy')).toContain('microphone=()');
  });
});

describe('os nomes organizados', () => {
  const nomes = nomesOrganizados(CLIPES, (letters as { id: string }[]).map(l => l.id)) as Record<string, string>;

  it('um nome para cada item, e nenhum repetido', () => {
    expect(Object.keys(nomes)).toHaveLength(CLIPES.length);
    expect(new Set(Object.values(nomes)).size).toBe(CLIPES.length);
    for (const n of Object.values(nomes)) expect(n).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('legíveis: a transliteração sem acento, o sentido quando não há, e o lugar para desempatar', () => {
    expect(nomes[ALEF]).toBe('alef');
    expect(nomes[idDoClipe(CLIPES.find(c => c.gloss === 'girafa')!)]).toBe('girafa');
    const oA = CLIPES.filter(c => c.translit === 'a').map(c => nomes[idDoClipe(c)]);
    expect(oA).toEqual(expect.arrayContaining(['a-alef', 'a-ayin']));
  });
});

describe('o gravador', () => {
  it('prefere MP4/AAC; sem ele, WebM, que é convertido para WAV', () => {
    const safari = (t: string) => t.startsWith('audio/mp4');
    const firefox = (t: string) => t.startsWith('audio/ogg') || t.startsWith('audio/webm');
    expect(escolherFormato(safari)).toBe('audio/mp4;codecs=mp4a.40.2');
    expect(escolherFormato(firefox)).toBe('audio/webm;codecs=opus');
    expect(escolherFormato(() => false)).toBe('');
    expect(precisaConverter('audio/mp4')).toBe(false);
    expect(precisaConverter('audio/webm;codecs=opus')).toBe(true);
    expect(precisaConverter('')).toBe(true);
  });

  /* Meio segundo de sala, 400 ms de voz, meio segundo de sala. */
  const taxa = 44100;
  const gravacao = () => {
    const a = new Float32Array(Math.round(taxa * 1.4));
    for (let i = 0; i < a.length; i++) {
      const t = i / taxa;
      a[i] = (Math.random() - 0.5) * 0.002 + (t >= 0.5 && t < 0.9 ? 0.5 * Math.sin(2 * Math.PI * 220 * t) : 0);
    }
    return a;
  };

  it('acha onde a voz começa e termina, com margem', () => {
    const c = acharVoz(gravacao(), taxa)!;
    expect(c.inicio).toBeGreaterThanOrEqual(400);
    expect(c.inicio).toBeLessThanOrEqual(500);
    expect(c.fim).toBeGreaterThanOrEqual(900);
    expect(c.fim).toBeLessThanOrEqual(1100);
    expect(acharVoz(new Float32Array(taxa).map(() => (Math.random() - 0.5) * 0.002), taxa)).toBeNull();
  });

  it('diz quando a gravação está baixa, estourada ou sem voz', () => {
    expect(diagnosticar(gravacao(), taxa).nivel).toBe('ok');
    expect(diagnosticar(gravacao().map(x => x * 0.02), taxa).nivel).toBe('baixo');
    expect(diagnosticar(gravacao().map(x => Math.max(-1, Math.min(1, x * 4))), taxa).nivel).toBe('estourado');
  });

  it('o WAV de reserva sai só com o trecho, nivelado', () => {
    const buf = wavDoTrecho(gravacao(), taxa, { inicio: 420, fim: 1060 });
    const v = new DataView(buf);
    expect(String.fromCharCode(...new Uint8Array(buf, 0, 4))).toBe('RIFF');
    expect(v.getUint32(24, true)).toBe(taxa);
    const n = v.getUint32(40, true) / 2;
    expect(n).toBeCloseTo(taxa * 0.64, -2);
    let p = 0;
    for (let i = 0; i < n; i++) p = Math.max(p, Math.abs(v.getInt16(44 + i * 2, true)));
    expect(p / 0x7fff).toBeCloseTo(0.84, 1);
  });

  it('a mistura para mono é a média, sem somar a voz com ela mesma', () => {
    const l = new Float32Array([0.5, -0.5]);
    expect(Array.from(paraMono([l, l]))).toEqual([0.5, -0.5]);
  });
});

describe('o curso fica sabendo das gravações novas', () => {
  it('um id do manifesto vira clipe, com a versão e o trecho no endereço', () => {
    const id = 'he-abcdef12';
    expect(temClipe(id)).toBe(false);
    aplicarManifesto({ clips: { [id]: [1700000000000, 420, 1310], 'lixo': [1] } });
    expect(temClipe(id)).toBe(true);
    expect(temClipe('lixo')).toBe(false);
    expect(urlDoClipe(id)).toBe(`/audio/${id}.mp3?v=1700000000000#t=0.42,1.31`);
    aplicarManifesto({ clips: {} });
    expect(temClipe(id)).toBe(false);
  });
});

describe('sem promessa de curso que ainda não existe', () => {
  it('o menu não promete o A1 liberado, e a vitrine não promete os próximos níveis', async () => {
    const shell = await readFile(new URL('../src/components/shell/AppShell.tsx', import.meta.url), 'utf8');
    const secoes = await readFile(new URL('../src/components/landing/Secoes.tsx', import.meta.url), 'utf8');
    expect(shell).not.toMatch(/Liberado quando você concluir/);
    expect(secoes).not.toMatch(/acompanha os próximos níveis/);
  });
});
