/* O crédito ao método de origem.
 * ─────────────────────────────────────────────────────────────────────────
 * O Hebraico Fluente não inventou o caminho que ensina. Ele parte do método
 * do Dr. Damián Dzienciarsky, autor de בא לי עברית - a ordem em que as
 * letras entram, a decisão de ler antes de falar e o cuidado com o aluno que
 * estuda sozinho vêm de lá, e o conteúdo do livro dele é a base do que a
 * plataforma ensina.
 *
 * Isto mora num arquivo só, e não copiado em três telas, pela mesma razão
 * que `totalLicoes()` existe: um crédito que diverge de si mesmo entre o
 * rodapé, a página Sobre e a capa é pior do que crédito nenhum. O nome de
 * uma pessoa é o último texto do site que pode sair de uma cópia manual.
 *
 * O hebraico daqui sempre sai pelo componente <He>, que fixa a direção do
 * texto: um título em hebraico dentro de uma frase em português, sem isso,
 * vira uma linha embaralhada no navegador.
 */

import { tx } from '@/i18n/telas/motor-credito';

export const METODO_ORIGINAL = {
  /** Como o autor assina. Escrito aqui e em lugar nenhum mais
   *  (check-legal.mjs lê esta linha). */
  autor: 'Dr. Damián Dzienciarsky', // i18n-ok: nome próprio
  /** O título da obra, em hebraico. Renderizar com <He>. */
  obraHe: 'בא לי עברית',
  /** A transliteração, para quem ainda não lê - que é todo mundo que chega
   *  aqui. Não há tradução ao lado de propósito: o título é um jogo de
   *  linguagem que não atravessa para o português em três palavras, e
   *  inventar uma versão seria pôr na boca do autor o que ele não escreveu. */
  obraTranslit: 'Ba Li Ivrit',
  /** A frase curta, para rodapé e legendas. */
  get linhaPt(): string { return tx.linha(this.autor); },
  /** O que vem do método e o que é do professor, nas palavras dele
   *  (01/10/2026): a ordem das letras NÃO é adaptação; os exercícios, as
   *  explicações para quem fala português e a escrita cursiva são. Em
   *  primeira pessoa, porque é o Moshik quem fala na capa e em /sobre. */
  adaptacoesPt: tx.adaptacoes
} as const;
