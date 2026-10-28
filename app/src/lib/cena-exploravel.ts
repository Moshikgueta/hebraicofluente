/* As cenas exploráveis (28/10/2026, pedido do dono: "Começa pelas cenas
 * exploráveis").
 * ─────────────────────────────────────────────────────────────────────────
 * No lugar do módulo, cada coisa desenhada que o curso ensina vira um ponto
 * para tocar: o mar, o copo d'água, o chá; no jardim, o sol, a montanha, o
 * rio, o lago, o peixe e o sorvete. O toque mostra a palavra do curso.
 *
 * Nada de hebraico novo: cada ponto CITA uma palavra que já está no
 * vocabulário (`vocabularioDoCurso`), e a leitura, o sentido e o áudio vêm de
 * lá - a cena nunca discorda da lição (`tests/cena-exploravel.test.ts`).
 * E a regra da ordem vale aqui também: palavra com letra ainda não começada
 * aparece só em português, com o nome da letra que falta.
 *
 * As posições são em unidades do desenho (viewBox 320 x 120), e cada par de
 * pontos fica a 40 unidades ou mais um do outro: no telefone de 390 px uma
 * unidade passa de 1 px, e assim as áreas de toque de 44 px não se cobrem.
 */

import type { Letter } from '@/lib/content';
import { FINAL_TO_BASE, clean, consonantsOf } from '@/lib/hebrew';
import { alfabetoDe, consegueLer, vocabularioDoCurso, type PalavraDoCurso } from '@/lib/engine/palavras';

export type PontoDaCena = { he: string; x: number; y: number };

export const PONTOS_DA_CENA: Partial<Record<number, readonly PontoDaCena[]>> = {
  1: [
    { he: 'יָם', x: 236, y: 100 },
    { he: 'מַיִם', x: 44, y: 87 },
    { he: 'תֵה', x: 102, y: 94 }
  ],
  2: [
    { he: 'שֶׁמֶשׁ', x: 70, y: 30 },
    { he: 'גַן', x: 56, y: 86 },
    { he: 'הַר', x: 200, y: 46 },
    { he: 'נָהָר', x: 221, y: 88 },
    { he: 'אֲגַם', x: 182, y: 111 },
    { he: 'דָג', x: 140, y: 93 },
    { he: 'גְלִידָה', x: 296, y: 68 }
  ]
};

export type Descoberta = PontoDaCena & {
  palavra: PalavraDoCurso;
  legivel: boolean;
  /** A primeira letra da palavra que o aluno ainda não começou. */
  falta: Letter | null;
};

/** Os pontos da cena do módulo, com a palavra do curso e se ela já se lê. */
export function descobertasDaCena(
  modulo: number, todas: readonly Letter[], comecadas: readonly Letter[]
): Descoberta[] {
  const vocab = vocabularioDoCurso(todas);
  const alfabeto = alfabetoDe(comecadas);
  const tem = new Set(alfabeto.map(g => FINAL_TO_BASE[g] ?? g));
  return (PONTOS_DA_CENA[modulo] ?? []).flatMap(p => {
    const palavra = vocab.find(w => clean(w.he) === clean(p.he));
    if (!palavra) return [];
    const legivel = consegueLer(palavra.he, alfabeto);
    const faltaGlifo = legivel ? null : consonantsOf(palavra.he).find(g => !tem.has(g)) ?? null;
    const falta = faltaGlifo ? todas.find(l => l.letter === faltaGlifo) ?? null : null;
    return [{ ...p, palavra, legivel, falta }];
  });
}
