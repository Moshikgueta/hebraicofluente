/* A segunda letra por e-mail, no fim do teste grátis da capa (03/10/2026).
 * Ver worker/src/api/segunda-letra.js e mensagemDaSegundaLetra (lib/mail.js).
 *
 *   · o e-mail ensina o que a lição 2 ensina, palavra por palavra;
 *   · endereço inválido não manda nada; o mesmo endereço não recebe duas
 *     vezes no dia, e a resposta não conta isso;
 *   · o endereço não é gravado em lugar nenhum (só o hash, no freio);
 *   · o envio conta no funil do painel.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { envDeTeste } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import { SEGUNDA_LETRA, mensagemDaSegundaLetra } from '../../worker/src/lib/mail.js';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
type Enviado = { to: string[]; subject: string; text: string; html: string };

const semMarcas = (s: string) => s.replace(/\{\{|\}\}/g, '');

describe('o conteúdo do e-mail', () => {
  const dados = JSON.parse(readFileSync(new URL('../../data/letters.json', import.meta.url), 'utf8'));
  const letras = (Array.isArray(dados) ? dados : dados.letters) as Record<string, any>[];
  const mem = letras.find(l => l.id === 'mem')!;
  const ordem = [...letras].sort((a, b) => a.lesson - b.lesson || a.order - b.order);

  it('é a segunda letra do curso, e diz o que a lição dela diz', () => {
    expect(ordem[1]!.id).toBe('mem');
    expect(SEGUNDA_LETRA.letra).toBe(mem.letter);
    expect(SEGUNDA_LETRA.nome).toBe(mem.namePt);
    expect(SEGUNDA_LETRA.final).toBe(mem.finalForm);
    expect(SEGUNDA_LETRA.som).toBe(semMarcas(mem.soundNotePt));
    expect(semMarcas(mem.brazilianMistake.why)).toBe(SEGUNDA_LETRA.cuidado);
    expect(semMarcas(mem.ensino.lembrePt)).toBe(`${mem.letter} ${SEGUNDA_LETRA.fim}`);
    expect(semMarcas(mem.didYouKnow).startsWith(SEGUNDA_LETRA.sabia)).toBe(true);
    for (const [he, t] of SEGUNDA_LETRA.silabas) {
      expect(mem.syllables.some((s: { he: string; translit: string }) => s.he === he && s.translit === t)).toBe(true);
    }
    const palavras = [...mem.wordsToRecognize, ...mem.wordsToRead];
    for (const [he, t, pt] of SEGUNDA_LETRA.palavras) {
      expect(palavras.some((w: { he: string; translit: string; pt: string }) => w.he === he && w.translit === t && w.pt === pt)).toBe(true);
    }
  });

  it('sem preço, com o link do curso e o aviso de quem não pediu', () => {
    const m = mensagemDaSegundaLetra({ site: SITE, suporte: 'contato@hebraicofluente.com.br' });
    expect(m.subject).toBe('A segunda letra: Mem (מ) - Hebraico Fluente');
    expect(m.text).not.toMatch(/R\$/);
    expect(m.text).toContain(`${SITE}/curso-de-hebraico/`);
    expect(m.text).toContain('Não foi você? É só ignorar');
    expect(m.html).toContain('dir="rtl"');
    expect(m.html).not.toMatch(/<script/i);
    /* A frase da forma final aparece uma vez só, com a forma no meio. */
    expect(m.html.split('outro desenho').length - 1).toBe(1);
    expect(m.html).toContain('vira <span dir="rtl" lang="he" style="font-size:1.25em">ם</span> quando');
  });
});

function ambiente(extra: Record<string, string> = {}) {
  const enviados: Enviado[] = [];
  const antigo = globalThis.fetch;
  let recusar = false;
  globalThis.fetch = (async (_u: string, init: RequestInit) => {
    if (recusar) return new Response('{"message":"falhou"}', { status: 500 });
    enviados.push(JSON.parse(String(init.body)));
    return new Response('{"id":"x"}', { status: 200 });
  }) as typeof fetch;
  const env = envDeTeste({
    RESEND_API_KEY: 're_teste', EMAIL_FROM: 'Hebraico Fluente <contato@hebraicofluente.com.br>',
    SUPPORT_EMAIL: 'contato@hebraicofluente.com.br', SITE_ORIGIN: SITE, ...extra
  }) as Env;
  return { env, enviados, recusar: (v: boolean) => { recusar = v; }, restaurar: () => { globalThis.fetch = antigo; } };
}
const pedir = (env: Env, email: unknown, ip = '203.0.113.7') => worker.fetch(new Request(`${SITE}/api/segunda-letra`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: SITE, 'CF-Connecting-IP': ip },
  body: JSON.stringify({ email })
}), env, ctx);

describe('o pedido', () => {
  it('manda a letra uma vez por dia por endereço, sem gravar o endereço', async () => {
    const { env, enviados, restaurar } = ambiente();
    try {
      expect((await pedir(env, 'Ana@Exemplo.com ')).status).toBe(200);
      expect(enviados).toHaveLength(1);
      expect(enviados[0]!.to).toEqual(['ana@exemplo.com']);
      expect(enviados[0]!.subject).toContain('Mem');
      /* De novo no mesmo dia: a resposta é a mesma, e nada sai. */
      const r2 = await pedir(env, 'ana@exemplo.com', '198.51.100.2');
      expect(r2.status).toBe(200);
      expect(await r2.json()).toEqual({ ok: true });
      expect(enviados).toHaveLength(1);
      /* O endereço não está em tabela nenhuma. */
      const tabelas = (env.DB.bruto.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as { name: string }[]).map(t => t.name);
      for (const t of tabelas) {
        const linhas = JSON.stringify(env.DB.bruto.prepare(`SELECT * FROM "${t}"`).all());
        expect(linhas.includes('ana@exemplo.com'), `o endereço apareceu em ${t}`).toBe(false);
      }
      /* E o funil do painel conta o envio, uma vez. */
      expect(env.DB.bruto.prepare("SELECT n FROM estatisticas WHERE chave = 'd|segunda-letra'").get()).toEqual({ n: 1 });
    } finally { restaurar(); }
  });

  it('endereço inválido, freio por IP, provedor fora e o funil que o navegador não falsifica', async () => {
    const { env, enviados, recusar, restaurar } = ambiente();
    try {
      for (const ruim of ['', 'ana', 'ana@', { x: 1 }, 'a b@c.com']) {
        const r = await pedir(env, ruim);
        expect(r.status).toBe(400);
        expect(await r.json()).toEqual({ error: 'email-invalido' });
      }
      expect(enviados).toHaveLength(0);
      for (let i = 0; i < 5; i++) expect((await pedir(env, `p${i}@exemplo.com`, '192.0.2.9')).status).toBe(200);
      expect((await pedir(env, 'p9@exemplo.com', '192.0.2.9')).status).toBe(429);
      recusar(true);
      expect((await pedir(env, 'falha@exemplo.com', '192.0.2.10')).status).toBe(502);
      /* O navegador não consegue somar `segunda-letra` pelo /api/demo. */
      await worker.fetch(new Request(`${SITE}/api/demo`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: SITE }, body: '{"etapa":"segunda-letra"}'
      }), env, ctx);
      expect(env.DB.bruto.prepare("SELECT n FROM estatisticas WHERE chave = 'd|segunda-letra'").get()).toEqual({ n: 5 });
    } finally { restaurar(); }
    const semProvedor = envDeTeste() as Env;
    expect((await pedir(semProvedor, 'ana@exemplo.com')).status).toBe(503);
  });
});
