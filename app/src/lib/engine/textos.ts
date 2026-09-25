/* Os mini-textos de leitura corrida.
 * ─────────────────────────────────────────────────────────────────────────
 * O curso levava o aluno até a frase de três palavras e parava. Ninguém
 * compra "alfabetização em hebraico" para ler palavras soltas: compra para
 * ler um bilhete, uma mensagem, um cartão. Um texto curto por módulo, do 3
 * ao 7, fecha essa lacuna - cinco ou seis linhas, uma situação de verdade,
 * e perguntas de compreensão em português.
 *
 * ── por que existe `revisado` ────────────────────────────────────────────
 * Tudo o mais no curso é vocabulário e frase que vieram do material de
 * origem. Estes textos foram escritos para o curso, com frases novas, e
 * frase nova em hebraico só vai para o aluno depois que alguém que fala a
 * língua a aprovou. Então cada texto nasce com `revisado: false`, e o curso
 * SÓ mostra os aprovados (`textoDoModulo` em lib/content.ts filtra). Aprovar
 * é mudar o campo para `true` em `data/textos.json`.
 *
 * `novas` lista o que o texto usa e o curso não ensinou: nomes próprios, o
 * artigo e as preposições grudadas na palavra, e umas poucas palavras. Elas
 * aparecem num glossário embaixo do texto.
 */

import type { ItemCompreensao } from '@/lib/content-publico';

export type LinhaDeTexto = { he: string; translit: string; pt: string };

export type Texto = {
  modulo: number;
  tituloPt: string;
  /** Que tipo de texto é: "Bilhete", "Mensagem de WhatsApp"... */
  tipoPt: string;
  introPt: string;
  /** Só `true` depois de um falante de hebraico aprovar. */
  revisado: boolean;
  /** Mostrar sem nikud, como chega de verdade (módulo 6). */
  semPontos?: boolean;
  linhas: LinhaDeTexto[];
  novas: LinhaDeTexto[];
  perguntas: ItemCompreensao[];
};

/** Os textos que o aluno pode ver. */
export const textosPublicados = (textos: readonly Texto[]): Texto[] =>
  textos.filter(t => t.revisado);
