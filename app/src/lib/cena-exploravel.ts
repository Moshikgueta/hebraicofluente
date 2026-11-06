/* As cenas exploráveis (28/10/2026, pedido do dono: "Começa pelas cenas
 * exploráveis", e depois "Faz agora as cenas dos outros módulos").
 * ─────────────────────────────────────────────────────────────────────────
 * No lugar do módulo, cada coisa desenhada que o curso ensina vira um ponto
 * para tocar: o mar, o copo d'água, o chá; no jardim, o sol, a montanha, o
 * rio, o lago, o peixe e o sorvete; e assim até o telhado. O toque mostra a
 * palavra do curso.
 *
 * Nada de hebraico novo: cada ponto CITA uma palavra que o curso já ensina, e
 * a leitura, o sentido e o áudio vêm de lá - a cena nunca discorda da lição
 * (`tests/cena-exploravel.test.ts`). Três fontes:
 *   · `curso`      · o vocabulário das letras (`vocabularioDoCurso`)
 *   · `sem-pontos` · as palavras do módulo 6, como ele as mostra (sem nikud)
 *   · `gueresh`    · as palavras dos sons modernos, do módulo 7
 *
 * E a regra da ordem vale aqui também: palavra com letra ainda não começada
 * aparece só em português, com o nome da letra que falta; as do módulo 6 e
 * do 7 esperam o aluno começar o módulo, que é onde elas são ensinadas.
 *
 * A cena cresce com o aluno: os pontos `depois` são palavras de módulos
 * seguintes que combinam com o desenho, e aparecem quando já se leem.
 *
 * As posições são em unidades do desenho (viewBox 320 x 120), e cada par de
 * pontos fica a 40 unidades ou mais um do outro: no telefone de 390 px uma
 * unidade passa de 1 px, e assim as áreas de toque de 44 px não se cobrem.
 */

import type { Letter } from '@/lib/content';
import type { Extras } from '@/lib/engine/extras';
import { FINAL_TO_BASE, clean, consonantsOf } from '@/lib/hebrew';
import { alfabetoDe, consegueLer, vocabularioDoCurso } from '@/lib/engine/palavras';

export type FonteDoPonto = 'curso' | 'sem-pontos' | 'gueresh';
/** `depois`: um ponto que a cena ganha quando o aluno avança (28/10/2026).
 *  A palavra é de um módulo seguinte, e o ponto só aparece quando ela já se
 *  lê; antes disso ele não existe, nem como dica. */
export type PontoDaCena = { he: string; x: number; y: number; fonte?: FonteDoPonto; depois?: true };

export const PONTOS_DA_CENA: Partial<Record<number, readonly PontoDaCena[]>> = {
  1: [
    { he: 'יָם', x: 236, y: 100 },
    { he: 'מַיִם', x: 44, y: 87 },
    { he: 'תֵה', x: 102, y: 94 },
    { he: 'שֶׁמֶשׁ', x: 62, y: 34, depois: true },
    { he: 'עִיר', x: 250, y: 58, depois: true },
    { he: 'עֵץ', x: 12, y: 58, depois: true }
  ],
  2: [
    { he: 'שֶׁמֶשׁ', x: 70, y: 30 },
    { he: 'גַן', x: 56, y: 86 },
    { he: 'הַר', x: 200, y: 46 },
    { he: 'נָהָר', x: 221, y: 88 },
    { he: 'אֲגַם', x: 182, y: 111 },
    { he: 'דָג', x: 140, y: 93 },
    { he: 'גְלִידָה', x: 296, y: 68 },
    { he: 'עֵץ', x: 96, y: 92, depois: true }
  ],
  3: [
    { he: 'וֶרֶד', x: 36, y: 52 },
    { he: 'חַלוֹן', x: 80, y: 78 },
    { he: 'לֶחֶם', x: 121, y: 93 },
    { he: 'מִטְרִיָה', x: 170, y: 76 },
    { he: 'בַּיִת', x: 257, y: 70, depois: true },
    { he: 'דֶרֶךְ', x: 220, y: 112, depois: true }
  ],
  4: [
    { he: 'עֵץ', x: 52, y: 74 },
    { he: 'צֵל', x: 84, y: 108 },
    { he: 'עִיר', x: 160, y: 62 },
    { he: 'סַל', x: 244, y: 92 },
    { he: 'מִיץ', x: 294, y: 86 },
    { he: 'שֶׁמֶשׁ', x: 250, y: 34 },
    { he: 'דֶרֶךְ', x: 160, y: 112, depois: true }
  ],
  5: [
    { he: 'אֹכֶל', x: 36, y: 78 },
    { he: 'פִּתָה', x: 98, y: 78 },
    { he: 'כֶּלֶב', x: 160, y: 98 },
    { he: 'כּוֹס', x: 222, y: 78 },
    { he: 'כֶּסֶף', x: 284, y: 78 }
  ],
  6: [
    { he: 'שמש', x: 290, y: 22, fonte: 'sem-pontos' },
    { he: 'בית', x: 98, y: 44, fonte: 'sem-pontos' },
    { he: 'אוטובוס', x: 159, y: 96, fonte: 'sem-pontos' },
    { he: 'רחוב', x: 64, y: 113, fonte: 'sem-pontos' }
  ],
  7: [
    { he: 'פיג׳מה', x: 302, y: 58, fonte: 'gueresh' },
    { he: 'גַג', x: 100, y: 72 },
    { he: 'שֶׁמֶשׁ', x: 168, y: 52 },
    { he: 'חַלוֹן', x: 194, y: 90 },
    { he: 'עִיר', x: 28, y: 96 },
    { he: 'בַּיִת', x: 262, y: 100 }
  ]
};

/** A palavra de um ponto, já com o que a tela mostra. */
export type PalavraDaCena = {
  he: string;
  translit: string | null;
  pt: string;
  audioId: string | null;
  /** Nas palavras sem pontos, a forma pontuada (a dica). */
  comPontos: string | null;
};

export type Descoberta = PontoDaCena & {
  palavra: PalavraDaCena;
  legivel: boolean;
  /** A primeira letra da palavra que o aluno ainda não começou. */
  falta: Letter | null;
  /** O módulo que ensina a palavra, quando é ele que falta (6 ou 7). */
  faltaModulo: number | null;
};

function palavraDoPonto(p: PontoDaCena, todas: readonly Letter[], extras: Extras | null): PalavraDaCena | null {
  if (p.fonte === 'sem-pontos') {
    const w = extras?.unpointed.groups.flatMap(g => g.words).find(x => x.bare === p.he);
    return w ? { he: w.bare, translit: w.translit, pt: w.pt, audioId: w.audioId ?? null, comPontos: w.pointed } : null;
  }
  if (p.fonte === 'gueresh') {
    const w = extras?.gerech.letters.flatMap(l => l.words).find(x => x.he === p.he);
    return w ? { he: w.he, translit: null, pt: w.pt, audioId: w.audioId ?? null, comPontos: null } : null;
  }
  const w = vocabularioDoCurso(todas).find(x => clean(x.he) === clean(p.he));
  return w ? { he: w.he, translit: w.translit, pt: w.pt, audioId: w.audioId ?? null, comPontos: null } : null;
}

/** Os pontos da cena do módulo, com a palavra do curso e se ela já se lê.
 *  `modulosComecados` diz quais dos módulos sem letra (6 e 7) já começaram. */
export function descobertasDaCena(
  modulo: number, todas: readonly Letter[], comecadas: readonly Letter[],
  extras: Extras | null = null, modulosComecados: readonly number[] = []
): Descoberta[] {
  const alfabeto = alfabetoDe(comecadas);
  const tem = new Set(alfabeto.map(g => FINAL_TO_BASE[g] ?? g));
  return (PONTOS_DA_CENA[modulo] ?? []).flatMap(p => {
    const palavra = palavraDoPonto(p, todas, extras);
    if (!palavra) return [];
    const forma = palavra.comPontos ?? palavra.he;
    const faltaGlifo = consegueLer(forma, alfabeto) ? null : consonantsOf(forma).find(g => !tem.has(g)) ?? null;
    const falta = faltaGlifo ? todas.find(l => l.letter === faltaGlifo) ?? null : null;
    const doModulo = p.fonte === 'sem-pontos' ? 6 : p.fonte === 'gueresh' ? 7 : null;
    const faltaModulo = !falta && doModulo && !modulosComecados.includes(doModulo) ? doModulo : null;
    const legivel = consegueLer(forma, alfabeto) && !faltaModulo;
    if (p.depois && !legivel) return [];
    return [{ ...p, palavra, legivel, falta, faltaModulo }];
  });
}
