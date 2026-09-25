/* A missão de módulo: o módulo fecha com "eu usei isto".
 * ─────────────────────────────────────────────────────────────────────────
 * O checkpoint mede itens soltos - esta letra, aquela sílaba. A missão é uma
 * situação só (o mercado, a padaria, a ficha da escola) em três ou quatro
 * passos, e cada passo é uma coisa que a pessoa faria de verdade: ler um
 * rótulo, achar a palavra certa, dizer em voz alta o que está escrito.
 *
 * ── o arquivo CITA, o curso RESPONDE ─────────────────────────────────────
 * `data/missoes.json` guarda só o hebraico de cada passo e o texto em
 * português da situação. O significado e a transliteração vêm do vocabulário
 * do curso, aqui, na hora de montar. Assim a missão nunca discorda da lição
 * sobre o que uma palavra quer dizer, e ninguém escreve hebraico pontuado à
 * mão num segundo lugar. Uma palavra que o curso não tem é erro de conteúdo,
 * e `tests/missoes.test.ts` o pega antes da publicação - junto com a regra
 * que o curso inteiro guarda: nada de letra que o aluno ainda não viu.
 *
 * Os três tipos de passo usam formatos que o tocador já sabe mostrar:
 *   ler           - o hebraico no lugar onde aparece → o significado
 *   achar         - o significado → qual das palavras é
 *   transliterar  - o hebraico → escrever como se lê
 * `semPontos` mostra a palavra sem nikud: é a missão do módulo 6.
 */

import type { Letter, Scene } from '@/lib/content-publico';
import type { Extras } from './extras';
import type { Exercise } from './types';
import { shuffled, type Rand } from './rng';
import { stripNikud } from '@/lib/hebrew';

export type PassoMissao =
  | { tipo: 'ler'; he: string; ondePt: string; erradas: string[]; semPontos?: boolean }
  | { tipo: 'achar'; he: string; promptPt: string; erradas: string[] }
  | { tipo: 'transliterar'; he: string; promptPt: string; semPontos?: boolean };

export type Missao = {
  modulo: number;
  tituloPt: string;
  situacaoPt: string;
  passos: PassoMissao[];
  fechoPt: string;
};

export type Verbete = { he: string; pt: string; translit?: string; audioId?: string | null };

/** O `firsts` que registra a missão cumprida. Uma vez, com data. */
export const missaoId = (modulo: number): string => `missao-${modulo}`;

/** A mesma régua do checkpoint e do exame. */
export const MISSAO_PASSA = 0.7;

/**
 * Tudo que o curso sabe dizer sobre uma palavra: as listas das lições, as
 * cenas do mundo real e as palavras dos sons modernos. A primeira definição
 * vence, na ordem do curso - é a que o aluno viu primeiro.
 */
export function lexicoDoCurso(
  letras: readonly Letter[], cenas: readonly Scene[], extras: Pick<Extras, 'gerech'>
): Map<string, Verbete> {
  const lex = new Map<string, Verbete>();
  const junta = (v: Verbete) => { if (!lex.has(v.he)) lex.set(v.he, v); };
  for (const L of [...letras].sort((a, b) => a.order - b.order)) {
    for (const w of [...L.wordsToRead, ...L.wordsToRecognize]) junta(w);
  }
  for (const s of cenas) junta(s);
  for (const g of extras.gerech.letters) for (const w of g.words) junta(w);
  return lex;
}

/** Todo hebraico que a missão põe na tela, para o teste conferir. */
export function palavrasDaMissao(m: Missao): string[] {
  return m.passos.flatMap(p => [p.he, ...('erradas' in p ? p.erradas : [])]);
}

function verbete(lex: ReadonlyMap<string, Verbete>, he: string, m: Missao): Verbete {
  const v = lex.get(he);
  if (!v) throw new Error(`missão do módulo ${m.modulo}: "${he}" não é palavra do curso`);
  return v;
}

/** Os passos da missão, como exercícios do tocador. Na ordem da história:
 *  só as alternativas são embaralhadas, nunca os passos. */
export function montarMissao(m: Missao, lex: ReadonlyMap<string, Verbete>, rand: Rand): Exercise[] {
  return m.passos.map((p, i): Exercise => {
    const base = { id: `missao-${m.modulo}-${i}`, letterId: 'final', skill: 'ler' as const };
    const v = verbete(lex, p.he, m);
    const mostra = (he: string, semPontos?: boolean) => (semPontos ? stripNikud(he) : he);
    const explica = `${p.he}${v.translit ? ` - ${v.translit}` : ''} - ${v.pt}.`;

    if (p.tipo === 'ler') {
      const certa = v.pt;
      const options = shuffled(
        [...new Set([certa, ...p.erradas.map(e => verbete(lex, e, m).pt)])], rand);
      return {
        ...base, kind: 'scene-reading',
        promptPt: 'Leia. O que está escrito?',
        he: mostra(p.he, p.semPontos), wherePt: p.ondePt,
        options, answer: options.indexOf(certa),
        audioId: v.audioId ?? null, explainPt: explica
      };
    }
    if (p.tipo === 'achar') {
      for (const e of p.erradas) verbete(lex, e, m);
      const options = shuffled([...new Set([p.he, ...p.erradas])], rand);
      return {
        ...base, kind: 'meaning-to-word',
        promptPt: p.promptPt, pt: v.pt,
        options, answer: options.indexOf(p.he),
        explainPt: explica
      };
    }
    if (!v.translit) {
      throw new Error(`missão do módulo ${m.modulo}: "${p.he}" não tem transliteração no curso`);
    }
    return {
      ...base, kind: 'type-answer',
      promptPt: p.promptPt,
      he: mostra(p.he, p.semPontos),
      accept: [v.translit],
      placeholder: 'escreva aqui',
      want: 'translit',
      audioId: v.audioId ?? null,
      hintsPt: [`Começa com “${v.translit[0]}”.`],
      explainPt: explica
    };
  });
}
