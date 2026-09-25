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

import type { ItemCompreensao, Word } from '@/lib/content-publico';

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

/** O `firsts` que registra o texto do módulo `n` como lido. */
export const textoLidoId = (n: number): string => `texto-${n}`;

/**
 * As palavras que um texto acrescenta ao vocabulário do aluno, depois de lido.
 *
 * Vêm de `novas`, que já foram revisadas junto com o texto, menos o que não é
 * palavra de vocabulário: o prefixo solto (הַ־, בַּ־, que termina no traço de
 * união) e o nome próprio (Dana, Noa). A pontuação de fim sai: "מָה נִשְׁמַע?"
 * entra como "מָה נִשְׁמַע". Sem gravação ainda, então `audioId` vazio.
 */
export function palavrasDoTexto(t: Texto): Word[] {
  return t.novas
    .filter(w => !w.he.includes('־') && !/\(nome\)\s*$/.test(w.pt))
    .map(w => ({
      he: w.he.replace(/[?!.,:]+$/u, '').trim(),
      translit: w.translit.replace(/[?!.,:]+$/u, '').trim(),
      pt: w.pt,
      use: null,
      audioId: ''
    }));
}
