/* Trocar XP por recompensas (27/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Pedido do dono do curso: o XP que o aluno junta passa a valer alguma coisa.
 * A regra que segura tudo:
 *
 *   O XP TOTAL é a conquista e nunca diminui. O que se gasta é o SALDO -
 *   o total menos o que já foi trocado. Gastar não apaga esforço.
 *
 * As compras moram no progresso (`LearnerState.loja.compras`), que sincroniza
 * entre aparelhos: cada compra tem um id próprio, e a fusão é a união. Dois
 * aparelhos sem rede comprando ao mesmo tempo podem deixar o saldo negativo
 * depois de se encontrarem; ele aparece como zero, e nada é desfeito - são
 * prêmios digitais, e desfazer um prêmio já usado seria pior.
 *
 * O conteúdo principal NUNCA está aqui: o aluno já pagou pelo curso, e
 * trancar lição atrás de XP seria cobrar duas vezes.
 */

import type { Compra, LearnerState } from '@/lib/state/types';

/* ── o catálogo ─────────────────────────────────────────────────────────── */

export type ItemDaLoja = {
  id: 'folga' | 'carta' | 'nome-decorado' | 'texto-bonus' | 'bencao';
  titulo: string;
  custo: number;
  descricao: string;
};

/* Os preços na escala do XP do curso: uma letra inteira (cinco etapas, a
   lição e a fixação perfeita) vale uns 55; o curso todo, uns 2.000. */
export const ITENS: Record<ItemDaLoja['id'], ItemDaLoja> = {
  folga: {
    id: 'folga', titulo: 'Dia de folga', custo: 100,
    descricao: 'Se você passar um dia sem cumprir a meta, a folga é usada sozinha e a sua sequência continua. Dá para guardar até duas.'
  },
  carta: {
    id: 'carta', titulo: 'Carta de cultura antecipada', custo: 150,
    descricao: 'Abre agora a próxima carta da viagem pela história do hebraico, sem esperar dominar mais letras.'
  },
  'nome-decorado': {
    id: 'nome-decorado', titulo: 'Seu nome em hebraico decorado', custo: 300,
    descricao: 'O seu nome em letra de fôrma e à mão, numa imagem para baixar: papel de parede do celular ou para imprimir.'
  },
  /* As leituras bônus (lib/engine/bonus.ts): 200 XP cada, trecho ou
     versículo (30/09/2026, decisão do dono; antes o versículo custava 100).
     Uma compra guarda o custo que pagou, então mudar o preço não mexe no
     saldo de quem já trocou. O id `bencao` ficou
     do tempo em que havia bênçãos de reza aqui: mudar quebraria compras. */
  'texto-bonus': {
    id: 'texto-bonus', titulo: 'Texto bíblico bônus', custo: 200,
    descricao: 'Um trecho do Antigo Testamento em hebraico, com transliteração, tradução e a leitura gravada, linha a linha.'
  },
  bencao: {
    id: 'bencao', titulo: 'Versículo bíblico', custo: 200,
    descricao: 'Um versículo conhecido do Antigo Testamento, com transliteração, tradução e a leitura gravada.'
  }
};

/** Os itens comprados PARA alguma coisa: a carta, a leitura. Um por alvo. */
const COM_ALVO = new Set<ItemDaLoja['id']>(['carta', 'texto-bonus', 'bencao']);

/** Quantas folgas sem uso cabem na mão de uma vez. */
export const MAX_FOLGAS = 2;

/* ── o saldo ────────────────────────────────────────────────────────────── */

const compras = (s: LearnerState): Compra[] => Object.values(s.loja?.compras ?? {});

export const gasto = (s: LearnerState): number => compras(s).reduce((t, c) => t + c.custo, 0);

/** O que dá para trocar agora. Nunca negativo (ver o cabeçalho). */
export const saldo = (s: LearnerState): number => Math.max(0, s.xp - gasto(s));

/* ── as folgas ──────────────────────────────────────────────────────────── */

/** As folgas compradas e ainda não usadas, da mais antiga para a mais nova. */
export function folgasLivres(s: LearnerState): [string, Compra][] {
  return Object.entries(s.loja?.compras ?? {})
    .filter(([, c]) => c.item === 'folga' && !c.usadaEm)
    .sort(([, a], [, b]) => a.em.localeCompare(b.em));
}

/**
 * Gasta `dias` folgas, uma para cada dia perdido, e devolve o novo estado -
 * ou `null` se não há folgas bastantes. Tudo ou nada: cobrir só metade da
 * lacuna não salva a sequência e gastaria folga à toa.
 */
export function usarFolgas(s: LearnerState, diasPerdidos: readonly string[]): LearnerState | null {
  const livres = folgasLivres(s);
  if (!diasPerdidos.length) return s;
  if (livres.length < diasPerdidos.length) return null;
  const todas = { ...(s.loja?.compras ?? {}) };
  diasPerdidos.forEach((dia, i) => {
    const [id, c] = livres[i]!;
    todas[id] = { ...c, usadaEm: dia };
  });
  return { ...s, loja: { compras: todas } };
}

/* ── as cartas ──────────────────────────────────────────────────────────── */

/** Os ids das cartas de cultura abertas com XP. */
export const cartasCompradas = (s: LearnerState): Set<string> =>
  new Set(compras(s).filter(c => c.item === 'carta' && c.alvo).map(c => c.alvo!));

/** Os ids das leituras bônus abertas (textos e versículos). */
export const leiturasCompradas = (s: LearnerState): Set<string> =>
  new Set(compras(s).filter(c => (c.item === 'texto-bonus' || c.item === 'bencao') && c.alvo).map(c => c.alvo!));

export const temNomeDecorado = (s: LearnerState): boolean =>
  compras(s).some(c => c.item === 'nome-decorado');

/* ── comprar ────────────────────────────────────────────────────────────── */

export type Recusa = 'saldo' | 'limite' | 'ja-tem' | 'sem-alvo' | 'sem-nome';

/**
 * A compra, pura: devolve o estado novo ou o motivo da recusa. `agora` entra
 * de fora (ISO) para que os testes controlem o relógio e o id seja estável.
 */
export function comprar(
  s: LearnerState, item: ItemDaLoja['id'], agora: string, alvo?: string
): { ok: true; state: LearnerState } | { ok: false; motivo: Recusa } {
  const def = ITENS[item];
  if (saldo(s) < def.custo) return { ok: false, motivo: 'saldo' };
  if (item === 'folga' && folgasLivres(s).length >= MAX_FOLGAS) return { ok: false, motivo: 'limite' };
  if (COM_ALVO.has(item) && !alvo) return { ok: false, motivo: 'sem-alvo' };
  if (COM_ALVO.has(item) && `${item}:${alvo}` in (s.loja?.compras ?? {})) return { ok: false, motivo: 'ja-tem' };
  if (item === 'nome-decorado' && temNomeDecorado(s)) return { ok: false, motivo: 'ja-tem' };
  if (item === 'nome-decorado' && !s.nomeHebraico) return { ok: false, motivo: 'sem-nome' };

  /* O id: único por compra de folga (várias podem existir), e fixo por alvo
     nas outras - comprar a mesma carta em dois aparelhos vira UMA compra na
     fusão, e não duas cobranças. */
  const id = item === 'folga' ? `folga:${agora}` : COM_ALVO.has(item) ? `${item}:${alvo}` : item;
  const compra: Compra = { item, custo: def.custo, em: agora, ...(alvo ? { alvo } : {}), ...(item === 'folga' ? { usadaEm: null } : {}) };
  return { ok: true, state: { ...s, loja: { compras: { ...(s.loja?.compras ?? {}), [id]: compra } } } };
}

/* ── o que vem do servidor ou de outro aparelho ─────────────────────────── */

const PERIGOSAS = new Set(['__proto__', 'constructor', 'prototype']);
const ITEM_VALIDO = new Set(Object.keys(ITENS));

/** Só as compras com a forma certa. Um custo que não é número viraria saldo infinito. */
export function comprasValidas(bruto: unknown): Record<string, Compra> {
  const fora: Record<string, Compra> = {};
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return fora;
  for (const [id, v] of Object.entries(bruto as Record<string, unknown>)) {
    if (PERIGOSAS.has(id) || !v || typeof v !== 'object') continue;
    const c = v as Record<string, unknown>;
    if (typeof c.item !== 'string' || !ITEM_VALIDO.has(c.item)) continue;
    if (typeof c.custo !== 'number' || !Number.isFinite(c.custo) || c.custo < 0) continue;
    if (typeof c.em !== 'string') continue;
    fora[id] = {
      item: c.item, custo: c.custo, em: c.em,
      ...(typeof c.alvo === 'string' ? { alvo: c.alvo } : {}),
      ...(c.item === 'folga' ? { usadaEm: typeof c.usadaEm === 'string' ? c.usadaEm : null } : {})
    };
  }
  return fora;
}

/**
 * Funde as compras de dois aparelhos: a união por id. Uma folga comprada nos
 * dois (o mesmo id chega pelos dois lados) fica com o uso MAIS CEDO - a folga
 * foi gasta, e em qual dia não muda que foi. Comutativa e idempotente.
 */
export function fundirCompras(a: Record<string, Compra>, b: Record<string, Compra>): Record<string, Compra> {
  const va = comprasValidas(a), vb = comprasValidas(b);
  const fora: Record<string, Compra> = {};
  for (const id of new Set([...Object.keys(va), ...Object.keys(vb)])) {
    const x = va[id], y = vb[id];
    if (!x || !y) { fora[id] = (x ?? y)!; continue; }
    const usos = [x.usadaEm, y.usadaEm].filter((d): d is string => !!d).sort();
    fora[id] = {
      ...(x.em <= y.em ? x : y),
      ...(x.item === 'folga' ? { usadaEm: usos[0] ?? null } : {})
    };
  }
  return fora;
}
