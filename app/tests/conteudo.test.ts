/* O conteúdo pago, e quem pode lê-lo.
 * ─────────────────────────────────────────────────────────────────────────
 * O conserto de 20/09/2026 tirou o curso de dentro do pacote que qualquer
 * visitante baixa e o pôs atrás de `GET /api/content`. Três coisas precisam
 * ser verdade ao mesmo tempo para isso funcionar, e cada uma quebra de um
 * jeito diferente:
 *
 *   1. `lib/content.ts` não pode importar os JSONs. É a causa do vazamento
 *      original: um import estático ali vai parar no pedaço que a home
 *      carrega. (Quem prova isso no arquivo PUBLICADO é `pacote.mjs`, que
 *      roda depois da build - aqui se prova a fonte, que é o que falha
 *      primeiro e de graça.)
 *
 *   2. `content-servidor.ts`, que importa tudo, só pode ser lido por
 *      componente de SERVIDOR. Um `'use client'` que o importe põe o curso de
 *      volta no pacote sem nenhum aviso.
 *
 *   3. o que o Worker devolve tem de ser exatamente o que o depósito espera.
 *      São dois arquivos diferentes montando o mesmo objeto - se divergirem,
 *      o aluno paga, entra, e a lição abre vazia.
 *
 * E, por fim, a rota em si: sem sessão não responde, com sessão e sem direito
 * de acesso não responde, e nunca pode ser guardada em cache compartilhado.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { hidratarConteudo, allLetters, nikud, extras, cultureCards } from '@/lib/content';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { conteudoBruto, content } from '../../worker/src/api/content.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { createOrder, grantAccess } from '../../worker/src/lib/db.js';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const src = (p: string) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');

/* Os JSONs PAGOS. A lista era de seis e ficou de seis enquanto `sentences` e
   `eras` nasciam - dois arquivos de conteúdo pago sem nenhum caso os
   cobrindo, que é a mesma forma do buraco original. Um JSON novo do curso
   entra AQUI no mesmo commit em que entra no exportador.

   `course.json` e `biblia.json` não estão nesta lista de propósito: os dois
   são públicos, e o caso logo abaixo é quem diz isso em voz alta. */
const OS_PAGOS = [
  'letters', 'nikud', 'extras', 'real-world', 'sentences', 'eras',
  'stroke-paths', 'culture', 'missoes', 'textos'
];

/* ── 1. a fonte do vazamento ─────────────────────────────────────────────── */

describe('o depósito do navegador não carrega o curso', () => {
  it('não importa nenhum dos JSONs pagos de forma estática', () => {
    const texto = src('lib/content.ts');
    const estaticos = [...texto.matchAll(/^\s*import\s[^\n]*from\s+'@content\/([a-z-]+)\.json'/gm)]
      .map(m => m[1]);
    expect(estaticos).toEqual([]);
  });

  it('só importa o conteúdo dentro do ramo que a build de produção apaga', () => {
    const texto = src('lib/content.ts');
    /* O `if` tem de conferir o `process.env` literal: é essa forma que o Next
       troca pelo valor na build, e é a troca que faz o empacotador podar o
       bloco. Escrito com a constante exportada, o ramo sobreviveria - com os
       seis `import()` dentro. */
    expect(texto).toContain("process.env.NEXT_PUBLIC_PLATFORM_API !== 'worker'");

    const corte = texto.indexOf("process.env.NEXT_PUBLIC_PLATFORM_API !== 'worker'");
    for (const nome of OS_PAGOS) {
      const onde = texto.indexOf(`@content/${nome}.json`);
      expect(onde, `${nome}.json fora do ramo local`).toBeGreaterThan(corte);
    }
  });

  it('lê o conteúdo público de content-publico, e o público é só o esqueleto', () => {
    const publico = src('lib/content-publico.ts');
    const importados = [...publico.matchAll(/'@content\/([a-z-]+)\.json'/g)].map(m => m[1]);
    /* DOIS arquivos podem estar aqui, e a lista é fechada de propósito: um
       terceiro que apareça sem passar por este caso é uma aula indo para o
       pacote público.

       `course.json` é a grade - títulos de módulo, ids de letra, páginas da
       apostila -, que a landing mostra de propósito e que não ensina nada.
       `biblia.json` é um versículo de domínio público com a fonte ao lado,
       na página que responde «vou conseguir ler a Bíblia?»: quem faz essa
       pergunta ainda não comprou, e é antes da compra que a expectativa
       precisa ser ajustada. */
    expect(importados.sort()).toEqual(['biblia', 'course']);
  });
});

/* ── 2. quem pode importar o conteúdo inteiro ────────────────────────────── */

describe('content-servidor só é lido no servidor', () => {
  const arquivos = (dir: string): string[] =>
    readdirSync(dir).flatMap(nome => {
      const p = join(dir, nome);
      return statSync(p).isDirectory() ? arquivos(p) : /\.tsx?$/.test(p) ? [p] : [];
    });

  it('nenhum componente de cliente o importa', () => {
    const culpados: string[] = [];
    for (const p of arquivos('src')) {
      const t = readFileSync(p, 'utf8');
      if (!t.includes('content-servidor')) continue;
      /* A diretiva vale se estiver no topo do arquivo - depois de comentários,
         antes de qualquer import. Um `'use client'` no meio do texto (numa
         nota, por exemplo) não torna o módulo de cliente. */
      const primeira = t.slice(0, t.search(/^import\s/m) + 1);
      if (/^\s*['"]use client['"]/m.test(primeira)) culpados.push(p);
    }
    expect(culpados).toEqual([]);
  });

  it('e ninguém mais importa os JSONs direto', () => {
    const permitidos = ['src/lib/content-servidor.ts', 'src/lib/content.ts'];
    const culpados: string[] = [];
    for (const p of arquivos('src')) {
      if (permitidos.includes(p)) continue;
      const t = readFileSync(p, 'utf8');
      if (OS_PAGOS.some(n => t.includes(`@content/${n}.json`))) culpados.push(p);
    }
    expect(culpados).toEqual([]);
  });
});

/* ── 3. os dois lados do contrato ────────────────────────────────────────── */

describe('o que o Worker manda é o que o navegador espera', () => {
  const doWorker = JSON.parse(conteudoBruto());

  it('tem as mesmas seis partes, do mesmo tamanho', () => {
    /* `_licenca` é o aviso de uso pessoal com o número da cópia (lib/marca.js);
       o navegador não o usa. */
    expect(Object.keys(doWorker).filter(k => k !== '_licenca').sort()).toEqual(Object.keys(conteudoPago).sort());
    expect(doWorker.letters).toHaveLength(conteudoPago.letters.length);
    expect(doWorker.scenes).toHaveLength(conteudoPago.scenes.length);
    expect(doWorker.culture).toHaveLength(conteudoPago.culture.length);
    expect(Object.keys(doWorker.strokes).sort())
      .toEqual(Object.keys(conteudoPago.strokes).sort());
  });

  it('manda as letras na ordem do curso, como o depósito assume', () => {
    const ordens = doWorker.letters.map((l: { order: number }) => l.order);
    expect(ordens).toEqual([...ordens].sort((a: number, b: number) => a - b));
  });

  it('enche o depósito inteiro - nada fica indefinido depois de hidratar', () => {
    hidratarConteudo(doWorker);
    expect(allLetters()).toHaveLength(conteudoPago.letters.length);
    expect(nikud().sounds.length).toBeGreaterThan(0);
    expect(extras().dagesh.letters.length).toBeGreaterThan(0);
    expect(cultureCards()).toHaveLength(conteudoPago.culture.length);
    /* Deixa o depósito como a suíte inteira espera encontrá-lo. */
    hidratarConteudo(conteudoPago);
  });
});

/* ── 4. a rota ───────────────────────────────────────────────────────────── */

async function contaLogada(env: Record<string, unknown>, ctx = {}) {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`,
      { aceitouTermos: true, declarouIdade: true, name: 'Ana', email: 'ana@exemplo.com', password: 'senha-boa-123' }),
    env, ctx
  });
  expect(r.status).toBe(200);
  const db = env.DB as unknown as {
    prepare(s: string): { first(): Promise<{ id: number } | null> };
  };
  const linha = await db.prepare('SELECT id FROM accounts LIMIT 1').first();
  expect(linha?.id).toBeTypeOf('number');
  return { cookie: cookieDe(r), id: linha!.id };
}

/** Uma conta com o curso na mão, do jeito que a compra a deixa: um pedido e
 *  o direito de acesso apontando para ele. */
async function comprou(env: Record<string, unknown>, id: number) {
  const order = await createOrder(env, {
    accountId: id, courseSlug: 'alfabetizacao', amountCents: 19700, method: 'pix'
  });
  await grantAccess(env, {
    accountId: id, courseSlug: 'alfabetizacao', orderId: order.id, months: 12
  });
}

const pedirConteudo = (cookie?: string) =>
  new Request(`${SITE}/api/content`, cookie ? { headers: { cookie } } : undefined);

describe('/api/content só responde a quem pagou', () => {
  it('recusa sem sessão', async () => {
    const env = envDeTeste();
    const r = await content({ request: pedirConteudo(), env, ctx: {} });
    expect(r.status).toBe(401);
    expect(await r.text()).not.toContain('soundNotePt');
  });

  it('recusa quem entrou mas não comprou', async () => {
    const env = envDeTeste();
    const { cookie } = await contaLogada(env);
    const r = await content({ request: pedirConteudo(cookie), env, ctx: {} });
    expect(r.status).toBe(403);
  });

  it('entrega o curso a quem tem o direito de acesso', async () => {
    const env = envDeTeste();
    const { cookie, id } = await contaLogada(env);
    await comprou(env, id);

    const r = await content({ request: pedirConteudo(cookie), env, ctx: {} });
    expect(r.status).toBe(200);
    const corpo = await r.json() as { letters: unknown[] };
    expect(corpo.letters).toHaveLength(conteudoPago.letters.length);
  });

  it('nunca pode ser guardado num cache compartilhado', async () => {
    const env = envDeTeste();
    const { cookie, id } = await contaLogada(env);
    await comprou(env, id);

    const r = await content({ request: pedirConteudo(cookie), env, ctx: {} });
    const cache = r.headers.get('cache-control') || '';
    /* Sem isto, um cache no caminho entrega a aula de quem pagou para o
       próximo que pedir - e desfaz a rota inteira sem erro nenhum. */
    expect(cache).toContain('private');
    expect(cache).toContain('no-store');
  });

  it('fecha a porta quando o direito de acesso vence', async () => {
    const env = envDeTeste();
    const { cookie, id } = await contaLogada(env);
    await comprou(env, id);
    (env.DB as never as { prepare(s: string): { run(): Promise<unknown> } })
      .prepare(`UPDATE entitlements SET expires_at = ${Date.now() - 1000} WHERE account_id = ${id}`)
      .run();

    /* O cookie continua válido - é o BANCO que decide, a cada pedido. É isso
       que faz um estorno cortar o acesso na hora, sem esperar o cookie
       vencer. */
    const r = await content({ request: pedirConteudo(cookie), env, ctx: {} });
    expect(r.status).toBe(403);
  });
});

/* ── 5. a rota está de fato ligada ───────────────────────────────────────── */

describe('o Worker conhece a rota', () => {
  it('tem GET /api/content na tabela de rotas', () => {
    const doWorker = readFileSync(new URL('../../worker/src/worker.js', import.meta.url), 'utf8');
    expect(doWorker).toContain("'GET /api/content': content");
  });
});

/* ── os diagramas de traçado ─────────────────────────────────────────────
   Auditoria de 24/09/2026: os 27 diagramas de ordem dos traços eram
   públicos em /stroke-order/, e a landing usava dois. Agora /stroke-order/
   está atrás do portão, e a landing lê de /tracado-amostra/, que só tem as
   letras que ela mostra. */
describe('os diagramas de traçado', () => {
  const publico = new URL('../public/tracado-amostra/', import.meta.url);

  it('a landing só usa letras que estão na amostra pública, e a amostra só tem essas', () => {
    const landing = readdirSync(new URL('../src/components/landing/', import.meta.url))
      .map(f => src(`components/landing/${f}`)).join('\n');
    const usadas = [...landing.matchAll(/<DiagramaDeTracado[^>]*letterId="([^"]+)"/g)].map(m => m[1]!);
    expect(usadas.length).toBeGreaterThan(0);
    const publicadas = readdirSync(publico).map(f => f.replace(/\.svg$/, '')).sort();
    expect(publicadas).toEqual([...new Set(usadas)].sort());
  });

  it('o componente da landing lê da amostra, não de /stroke-order/', () => {
    const c = src('components/landing/DiagramaDeTracado.tsx');
    expect(c).toContain('/tracado-amostra/');
    expect(c).not.toMatch(/src=\{`\/stroke-order\//);
  });

  it('/stroke-order/ exige o curso; /tracado-amostra/ não', async () => {
    // @ts-expect-error - módulo JS do Worker, sem tipos
    const { gate, isGatedPath } = await import('../../worker/src/gate.js');
    expect(isGatedPath('/stroke-order/tav.svg')).toBe(true);
    expect(isGatedPath('/tracado-amostra/alef.svg')).toBe(false);

    const env = envDeTeste();
    const img = { headers: { 'Sec-Fetch-Dest': 'image' } };
    const semConta = await gate(new Request(`${SITE}/stroke-order/tav.svg`, img), env);
    expect(semConta.status).toBe(403);

    const r = await auth.signup({
      request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, declarouIdade: true, email: 'traco@exemplo.com', password: 'senha-boa-123' }),
      env, ctx: { waitUntil() {} }
    });
    const cookie = cookieDe(r);
    const semCurso = await gate(new Request(`${SITE}/stroke-order/tav.svg`, { headers: { ...img.headers, cookie } }), env);
    expect(semCurso.status).toBe(403);

    const { account } = await r.json() as { account: { id: string } };
    await grantAccess(env, { accountId: account.id, courseSlug: 'alfabetizacao', orderId: 'TESTE', months: 12 });
    expect(await gate(new Request(`${SITE}/stroke-order/tav.svg`, { headers: { ...img.headers, cookie } }), env)).toBeNull();
  });
});
