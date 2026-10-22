/* O progresso de Raízes Sefarditas (21/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Mora no MESMO estado do aluno (um blob por conta em /api/progress), numa
 * chave própria e opcional, `raizes`, como `leituraAutoavaliada`: estados
 * antigos não a têm, e nada do curso de hebraico a lê.
 *
 * Três coisas, e cada uma tem um "mais adiantado dos dois" (a regra de
 * lib/state/merge.ts: a fusão é monotônica, nunca soma, e pode ser repetida
 * depois de um 409 sem desfazer nada):
 *   · cada atividade (`m01:mapa`): a melhor nota (o MÁXIMO), as tentativas (o
 *     MÁXIMO, não a soma: a mesma tentativa vista pelos dois aparelhos contaria
 *     duas vezes), a data da conclusão (a MAIS ANTIGA, aconteceu uma vez) e a
 *     última vez que foi feita (a MAIS RECENTE);
 *   · as etapas abertas (`m01:explorar`): a primeira visita (a mais antiga);
 *   · o último lugar onde o aluno estava, para o "Continuar de onde parei":
 *     vale o mais recente.
 *
 * O que NÃO mora aqui, de propósito:
 *   · a resposta livre da reflexão: fica só no aparelho (components/raizes/
 *     Reflexao.tsx). É opinião pessoal, não progresso, e não precisa ir ao
 *     servidor;
 *   · o laboratório genealógico (módulo 9, ainda não construído): nomes de
 *     parentes são dado pessoal de terceiros e não entram neste blob;
 *   · XP. Raízes não paga XP: o XP compra extras do curso de hebraico
 *     (lib/loja.ts), e um produto não deve comprar recompensa do outro.
 *
 * A conclusão de um MÓDULO não é guardada: é calculada das atividades
 * (`moduloConcluido`), então não há dois lugares que possam discordar.
 */

export type AtividadeFeita = {
  /** Melhor nota, de 0 a 1, na tentativa que valeu mais. */
  melhor: number;
  tentativas: number;
  /** ISO da primeira vez que o critério de conclusão foi cumprido. */
  concluidaEm: string | null;
  /** ISO da tentativa mais recente. */
  ultima: string;
};

export type EstadoRaizes = {
  atividades: Record<string, AtividadeFeita>;
  etapas: Record<string, string>;
  onde: { rota: string; em: string } | null;
};

export const RAIZES_VAZIO: EstadoRaizes = { atividades: {}, etapas: {}, onde: null };

export const chaveDaAtividade = (modulo: number, id: string) => `m${String(modulo).padStart(2, '0')}:${id}`;
export const chaveDaEtapa = chaveDaAtividade;

const cedo = (a: string | null, b: string | null) => (!a ? b : !b ? a : a < b ? a : b);
const tarde = (a: string, b: string) => (a > b ? a : b);

export function fundirRaizes(a: EstadoRaizes | undefined, b: EstadoRaizes | undefined): EstadoRaizes {
  const x = a ?? RAIZES_VAZIO, y = b ?? RAIZES_VAZIO;
  const atividades: Record<string, AtividadeFeita> = {};
  for (const k of new Set([...Object.keys(x.atividades), ...Object.keys(y.atividades)])) {
    const p = x.atividades[k], q = y.atividades[k];
    atividades[k] = !p ? q! : !q ? p : {
      melhor: Math.max(p.melhor, q.melhor),
      tentativas: Math.max(p.tentativas, q.tentativas),
      concluidaEm: cedo(p.concluidaEm, q.concluidaEm),
      ultima: tarde(p.ultima, q.ultima)
    };
  }
  const etapas: Record<string, string> = {};
  for (const k of new Set([...Object.keys(x.etapas), ...Object.keys(y.etapas)])) {
    etapas[k] = cedo(x.etapas[k] ?? null, y.etapas[k] ?? null)!;
  }
  /* Empate de data: a rota maior na ordem do texto, para a fusão não
     depender de qual lado veio primeiro (comutativa). */
  const onde = !x.onde ? y.onde : !y.onde ? x.onde
    : x.onde.em !== y.onde.em ? (x.onde.em > y.onde.em ? x.onde : y.onde)
    : (x.onde.rota >= y.onde.rota ? x.onde : y.onde);
  return { atividades, etapas, onde };
}

const ehIso = (v: unknown): v is string => typeof v === 'string' && v.length <= 40 && !Number.isNaN(Date.parse(v));
const ehChave = (k: string) => /^m\d{2}:[a-z0-9-]{1,40}$/.test(k);

/** Só o que tem a forma certa: isto vem do servidor ou do navegador. */
export function raizesValido(v: unknown): EstadoRaizes | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const atividades: Record<string, AtividadeFeita> = {};
  if (o.atividades && typeof o.atividades === 'object') {
    for (const [k, a] of Object.entries(o.atividades as Record<string, unknown>)) {
      if (!ehChave(k) || !a || typeof a !== 'object') continue;
      const r = a as Record<string, unknown>;
      const melhor = Number(r.melhor), tentativas = Number(r.tentativas);
      if (!Number.isFinite(melhor) || melhor < 0 || melhor > 1) continue;
      if (!Number.isInteger(tentativas) || tentativas < 0 || tentativas > 100000) continue;
      if (!ehIso(r.ultima)) continue;
      atividades[k] = { melhor, tentativas, concluidaEm: ehIso(r.concluidaEm) ? r.concluidaEm : null, ultima: r.ultima };
    }
  }
  const etapas: Record<string, string> = {};
  if (o.etapas && typeof o.etapas === 'object') {
    for (const [k, em] of Object.entries(o.etapas as Record<string, unknown>)) {
      if (ehChave(k) && ehIso(em)) etapas[k] = em;
    }
  }
  const w = o.onde as Record<string, unknown> | null | undefined;
  const onde = w && typeof w.rota === 'string' && w.rota.startsWith('/raizes') && w.rota.length <= 120 && ehIso(w.em)
    ? { rota: w.rota, em: w.em } : null;
  return { atividades, etapas, onde };
}

/** Uma tentativa terminada. `nota` de 0 a 1; `concluiu` = o critério da atividade foi cumprido. */
export function registrarAtividade(
  e: EstadoRaizes | undefined, chave: string, nota: number, concluiu: boolean, agora: string
): EstadoRaizes {
  const s = e ?? RAIZES_VAZIO;
  const antes = s.atividades[chave];
  const n = Math.max(0, Math.min(1, Number.isFinite(nota) ? nota : 0));
  return {
    ...s,
    atividades: {
      ...s.atividades,
      [chave]: {
        melhor: Math.max(antes?.melhor ?? 0, n),
        tentativas: (antes?.tentativas ?? 0) + 1,
        concluidaEm: antes?.concluidaEm ?? (concluiu ? agora : null),
        ultima: agora
      }
    }
  };
}

export function visitarEtapa(e: EstadoRaizes | undefined, chave: string, rota: string, agora: string): EstadoRaizes {
  const s = e ?? RAIZES_VAZIO;
  return {
    ...s,
    etapas: s.etapas[chave] ? s.etapas : { ...s.etapas, [chave]: agora },
    onde: { rota, em: agora }
  };
}

export const atividadeConcluida = (e: EstadoRaizes | undefined, chave: string) =>
  !!e?.atividades[chave]?.concluidaEm;

/** Concluído quando TODAS as atividades do módulo estão concluídas. */
export const moduloConcluido = (e: EstadoRaizes | undefined, chaves: readonly string[]) =>
  chaves.length > 0 && chaves.every(k => atividadeConcluida(e, k));
