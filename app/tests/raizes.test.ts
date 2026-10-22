/* Raízes Sefarditas (21/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O que este arquivo segura, e por quê:
 *   1. ACESSO: é outro produto, com outro direito. Quem tem o curso de
 *      hebraico não abre Raízes, e o contrário; o conteúdo só sai por
 *      /api/content/raizes, para quem tem o direito.
 *   2. A MATRIZ: toda marca [[R01-NNN]] do texto existe, pode ir ao texto
 *      (VERIFICADO ou CONTESTADO) e aponta para fontes que existem. Uma
 *      afirmação NÃO VERIFICADA nunca aparece. Sem Wikipedia como prova.
 *   3. AS ATIVIDADES: toda alternativa tem explicação, a ordem da linha do
 *      tempo bate com as datas, o mapa só tem pontos dentro do desenho.
 *   4. A FUSÃO: o progresso entre aparelhos é monotônico (CLAUDE.md).
 *   5. O PACOTE: o JSON não é importado de forma estática por nenhum cliente.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { gate, cursoDaRota, isGatedPath } from '../../worker/src/gate.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { content } from '../../worker/src/api/content.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { contentRaizes, conteudoRaizesBruto } from '../../worker/src/api/content-raizes.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { grantAccess } from '../../worker/src/lib/db.js';
import {
  MODULOS_COM_CONTEUDO, TOTAL_DE_MODULOS, embaralhar, hidratarRaizes, marcasDe, moduloAberto, partir,
  progressoDoModulo, conquistasObtidas, type DadosRaizes, type ModuloRaizes
} from '@/lib/raizes';
import {
  RAIZES_VAZIO, chaveDaAtividade, fundirRaizes, moduloConcluido, raizesValido, registrarAtividade, visitarEtapa,
  type EstadoRaizes
} from '@/lib/state/raizes-estado';
import { mergeStates } from '@/lib/state/merge';
import { migrate } from '@/lib/state/migrate';
import { EMPTY_STATE } from '@/lib/state/types';

const RAIZ = new URL('../../', import.meta.url).pathname;
const ler = (p: string) => JSON.parse(readFileSync(join(RAIZ, p), 'utf8'));
const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };

type Afirmacao = { id: string; status: string; fontes: string[]; interpretacoes_concorrentes: string | null; revisao_humana: boolean; acesso: string; modulo: number };
type Fonte = { id: string; nivel: string; url: string | null; acesso: string; abnt: string };

const curso = ler('data/raizes/curso.json');
const afirmacoes: Afirmacao[] = ler('data/raizes/afirmacoes.json').afirmacoes;
const fontes: Fonte[] = ler('data/raizes/fontes.json').fontes;
const modulos: ModuloRaizes[] = MODULOS_COM_CONTEUDO.map(n => ler(`data/raizes/modulos/m${String(n).padStart(2, '0')}.json`));
const porId = new Map(afirmacoes.map(a => [a.id, a]));
const fontePorId = new Map(fontes.map(f => [f.id, f]));
const NO_TEXTO = new Set(['VERIFICADO', 'CONTESTADO']);

/** Toda referência a afirmação num módulo: marcas do texto e listas `afirmacoes`. */
function referencias(m: ModuloRaizes): { onde: string; id: string }[] {
  const saida: { onde: string; id: string }[] = [];
  const texto = (onde: string, s: string) => marcasDe(s).forEach(id => saida.push({ onde, id }));
  const lista = (onde: string, ids: string[] | undefined) => (ids ?? []).forEach(id => saida.push({ onde, id }));
  for (const e of m.etapas) {
    for (const [i, b] of e.blocos.entries()) {
      const onde = `${e.id}[${i}]`;
      if (b.tipo === 'texto' || b.tipo === 'caixa' || b.tipo === 'debate') b.paragrafos.forEach(p => texto(onde, p));
      if (b.tipo === 'glossario') b.termos.forEach(t => lista(`${onde}.${t.termo}`, t.afirmacoes));
      if (b.tipo === 'linha-do-tempo') b.eventos.forEach(ev => lista(`${onde}.${ev.quando}`, ev.afirmacoes));
    }
  }
  for (const [id, a] of Object.entries(m.atividades)) {
    if ('afirmacoes' in a) lista(id, a.afirmacoes);
    if (a.tipo === 'mapa') a.lugares.forEach(l => lista(`${id}.${l.id}`, l.afirmacoes));
    if (a.tipo === 'associacao') a.documentos.forEach(d => lista(`${id}.${d.id}`, d.afirmacoes));
    if (a.tipo === 'ordenar') a.eventos.forEach(ev => lista(`${id}.${ev.id}`, ev.afirmacoes));
    if (a.tipo === 'classificar') a.itens.forEach(it => lista(`${id}.${it.id}`, it.afirmacoes));
  }
  return saida;
}

/* ── 1. acesso ─────────────────────────────────────────────────────────── */

async function comConta(env: Record<string, unknown>, cursos: string[]) {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`,
      { aceitouTermos: true, declarouIdade: true, name: 'Ana', email: 'ana@exemplo.com.br', password: 'senha-boa-123' }),
    env, ctx
  });
  expect(r.status).toBe(200);
  const { account } = await r.json() as { account: { id: number } };
  for (const c of cursos) await grantAccess(env, { accountId: account.id, courseSlug: c, orderId: `T-${c}`, months: 12 });
  return cookieDe(r);
}
const porta = (env: Record<string, unknown>, cookie: string, caminho: string) =>
  gate(new Request(`${SITE}${caminho}`, { headers: { Cookie: cookie } }), env);
const pedirRaizes = (cookie?: string) =>
  new Request(`${SITE}/api/content/raizes`, cookie ? { headers: { cookie } } : undefined);

describe('Raízes é outro produto, com outro direito', () => {
  it('as rotas /raizes são protegidas e pertencem a raizes-sefarditas', () => {
    expect(isGatedPath('/raizes')).toBe(true);
    expect(isGatedPath('/raizes/modulo/1/')).toBe(true);
    expect(isGatedPath('/Raizes/Biblioteca')).toBe(true);
    expect(isGatedPath('/raizesx')).toBe(false);
    expect(cursoDaRota('/raizes/modulo/1/')).toBe('raizes-sefarditas');
    expect(cursoDaRota('/licao/alef/')).toBe('alfabetizacao');
  });

  it('quem tem só o alfabeto não abre Raízes, e vai para a lista de cursos (não há página de venda)', async () => {
    const env = envDeTeste();
    const cookie = await comConta(env, ['alfabetizacao']);
    const r = await porta(env, cookie, '/raizes/modulo/1/');
    expect(r?.status).toBe(302);
    expect(r?.headers.get('location')).toBe(`${SITE}/cursos/`);
  });

  it('quem tem só Raízes abre Raízes e não abre o alfabeto', async () => {
    const env = envDeTeste();
    const cookie = await comConta(env, ['raizes-sefarditas']);
    expect(await porta(env, cookie, '/raizes/modulo/1/')).toBeNull();
    const r = await porta(env, cookie, '/licao/alef/');
    expect(r?.status).toBe(302);
  });

  it('o conteúdo recusa sem sessão e recusa quem tem só o hebraico', async () => {
    expect((await contentRaizes({ request: pedirRaizes(), env: envDeTeste(), ctx: {} })).status).toBe(401);
    const env = envDeTeste();
    const cookie = await comConta(env, ['alfabetizacao', 'hebraico-a1']);
    const r = await contentRaizes({ request: pedirRaizes(cookie), env, ctx: {} });
    expect(r.status).toBe(403);
    expect(await r.text()).not.toContain('Sefarad');
  });

  it('entrega a quem tem o direito, privado e por cookie; e esse direito não abre o hebraico', async () => {
    const env = envDeTeste();
    const cookie = await comConta(env, ['raizes-sefarditas']);
    const r = await contentRaizes({ request: pedirRaizes(cookie), env, ctx: {} });
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toContain('private');
    expect(r.headers.get('vary') || '').toContain('Cookie');
    const corpo = await r.json() as DadosRaizes;
    expect(corpo.conteudo.map(m => m.n)).toEqual([...MODULOS_COM_CONTEUDO]);
    expect((await content({ request: new Request(`${SITE}/api/content`, { headers: { cookie } }), env, ctx: {} })).status).toBe(403);
  });

  it('não está no catálogo de venda: vender depende da decisão do dono', () => {
    const catalogo = ler('data/courses.json').courses.map((c: { slug: string }) => c.slug);
    expect(catalogo).not.toContain('raizes-sefarditas');
  });
});

/* ── 2. a matriz de verificação ────────────────────────────────────────── */

describe('a matriz: o que vai ao texto tem fonte', () => {
  it('toda marca e toda lista citam uma afirmação que existe e pode ir ao texto', () => {
    const ruins: string[] = [];
    for (const m of modulos) {
      for (const r of referencias(m)) {
        const a = porId.get(r.id);
        if (!a) ruins.push(`${r.onde}: ${r.id} não existe`);
        else if (!NO_TEXTO.has(a.status)) ruins.push(`${r.onde}: ${r.id} está ${a.status}`);
      }
    }
    expect(ruins).toEqual([]);
  });

  it('toda afirmação cita fontes que existem, e as que vão ao texto têm pelo menos uma', () => {
    for (const a of afirmacoes) {
      for (const f of a.fontes) expect(fontePorId.has(f), `${a.id} → ${f}`).toBe(true);
      if (NO_TEXTO.has(a.status)) expect(a.fontes.length, a.id).toBeGreaterThan(0);
    }
  });

  it('CONTESTADO só existe com as interpretações registradas', () => {
    for (const a of afirmacoes.filter(x => x.status === 'CONTESTADO')) {
      expect(a.interpretacoes_concorrentes, a.id).toBeTruthy();
    }
  });

  it('nenhuma afirmação se diz conferida no texto integral, e todas pedem revisão humana', () => {
    for (const a of afirmacoes) {
      expect(a.acesso, a.id).not.toBe('texto-integral');
      expect(a.revisao_humana, a.id).toBe(true);
    }
  });

  it('nenhuma fonte é Wikipedia, blog ou rede social, e toda fonte tem nível e ABNT', () => {
    for (const f of fontes) {
      expect(f.url ?? '', f.id).not.toMatch(/wikipedia\.org|blogspot|medium\.com|facebook\.com|instagram\.com|tripadvisor/);
      expect(['A', 'B', 'C', 'D', 'E'], f.id).toContain(f.nivel);
      expect(f.abnt.length, f.id).toBeGreaterThan(20);
    }
  });

  it('as afirmações NÃO VERIFICADAS ficam fora do que o aluno recebe', () => {
    const fora = afirmacoes.filter(a => !NO_TEXTO.has(a.status)).map(a => a.id);
    expect(fora.length).toBeGreaterThan(0);
    const enviado = conteudoRaizesBruto();
    for (const id of fora) expect(enviado, id).not.toContain(`"${id}"`);
  });

  it('parágrafo com ano tem marca de fonte', () => {
    const sem: string[] = [];
    for (const m of modulos) {
      for (const e of m.etapas) {
        for (const b of e.blocos) {
          if (b.tipo !== 'texto' && b.tipo !== 'debate') continue;
          for (const p of b.paragrafos) {
            if (/\b\d{3,4}\b/.test(p.replace(/\[\[[^\]]*\]\]/g, '').replace(/módulos? \d+(, \d+)*( e \d+)?/g, '')) && marcasDe(p).length === 0) sem.push(p.slice(0, 60));
          }
        }
      }
    }
    expect(sem).toEqual([]);
  });

  it('a marca sempre vem depois da pontuação da frase', () => {
    for (const m of modulos) {
      for (const e of m.etapas) {
        for (const b of e.blocos) {
          if (b.tipo !== 'texto' && b.tipo !== 'debate') continue;
          for (const p of b.paragrafos) {
            for (const x of p.matchAll(/(.)\[\[/g)) expect('.?!)', p.slice(0, 50)).toContain(x[1]);
          }
        }
      }
    }
  });
});

/* ── 3. as atividades ──────────────────────────────────────────────────── */

const primeiroAno = (q: string) => Number(q.match(/\d{3,4}/)?.[0]);

describe('as atividades funcionam como prometem', () => {
  for (const m of modulos) {
    it(`módulo ${m.n}: todo bloco de atividade aponta para uma atividade, e toda atividade aparece uma vez`, () => {
      const citadas = m.etapas.flatMap(e => e.blocos.filter(b => b.tipo === 'atividade').map(b => (b as { id: string }).id));
      expect(citadas.sort()).toEqual(Object.keys(m.atividades).sort());
    });

    it(`módulo ${m.n}: as oito etapas do percurso pedagógico, na ordem`, () => {
      expect(m.etapas.map(e => e.id)).toEqual(['descobrir', 'contextualizar', 'explorar', 'investigar', 'aplicar', 'refletir', 'consolidar', 'avancar']);
    });

    it(`módulo ${m.n}: cada atividade tem objetivo, critério e explicação para toda resposta`, () => {
      for (const [id, a] of Object.entries(m.atividades)) {
        expect(a.objetivo.length, id).toBeGreaterThan(10);
        expect(a.criterio.length, id).toBeGreaterThan(10);
        if (a.tipo === 'escolha') {
          expect(a.opcoes.filter(o => o.correta), id).toHaveLength(1);
          for (const o of a.opcoes) expect(o.feedback.length, `${id}: ${o.texto}`).toBeGreaterThan(10);
        }
        if (a.tipo === 'multipla') {
          expect(a.opcoes.some(o => o.correta) && a.opcoes.some(o => !o.correta), id).toBe(true);
          for (const o of a.opcoes) expect(o.feedback.length, `${id}: ${o.texto}`).toBeGreaterThan(10);
        }
        if (a.tipo === 'associacao') {
          const ctxs = new Set(a.contextos.map(c => c.id));
          for (const d of a.documentos) {
            expect(ctxs.has(d.contexto), `${id}.${d.id}`).toBe(true);
            expect(d.diz && d.naoProva && d.explicacao, `${id}.${d.id}`).toBeTruthy();
          }
        }
        if (a.tipo === 'classificar') {
          const cats = new Set(a.categorias.map(c => c.id));
          for (const it of a.itens) expect(cats.has(it.categoria), `${id}.${it.id}`).toBe(true);
          expect(a.minimo).toBeLessThanOrEqual(a.itens.length);
          /* "Em debate" precisa aparecer: o percurso não reduz debate a sim ou não. */
          expect(a.itens.some(i => i.categoria === 'debate')).toBe(true);
        }
        if (a.tipo === 'mapa') {
          const ids = new Set(a.lugares.map(l => l.id));
          for (const q of a.perguntas) {
            expect(ids.has(q.resposta), `${id}.${q.id}`).toBe(true);
            expect(a.lugares.find(l => l.id === q.resposta)?.incerto, `${id}.${q.id}`).toBeFalsy();
          }
          expect(a.minimoExplorados).toBeLessThanOrEqual(a.lugares.length);
        }
      }
    });

    it(`módulo ${m.n}: a ordem certa da linha do tempo é a ordem das datas`, () => {
      for (const a of Object.values(m.atividades)) {
        if (a.tipo !== 'ordenar') continue;
        const anos = a.eventos.map(e => primeiroAno(e.quando));
        expect(anos.every(Number.isFinite)).toBe(true);
        expect([...anos].sort((x, y) => x - y)).toEqual(anos);
        expect(new Set(anos).size, 'dois eventos no mesmo ano tornam a ordem ambígua').toBe(anos.length);
      }
      for (const e of m.etapas) {
        for (const b of e.blocos) {
          if (b.tipo !== 'linha-do-tempo') continue;
          const anos = b.eventos.map(ev => primeiroAno(ev.quando));
          expect([...anos].sort((x, y) => x - y)).toEqual(anos);
        }
      }
    });
  }

  it('o mapa: todo ponto cai dentro do desenho', () => {
    const mapa = ler('data/raizes/mapa-peninsula.json');
    for (const m of modulos) {
      for (const a of Object.values(m.atividades)) {
        if (a.tipo !== 'mapa') continue;
        for (const l of a.lugares) {
          expect(l.lon, l.id).toBeGreaterThan(mapa.quadro.oeste);
          expect(l.lon, l.id).toBeLessThan(mapa.quadro.leste);
          expect(l.lat, l.id).toBeGreaterThan(mapa.quadro.sul);
          expect(l.lat, l.id).toBeLessThan(mapa.quadro.norte);
        }
      }
    }
    /* Sem fronteira desenhada: o contorno é só terra (tools/raizes-mapa.mjs). */
    expect(mapa._.join(' ')).toMatch(/land/);
  });

  it('embaralhar nunca devolve a ordem certa e é sempre a mesma para a mesma semente', () => {
    const xs = ['a', 'b', 'c', 'd', 'e'];
    expect(embaralhar(xs, 's')).not.toEqual(xs);
    expect(embaralhar(xs, 's')).toEqual(embaralhar(xs, 's'));
    expect([...embaralhar(xs, 's')].sort()).toEqual(xs);
  });
});

/* ── a jornada, as conquistas e o certificado ──────────────────────────── */

describe('a jornada e o que ela promete', () => {
  it('dez módulos no plano, e as páginas geradas são as dos módulos que têm arquivo', () => {
    expect(curso.modulos.map((m: { n: number }) => m.n)).toEqual(Array.from({ length: TOTAL_DE_MODULOS }, (_, i) => i + 1));
    const comArquivo = curso.modulos.map((m: { n: number }) => m.n)
      .filter((n: number) => existsSync(join(RAIZ, `data/raizes/modulos/m${String(n).padStart(2, '0')}.json`)));
    expect(comArquivo).toEqual([...MODULOS_COM_CONTEUDO]);
  });

  it('o certificado diz o que NÃO certifica, e nenhuma conquista atribui identidade', () => {
    expect(curso.certificado.naoCertifica.join(' ')).toMatch(/origem sefardita.*ancestralidade judaica.*identidade religiosa.*vínculo genealógico.*cidadania/s);
    for (const c of curso.conquistas) expect(c.titulo, c.id).not.toMatch(/sefardita|judeu|judia|descendente|cristão-novo/i);
    expect(curso.aviso).toMatch(/não é o mesmo que comprovar/);
  });

  it('desbloqueio, conclusão e conquistas seguem o estado', () => {
    const dados = JSON.parse(conteudoRaizesBruto()) as DadosRaizes;
    hidratarRaizes(dados);
    const m1 = dados.conteudo[0]!;
    expect(moduloAberto(undefined, 1)).toBe(true);
    expect(moduloAberto(undefined, 2)).toBe(false);
    let e: EstadoRaizes = RAIZES_VAZIO;
    for (const id of Object.keys(m1.atividades).slice(0, -1)) e = registrarAtividade(e, chaveDaAtividade(1, id), 1, true, '2026-10-21T10:00:00Z');
    expect(progressoDoModulo(e, m1).concluido).toBe(false);
    expect(conquistasObtidas(e).has('explorador-de-sefarad')).toBe(false);
    const ultima = Object.keys(m1.atividades).at(-1)!;
    e = registrarAtividade(e, chaveDaAtividade(1, ultima), 0.5, false, '2026-10-21T10:05:00Z');
    expect(progressoDoModulo(e, m1).concluido).toBe(false);
    e = registrarAtividade(e, chaveDaAtividade(1, ultima), 1, true, '2026-10-21T10:06:00Z');
    expect(progressoDoModulo(e, m1).concluido).toBe(true);
    expect(conquistasObtidas(e).has('explorador-de-sefarad')).toBe(true);
    expect(conquistasObtidas(e).has('primeiro-documento')).toBe(true);
  });
});

/* ── 4. a fusão entre aparelhos ────────────────────────────────────────── */

describe('o progresso de Raízes funde sem perder nem dobrar', () => {
  const A = registrarAtividade(visitarEtapa(undefined, 'm01:explorar', '/raizes/modulo/1?etapa=explorar', '2026-10-21T10:00:00Z'),
    'm01:mapa', 0.5, false, '2026-10-21T10:01:00Z');
  const B = registrarAtividade(registrarAtividade(undefined, 'm01:mapa', 1, true, '2026-10-21T11:00:00Z'),
    'm01:prova', 0.4, false, '2026-10-21T11:02:00Z');

  it('comutativa, idempotente e associativa', () => {
    expect(fundirRaizes(A, B)).toEqual(fundirRaizes(B, A));
    expect(fundirRaizes(A, A)).toEqual(A);
    const C = visitarEtapa(undefined, 'm01:aplicar', '/raizes/modulo/1?etapa=aplicar', '2026-10-21T12:00:00Z');
    expect(fundirRaizes(fundirRaizes(A, B), C)).toEqual(fundirRaizes(A, fundirRaizes(B, C)));
  });

  it('máximo, nunca soma; conclusão mais antiga; onde parei mais recente', () => {
    const f = fundirRaizes(A, B);
    expect(f.atividades['m01:mapa']).toEqual({ melhor: 1, tentativas: 1, concluidaEm: '2026-10-21T11:00:00Z', ultima: '2026-10-21T11:00:00Z' });
    expect(fundirRaizes(f, f).atividades['m01:mapa']!.tentativas).toBe(1);
    expect(f.onde?.rota).toBe('/raizes/modulo/1?etapa=explorar');
    expect(moduloConcluido(f, ['m01:mapa'])).toBe(true);
    expect(moduloConcluido(f, ['m01:mapa', 'm01:prova'])).toBe(false);
  });

  it('entra no estado do aluno pela fusão geral, só quando um lado o tem', () => {
    expect(mergeStates(EMPTY_STATE, EMPTY_STATE).raizes).toBeUndefined();
    const s = mergeStates({ ...EMPTY_STATE, raizes: A }, { ...EMPTY_STATE, raizes: B });
    expect(s.raizes).toEqual(fundirRaizes(A, B));
  });

  it('o que vem do servidor ou do navegador passa pela forma certa', () => {
    expect(raizesValido(null)).toBeUndefined();
    const sujo = {
      atividades: {
        'm01:mapa': { melhor: 9, tentativas: 1, concluidaEm: null, ultima: '2026-10-21T10:00:00Z' },
        'm01:prova': { melhor: 0.5, tentativas: 2, concluidaEm: 'ontem', ultima: '2026-10-21T10:00:00Z' },
        '../x': { melhor: 1, tentativas: 1, concluidaEm: null, ultima: '2026-10-21T10:00:00Z' }
      },
      etapas: { 'm01:explorar': 'não é data' },
      onde: { rota: 'https://outro.site/', em: '2026-10-21T10:00:00Z' }
    };
    expect(raizesValido(sujo)).toEqual({
      atividades: { 'm01:prova': { melhor: 0.5, tentativas: 2, concluidaEm: null, ultima: '2026-10-21T10:00:00Z' } },
      etapas: {},
      onde: null
    });
    expect(migrate({ ...EMPTY_STATE, raizes: A }).raizes).toEqual(A);
  });
});

/* ── 5. o pacote público e a escrita ───────────────────────────────────── */

describe('o conteúdo não vai para o pacote público', () => {
  const arquivos = (dir: string): string[] =>
    readdirSync(dir).flatMap(nome => {
      const p = join(dir, nome);
      return statSync(p).isDirectory() ? arquivos(p) : /\.tsx?$/.test(p) ? [p] : [];
    });

  it('só lib/raizes.ts importa o JSON, e só no ramo que a build de produção apaga', () => {
    const fonteLib = readFileSync('src/lib/raizes.ts', 'utf8');
    expect(fonteLib).not.toMatch(/^\s*import\s[^\n]*'@content\/raizes\.json'/m);
    expect(fonteLib.indexOf("@content/raizes.json")).toBeGreaterThan(fonteLib.indexOf("process.env.NEXT_PUBLIC_PLATFORM_API !== 'worker'"));
    const culpados = arquivos('src').filter(p => p !== 'src/lib/raizes.ts' && readFileSync(p, 'utf8').includes('@content/raizes.json'));
    expect(culpados).toEqual([]);
  });

  it('sem travessão nem meia-risca nos dados, nos componentes e nos documentos de Raízes', () => {
    const alvos = [
      ...readdirSync(join(RAIZ, 'data/raizes')).filter(n => n.endsWith('.json')).map(n => join(RAIZ, 'data/raizes', n)),
      ...readdirSync(join(RAIZ, 'data/raizes/modulos')).map(n => join(RAIZ, 'data/raizes/modulos', n)),
      ...arquivos('src/components/raizes'), ...arquivos('src/app/raizes'),
      ...(existsSync(join(RAIZ, 'docs/raizes-sefarditas')) ? readdirSync(join(RAIZ, 'docs/raizes-sefarditas')).map(n => join(RAIZ, 'docs/raizes-sefarditas', n)) : [])
    ];
    const proibido = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
    expect(alvos.filter(p => proibido.test(readFileSync(p, 'utf8')))).toEqual([]);
  });

  it('o hebraico do texto é NFC e está na lista de aprovação do dono', () => {
    const lista = existsSync(join(RAIZ, 'docs/raizes-sefarditas/hebraico-para-aprovar.md'))
      ? readFileSync(join(RAIZ, 'docs/raizes-sefarditas/hebraico-para-aprovar.md'), 'utf8') : '';
    for (const m of modulos) {
      for (const e of m.etapas) {
        for (const b of e.blocos) {
          if (b.tipo !== 'texto') continue;
          for (const p of b.paragrafos) {
            for (const x of partir(p)) {
              if (x.t !== 'he') continue;
              expect(x.v).toBe(x.v.normalize('NFC'));
              expect(lista, x.v).toContain(x.v);
            }
          }
        }
      }
    }
  });
});
