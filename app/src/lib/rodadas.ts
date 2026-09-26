/* Cada vez que o aluno refaz um exercício, perguntas novas (26/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O motor é semeado (lib/engine/rng.ts) e, até aqui, a semente de muitas
 * telas era fixa ou recomeçava do zero a cada visita: a prática da letra, o
 * mini-teste, as lições de som, os checkpoints, as missões. Sair e voltar
 * devolvia exatamente as mesmas perguntas, na mesma ordem - e o aluno
 * acabava decorando a posição da resposta em vez de ler.
 *
 * Pedido do dono do curso: na segunda vez, perguntas diferentes, e não as
 * mesmas. Duas peças fazem isso:
 *
 *   1. UMA RODADA POR VEZ. Cada categoria (a prática do Bet, o checkpoint 3,
 *      a revisão...) conta quantas rodadas o aluno já concluiu, e a semente
 *      inclui esse número. Concluir e refazer é outra rodada.
 *   2. O QUE JÁ APARECEU FICA PARA DEPOIS. A categoria lembra a "impressão"
 *      das perguntas das últimas rodadas - o tipo, o que está na tela e a
 *      resposta certa; não o id nem a ordem das alternativas. A rodada nova
 *      é sorteada várias vezes e fica a que menos repete. Quando o conteúdo
 *      acaba (uma letra com seis palavras não tem trinta perguntas
 *      diferentes), repete primeiro o que apareceu há mais tempo.
 *
 * A rodada só avança quando é CONCLUÍDA (`registrarRodada`). Recalcular a
 * tela no meio - o registro de áudio que chega, uma resposta que muda o
 * estado - não troca as perguntas debaixo do aluno.
 *
 * Fica no navegador (localStorage), por aparelho. Sem ele (janela anônima,
 * armazenamento bloqueado) o curso funciona igual, só sem a memória.
 */

import type { Exercise } from '@/lib/engine/types';

const CHAVE = 'hf-rodadas-v1';
/** Quantas impressões cada categoria guarda: umas quatro rodadas grandes. */
export const MEMORIA = 80;
/** Quantos sorteios são consultados para cada lugar da rodada. */
export const TENTATIVAS = 12;

type Registro = { n: number; vistas: string[] };
type Store = Record<string, Registro>;

/* ── a impressão de uma pergunta ────────────────────────────────────────── */

const h = (s: string) => {
  let x = 5381;
  for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) | 0;
  return (x >>> 0).toString(36);
};

/**
 * O que faz duas perguntas serem "a mesma" para quem responde: o tipo, o que
 * aparece na tela e a resposta certa. O id não entra (muitos são por posição)
 * e a ordem das alternativas também não (embaralhar não faz outra pergunta).
 */
export function impressao(ex: Exercise): string {
  const e = ex as Record<string, unknown>;
  const certa = Array.isArray(e.options) && typeof e.answer === 'number'
    ? (e.options as unknown[])[e.answer as number]
    : e.target ?? e.accept ?? e.pairs ?? e.answer ?? null;
  /* O que está na tela. `pairs` e `target` também são a pergunta nos tipos de
     parear e montar; `modo` separa os quatro graus da cursiva. */
  const tela = ['he', 'letter', 'sound', 'audioId', 'pt', 'parts', 'escrita', 'modo', 'translit', 'want']
    .map(k => (k in e ? JSON.stringify(e[k]) : ''))
    .join('|');
  return h(`${ex.kind}|${ex.promptPt}|${tela}|${JSON.stringify(certa)}`);
}

/* ── a escolha (pura, testável) ─────────────────────────────────────────── */

/**
 * Monta a rodada `n` a partir de `tentativas` sorteios, POSIÇÃO POR POSIÇÃO:
 * para cada lugar da rodada, a primeira pergunta (entre os sorteios) que
 * ainda não apareceu e não está já nesta rodada. Assim a estrutura que o
 * gerador escolheu - reconhecer, depois o som, depois ler - fica a mesma,
 * e só o conteúdo de cada lugar muda.
 *
 * Quando todos os sorteios de um lugar repetem, fica o que foi visto há mais
 * tempo. Sem nada visto, a rodada é exatamente o sorteio 0 - e a mesma
 * rodada sai igual enquanto não for concluída.
 */
export function melhorRodada<T>(
  gerar: (seed: string) => T[], base: string, n: number, vistas: readonly string[],
  imp: (t: T) => string, tentativas = TENTATIVAS
): { seed: string; itens: T[]; repetidas: number } {
  /* Idade de cada impressão: 0 = a mais recente. O que nunca foi visto não
     tem idade e é sempre preferido. */
  const idade = new Map<string, number>();
  vistas.forEach((v, i) => { if (!idade.has(v)) idade.set(v, i); });
  const seed0 = `${base}-r${n}-0`;
  const sorteios = [gerar(seed0)];
  const itens: T[] = [];
  const usadas = new Set<string>();
  const ids = new Set<string>();
  let repetidas = 0;

  const idDe = (t: T) => (t && typeof t === 'object' && 'id' in t ? String((t as { id: unknown }).id) : null);

  for (let pos = 0; pos < sorteios[0]!.length; pos++) {
    let escolhido: T | null = null;
    let melhorIdade = -1;
    for (let k = 0; k < tentativas; k++) {
      if (!sorteios[k]) sorteios[k] = gerar(`${base}-r${n}-${k}`);
      const t = sorteios[k]![pos];
      if (t === undefined) continue;
      const m = imp(t);
      if (usadas.has(m)) continue;
      const vista = idade.get(m);
      if (vista === undefined) { escolhido = t; melhorIdade = Infinity; break; }
      if (vista > melhorIdade) { escolhido = t; melhorIdade = vista; }
    }
    if (escolhido === null) escolhido = sorteios[0]![pos]!;
    if (melhorIdade !== Infinity) repetidas++;
    usadas.add(imp(escolhido));
    /* Dois sorteios podem dar o mesmo id a perguntas diferentes (ids por
       posição): o id tem de ser único na rodada. */
    const id = idDe(escolhido);
    if (id !== null) {
      let novo = id;
      for (let x = 2; ids.has(novo); x++) novo = `${id}~${x}`;
      if (novo !== id) escolhido = { ...(escolhido as object), id: novo } as T;
      ids.add(novo);
    }
    itens.push(escolhido);
  }
  return { seed: seed0, itens, repetidas };
}

/* ── a memória (localStorage) ───────────────────────────────────────────── */

function ler(): Store {
  if (typeof window === 'undefined') return {};
  try {
    const s = JSON.parse(window.localStorage.getItem(CHAVE) || '{}');
    return s && typeof s === 'object' ? s as Store : {};
  } catch { return {}; }
}

function gravar(s: Store) {
  try { window.localStorage.setItem(CHAVE, JSON.stringify(s)); } catch { /* sem armazenamento */ }
}

/** A rodada atual de uma categoria: as perguntas e a semente que as gerou. */
export function escolherRodada<T = Exercise>(
  categoria: string, gerar: (seed: string) => T[],
  imp: (t: T) => string = impressao as unknown as (t: T) => string
): { seed: string; itens: T[] } {
  const r = ler()[categoria] ?? { n: 0, vistas: [] };
  const { seed, itens } = melhorRodada(gerar, categoria, r.n, r.vistas, imp);
  return { seed, itens };
}

/** A rodada foi concluída: a próxima é outra, e estas perguntas vão para o fim da fila. */
export function registrarRodada<T = Exercise>(
  categoria: string, itens: readonly T[],
  imp: (t: T) => string = impressao as unknown as (t: T) => string
) {
  if (typeof window === 'undefined') return;
  const s = ler();
  const r = s[categoria] ?? { n: 0, vistas: [] };
  const novas = itens.map(imp);
  s[categoria] = {
    n: r.n + 1,
    vistas: [...novas, ...r.vistas.filter(v => !novas.includes(v))].slice(0, MEMORIA)
  };
  gravar(s);
}
