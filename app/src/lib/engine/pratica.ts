/* As lições de prática: 3, 7, 10 e 13 (29/09/2026; a 23 e a 27 são o fecho
 * dos módulos 6 e 7, em /extra, desde 30/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O plano de aulas fecha cada módulo com uma lição sem letra nova - "jogos,
 * correção e leitura em voz alta". No site ela era só essa frase na página
 * do módulo, sem link: seis das 27 lições anunciadas não existiam.
 *
 * Agora cada uma é uma página (/modulo/N/pratica) montada SÓ com o que o
 * curso já tem - nenhuma palavra nova, nenhum hebraico escrito para ela:
 *
 *   · correção  - os erros do aluno nas letras do módulo (ou, sem erro
 *                 registrado, as letras do módulo), com a questão errada
 *                 voltando até ser acertada; nos módulos 6 e 7, o quiz do
 *                 ponto e das finais, ou o do gerech;
 *   · parecidas - o par de letras do módulo que mais se confunde, lado a
 *                 lado (só onde há par);
 *   · ler       - as palavras do módulo em voz alta, com o gravar e comparar;
 *   · e as portas para o texto, a missão e o checkpoint do módulo.
 *
 * Não tranca nada e não conta na porcentagem: é revisão. Terminar a correção
 * grava `pratica-N` em `firsts`, que a página do módulo mostra com ✓.
 */

import type { Letter } from '@/lib/content-publico';
import type { Extras } from './extras';
import { buildDageshQuiz, buildGerechQuiz } from './extras';
import { buildConfusionDrill, buildReview, type Exercise } from './exercises';

export const praticaId = (n: number) => `pratica-${n}`;

type ModuloLike = { n: number; letterIds: readonly string[]; lessons: readonly { n: number; kind?: string }[] };

/** O número da lição de prática do módulo, se ele tem uma. */
export const licaoDePratica = (mod: ModuloLike): number | null =>
  mod.lessons.find(l => l.kind === 'practice')?.n ?? null;

/** As letras do módulo, e o alfabeto que o aluno tem ao chegar ao fim dele. */
export function letrasDoModulo(mod: ModuloLike, letras: readonly Letter[]) {
  const doModulo = letras.filter(l => mod.letterIds.includes(l.id));
  const ate = doModulo.length ? Math.max(...doModulo.map(l => l.order)) : Infinity;
  const historia = [...letras].filter(l => l.order <= ate).sort((a, b) => a.order - b.order);
  return { doModulo, historia };
}

/**
 * A correção: o que o aluno errou NESTE módulo. `fracas` vem de
 * weakLetters (lib/state/rules.ts), já ordenada por quanto a letra deu
 * trabalho; aqui ela é filtrada para as letras do módulo. Sem erro nenhum,
 * as letras do módulo inteiras - a prática nunca sai vazia.
 */
export function correcaoDoModulo(
  mod: ModuloLike, letras: readonly Letter[], extras: Extras, fracas: readonly string[],
  opts: { audioAvailable: boolean; seed: string; count?: number }
): { exercicios: Exercise[]; dosErros: boolean } {
  const count = opts.count ?? 8;
  const { doModulo, historia } = letrasDoModulo(mod, letras);
  if (!doModulo.length) {
    /* Os módulos sem letra: o 6 (o ponto e as finais) e o 7 (o gerech). */
    const exercicios = mod.n === 7
      ? buildGerechQuiz(extras, count, opts.seed)
      : buildDageshQuiz(extras, count, opts.seed);
    return { exercicios, dosErros: false };
  }
  const alvo = fracas.filter(id => doModulo.some(l => l.id === id));
  return {
    exercicios: buildReview(alvo.length ? alvo : doModulo.map(l => l.id), historia, {
      audioAvailable: opts.audioAvailable, count, seed: opts.seed
    }),
    dosErros: alvo.length > 0
  };
}

/**
 * O par de letras parecidas do módulo: a primeira letra do módulo que tem
 * uma parecida já ensinada. O conteúdo declara as parecidas
 * (`confusableWith`), então o par é o que o curso já ensina como par.
 */
export function parDoModulo(mod: ModuloLike, letras: readonly Letter[]): [Letter, Letter] | null {
  const { doModulo, historia } = letrasDoModulo(mod, letras);
  for (const L of doModulo) {
    for (const g of L.confusableWith ?? []) {
      const outra = historia.find(x => x.id !== L.id && (x.letter === g || x.finalForm === g));
      if (outra) return [L, outra];
    }
  }
  return null;
}

export function parecidasDoModulo(
  mod: ModuloLike, letras: readonly Letter[], opts: { audioAvailable: boolean; seed: string; count?: number }
): { par: [Letter, Letter]; exercicios: Exercise[] } | null {
  const par = parDoModulo(mod, letras);
  if (!par) return null;
  const { historia } = letrasDoModulo(mod, letras);
  const exercicios = buildConfusionDrill(par[0], par[1], {
    audioAvailable: opts.audioAvailable, count: opts.count ?? 6, seed: opts.seed, history: historia
  });
  return exercicios.length ? { par, exercicios } : null;
}

export type PalavraParaLer = { he: string; translit: string | null; pt: string; audioId: string };

/**
 * As palavras para ler em voz alta: as de leitura das letras do módulo; no
 * 6, as do ponto e das finais; no 7, as do gerech. Sem repetir, até `max`.
 */
export function palavrasParaLer(
  mod: ModuloLike, letras: readonly Letter[], extras: Extras, max = 8
): PalavraParaLer[] {
  const { doModulo } = letrasDoModulo(mod, letras);
  const todas: PalavraParaLer[] = doModulo.length
    ? doModulo.flatMap(L => L.wordsToRead.map(w => ({ he: w.he, translit: w.translit, pt: w.pt, audioId: w.audioId })))
    : mod.n === 7
      ? extras.gerech.letters.flatMap(g => g.words.map(w => ({ he: w.he, translit: null, pt: w.pt, audioId: w.audioId })))
      : [
          ...extras.dagesh.letters.flatMap(D => [...D.hardWords, ...D.softWords]),
          ...extras.finals.map(F => ({ he: F.word, translit: F.translit, pt: F.pt, audioId: F.audioId }))
        ].map(w => ({ he: w.he, translit: w.translit, pt: w.pt, audioId: w.audioId }));
  const vistas = new Set<string>();
  const out: PalavraParaLer[] = [];
  for (const w of todas) {
    const k = w.he.normalize('NFC');
    if (vistas.has(k)) continue;
    vistas.add(k);
    out.push(w);
    if (out.length >= max) break;
  }
  return out;
}
