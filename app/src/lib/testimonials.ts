/* Os depoimentos.
 * ─────────────────────────────────────────────────────────────────────────
 * A lista nasce VAZIA, e a seção inteira some da landing enquanto ela
 * estiver assim. O protótipo entrega três cartões de exemplo com "Nome do
 * aluno" e um aviso em dourado dizendo que são espaço reservado - o aviso é
 * um bilhete para nós, e quem lê a página é quem está decidindo comprar.
 * Cartão de depoimento com nome inventado numa página de vendas é uma coisa
 * só, e não é reservado: é falso.
 *
 * Para publicar, acrescente objetos aqui. O formato é o do design, e cada
 * campo tem uma função:
 *
 *   nome     - primeiro nome basta.
 *   contexto - uma linha: de onde veio, por que estuda.
 *   resultado- o que passou a conseguir fazer, específico e verificável.
 *              "Lê cardápio em Tel Aviv" vale; "adorei o curso" não.
 *   citacao  - curta. Os melhores dizem o que a pessoa leu e em quanto tempo.
 *   iniciais - usadas no círculo enquanto não houver foto.
 */

export type Depoimento = {
  nome: string;
  contexto: string;
  resultado: string;
  citacao: string;
  iniciais: string;
};

export const DEPOIMENTOS: readonly Depoimento[] = [];
