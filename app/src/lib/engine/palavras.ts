/* As palavras do curso como coisa que o aluno USA.
 * ─────────────────────────────────────────────────────────────────────────
 * Até aqui a palavra aparecia para ser reconhecida: ler e escolher o sentido,
 * achar uma letra dentro dela. Este arquivo trata a palavra como algo que se
 * CONSTRÓI e se RECONHECE EM CURSIVA, e dá o número que transforma "aprendi
 * oito letras" em "já consigo ler 34 palavras".
 *
 * ── duas réguas de "consegue", e a diferença importa ─────────────────────
 * LER segue a regra do curso inteiro (`isReadableWith`): o ו de מוֹ é vogal, e
 * "mo" se lê na segunda lição, antes de o Vav ser ensinado como letra.
 *
 * MONTAR e VER EM CURSIVA não podem usar essa régua. Montar põe o ו numa peça
 * solta, e a cursiva escreve a palavra sem sinal nenhum - nos dois casos o ו
 * aparece como LETRA, e a regra é que nenhuma letra aparece antes de ser
 * ensinada. Para esses a régua é estrita: toda letra da grafia já ensinada.
 */

import type { Letter, Word } from '@/lib/content';
import {
  BASE_TO_FINAL, FINAL_TO_BASE, clean, consonantsOf, isReadableWith, stripNikud
} from '@/lib/hebrew';
import { shuffled, take, type Rand } from './rng';
import type { Ctx, Gen } from './generators';
import type { Exercise } from './types';

/* ── o vocabulário ─────────────────────────────────────────────────────── */

/** Uma palavra do curso, com a lição em que ela apareceu pela primeira vez. */
export type PalavraDoCurso = Word & { desde: number };

/**
 * Todas as palavras do curso, uma vez cada, na ordem em que aparecem.
 *
 * `wordsToRead` e `wordsToRecognize`: as duas listas são vocabulário que o
 * aluno encontra na lição. A diferença entre elas é SE ele consegue ler a
 * palavra naquele momento - e isso esta função não decide; quem decide é
 * `consegueLer`, com as letras que ele tem hoje.
 */
export function vocabularioDoCurso(letras: readonly Letter[]): PalavraDoCurso[] {
  const visto = new Map<string, PalavraDoCurso>();
  for (const L of [...letras].sort((a, b) => a.order - b.order)) {
    for (const w of [...L.wordsToRead, ...L.wordsToRecognize]) {
      const k = clean(w.he);
      if (!visto.has(k)) visto.set(k, { ...w, desde: L.order });
    }
  }
  return [...visto.values()];
}

/** Os desenhos de um conjunto de letras: a forma base e a final. */
export function alfabetoDe(letras: readonly Letter[]): string[] {
  return letras.flatMap(l => (l.finalForm ? [l.letter, l.finalForm] : [l.letter]));
}

/** Pela regra de LEITURA do curso. É a que conta "palavras que você lê". */
export const consegueLer = (he: string, alfabeto: readonly string[]): boolean =>
  isReadableWith(he, alfabeto);

/** Pela régua ESTRITA: toda letra da grafia, inclusive o ו vogal. */
export function todasAsLetrasEnsinadas(he: string, alfabeto: readonly string[]): boolean {
  const ok = new Set(alfabeto.map(g => FINAL_TO_BASE[g] ?? g));
  return consonantsOf(he).every(c => ok.has(c));
}

/** As palavras do curso que este alfabeto lê. É o número da conquista. */
export function palavrasLegiveis(
  vocabulario: readonly PalavraDoCurso[], alfabeto: readonly string[]
): PalavraDoCurso[] {
  return vocabulario.filter(w => consegueLer(w.he, alfabeto));
}

/**
 * O vocabulário que o aluno ACUMULOU e já pode montar, ver à mão e digitar:
 * toda palavra das lições feitas, lida pela régua do curso E com toda letra
 * da grafia já ensinada. É a fonte dos três modos de palavra da academia -
 * antes eles tiravam a palavra da posição do item, e a mesma palavra voltava
 * item após item ("Digitar" pedia אמא oito vezes).
 */
export function palavrasAcumuladas(letras: readonly Letter[]): PalavraDoCurso[] {
  const alfabeto = alfabetoDe(letras);
  return vocabularioDoCurso(letras).filter(w => letrasDaGrafia(w.he).length >= 2
    && consegueLer(w.he, alfabeto) && todasAsLetrasEnsinadas(w.he, alfabeto));
}

/** Os marcos que viram conquista. O número exato aparece sempre; os marcos
 *  são os momentos em que ele é DITO em voz alta. */
export const MARCOS_DE_LEITURA = [10, 25, 50, 100] as const;
export const marcoId = (n: number): string => `le-${n}`;

/** A grafia sem sinal nenhum, letra por letra, na ordem de leitura. */
export function letrasDaGrafia(he: string): string[] {
  return [...stripNikud(he)].filter(ch => /[א-ת]/.test(ch));
}

/* ── o nível de construção ─────────────────────────────────────────────── */

export type NivelConstrucao = 'inicial' | 'intermediario' | 'avancado';

/** Pela posição no alfabeto, que é o que decide quanto vocabulário existe. */
export function nivelDeConstrucao(ordem: number): NivelConstrucao {
  if (ordem < 7) return 'inicial';
  if (ordem < 14) return 'intermediario';
  return 'avancado';
}

const FAIXA: Record<NivelConstrucao, [number, number]> = {
  inicial: [2, 3],
  intermediario: [3, 5],
  avancado: [4, 8]
};

/** As palavras que o aluno pode MONTAR agora: já vistas, régua estrita. */
function montaveis(ctx: Ctx): Word[] {
  const vistas = ctx.history.flatMap(x => x.wordsToRead);
  const unicas = [...new Map(vistas.map(w => [clean(w.he), w])).values()];
  return unicas.filter(w => todasAsLetrasEnsinadas(w.he, ctx.alphabet)
    && letrasDaGrafia(w.he).length >= 2);
}

/**
 * Letras que ficam na mesa sem pertencer à palavra.
 *
 *   inicial        - nenhuma. A tarefa é a ordem, e só a ordem.
 *   intermediário  - uma ou duas letras já ensinadas que não estão na palavra.
 *   avançado       - as PARECIDAS das letras da palavra, quando ensinadas:
 *                    quem monta אבא tem um כ na mesa. É o nível em que montar
 *                    também é distinguir.
 */
function distratoresDaConstrucao(
  letras: readonly string[], nivel: NivelConstrucao, ctx: Ctx, rand: Rand
): string[] {
  if (nivel === 'inicial') return [];
  const naPalavra = new Set(letras.map(g => FINAL_TO_BASE[g] ?? g));
  const ensinadas = ctx.alphabet.filter(g => !FINAL_TO_BASE[g] && !naPalavra.has(g));
  if (nivel === 'intermediario') return take(ensinadas, 1 + Math.floor(rand() * 2), rand);
  const donos = ctx.history.filter(x => naPalavra.has(x.letter));
  const parecidas = [...new Set(donos.flatMap(x => x.confusableWith))]
    .map(g => FINAL_TO_BASE[g] ?? g)
    .filter(g => ctx.alphabet.includes(g) && !naPalavra.has(g));
  const out = take(parecidas, 2, rand);
  return out.length ? out : take(ensinadas, 2, rand);
}

/**
 * Monte a palavra, letra por letra, da direita para a esquerda.
 * ─────────────────────────────────────────────────────────────────────────
 * O que a tela mostra é a TRANSLITERAÇÃO - "imá" -, e na mesa estão as letras
 * soltas da grafia, sem sinal: א, מ, א. O aluno as põe na ordem de leitura, e
 * a primeira fica à direita. É o gesto mais próximo de escrever que existe sem
 * uma caneta: lembrar quais letras formam o som, e em que ordem.
 *
 * `exBuildWord` já existia e continua: ele monta por SÍLABAS pontuadas, que é
 * ler. Este monta por LETRAS, que é soletrar.
 */
export function construirPalavra(cursiva: boolean): Gen {
  return (L, ctx, rand, i) => {
    const nivel = nivelDeConstrucao(L.order);
    const pool = montaveis(ctx);
    if (!pool.length) return null;
    const [min, max] = FAIXA[nivel];
    const naFaixa = pool.filter(w => {
      const n = letrasDaGrafia(w.he).length;
      return n >= min && n <= max;
    });
    /* As palavras da própria letra primeiro, e dentro da faixa - senão a mais
       próxima dela. Nunca uma palavra que ainda não apareceu. */
    const daLetra = naFaixa.filter(w => L.wordsToRead.some(x => clean(x.he) === clean(w.he)));
    const fila = daLetra.length ? [...daLetra, ...naFaixa.filter(w => !daLetra.includes(w))]
      : naFaixa.length ? naFaixa
      : [...pool].sort((a, b) => Math.abs(letrasDaGrafia(a.he).length - min)
                               - Math.abs(letrasDaGrafia(b.he).length - min));
    const alvo = fila[i % fila.length];
    if (!alvo) return null;
    return itemConstruir(alvo, L, ctx, rand, i, cursiva, nivel);
  };
}

/** O item de montar para uma palavra JÁ escolhida. A lição escolhe pela
 *  letra do dia; a academia, pelo vocabulário acumulado (ver `gym.ts`). */
export function itemConstruir(
  alvo: Word, L: Letter, ctx: Ctx, rand: Rand, i: number,
  cursiva: boolean, nivel: NivelConstrucao
): Exercise {
  const letras = letrasDaGrafia(alvo.he);
  const extras = distratoresDaConstrucao(letras, nivel, ctx, rand);
  let pecas = shuffled([...letras, ...extras], rand);
  if (!extras.length && pecas.join('') === letras.join('') && letras.length > 1) {
    pecas = [...pecas].reverse();
  }
  return {
    id: `${L.id}-${cursiva ? 'bcur' : 'blet'}-${i}`,
    kind: 'build-letters', letterId: L.id, skill: 'ler',
    promptPt: cursiva
      ? `Monte em cursiva a palavra “${alvo.translit}”.`
      : `Monte a palavra “${alvo.translit}”, letra por letra.`,
    target: stripNikud(alvo.he), letras, tiles: pecas,
    translit: alvo.translit,
    /* No avançado o significado sai de cena: sobra só o som. */
    pt: nivel === 'avancado' ? null : alvo.pt,
    cursiva, nivel,
    audioId: alvo.audioId,
    hintsPt: [
      'A primeira letra fica à DIREITA.',
      `Começa com ${letras[0]}.`
    ],
    explainPt: `${alvo.he} - ${alvo.translit} - ${alvo.pt}. `
      + (cursiva ? 'À mão, sem os sinais de vogal: é assim que se escreve de verdade.'
                 : 'Sem os sinais de vogal, é assim que a palavra aparece numa placa.')
  };
}

export const exBuildLetters = construirPalavra(false);
export const exBuildLettersCursive = construirPalavra(true);

/* ── a palavra em cursiva ──────────────────────────────────────────────── */

export type ModoCursiva = 'letra' | 'qual-palavra' | 'para-cursiva' | 'significado';

/**
 * A partir de que letra cada etapa entra. A cursiva de uma letra é praticada
 * na etapa de escrita DA LIÇÃO DELA, então qualquer palavra legível agora é
 * feita de letras cuja cursiva o aluno já traçou. O que muda de etapa para
 * etapa é o quanto a palavra cursiva tem de ser LIDA, e não só olhada.
 */
export const CURSIVA_DESDE: Record<ModoCursiva, number> = {
  'letra': 3,          // uma letra destacada: que letra é esta?
  'qual-palavra': 5,   // sem destaque: qual destas (impressas) está escrita?
  'para-cursiva': 7,   // a impressa: escolha a mesma em cursiva
  'significado': 9     // só a cursiva: o que quer dizer?
};
/** Construir em cursiva, a etapa 5. */
export const CONSTRUIR_CURSIVA_DESDE = 11;

function cursivaveis(ctx: Ctx): Word[] {
  const vistas = ctx.history.flatMap(x => x.wordsToRead);
  const unicas = [...new Map(vistas.map(w => [clean(w.he), w])).values()];
  return unicas.filter(w => todasAsLetrasEnsinadas(w.he, ctx.alphabet)
    && letrasDaGrafia(w.he).length >= 2);
}

/* Duas palavras com o mesmo esqueleto sem vogal são a MESMA palavra em
   cursiva, e pôr as duas como alternativas deixaria a pergunta sem resposta. */
const esqueleto = (he: string) => letrasDaGrafia(he).map(g => FINAL_TO_BASE[g] ?? g).join('');

export function palavraEmCursiva(modo: ModoCursiva): Gen {
  return (L, ctx, rand, i) => {
    if (L.order < CURSIVA_DESDE[modo]) return null;
    const pool = cursivaveis(ctx);
    const daLetra = pool.filter(w => L.wordsToRead.some(x => clean(x.he) === clean(w.he)));
    const fila = [...daLetra, ...pool.filter(w => !daLetra.includes(w))];
    const alvo = fila[i % Math.max(1, fila.length)];
    if (!alvo) return null;
    return itemCursiva(modo, alvo, pool, L, ctx, rand, i);
  };
}

/** O item de cursiva para uma palavra JÁ escolhida; `pool` é de onde saem
 *  as alternativas erradas. Devolve null quando não há alternativas. */
export function itemCursiva(
  modo: ModoCursiva, alvo: Word, pool: readonly Word[],
  L: Letter, ctx: Ctx, rand: Rand, i: number
): Exercise | null {
  const escrita = stripNikud(alvo.he);
  const outras = pool.filter(w => esqueleto(w.he) !== esqueleto(alvo.he));
  const base = {
    id: `${L.id}-curw-${modo}-${i}`,
    kind: 'cursive-word' as const, letterId: L.id,
    modo, he: alvo.he, escrita, audioId: alvo.audioId,
    explainPt: `${alvo.he} - ${alvo.translit} - ${alvo.pt}. À mão ela se escreve sem os `
      + 'sinais de vogal, e é assim que você vai encontrá-la num bilhete.'
  };

  if (modo === 'letra') {
    /* A letra destacada é a da lição, se ela está na palavra; senão a
       primeira. As alternativas são IMPRESSAS e todas já ensinadas. */
    const letras = letrasDaGrafia(alvo.he);
    const marca = letras.find(g => (FINAL_TO_BASE[g] ?? g) === L.letter) ?? letras[0]!;
    const dono = ctx.history.find(x => x.letter === (FINAL_TO_BASE[marca] ?? marca));
    const parecidas = (dono?.confusableWith ?? [])
      .filter(g => ctx.alphabet.includes(g) && g !== marca);
    const resto = ctx.alphabet.filter(g => g !== marca && !parecidas.includes(g)
      && !FINAL_TO_BASE[g]);
    const erradas = [...take(parecidas, 2, rand), ...shuffled(resto, rand)].slice(0, 3);
    if (erradas.length < 2) return null;
    const options = shuffled([marca, ...erradas], rand);
    return {
      ...base, skill: 'rec',
      promptPt: 'Na palavra escrita à mão, que letra é esta, a destacada?',
      marca, options, answer: options.indexOf(marca),
      whyPt: options.map(o => o === marca ? null
        : dono?.contrastes?.[o] ?? 'Essa é outra letra. Compare o traço destacado com ela.')
    };
  }

  if (modo === 'significado') {
    const erradas = take(outras.filter(w => w.pt !== alvo.pt), 3, rand).map(w => w.pt);
    if (erradas.length < 2) return null;
    const options = shuffled([alvo.pt, ...erradas], rand);
    return {
      ...base, skill: 'ler',
      promptPt: 'Esta palavra está escrita à mão. O que ela quer dizer?',
      options, answer: options.indexOf(alvo.pt)
    };
  }

  /* As duas direções entre a impressa e a cursiva. As alternativas são
     palavras de comprimento parecido, para a pergunta ser sobre o desenho
     das letras e não sobre o tamanho da palavra. */
  const n = letrasDaGrafia(alvo.he).length;
  const parecidasNoTamanho = [...outras].sort((a, b) =>
    Math.abs(letrasDaGrafia(a.he).length - n) - Math.abs(letrasDaGrafia(b.he).length - n));
  const erradas = take(parecidasNoTamanho.slice(0, 6), 3, rand);
  if (erradas.length < 2) return null;
  const certa = modo === 'para-cursiva' ? escrita : alvo.he;
  const options = shuffled(
    [certa, ...erradas.map(w => (modo === 'para-cursiva' ? stripNikud(w.he) : w.he))], rand);
  return {
    ...base, skill: 'ler',
    promptPt: modo === 'para-cursiva'
      ? 'Qual destas é a mesma palavra, escrita à mão?'
      : 'Qual destas palavras está escrita à mão aqui?',
    options, answer: options.indexOf(certa)
  };
}

export const exCursivaLetra = palavraEmCursiva('letra');
export const exCursivaQualPalavra = palavraEmCursiva('qual-palavra');
export const exCursivaParaCursiva = palavraEmCursiva('para-cursiva');
export const exCursivaSignificado = palavraEmCursiva('significado');

/** Os quatro modos de leitura cursiva, na ordem em que entram. */
export const GENS_CURSIVA_PALAVRA: readonly Gen[] = [
  exCursivaLetra, exCursivaQualPalavra, exCursivaParaCursiva, exCursivaSignificado
];

/* Construir em cursiva só existe a partir da etapa 5. */
export const exBuildCursiveGated: Gen = (L, ctx, rand, i) =>
  L.order >= CONSTRUIR_CURSIVA_DESDE ? exBuildLettersCursive(L, ctx, rand, i) : null;

/* ── digitar em hebraico ───────────────────────────────────────────────── */

/**
 * A palavra, digitada no teclado hebraico.
 *
 * Só vive na academia, atrás da confirmação do teclado: numa lição normal o
 * aluno nunca precisa trocar de teclado. A comparação ignora os sinais de
 * vogal e aceita a letra de meio no lugar da final - quem está começando a
 * usar um teclado hebraico ainda não sabe onde fica o ם, e isso não é erro de
 * leitura. A resposta mostrada traz a forma final, para ele ver a diferença.
 */
export const exTypeHebrew: Gen = (L, ctx, _rand, i) => {
  const pool = montaveis(ctx).filter(w => letrasDaGrafia(w.he).length <= 5);
  const alvo = pool[i % Math.max(1, pool.length)];
  if (!alvo) return null;
  return itemDigitar(alvo, L, i);
};

/** O item de digitar para uma palavra JÁ escolhida. */
export function itemDigitar(alvo: Word, L: Letter, i: number): Exercise {
  return {
    id: `${L.id}-typhe-${i}`,
    kind: 'type-hebrew', letterId: L.id, skill: 'escrever',
    promptPt: `Digite em hebraico: “${alvo.translit}” (${alvo.pt}).`,
    accept: [stripNikud(alvo.he)],
    translit: alvo.translit,
    audioId: alvo.audioId,
    hintsPt: ['A primeira letra que você digita aparece à direita.', `Começa com ${letrasDaGrafia(alvo.he)[0]}.`],
    explainPt: `${alvo.he} - ${alvo.translit} - ${alvo.pt}.`
  };
}

/** Hebraico digitado, comparado sem vogais e sem exigir a forma final. */
export function hebraicoDigitadoCerto(digitado: string, aceitas: readonly string[]): boolean {
  const norm = (s: string) => letrasDaGrafia(s).map(g => FINAL_TO_BASE[g] ?? g).join('');
  const d = norm(digitado);
  return d.length > 0 && aceitas.some(a => norm(a) === d);
}

/** Letras latinas numa resposta que devia ser hebraico: o teclado não trocou. */
export const pareceTecladoLatino = (s: string): boolean => /[A-Za-z]/.test(s);

export { BASE_TO_FINAL };

/* ── palavras à mão ──────────────────────────────────────────────────────
   O treino de escrita da academia era de letra solta. Escrever uma palavra
   inteira é outra habilidade: as letras vizinhas mudam de tamanho uma perto
   da outra, a final entra no lugar da base, e a mão vai da direita para a
   esquerda sem voltar. Este é o sorteio das palavras daquele treino. */

/** Quantas palavras numa rodada de escrita à mão. */
export const RODADA_A_MAO = 5;

/**
 * As palavras que o aluno pode escrever à mão: as do vocabulário ACUMULADO
 * (toda letra da grafia já ensinada - à mão não há vogal, e o ו vogal vira
 * letra na tela) e de até sete letras, que é o que cabe num telefone em
 * corpo legível. Sorteadas pela semente, sem repetir.
 */
export function palavrasParaEscrever(
  letras: readonly Letter[], rand: Rand, n: number = RODADA_A_MAO
): PalavraDoCurso[] {
  const cabem = palavrasAcumuladas(letras).filter(w => letrasDaGrafia(w.he).length <= 7);
  return shuffled(cabem, rand).slice(0, n);
}
