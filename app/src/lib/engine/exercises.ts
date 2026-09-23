/* The exercise engine: what to ask, and in what order.
 * ─────────────────────────────────────────────────────────────────────────
 * Exercises are GENERATED from a letter's content plus the alphabet available
 * at that point in the course - never authored per lesson - for three reasons:
 *
 *   1. It is the only way the order rule can be guaranteed. A generator that
 *      is only ever handed `alphabetSoFar` cannot produce a distractor with an
 *      unlearned letter; a human authoring 22 × 13 questions by hand can, and
 *      eventually will. tests/order-rule.test.ts enumerates every exercise the
 *      course will ever generate and proves it.
 *
 *   2. The same primitives serve the lesson quiz, the checkpoint, the quick
 *      review, the reading gym and the final challenge. They differ in which
 *      items they draw from, not in what an exercise is.
 *
 *   3. Adding a word to data/letters.json adds it to every exercise type that
 *      can use it, in both the book and the app, with nothing else to touch.
 *
 * The generators themselves live in ./generators.ts; this file decides which
 * ones a given moment in the course should use.
 */

import type { Letter } from '@/lib/content';
import { nikud, sentencesUpTo } from '@/lib/content';
import type { Skill } from '@/lib/state/types';
import { ALL_GLYPHS, isReadableWith } from '@/lib/hebrew';
import { rng, shuffled, type Rand } from './rng';
import {
  BY_SKILL, LESSON_GENERATORS, NEEDS_AUDIO,
  exBuildSyllable, exBuildWord, exCompleteWord, exConfusablePick, exCursiveToPrint,
  exFinalForm, exFinalInWord, exLetterInWord, exLetterPosition, exLetterRecognition,
  exLetterVariant,
  exVariantSyllable,
  exMatchLetterSound, exMeaningToWord, exOddOneOut, exPrintVsCursive, exSoundToSyllable,
  exSentenceReading, exSyllableReading, exVowelSound, exWordMeaning,
  type Ctx, type Gen
} from './generators';
import type { Exercise } from './types';

export type { Exercise, ExerciseKind, ChoiceBase, ExerciseBase } from './types';
export { letterIdOf, isChoice, normalizeTyped, typedIsCorrect } from './types';

/* ── two different rules, and conflating them was a bug ──────────────────
   The order rule governs what the learner must READ: a word or a syllable may
   only use letters already taught, or the exercise is unanswerable and the
   course's central promise breaks.

   It does NOT govern a single-letter DISTRACTOR. "Qual destas é מ?" with ס as
   a wrong option is the exercise working as intended - telling מ from ס is
   precisely the skill, and it needs no knowledge of ס. The printed workbook
   does the same thing from its first page.

   Enforcing the strict rule on both left letter 1 with three questions,
   because with only מ and ם in hand there was no legal distractor to offer.
   So the two are separated here, and the tests check each one. */

/** Strings the learner is asked to READ. Subject to the order rule. */
export function readingUsedBy(ex: Exercise): string[] {
  const out: string[] = [];
  switch (ex.kind) {
    case 'syllable-reading':
    case 'word-meaning':
    case 'vowel-sound':
    /* `vowel-pair` traz DUAS sílabas separadas por espaço, e precisa estar
       aqui pelo mesmo motivo que as outras: é por esta função que passa a
       regra de ordem, a que impede um exercício de mostrar glifo que o aluno
       ainda não viu. Fora da lista, a regra não se aplicaria a ele - em
       silêncio, que é como esse tipo de furo costuma durar. */
    case 'vowel-pair':
    case 'scene-reading':
      out.push(ex.he);
      break;
    case 'complete-word':
      out.push(...ex.parts.filter((p): p is string => p != null));
      break;
    /* Aqui o hebraico está nas ALTERNATIVAS, e não no enunciado: a regra
       de ordem tem de olhar para elas. */
    case 'letter-variant':
      out.push(...ex.options);
      break;
    case 'meaning-to-word':
    case 'audio-recognition':
    case 'sound-to-syllable':
    case 'listen-syllable':
      out.push(...ex.options);
      break;
    /* As alternativas SÃO palavras, e a pessoa tem de ler as quatro para
       achar a letra - então as quatro passam pela regra da ordem, não só a
       certa. Foi o teste da regra que cobrou isto, e com razão: sem esta
       linha um `letter-in-word` podia oferecer uma palavra com uma letra
       que a pessoa ainda não viu, e ninguém perceberia. */
    case 'letter-in-word':
      out.push(...ex.options);
      break;
    case 'letter-position':
      out.push(ex.he);
      break;
    case 'build-syllable':
      out.push(ex.target);
      break;
    case 'build-word':
      /* Both: the finished word and every tile, since a tile is shown on its
         own and must be legible on its own. */
      out.push(ex.target, ...ex.tiles);
      break;
    case 'match':
      if (ex.leftKind === 'reading') out.push(...ex.pairs.map(p => p.left));
      if (ex.rightKind === 'reading') out.push(...ex.pairs.map(p => p.right));
      break;
    case 'type-answer':
      if (ex.he) out.push(ex.he);
      break;
    default:
      break;
  }
  return out;
}

/** Single glyphs offered as options. Must be real letters; may be untaught. */
export function glyphOptionsOf(ex: Exercise): string[] {
  switch (ex.kind) {
    case 'letter-recognition':
    case 'print-vs-cursive':
    case 'final-form':
    case 'complete-word':
    case 'odd-one-out':
      return ex.options;
    case 'match':
      /* A letter↔sound match puts single glyphs on the left; a word or
         syllable match puts reading material there, and that is handled by
         readingUsedBy instead. The side says which it is. */
      return [
        ...(ex.leftKind === 'glyph' ? ex.pairs.map(p => p.left) : []),
        ...(ex.rightKind === 'glyph' ? ex.pairs.map(p => p.right) : [])
      ];
    default:
      return [];
  }
}

/** Reading material that breaks the order rule. Empty is the only valid answer. */
export function violatesOrderRule(ex: Exercise, alphabet: readonly string[]): string[] {
  return readingUsedBy(ex).filter(s => !isReadableWith(s, alphabet));
}

/* ── building a set ─────────────────────────────────────────────────────── */

export type BuildOptions = {
  /** Audio exercises are dropped unless a recording exists. See ARCHITECTURE §6.3. */
  audioAvailable?: boolean;
  count?: number;
  seed?: string;
  /** Restrict to the generators that train these skills. */
  skills?: readonly Skill[];
  /**
   * Exactly these generators, in this order. Takes precedence over `skills`.
   * The reading gym uses it: a mode is defined by the exercises it contains
   * ("sílabas"), not by a skill taxonomy ("ler"), and round-tripping one
   * through the other loses the distinction.
   */
  gens?: readonly Gen[];
};

function contextFor(L: Letter, history: Letter[]): Ctx {
  return {
    history: history.filter(x => x.order <= L.order),
    alphabet: L.alphabetSoFar,
    allGlyphs: [...ALL_GLYPHS],
    sentences: sentencesUpTo(L.order),
    nikud: nikud().sounds
  };
}

const generatorsFor = (
  skills: readonly Skill[] | undefined, gens?: readonly Gen[]
): readonly Gen[] => {
  if (gens?.length) return gens;
  if (!skills?.length) return LESSON_GENERATORS;
  const wanted = new Set(skills.flatMap(s => BY_SKILL[s] ?? []));
  /* Keep LESSON_GENERATORS' order - it is the one that alternates gestures. */
  const narrowed = LESSON_GENERATORS.filter(g => wanted.has(g));
  /* `escrever` has no generated question at all: writing is produced on a
     canvas, not answered. Asking for it left this empty, and an empty
     generator list made the builders index into nothing and throw. A narrowing
     that cannot be honoured is dropped, not crashed on. */
  return narrowed.length ? narrowed : LESSON_GENERATORS;
};

/**
 * Fill a set by walking the generator list in order, round after round.
 *
 * Walking IN ORDER rather than at random is what makes a lesson feel varied:
 * the list alternates gesture (recognise, read, assemble, pair, type), so the
 * first five questions are five different actions. Random selection produces
 * three multiple-choice questions in a row about one letter in eight.
 */
function fill(
  letters: readonly Letter[], history: Letter[], gens: readonly Gen[],
  rand: Rand, count: number, audioAvailable: boolean, rounds = 4
): Exercise[] {
  const out: Exercise[] = [];
  const seen = new Set<string>();
  if (!letters.length || !gens.length) return out;

  /* Both indices advance together. The generator index moves every step, so no
     two consecutive questions share a gesture; the letter index also moves
     every step, so a set covering six letters does not spend its first six
     questions on the first letter - which is what a generator-per-letter loop
     produced, and it made every checkpoint feel like a lesson about one thing. */
  const steps = gens.length * Math.max(letters.length, 1) * rounds;
  const ctxCache = new Map<string, Ctx>();
  for (let k = 0; k < steps && out.length < count; k++) {
    const gen = gens[k % gens.length]!;
    const L = letters[k % letters.length]!;
    if (!audioAvailable && NEEDS_AUDIO.has(gen)) continue;
    let ctx = ctxCache.get(L.id);
    if (!ctx) { ctx = contextFor(L, history); ctxCache.set(L.id, ctx); }
    const ex = gen(L, ctx, rand, Math.floor(k / gens.length));
    if (ex && !seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
  }
  return out;
}

/**
 * Break up runs of the same gesture.
 *
 * The generator walk alternates kinds by construction, but the fallback pass -
 * the one that tops up a checkpoint whose rotation came up short - does not,
 * and it produced "ligue cada letra ao seu som" twice in a row at the end of a
 * checkpoint. Two identical gestures back to back is the exact thing the new
 * engine exists to prevent, so it is fixed here rather than hoped away.
 *
 * Always take the kind with the most items LEFT, skipping the one just used.
 * Taking the first available instead is the obvious version and it fails at the
 * tail: it happily spends the varied items early and leaves the last three
 * questions all typing. Emptying the biggest pile first is what guarantees a
 * gap-free arrangement whenever one exists at all.
 *
 * If every remaining item is the same kind, it stays - a set of six matches
 * really is six matches, and reordering cannot change that.
 */
/* Duas perguntas IGUAIS com ids diferentes.
   ─────────────────────────────────────────────────────────────────────────
   O `seen` dos construtores dedupe por `id`, e o id de um exercício carrega o
   número da rodada: `mem-syl-0` e `mem-syl-3` são ids diferentes. Só que o
   gerador escolhe o item com `at(pool, i)`, que é modular - então numa letra
   com três sílabas legíveis a rodada 0 e a rodada 3 devolvem A MESMA sílaba,
   com a mesma pergunta e as mesmas alternativas, e o dedupe por id não vê
   nada.

   Isso já podia acontecer nas passadas de preenchimento; passou a importar
   quando o bloco de prática cresceu, porque um bloco maior chega mais longe
   na rotação. Então o dedupe passou a ser por CONTEÚDO: o que o aluno lê na
   tela, e não o nome interno do item. */
export function assinatura(ex: Exercise): string {
  const o = (ex as { options?: string[] }).options;
  return [ex.kind, ex.promptPt, o ? o.join('\u0001') : ''].join('\u0002');
}

const hasRun = (list: Exercise[]): boolean =>
  list.some((ex, i) => i > 0 && ex.kind === list[i - 1]!.kind);

export function spread(list: Exercise[]): Exercise[] {
  /* The generator walk usually gets this right on its own, and its order is
     also the pedagogical one - recognition early, typing late. Leave it alone
     unless it actually broke. */
  if (!hasRun(list)) return list;

  /* Stable repair first: pull forward the next item of a different kind, and
     change nothing else. */
  const rest = [...list];
  const stable: Exercise[] = [];
  while (rest.length) {
    const prevKind = stable.length ? stable[stable.length - 1]!.kind : null;
    let idx = 0;
    if (prevKind && rest[0]!.kind === prevKind) {
      const alt = rest.findIndex(e => e.kind !== prevKind);
      if (alt > 0) idx = alt;
    }
    stable.push(rest.splice(idx, 1)[0]!);
  }
  if (!hasRun(stable)) return stable;

  /* Only if that still leaves a run - which happens when the varied items were
     spent early and the tail is all one kind - fall back to emptying the
     biggest pile first, which finds an arrangement whenever one exists. */
  const byKind = new Map<string, Exercise[]>();
  for (const ex of list) {
    const bucket = byKind.get(ex.kind);
    if (bucket) bucket.push(ex); else byKind.set(ex.kind, [ex]);
  }

  const out: Exercise[] = [];
  let prev: string | null = null;
  while (out.length < list.length) {
    let pick: string | null = null;
    let most = 0;
    for (const [kind, items] of byKind) {
      if (!items.length || kind === prev) continue;
      if (items.length > most) { most = items.length; pick = kind; }
    }
    /* Nothing but the previous kind is left. */
    if (pick == null) {
      for (const [kind, items] of byKind) if (items.length) { pick = kind; break; }
    }
    if (pick == null) break;
    out.push(byKind.get(pick)!.shift()!);
    prev = pick;
  }
  return out;
}


/* ── a unidade de prática de uma letra ──────────────────────────────────
 * O que a auditoria mostrou, em números: cada letra recebia 13 itens, de 8
 * tipos, e TODOS OS 13 eram da própria letra. Zero revisão cumulativa dentro
 * da lição. A forma final só aparecia na primeira letra, porque a rotação de
 * geradores é posicional e `exFinalForm` está no meio da lista - as outras
 * quatro letras com forma final nunca a exercitavam na própria aula. A letra
 * em outra fonte, idem: só o Tav a via.
 *
 * A causa é a rotação: ela alterna GESTO muito bem, mas não garante
 * COBERTURA. Com treze passos e vinte e quatro geradores, metade da lista
 * nunca chega a ser chamada.
 *
 * Então esta função não sorteia: ela monta camadas, na ordem em que uma
 * habilidade sustenta a seguinte.
 *
 *   1 reconhecer      a forma isolada
 *   2 o som           a letra ↔ o som que ela faz
 *   3 discriminar     contra as letras que se parecem com ela
 *   4 no contexto     dentro de uma palavra, e onde na palavra
 *   5 forma final     quando a letra tem uma
 *   6 outra fonte     imprensa ↔ cursiva
 *   7 ler             sílaba, palavra, montar
 *   8 cumulativo      ~30% de letras anteriores
 *
 * Cada camada tenta os seus geradores em ordem e aceita o primeiro que
 * produzir alguma coisa. Uma camada que não pode existir - a forma final de
 * uma letra que não tem - simplesmente não entra, e o lugar dela vai para a
 * leitura, que é o que o curso existe para treinar.
 */
export function buildLetterPractice(
  L: Letter, history: Letter[], opts: BuildOptions & {
    /** Letras que andaram custando, para escolher as do bloco cumulativo. */
    weak?: readonly string[];
  } = {}
): Exercise[] {
  const { audioAvailable = false, count = 14, seed = `pratica-${L.id}`, weak = [] } = opts;
  const rand = rng(seed);
  const ctx = contextFor(L, history);
  const out: Exercise[] = [];
  const seen = new Set<string>();
  const ditos = new Set<string>();

  /* O GIRO, e por que ele existe.
     ─────────────────────────────────────────────────────────────────────
     Todo gerador escolhe o seu item com `at(pool, i)` - a sílaba, a palavra,
     o par de vogais -, e `i` é o número da rodada. Nas camadas abaixo a
     rodada só avança quando um gerador falha ou repete, então na prática ela
     era ZERO quase sempre.

     `at(pool, 0)` é o primeiro item de cada lista, e a primeira sílaba de
     toda letra é a do A: מַ, בַּ, שַׁ. Resultado medido nas 22 lições: a
     prática inteira do curso girava em torno do mesmo som, e a única coisa
     que mudava de uma letra para outra era a consoante. Quem fazia duas
     lições seguidas via o mesmo exercício duas vezes - e tinha razão.

     O conserto é uma linha de ideia: cada bloco começa numa posição
     diferente da rotação, e cada item avança mais um passo dentro dela. Duas
     consequências, e as duas são o que se queria:

       · letras diferentes caem em vogais diferentes, porque a semente é
         própria de cada letra;
       · dentro do MESMO bloco, a segunda sílaba nunca é a mesma da
         primeira.

     E continua determinístico: a mesma semente devolve o mesmo bloco, que é
     o que faz "refazer" gerar outras perguntas em vez de perguntas ao acaso.

     O intervalo é 97 e não 5 de propósito. Com cinco valores, duas sementes
     caem no mesmo giro uma vez em cinco - e `tests/vogais.test.ts` pegou isso
     na primeira execução: o gimel devolvia as NOVE mesmas perguntas ao
     refazer. 97 é primo e maior que qualquer lista de sílabas, palavras ou
     pares, o que espalha o resto em vez de coincidir. */
  const giro = Math.floor(rand() * 97);

  /* AS CAMADAS NÃO PODEM COMER A REVISÃO.
     ─────────────────────────────────────────────────────────────────────
     Enquanto o bloco tinha dez itens e as camadas próprias somavam sete, o
     que sobrava para a revisão cumulativa e para a frase sobrava por sorte.
     Ao subir o bloco para catorze e dar mais espaço à leitura, a sorte
     acabou: `tests/cobertura` mediu o Mem com UM item cumulativo em vez de
     quatro, e `tests/frases` viu a frase sumir de dez letras.

     Então o espaço deixou de ser resto e virou reserva. O teto das camadas
     próprias é o bloco MENOS o que a revisão e a frase vão ocupar, e as duas
     passam a ter lugar garantido em vez de disputar o que sobrou. É a mesma
     ideia de sempre - uma letra ensinada sozinha não é um alfabeto -, agora
     escrita em vez de esperada. */
  const anteriores = history.filter(x => x.id !== L.id);
  const reservaRevisao = anteriores.length ? Math.max(1, Math.round(count * 0.3)) : 0;
  const frase = exSentenceReading(L, ctx, rand, giro);

  /* O PISO das camadas fixas, e por que ele é `Math.max` e não subtração.
     ─────────────────────────────────────────────────────────────────────
     As sete camadas abaixo são o currículo de uma letra - reconhecer, o som
     ou a variante, discriminar, dentro da palavra, a posição, a forma final
     e a cursiva. Elas não são preenchimento: cada uma existe porque alguma
     coisa que o curso ensina não era cobrada em lugar nenhum.

     A primeira versão desta reserva subtraía e pronto, e `tests/cobertura`
     pegou o resultado: num bloco de dez, com três reservados para a revisão
     e um para a frase, sobravam seis lugares para sete camadas - e a que
     caía era sempre a ÚLTIMA, a cursiva, nas três letras que têm variante e
     forma final ao mesmo tempo. Ou seja, a etapa de escrita deixava de ser
     cobrada exatamente no Tsadi, no Kaf e no Pe.

     Com o piso, um bloco pequeno perde revisão cumulativa antes de perder
     currículo - e um bloco do tamanho que a lição pede hoje tem espaço para
     as duas coisas. */
  const CAMADAS_FIXAS = 7;
  const tetoProprio = Math.max(CAMADAS_FIXAS, count - reservaRevisao - (frase ? 1 : 0));

  const tentar = (gens: readonly Gen[], quantos = 1) => {
    let postos = 0;
    for (let round = 0; round < 6 && postos < quantos; round++) {
      for (const gen of gens) {
        if (postos >= quantos || out.length >= tetoProprio) return;
        if (!audioAvailable && NEEDS_AUDIO.has(gen)) continue;
        const ex = gen(L, ctx, rand, giro + round + out.length);
        if (!ex || seen.has(ex.id) || ditos.has(assinatura(ex))) continue;
        seen.add(ex.id);
        ditos.add(assinatura(ex));
        out.push(ex);
        postos++;
      }
    }
  };

  tentar([exLetterRecognition], 1);
  /* A letra que tem mais de uma leitura pratica ESSA diferença, e pratica
     cedo. Sem isto dava para terminar a prática do {{ש}} sem nunca ter
     decidido de que lado estava o ponto - a lição explicava e o exercício
     nunca cobrava. E tinha de vir aqui, e não no fim: nas letras tardias
     como {{ב}} e {{פ}} as camadas anteriores já lotavam o bloco de dez, e a
     diferença que DEFINE a letra ficava de fora justamente nelas.

     Ela OCUPA O LUGAR da camada de som, e não um lugar a mais - pela mesma
     razão da frase mais abaixo: o bloco tem dez itens, e somar um aqui
     empurrava a revisão cumulativa para fora dele justamente nas quatro
     letras em questão. E a troca é honesta antes de ser aritmética: numa
     letra de duas leituras, “que som esta letra faz?” é a pergunta errada -
     a resposta é “depende do ponto”, que é exatamente o que a camada de
     variante cobra. */
  const antes = out.length;
  if ((L.variantes?.length ?? 0) >= 2) tentar([exLetterVariant, exVariantSyllable], 1);
  if (out.length === antes) tentar([exMatchLetterSound, exVowelSound, exSoundToSyllable], 1);
  tentar([exConfusablePick, exOddOneOut], 1);
  tentar([exLetterInWord, exCompleteWord], 1);
  tentar([exLetterPosition, exLetterInWord], 1);
  if (L.finalForm) tentar([exFinalInWord, exFinalForm], 1);
  tentar([exPrintVsCursive, exCursiveToPrint], 1);
  /* A frase foi DECIDIDA lá em cima, junto da reserva, e é COLOCADA aqui.
     Decidida antes porque o teto das camadas depende dela; colocada depois
     porque é o item mais difícil e o mais gratificante - antes das sílabas o
     aluno bate nele sem aquecimento.

     DOIS itens de leitura e montagem, e não um: com o bloco em catorze cabem
     os dois gestos, ler a sílaba pronta e MONTAR a sílaba. Antes só cabia um
     deles, e qual dos dois era sorte da ordem da lista. */
  tentar([exSyllableReading, exBuildSyllable, exWordMeaning, exBuildWord, exMeaningToWord],
         frase ? 2 : 3);
  /* A frase NÃO entra aqui: ela é acrescentada no fim, depois do arranjo.
     Ver a nota do `return`. */

  /* ── cumulativo ──────────────────────────────────────────────────────
     Aproximadamente 30% do bloco, tirado das letras ANTERIORES - as que
     custaram primeiro, se o chamador souber quais. Sem isto, uma letra
     aprendida na lição 3 não volta a aparecer até o checkpoint, e o curso
     ensina vinte e duas coisas isoladas em vez de um alfabeto. O tamanho da
     reserva foi calculado lá em cima, antes das camadas. */
  if (anteriores.length) {
    const ordenadas = [
      ...anteriores.filter(x => weak.includes(x.id)),
      ...shuffled(anteriores.filter(x => !weak.includes(x.id)), rand)
    ];
    const quantos = reservaRevisao;
    const gensCumulativo = [exLetterRecognition, exLetterInWord, exSyllableReading,
                            exConfusablePick, exVowelSound, exWordMeaning];
    let postos = 0;
    for (let k = 0; k < ordenadas.length * 3 && postos < quantos && out.length < count; k++) {
      const P = ordenadas[k % ordenadas.length]!;
      const gen = gensCumulativo[k % gensCumulativo.length]!;
      if (!audioAvailable && NEEDS_AUDIO.has(gen)) continue;
      const ex = gen(P, contextFor(P, history), rand, giro + Math.floor(k / ordenadas.length));
      if (!ex || seen.has(ex.id) || ditos.has(assinatura(ex))) continue;
      seen.add(ex.id);
      ditos.add(assinatura(ex));
      out.push(ex);
      postos++;
    }
  }

  /* Sobrou espaço: completa com a rotação normal, que já alterna gesto.
     Pede o TRIPLO do que falta: `fill` tem o próprio controle de repetidos e
     devolve itens que este bloco já tem, então pedir exatamente o que falta
     costuma trazer zero novos - foi o que deixou o Mem com onze. */
  if (out.length < count) {
    for (const ex of fill([L], history, LESSON_GENERATORS, rand, (count - out.length) * 3 + 6, audioAvailable, 6)) {
      if (out.length >= count) break;
      if (seen.has(ex.id) || ditos.has(assinatura(ex))) continue;
      seen.add(ex.id);
      ditos.add(assinatura(ex));
      out.push(ex);
    }
  }
  /* Ainda curto - acontece nas duas primeiras letras, onde o alfabeto
     disponível é minúsculo: repete os geradores com outra rodada, que muda
     sílaba, palavra e distratores. Melhor uma segunda passada honesta do que
     uma lição de oito itens. */
  if (out.length < count) {
    for (let round = 1; round < 12 && out.length < count; round++) {
      for (const gen of LESSON_GENERATORS) {
        if (out.length >= count) break;
        if (!audioAvailable && NEEDS_AUDIO.has(gen)) continue;
        const ex = gen(L, ctx, rand, giro + round * 3);
        if (!ex || seen.has(ex.id) || ditos.has(assinatura(ex))) continue;
        seen.add(ex.id); ditos.add(assinatura(ex)); out.push(ex);
      }
    }
  }

  /* DEVOLVE O QUE HOUVER, e não o número pedido a qualquer custo.
     Nas duas primeiras letras o alfabeto disponível é minúsculo e não existem
     catorze perguntas honestas - existiriam catorze itens, alguns deles a
     mesma pergunta com outro nome. Um bloco curto de perguntas diferentes
     ensina mais do que um bloco cheio com repetição, e agora o dedupe por
     conteúdo garante que o que sai é sempre o primeiro caso.

     E A FRASE FECHA O BLOCO, acrescentada depois do `spread`.
     ─────────────────────────────────────────────────────────────────────
     Ela é o item mais difícil e o mais gratificante, e a regra pedagógica é
     que o aluno chegue nele aquecido - por isso ela vem depois das sílabas.
     Isso era esperado da ordem em que os itens eram empilhados, e sobrevivia
     por sorte: `spread` existe justamente para REORDENAR, e com o bloco maior
     ele passou a jogar a frase para antes da leitura de sílaba. `tests/frases`
     mediu o Vav com a frase na sexta posição e a sílaba na décima.

     Empilhar não é ordenar. Então a frase sai do arranjo e é posta no fim, de
     onde nada a tira - e o bloco termina com «você acabou de ler uma frase em
     hebraico», que é o melhor lugar para terminar. */
  const teto = frase ? count - 1 : count;
  const arranjado = spread(out.slice(0, teto));
  if (frase && !seen.has(frase.id) && !ditos.has(assinatura(frase))) arranjado.push(frase);
  return arranjado;
}

/**
 * O mini-teste que fecha uma letra. Cinco itens, um de cada coisa que
 * "saber a letra" quer dizer - e o quinto é de uma letra ANTERIOR, porque
 * saber a letra de hoje e ter esquecido a de ontem não é saber ler.
 *
 * É o mesmo motor da prática, com outra semente: quem refaz responde OUTRAS
 * cinco questões, não as mesmas cinco.
 */
export function buildMiniTest(
  L: Letter, history: Letter[], opts: BuildOptions = {}
): Exercise[] {
  /* DEZ, e o número não é estético: ele é o único que mantém as duas notas
     de corte coerentes entre si.

     Dominar uma letra pede 75% e destravar a próxima pede 80% (rules.ts).
     Com nove itens, 7 acertos dão 78% - a letra conta como dominada e mesmo
     assim NÃO abre a seguinte, que é um estado que nenhuma tela consegue
     explicar. Com dez, 8 acertos dão 80% e passam nas duas, 7 dão 70% e
     falham nas duas: não existe nota entre as duas réguas. E o aluno passa a
     ter dois erros perdoados em vez de um, o que é justo num teste que
     cresceu de seis para dez itens e ganhou três gestos novos. */
  const { audioAvailable = false, seed = `mini-${L.id}`, count = 10 } = opts;
  const rand = rng(seed);
  const ctx = contextFor(L, history);
  const out: Exercise[] = [];
  const seen = new Set<string>();
  const ditos = new Set<string>();

  /* O mesmo giro do bloco de prática, e pela mesma razão - ver a nota longa
     lá em cima. Sem ele a fixação de toda letra media a sílaba do A, e a
     prova cobrava uma vogal das cinco que a lição ensina. */
  const giro = Math.floor(rand() * 97);

  const tentar = (gens: readonly Gen[]) => {
    for (let round = 0; round < 6; round++) {
      for (const gen of gens) {
        if (!audioAvailable && NEEDS_AUDIO.has(gen)) continue;
        const ex = gen(L, ctx, rand, giro + round + out.length);
        if (!ex || seen.has(ex.id) || ditos.has(assinatura(ex))) continue;
        seen.add(ex.id); ditos.add(assinatura(ex)); out.push(ex); return;
      }
    }
  };

  tentar([exLetterRecognition]);
  tentar([exMatchLetterSound, exVowelSound, exSoundToSyllable]);
  tentar([exLetterInWord, exLetterPosition, exCompleteWord]);
  tentar([L.finalForm ? exFinalInWord : exConfusablePick, exConfusablePick, exOddOneOut]);
  /* A CURSIVA, que o checkpoint nunca cobrava.
     ─────────────────────────────────────────────────────────────────────
     A lição gasta uma etapa inteira nela: mostra o desenho, anima a ordem
     dos traços e faz o aluno escrever quatro vezes, do modelo cheio até a
     folha vazia. E a prova que decidia se a letra estava DOMINADA - e,
     desde a trava de progressão, se a próxima abre - passava por cima
     disso em todas as 22: medido, zero dos 22 mini-testes tinha um item de
     cursiva.

     Uma etapa que nunca é cobrada é uma etapa que o aluno aprende a pular,
     e ele estaria certo: o sistema estava dizendo que ela não conta.

     A direção aqui é a CONTRÁRIA à da prática, de propósito. A etapa de
     escrever e o bloco de prática vão da impressa para a cursiva - “esta é
     a letra, é assim que você a escreve”. O checkpoint vem da cursiva para
     a impressa, que é o gesto de LER o bilhete de outra pessoa, e só se
     cobra depois de o aluno ter desenhado a letra quatro vezes na etapa
     anterior. Assim as duas direções existem na unidade de cada letra, em
     vez de o curso treinar uma e chamar a outra de aprendida. */
  tentar([exCursiveToPrint, exPrintVsCursive]);

  /* ── três gestos que a fixação nunca cobrava ─────────────────────────
     As camadas acima são todas de ESCOLHER: quatro alternativas, um toque,
     pronto. A lição, porém, ensina em quatro gestos diferentes - escolher,
     montar, ler e ligar sentido a palavra -, e uma prova que só cobra um
     deles mede um quarto do que foi ensinado. Pior: ensina ao aluno que os
     outros três não valem nota, que é a mesma lição que a cursiva aprendeu
     a dar antes de ganhar a camada dela.

     Então entram os três que faltavam:

       · MONTAR - a sílaba ou a palavra construída peça por peça, que é o
         gesto da lição que mais se parece com escrever;
       · LER - a sílaba pronta, ou a frase quando já existe uma legível,
         que é o objetivo declarado do curso;
       · SIGNIFICADO - ligar a palavra ao que ela quer dizer, nos dois
         sentidos.

     Cada camada é uma LISTA em ordem de preferência, e não um gerador fixo:
     nas primeiras letras não há palavra legível nem frase, e a camada cai
     para o que existe em vez de sumir. */
  tentar([exBuildSyllable, exBuildWord, exSoundToSyllable]);
  tentar([exSentenceReading, exSyllableReading, exVowelSound]);
  tentar([exWordMeaning, exMeaningToWord, exCompleteWord, exOddOneOut]);

  const anteriores = history.filter(x => x.id !== L.id);
  if (anteriores.length) {
    const P = shuffled(anteriores, rand)[0]!;
    for (const gen of [exLetterRecognition, exLetterInWord, exSyllableReading, exVowelSound]) {
      const ex = gen(P, contextFor(P, history), rand, giro + 1);
      if (ex && !seen.has(ex.id) && !ditos.has(assinatura(ex))) {
        seen.add(ex.id); ditos.add(assinatura(ex)); out.push(ex); break;
      }
    }
  }

  /* Uma camada pode não render - letra sem palavra legível, alfabeto pequeno
     demais para distratores. O mini-teste tem tamanho fixo, então completa,
     pedindo folga pelo mesmo motivo do bloco de prática. */
  if (out.length < count) {
    for (const ex of fill([L], history, LESSON_GENERATORS, rand, count * 4, audioAvailable, 6)) {
      if (out.length >= count) break;
      if (seen.has(ex.id) || ditos.has(assinatura(ex))) continue;
      seen.add(ex.id); ditos.add(assinatura(ex)); out.push(ex);
    }
  }
  if (out.length < count) {
    for (let round = 1; round < 12 && out.length < count; round++) {
      for (const gen of LESSON_GENERATORS) {
        if (out.length >= count) break;
        if (!audioAvailable && NEEDS_AUDIO.has(gen)) continue;
        const ex = gen(L, ctx, rand, giro + round * 2);
        if (!ex || seen.has(ex.id) || ditos.has(assinatura(ex))) continue;
        seen.add(ex.id); ditos.add(assinatura(ex)); out.push(ex);
      }
    }
  }
  /* `spread` aqui também: com nove itens e três camadas novas, duas escolhas
     seguidas do mesmo gesto deixaram de ser improváveis. */
  return spread(out.slice(0, count));
}

/**
 * As três a cinco questões do "vamos praticar mais um pouco".
 *
 * Construídas a partir do que a pessoa ERROU no mini-teste - e não de um
 * sorteio novo. Um reforço que pergunta outra coisa não é reforço.
 */
export function buildRemedial(
  L: Letter, history: Letter[], missedLetterIds: readonly string[], opts: BuildOptions = {}
): Exercise[] {
  const { audioAvailable = false, seed = `reforco-${L.id}`, count = 4 } = opts;
  const rand = rng(seed);
  const alvos = [...new Set([...missedLetterIds, L.id])]
    .map(id => history.find(x => x.id === id) ?? (id === L.id ? L : null))
    .filter((x): x is Letter => !!x);

  const out: Exercise[] = [];
  const seen = new Set<string>();
  const gens = [exLetterRecognition, exConfusablePick, exLetterInWord,
                exMatchLetterSound, exLetterPosition, exOddOneOut];

  for (let k = 0; k < alvos.length * gens.length && out.length < count; k++) {
    const A = alvos[k % alvos.length]!;
    const gen = gens[Math.floor(k / alvos.length) % gens.length]!;
    if (!audioAvailable && NEEDS_AUDIO.has(gen)) continue;
    const ex = gen(A, contextFor(A, history), rand, Math.floor(k / alvos.length));
    if (!ex || seen.has(ex.id)) continue;
    seen.add(ex.id); out.push(ex);
  }
  return spread(out.slice(0, count));
}

/** The quiz that closes a letter lesson. Mixed by design. */
export function buildLessonQuiz(
  L: Letter, history: Letter[], opts: BuildOptions = {}
): Exercise[] {
  const { audioAvailable = false, count = 8, seed = `quiz-${L.id}`, skills, gens } = opts;
  return spread(fill([L], history, generatorsFor(skills, gens), rng(seed), count, audioAvailable, 4));
}

/**
 * A checkpoint: the module, across every modality it taught.
 *
 * Twelve questions drawn at random from the same pool as a lesson is not a
 * checkpoint, it is a longer lesson - and the old one was exactly that. What
 * makes this feel like a demonstration of mastery is that it covers the
 * DIMENSIONS deliberately: shape, sound, reading, and listening once there are
 * recordings. A learner who can recognise every letter and hear none of them
 * should not be able to pass by drawing twelve recognition questions.
 *
 * Nothing new is taught here, by design: a checkpoint that introduces material
 * is a lesson wearing a badge.
 */
export function buildCheckpoint(
  letters: Letter[], history: Letter[], opts: BuildOptions = {}
): Exercise[] {
  const {
    audioAvailable = false, count = 12,
    seed = `cp-${letters.map(l => l.id).join('-')}`, skills, gens: only
  } = opts;
  const rand = rng(seed);

  /* An explicit narrowing wins: the reading gym and the tests ask for one. */
  if (skills?.length || only?.length) {
    const gens = generatorsFor(skills, only);
    return spread(fill(letters, history, gens, rand, count, audioAvailable, 6));
  }

  const dimensions: Skill[] = audioAvailable
    ? ['rec', 'som', 'ler', 'ouvir']
    : ['rec', 'som', 'ler'];
  /* Reading gets the remainder: it is what the course is for. */
  const per = Math.floor(count / dimensions.length);

  const out: Exercise[] = [];
  const seen = new Set<string>();
  const push = (list: Exercise[]) => {
    for (const ex of list) {
      if (out.length >= count) return;
      if (seen.has(ex.id)) continue;
      seen.add(ex.id);
      out.push(ex);
    }
  };

  for (const skill of dimensions) {
    const want = skill === 'ler' ? count - per * (dimensions.length - 1) : per;
    push(fill(letters, history, generatorsFor([skill]), rand, want, audioAvailable, 6));
  }
  /* A dimension can come up short - a module with no words has little to read -
     so the rest is topped up from everything. */
  if (out.length < count) {
    push(fill(letters, history, LESSON_GENERATORS, rand, count - out.length, audioAvailable, 6));
  }
  return spread(out.slice(0, count));
}

/**
 * The quick review, built from what this learner actually missed.
 *
 * `weak` is a list of letter ids ordered by how much trouble they gave;
 * `focusSkills`, when given, narrows to the dimension that is failing - a
 * learner who reads ק and cannot hear it should get listening, not more
 * reading.
 */
export function buildReview(
  weak: string[], all: Letter[], opts: BuildOptions = {}
): Exercise[] {
  const {
    audioAvailable = false, count = 5,
    seed = `rev-${weak.join('-')}-${all.length}`, skills, gens: only
  } = opts;
  const rand = rng(seed);
  const target = weak
    .map(id => all.find(l => l.id === id))
    .filter((l): l is Letter => !!l);
  const pool = target.length ? target : all;
  const gens = generatorsFor(skills, only);
  const out: Exercise[] = [];
  const seen = new Set<string>();

  for (let round = 0; round < 6 && out.length < count; round++) {
    for (const L of pool) {
      if (out.length >= count) break;
      const ctx = contextFor(L, all);
      const gen = gens[(round * 5 + L.order) % gens.length]!;
      if (!audioAvailable && NEEDS_AUDIO.has(gen)) continue;
      const ex = gen(L, ctx, rand, round);
      if (ex && !seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
    }
  }
  if (out.length < count) {
    for (const ex of fill(pool, all, gens, rand, count - out.length, audioAvailable, 4)) {
      if (!seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
    }
  }

  /* Last resort: widen back to every generator.
     A narrowed review can legitimately come up empty - asking for `ouvir`
     before any recording exists leaves nothing at all - and an empty review is
     the worst possible answer: the learner is told the course cannot build
     them five questions when it plainly can. Aiming at the failing skill is a
     preference, not a promise. */
  if (!out.length && (skills?.length || only?.length)) {
    for (const ex of fill(pool, all, LESSON_GENERATORS, rand, count, audioAvailable, 4)) {
      if (!seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
    }
  }
  return spread(out.slice(0, count));
}

/**
 * The final challenge: the alphabet, and then the street.
 *
 * It opens as a checkpoint over all 22 letters and ends on the real-world
 * scenes - a word on a bottle, a word on a door, a word on a menu - because
 * the question the last screen of this course has to answer is not "do you
 * remember lesson 14" but "can you read the thing in front of you".
 *
 * Scenes go LAST and are never diluted: a learner who has just worked through
 * twenty questions about letters should finish by reading Hebrew that was not
 * written for them.
 */
export function buildFinalChallenge(
  letters: Letter[], scenes: readonly SceneLike[], opts: BuildOptions = {}
): Exercise[] {
  const { audioAvailable = false, count = 20, seed = 'final' } = opts;
  const rand = rng(seed);
  /* A third of the run, at most six: enough to change what the challenge is
     about, not so many that the letters stop being tested. */
  const wanted = Math.min(6, Math.max(3, Math.round(count / 3)));
  const sceneItems = buildScenes(scenes, rand, wanted);
  const core = buildCheckpoint(letters, letters, {
    audioAvailable, count: count - sceneItems.length, seed: `${seed}-core`
  });
  return [...core, ...sceneItems];
}

/** What a scene needs to be, so the engine does not import the content module. */
export type SceneLike = {
  id: string; he: string; pt: string; translit: string;
  labelPt: string; contextPt: string; audioId: string; fromOrder: number;
};

/** Idem para a frase: o motor não importa o módulo de conteúdo. */
export type SentenceLike = {
  id: string; he: string; pt: string; translit: string; audioId: string;
  words: readonly { he: string; translit: string; pt: string }[];
};

export function buildScenes(
  scenes: readonly SceneLike[], rand: Rand, count: number
): Exercise[] {
  const pool = shuffled(scenes, rand).slice(0, count);
  return pool.map((s, i) => {
    /* Distractors are other scenes' meanings: all plausible, all things a
       learner might meet, none of them a giveaway. */
    const others = shuffled(scenes.filter(x => x.id !== s.id), rand).slice(0, 3).map(x => x.pt);
    const unique = [...new Set([s.pt, ...others])];
    const options = shuffled(unique, rand);
    return {
      id: `scene-${s.id}-${i}`,
      kind: 'scene-reading' as const,
      letterId: 'final',
      skill: 'ler' as const,
      promptPt: 'Leia. O que está escrito?',
      he: s.he,
      wherePt: s.labelPt,
      options,
      answer: options.indexOf(s.pt),
      audioId: s.audioId,
      explainPt: `${s.he} - ${s.translit} - ${s.pt}. ${s.contextPt}`
    };
  }).filter(e => e.answer >= 0 && e.options.length >= 3);
}

/**
 * As frases do exame, sem repetir nenhuma.
 *
 * Espelha `buildScenes` por um motivo concreto, e não por simetria. Deixar o
 * exame chamar `exSentenceReading` pelo caminho normal de `buildReview` daria
 * a MESMA frase três vezes: aquele gerador recebe uma letra e devolve a frase
 * que ela acabou de destravar, ou, quando a letra não destrava nenhuma, a mais
 * tardia da lista. Como o exame varre as 22 letras e quase nenhuma delas
 * destrava frase, as três perguntas cairiam na mesma - com ids diferentes,
 * então nem a proteção contra repetido pegaria.
 *
 * Aqui a unidade sorteada é a FRASE, que é o que a parte examina.
 */
export function buildSentences(
  sentences: readonly SentenceLike[], rand: Rand, count: number
): Exercise[] {
  const pool = shuffled(sentences, rand).slice(0, count);
  return pool.map((s, i) => {
    /* Distratores são significados de OUTRAS frases do curso, nunca
       inventados: um distrator absurdo se elimina sem ler o hebraico, e aí a
       pergunta mede outra coisa. É a mesma regra do gerador da lição. */
    const outras = shuffled(sentences.filter(x => x.id !== s.id), rand).slice(0, 3).map(x => x.pt);
    const unique = [...new Set([s.pt, ...outras])];
    const options = shuffled(unique, rand);
    return {
      id: `exam-frase-${s.id}-${i}`,
      kind: 'sentence-reading' as const,
      letterId: 'final',
      skill: 'ler' as const,
      promptPt: s.words.length > 1
        ? 'Leia a frase inteira. O que ela quer dizer?'
        : 'Leia. O que está escrito?',
      he: s.he,
      words: s.words.map(w => ({ he: w.he, translit: w.translit, pt: w.pt })),
      options,
      answer: options.indexOf(s.pt),
      audioId: s.audioId,
      /* Sem transliteração na pergunta, como no gerador da lição: ela é a
         muleta que faz ler o alfabeto latino e achar que se leu hebraico. */
      explainPt: `${s.he} - ${s.translit} - ${s.pt}.`
    };
  }).filter(e => e.answer >= 0 && e.options.length >= 3);
}

/**
 * A drill for one confusion pair this learner actually has.
 *
 * Both letters, both directions, mixed gestures: find it in a row, tell it from
 * its twin, read a word that contains it. `a` is the letter whose place the
 * learner keeps giving to `b`.
 */
export function buildConfusionDrill(
  a: Letter, b: Letter, opts: BuildOptions = {}
): Exercise[] {
  const { audioAvailable = false, count = 6, seed = `conf-${a.id}-${b.id}` } = opts;
  const rand = rng(seed);
  const history = [a, b].sort((x, y) => x.order - y.order);
  const gens = generatorsFor(['rec', 'ler']);
  const out = fill(shuffled([a, b], rand), history, gens, rand, count, audioAvailable, 4);
  return spread(out.slice(0, count));
}
