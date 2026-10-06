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
 */

export type GeneroA1 = 'm' | 'f';

export type UnidadeFeita = {
  best: number | null;
  runs: number;
  concluidaEm: string | null;
};

export type EstadoA1 = {
  genero: { valor: GeneroA1; em: string } | null;
  unidades: Record<string, UnidadeFeita>;
  exame: {
    best: number | null;
    attempts: number;
    passedAt: string | null;
    parts?: Record<string, { correct: number; total: number }>;
  };
};

export const A1_VAZIO: EstadoA1 = {
  genero: null,
  unidades: {},
  exame: { best: null, attempts: 0, passedAt: null }
};

/** A nota que conclui uma unidade: a mesma régua dos checkpoints e do exame. */
export const A1_APROVA = 0.7;

const ehObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const data = (x: unknown): string | null => (typeof x === 'string' && x ? x : null);

/** O que veio do servidor ou do navegador, só com a forma certa. */
export function a1Valido(bruto: unknown): EstadoA1 {
  if (!ehObj(bruto)) return A1_VAZIO;
  const g = ehObj(bruto.genero) && (bruto.genero.valor === 'm' || bruto.genero.valor === 'f') && data(bruto.genero.em)
    ? { valor: bruto.genero.valor as GeneroA1, em: bruto.genero.em as string }
    : null;
  const unidades: Record<string, UnidadeFeita> = {};
  if (ehObj(bruto.unidades)) {
    for (const [k, v] of Object.entries(bruto.unidades)) {
      if (!/^(?:[0-9]|[1-3][0-9])$/.test(k) || !ehObj(v)) continue;
      unidades[k] = { best: num(v.best), runs: Math.max(0, num(v.runs) ?? 0), concluidaEm: data(v.concluidaEm) };
    }
  }
  const e = ehObj(bruto.exame) ? bruto.exame : {};
  const exame: EstadoA1['exame'] = {
    best: num(e.best), attempts: Math.max(0, num(e.attempts) ?? 0), passedAt: data(e.passedAt)
  };
  if (ehObj(e.parts)) exame.parts = e.parts as EstadoA1['exame']['parts'];
  return { genero: g, unidades, exame };
}

const maior = (a: number | null, b: number | null) => (a == null ? b : b == null ? a : Math.max(a, b));
const cedo = (a: string | null, b: string | null) => (!a ? b : !b ? a : a <= b ? a : b);

/** Comutativa e idempotente, como o resto da fusão. */
export function fundirA1(x: EstadoA1 | undefined, y: EstadoA1 | undefined): EstadoA1 {
  const a = x ?? A1_VAZIO, b = y ?? A1_VAZIO;
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
  return { genero, unidades, exame };
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
