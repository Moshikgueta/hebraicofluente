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
  /** Opcional: só quando a própria pessoa disse um resultado. Nunca inventado. */
  resultado?: string;
  /** Parágrafos separados por linha em branco. O texto é o da pessoa: nenhuma
   *  palavra trocada, e todo corte marcado com "[...]" no lugar do que saiu
   *  (é o que /depoimento promete a quem escreve). */
  citacao: string;
  iniciais: string;
};

export const DEPOIMENTOS: readonly Depoimento[] = [
  /* Enviado pela própria aluna ao dono do curso (25/09/2026), para a landing.
     Trecho, sem reescrita: a pedido do dono do curso sai o fim da segunda
     frase ("corrigindo e acompanhando até que você realmente compreenda"),
     que descrevia acompanhamento individual - e o curso não tem. O corte é
     marcado com "[...]" desde 01/10/2026 (auditoria, LEGAL-107). A
     autorização por escrito dela fica com o dono, fora do repositório
     (ANTES-DE-VENDER.md). */
  {
    nome: 'Natália',
    contexto: 'Búzios, Rio de Janeiro',
    /* Confirmado com a aluna pelo dono do curso (25/09/2026). Fica como
       etiqueta, fora das aspas: a citação é só o que ela escreveu. */
    resultado: 'Lê e escreve em hebraico',
    citacao:
      'Eu já havia estudado hebraico com outros professores, mas encontrei no Moshik uma abordagem ' +
      'diferente. Ele faz você prestar atenção em cada palavra, cada letra e cada pronúncia [...].\n\n' +
      'A plataforma também demonstra esse cuidado, com áudio, texto, imagens e exercícios de leitura, ' +
      'escrita e pronúncia. Existe uma preocupação real em fazer o aluno aprender de verdade.\n\n' +
      'Hoje consigo perceber que estou aprendendo hebraico de uma maneira diferente.',
    iniciais: 'N'
  }
];
