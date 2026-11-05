/* Ler cardápios (05/11/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * O quadro de um café em Tel Aviv, como chega em Israel: sem nikud, com o
 * preço em shekels. Três abas (pratos de Israel, bebidas, nomes
 * internacionais), cada item com um desenho. Abre com o alfabeto dominado:
 * todo cardápio usa letras do alfabeto inteiro. data/cardapios.json.
 *
 * Dois modos na tela (components/learn/QuadroDoCafe.tsx):
 *   · ler o quadro: tocar num prato mostra os pontos, a leitura e o sentido;
 *   · fazer o pedido: os desenhos somem, o cliente pede um prato pelo
 *     sentido, o aluno acha o nome no quadro e depois escolhe o preço.
 * As regras do pedido moram aqui, sem tela, para os testes. */

import { shuffled } from './rng';

export type ItemDoCardapio = { desenho: string; he: string; translit: string; pt: string; preco: number };
export type Cardapio = {
  id: string; he: string; nomePt: string; tipoPt: string;
  /** Aba de comidas com nome internacional: o item ganha a etiqueta. */
  internacional?: boolean;
  itens: ItemDoCardapio[];
};

/** Clientes por rodada do pedido. */
export const CLIENTES_POR_RODADA = 4;
/** Preços na escolha: o certo e mais dois do mesmo quadro. */
export const OPCOES_DE_PRECO = 3;

export const precoEm = (n: number) => `₪${n}`;

/** Os pratos pedidos numa rodada: índices distintos do cardápio. */
export function clientesDaRodada(c: Cardapio, rand: () => number = Math.random): number[] {
  return shuffled(c.itens.map((_, i) => i), rand).slice(0, Math.min(CLIENTES_POR_RODADA, c.itens.length));
}

/** As opções de preço para o item `i`: o certo e outros preços do quadro,
 *  todos diferentes entre si. */
export function opcoesDePreco(c: Cardapio, i: number, rand: () => number = Math.random): number[] {
  const certo = c.itens[i]!.preco;
  const outros = [...new Set(c.itens.map(x => x.preco).filter(p => p !== certo))];
  return shuffled([certo, ...shuffled(outros, rand).slice(0, OPCOES_DE_PRECO - 1)], rand);
}
