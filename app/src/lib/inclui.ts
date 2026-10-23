/* O que o preço do curso de alfabetização compra, em itens concretos.
 * ─────────────────────────────────────────────────────────────────────────
 * Uma lista só, lida pela caixa de preço da página de venda (Fecho.tsx) e
 * pelo cartão do curso na capa (PortalClient): os dois lugares dizem a mesma
 * coisa, com os mesmos números. Cada item é conferido no produto (auditoria
 * de 01/10, CONV-001 seção 2, item 4): a Aula 0 (/inicio), as lições
 * (contadas do curso), a cursiva traçada na tela, o áudio (só com o
 * manifesto cheio), os jogos da Academia (/academia), o exame final
 * (/desafio-final) e o certificado, que a própria imagem diz não ser
 * oficial (/faq, "Tem certificado?"). */

import { audioAvailable } from '@/components/learn/AudioButton';
import { totalLicoes } from '@/lib/content-publico';

export function oQueOCursoInclui(): string[] {
  return [
    'Aula 0: como o hebraico funciona, antes da primeira letra',
    `${totalLicoes()} lições, uma letra por vez`,
    'Escrita cursiva traçada na tela, com avaliação do traço',
    audioAvailable() ? 'Áudio gravado pelo professor, um israelense' : 'Explicação de som para cada letra',
    'Jogos de prática na Academia de Leitura',
    'Exame final e certificado de conclusão (não oficial)',
    'Progresso salvo, no celular e no computador'
  ];
}

/** Os três itens do cartão da capa: lições, cursiva e som. */
export const oEssencialDoCurso = (): string[] => oQueOCursoInclui().slice(1, 4);
