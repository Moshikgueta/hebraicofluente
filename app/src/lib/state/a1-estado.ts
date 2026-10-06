/* O progresso do curso Hebraico A1 (06/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Mora no MESMO estado do aluno (um blob por conta em /api/progress), numa
 * chave própria, `a1`, para não misturar com as letras: `lessons`,
 * `checkpoints` e `srs` são do alfabeto, com ids de letra.
 *
 * Três coisas, e as três regras de fusão entre aparelhos seguem as do resto
 * do estado (lib/state/merge.ts):
 *   · o gênero escolhido para os exercícios (decisão 9 do A1): é uma decisão
 *     que pode ser revista, então vale a mais recente, como o nome em hebraico;
 *   · cada unidade: melhor nota (a maior), número de rodadas (o maior), e a
 *     data em que foi concluída (a mais antiga - aconteceu uma vez);
 *   · o exame: melhor nota, tentativas, a data da aprovação (a mais antiga), e
 *     as partes da prova mais recente (do lado com mais tentativas).
 *
 * E, desde o A1 completo (06/10/2026), o caderno do aluno:
 *   · a revisão espaçada: cada exercício errado entra numa caixa de Leitner
 *     (0 a 4) e volta no dia marcado; acertar sobe uma caixa, errar volta à 0.
 *     Fusão: vale o registro visto por último (empate: o mais adiantado);
 *   · as habilidades (leitura, escuta, vocabulário, gramática, comunicação,
 *     escrita): acertos e erros na PRIMEIRA tentativa. Fusão: o maior de cada
 *     contador, como a XP (somar contaria duas vezes o que os dois aparelhos
 *     já viram juntos);
 *   · favoritos (palavras e frases salvas), a autoavaliação de cada unidade e a
 *     escolha da transliteração: decisões revistas, então vale a mais recente;
 *   · quantos exercícios de revisão por dia, para o histórico (o maior).
 */

export type GeneroA1 = 'm' | 'f';

export type UnidadeFeita = {
  best: number | null;
  runs: number;
  concluidaEm: string | null;
};

/** Uma caixa de Leitner: 0 é "rever agora", 4 é "dominado". */
export type ItemRevisao = { caixa: number; vence: string; acertos: number; erros: number; visto: string };

export const HABILIDADES_A1 = ['leitura', 'escuta', 'vocabulario', 'gramatica', 'comunicacao', 'escrita'] as const;
export type HabilidadeA1 = typeof HABILIDADES_A1[number];
export const NOME_DA_HABILIDADE: Record<HabilidadeA1, string> = {
  leitura: 'Leitura', escuta: 'Escuta', vocabulario: 'Vocabulário',
  gramatica: 'Gramática', comunicacao: 'Comunicação', escrita: 'Escrita'
};

export type TranslitA1 = 'auto' | 'mostrar' | 'esconder';

export type EstadoA1 = {
  genero: { valor: GeneroA1; em: string } | null;
  unidades: Record<string, UnidadeFeita>;
  exame: {
    best: number | null;
    attempts: number;
    passedAt: string | null;
    parts?: Record<string, { correct: number; total: number }>;
  };
  revisao: Record<string, ItemRevisao>;
  habilidades: Partial<Record<HabilidadeA1, { h: number; m: number }>>;
  favoritos: Record<string, { on: boolean; em: string }>;
  auto: Record<string, { itens: number[]; em: string }>;
  translit: { valor: TranslitA1; em: string } | null;
  dias: Record<string, number>;
};

export const A1_VAZIO: EstadoA1 = {
  genero: null,
  unidades: {},
  exame: { best: null, attempts: 0, passedAt: null },
  revisao: {},
  habilidades: {},
  favoritos: {},
  auto: {},
  translit: null,
  dias: {}
};

/** A nota que conclui uma unidade: a mesma régua dos checkpoints e do exame. */
export const A1_APROVA = 0.7;

const ehObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const data = (x: unknown): string | null => (typeof x === 'string' && x ? x : null);
const inteiro = (x: unknown): number => { const n = num(x); return n != null && n >= 0 ? Math.floor(n) : 0; };
const DIA = /^\d{4}-\d{2}-\d{2}$/;
const CHAVE_UNIDADE = /^(?:[0-9]|[1-3][0-9])$/;
/** "u3:1a2b3c4d": a unidade e o hash do item (chaveDoItem). */
const CHAVE_ITEM = /^u(?:[0-9]|[1-3][0-9]):[0-9a-f]{8}$/;
/** "w:" palavra ou "f:" frase, só letras hebraicas e a pontuação da frase. */
const CHAVE_FAVORITO = /^[wf]:[\u05d0-\u05ea\u05f3' ?!.,]{1,160}$/;

/** O que veio do servidor ou do navegador, só com a forma certa. */
export function a1Valido(bruto: unknown): EstadoA1 {
  if (!ehObj(bruto)) return A1_VAZIO;
  const g = ehObj(bruto.genero) && (bruto.genero.valor === 'm' || bruto.genero.valor === 'f') && data(bruto.genero.em)
    ? { valor: bruto.genero.valor as GeneroA1, em: bruto.genero.em as string }
    : null;
  const unidades: Record<string, UnidadeFeita> = {};
  if (ehObj(bruto.unidades)) {
    for (const [k, v] of Object.entries(bruto.unidades)) {
      if (!CHAVE_UNIDADE.test(k) || !ehObj(v)) continue;
      unidades[k] = { best: num(v.best), runs: Math.max(0, num(v.runs) ?? 0), concluidaEm: data(v.concluidaEm) };
    }
  }
  const e = ehObj(bruto.exame) ? bruto.exame : {};
  const exame: EstadoA1['exame'] = {
    best: num(e.best), attempts: Math.max(0, num(e.attempts) ?? 0), passedAt: data(e.passedAt)
  };
  if (ehObj(e.parts)) exame.parts = e.parts as EstadoA1['exame']['parts'];

  const revisao: Record<string, ItemRevisao> = {};
  if (ehObj(bruto.revisao)) {
    for (const [k, v] of Object.entries(bruto.revisao)) {
      if (!CHAVE_ITEM.test(k) || !ehObj(v) || !DIA.test(String(v.vence)) || !DIA.test(String(v.visto))) continue;
      const caixa = num(v.caixa);
      if (caixa == null || !Number.isInteger(caixa) || caixa < 0 || caixa > 4) continue;
      revisao[k] = { caixa, vence: String(v.vence), acertos: inteiro(v.acertos), erros: inteiro(v.erros), visto: String(v.visto) };
    }
  }
  const habilidades: EstadoA1['habilidades'] = {};
  if (ehObj(bruto.habilidades)) {
    for (const h of HABILIDADES_A1) {
      const v = bruto.habilidades[h];
      if (ehObj(v)) habilidades[h] = { h: inteiro(v.h), m: inteiro(v.m) };
    }
  }
  const favoritos: EstadoA1['favoritos'] = {};
  if (ehObj(bruto.favoritos)) {
    for (const [k, v] of Object.entries(bruto.favoritos)) {
      if (!CHAVE_FAVORITO.test(k) || !ehObj(v) || typeof v.on !== 'boolean' || !data(v.em)) continue;
      favoritos[k] = { on: v.on, em: v.em as string };
    }
  }
  const auto: EstadoA1['auto'] = {};
  if (ehObj(bruto.auto)) {
    for (const [k, v] of Object.entries(bruto.auto)) {
      if (!CHAVE_UNIDADE.test(k) || !ehObj(v) || !Array.isArray(v.itens) || !data(v.em)) continue;
      auto[k] = { itens: v.itens.filter((x): x is number => Number.isInteger(x) && (x as number) >= 0 && (x as number) < 20), em: v.em as string };
    }
  }
  const t = ehObj(bruto.translit) && ['auto', 'mostrar', 'esconder'].includes(String(bruto.translit.valor)) && data(bruto.translit.em)
    ? { valor: bruto.translit.valor as TranslitA1, em: bruto.translit.em as string }
    : null;
  const dias: Record<string, number> = {};
  if (ehObj(bruto.dias)) for (const [k, v] of Object.entries(bruto.dias)) if (DIA.test(k)) dias[k] = inteiro(v);
  return { genero: g, unidades, exame, revisao, habilidades, favoritos, auto, translit: t, dias };
}

const maior = (a: number | null, b: number | null) => (a == null ? b : b == null ? a : Math.max(a, b));
const cedo = (a: string | null, b: string | null) => (!a ? b : !b ? a : a <= b ? a : b);

/** Comutativa e idempotente, como o resto da fusão. */
export function fundirA1(x: EstadoA1 | undefined, y: EstadoA1 | undefined): EstadoA1 {
  const a = { ...A1_VAZIO, ...x }, b = { ...A1_VAZIO, ...y };
  const genero = !a.genero ? b.genero : !b.genero ? a.genero
    : (a.genero.em > b.genero.em ? a.genero : b.genero.em > a.genero.em ? b.genero
      : (a.genero.valor <= b.genero.valor ? a.genero : b.genero));
  const unidades: Record<string, UnidadeFeita> = {};
  for (const k of new Set([...Object.keys(a.unidades), ...Object.keys(b.unidades)])) {
    const u = a.unidades[k], v = b.unidades[k];
    unidades[k] = !u ? v! : !v ? u : {
      best: maior(u.best, v.best), runs: Math.max(u.runs, v.runs), concluidaEm: cedo(u.concluidaEm, v.concluidaEm)
    };
  }
  const ea = a.exame, eb = b.exame;
  const exame: EstadoA1['exame'] = {
    best: maior(ea.best, eb.best),
    attempts: Math.max(ea.attempts, eb.attempts),
    passedAt: cedo(ea.passedAt, eb.passedAt)
  };
  const parts = ea.attempts > eb.attempts ? (ea.parts ?? eb.parts)
    : eb.attempts > ea.attempts ? (eb.parts ?? ea.parts)
    : (JSON.stringify(ea.parts ?? null) <= JSON.stringify(eb.parts ?? null) ? (ea.parts ?? eb.parts) : (eb.parts ?? ea.parts));
  if (parts) exame.parts = parts;

  const revisao: Record<string, ItemRevisao> = {};
  for (const k of new Set([...Object.keys(a.revisao), ...Object.keys(b.revisao)])) {
    const u = a.revisao[k], v = b.revisao[k];
    revisao[k] = !u ? v! : !v ? u : (ordemRevisao(u) >= ordemRevisao(v) ? u : v);
  }
  const habilidades: EstadoA1['habilidades'] = {};
  for (const h of HABILIDADES_A1) {
    const u = a.habilidades[h], v = b.habilidades[h];
    if (u || v) habilidades[h] = { h: Math.max(u?.h ?? 0, v?.h ?? 0), m: Math.max(u?.m ?? 0, v?.m ?? 0) };
  }
  const favoritos = maisRecente(a.favoritos, b.favoritos);
  const auto = maisRecente(a.auto, b.auto);
  const translit = !a.translit ? b.translit : !b.translit ? a.translit
    : (a.translit.em > b.translit.em ? a.translit : b.translit.em > a.translit.em ? b.translit
      : (a.translit.valor <= b.translit.valor ? a.translit : b.translit));
  const dias: Record<string, number> = {};
  for (const k of new Set([...Object.keys(a.dias), ...Object.keys(b.dias)])) dias[k] = Math.max(a.dias[k] ?? 0, b.dias[k] ?? 0);
  return { genero, unidades, exame, revisao, habilidades, favoritos, auto, translit, dias };
}

/* A ordem que decide entre dois registros da mesma revisão: o visto por
   último; no empate, o mais adiantado. Uma string só, para comparar de uma vez
   e continuar comutativo. */
const ordemRevisao = (r: ItemRevisao) =>
  `${r.visto}|${r.caixa}|${String(r.acertos).padStart(6, '0')}|${String(r.erros).padStart(6, '0')}|${r.vence}`;

/** Por chave, o registro com `em` mais recente; no empate, o maior em texto. */
function maisRecente<T extends { em: string }>(x: Record<string, T>, y: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
    const u = x[k], v = y[k];
    out[k] = !u ? v! : !v ? u
      : u.em > v.em ? u : v.em > u.em ? v
      : (JSON.stringify(u) >= JSON.stringify(v) ? u : v);
  }
  return out;
}

/** Uma rodada de exercícios de uma unidade terminou. */
export function registrarUnidade(e: EstadoA1, n: number, nota: number, agoraIso: string): EstadoA1 {
  const k = String(n);
  const prev = e.unidades[k] ?? { best: null, runs: 0, concluidaEm: null };
  return {
    ...e,
    unidades: {
      ...e.unidades,
      [k]: {
        best: maior(prev.best, nota),
        runs: prev.runs + 1,
        concluidaEm: prev.concluidaEm ?? (nota >= A1_APROVA ? agoraIso : null)
      }
    }
  };
}

/** Uma prova do exame terminou. */
export function registrarExameA1(
  e: EstadoA1, nota: number, parts: Record<string, { correct: number; total: number }>,
  aprovacao: number, agoraIso: string
): EstadoA1 {
  return {
    ...e,
    exame: {
      best: maior(e.exame.best, nota),
      attempts: e.exame.attempts + 1,
      passedAt: e.exame.passedAt ?? (nota >= aprovacao ? agoraIso : null),
      parts
    }
  };
}

export const unidadeConcluida = (e: EstadoA1, n: number): boolean => !!e.unidades[String(n)]?.concluidaEm;

/* ── a revisão espaçada ─────────────────────────────────────────────────────
   Só o que o aluno ERRA entra (a regra do alfabeto: revisar o que já se sabe
   é tempo jogado fora). Os intervalos, em dias, por caixa: 0 volta no mesmo
   dia; 4 é "dominado" e volta em duas semanas e pouco, só para confirmar. */
export const INTERVALOS_A1 = [0, 1, 3, 7, 16] as const;

const somarDias = (dia: string, n: number): string => {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** A chave estável de um item: a unidade e um hash do conteúdo. Editar o
 *  item muda a chave, e a revisão antiga dele some com ele - o certo, porque
 *  ela era de uma pergunta que não existe mais. */
export function chaveDoItem(n: number, item: unknown): string {
  const t = JSON.stringify(item);
  let h = 0x811c9dc5;
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return `u${n}:${h.toString(16).padStart(8, '0')}`;
}

export function responderRevisao(e: EstadoA1, chave: string, certo: boolean, hoje: string): EstadoA1 {
  const prev = e.revisao[chave];
  if (certo && !prev) return e;
  const caixa = certo ? Math.min(4, prev!.caixa + 1) : 0;
  const r: ItemRevisao = {
    caixa,
    vence: somarDias(hoje, INTERVALOS_A1[caixa]!),
    acertos: (prev?.acertos ?? 0) + (certo ? 1 : 0),
    erros: (prev?.erros ?? 0) + (certo ? 0 : 1),
    visto: hoje
  };
  return { ...e, revisao: { ...e.revisao, [chave]: r } };
}

export type SituacaoRevisao = 'agora' | 'logo' | 'depois' | 'dominado';
export const NOME_DA_SITUACAO: Record<SituacaoRevisao, string> = {
  agora: 'Rever agora', logo: 'Rever logo', depois: 'Rever depois', dominado: 'Dominado'
};

export function situacaoRevisao(r: ItemRevisao, hoje: string): SituacaoRevisao {
  if (r.caixa >= 4) return 'dominado';
  if (r.vence <= hoje) return 'agora';
  return r.caixa <= 2 ? 'logo' : 'depois';
}

/** As chaves para revisar hoje: as vencidas, das caixas mais baixas primeiro. */
export const paraRevisarHoje = (e: EstadoA1, hoje: string): string[] =>
  Object.entries(e.revisao)
    .filter(([, r]) => r.caixa < 4 && r.vence <= hoje)
    .sort(([ka, a], [kb, b]) => a.caixa - b.caixa || a.vence.localeCompare(b.vence) || ka.localeCompare(kb))
    .map(([k]) => k);

export function registrarHabilidade(e: EstadoA1, h: HabilidadeA1, certo: boolean): EstadoA1 {
  const prev = e.habilidades[h] ?? { h: 0, m: 0 };
  return { ...e, habilidades: { ...e.habilidades, [h]: certo ? { ...prev, h: prev.h + 1 } : { ...prev, m: prev.m + 1 } } };
}

/** O domínio de uma habilidade, de 0 a 1, ou null com menos de 10 respostas:
 *  com pouca coisa, uma porcentagem mente. */
export const dominio = (e: EstadoA1, h: HabilidadeA1): number | null => {
  const v = e.habilidades[h];
  if (!v || v.h + v.m < 10) return null;
  return v.h / (v.h + v.m);
};

export const chaveDePalavra = (he: string) => `w:${somenteLetras(he)}`;
export const chaveDeFrase = (he: string) => `f:${somenteLetras(he)}`;
const somenteLetras = (he: string) => he.normalize('NFC').replace(/[\u0591-\u05c7]/g, '').replace(/[^\u05d0-\u05ea\u05f3' ?!.,]/g, '').trim().slice(0, 160);

export const favorito = (e: EstadoA1, chave: string): boolean => !!e.favoritos[chave]?.on;
