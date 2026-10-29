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

import { tx } from '@/i18n/telas/motor-testimonials';
import { LOCALE } from '@/i18n';

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

/* O site em inglês sai sem depoimento (decisão do dono, 29/10/2026): o da
   Natália foi escrito em português, por uma aluna do Brasil, e o site em
   inglês não fala de nenhum dos dois. Volta quando houver um aluno de lá. */
export const DEPOIMENTOS: readonly Depoimento[] = LOCALE === 'en' ? [] : [
  /* Enviado pela própria aluna ao dono do curso (25/09/2026), para a landing.
     Trecho, sem reescrita: a pedido do dono do curso sai o fim da segunda
     frase ("corrigindo e acompanhando até que você realmente compreenda"),
     que descrevia acompanhamento individual - e o curso não tem. O corte é
     marcado com "[...]" desde 01/10/2026 (auditoria, LEGAL-107). A
     autorização por escrito dela fica com o dono, fora do repositório
     (ANTES-DE-VENDER.md). */
  {
    nome: 'Natália', // i18n-ok: nome próprio
    /* Ela é aluna particular do professor (dono, 01/10/2026). O vínculo vai
       junto do depoimento, à vista: quem lê precisa saber que ela não é uma
       compradora qualquer (CONAR; PARA-O-ADVOGADO.md, item 16). */
    contexto: tx.natContexto,
    /* Confirmado com a aluna pelo dono do curso (25/09/2026). Fica como
       etiqueta, fora das aspas: a citação é só o que ela escreveu. */
    resultado: tx.natResultado,
    citacao: tx.natCitacao,
    iniciais: 'N'
  }
];
