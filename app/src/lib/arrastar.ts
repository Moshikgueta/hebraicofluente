/* Montar a palavra arrastando (28/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * O arrastar é um gesto A MAIS: tocar para pôr e tocar para tirar continuam
 * valendo, e são o caminho do teclado e do leitor de tela. Aqui fica só a
 * conta, sem tela, para o teste:
 *
 *   · onde a peça solta entra na palavra (`posicaoDeSoltar`). A palavra é
 *     hebraica: a primeira peça fica à DIREITA, e a fileira pode quebrar em
 *     duas linhas no telefone;
 *   · o que a soltura faz com a lista montada (`soltarNaPalavra`, `tirarDaPalavra`).
 */

export type Caixa = { left: number; right: number; top: number; bottom: number };

/**
 * Quantas peças já postas vêm ANTES do ponto (x, y): as das linhas de cima e,
 * na mesma linha, as que estão à direita dele.
 */
export function posicaoDeSoltar(caixas: readonly Caixa[], x: number, y: number): number {
  return caixas.filter(c =>
    c.bottom <= y ? true          // linha de cima: vem antes
    : c.top > y ? false           // linha de baixo: vem depois
    : (c.left + c.right) / 2 > x  // mesma linha: à direita vem antes
  ).length;
}

/** A peça `peca` entra na posição `pos`; se ela já estava na palavra, muda de lugar. */
export function soltarNaPalavra(montada: readonly number[], peca: number, pos: number): number[] {
  const de = montada.indexOf(peca);
  const sem = montada.filter(p => p !== peca);
  const alvo = de >= 0 && de < pos ? pos - 1 : pos;
  const k = Math.max(0, Math.min(alvo, sem.length));
  return [...sem.slice(0, k), peca, ...sem.slice(k)];
}

export function tirarDaPalavra(montada: readonly number[], peca: number): number[] {
  return montada.filter(p => p !== peca);
}
