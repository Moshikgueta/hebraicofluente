/* Os pares de letras parecidas, como unidade de treino.
 * ─────────────────────────────────────────────────────────────────────────
 * O motor sempre soube quais letras se parecem (`confusableWith`), mas treinava
 * LETRAS: "entre estas parecidas, qual é Kaf?", com a letra do dia como alvo.
 * O par só era treinado quando uma das duas metades era a letra da lição, e a
 * auditoria de 23/09 contou o resultado numa passagem pelo curso inteiro:
 *
 *   ב/כ 3 vezes · ו/ז 4 · ג/נ 4 · ק/ר 4 · ע/צ 4 · ד/ר 7
 *
 * contra א/ע 18. Os pares que mais enganam um leitor de alfabeto latino eram
 * os menos treinados, e ב/כ - as letras 20 e 21 - quase não tinha curso pela
 * frente para ser revisado.
 *
 * Este arquivo faz do PAR a unidade: uma lista de contrastes tirada do
 * conteúdo, e três exercícios que só existem com as duas letras na tela.
 *
 * ── nenhuma lista escrita à mão ─────────────────────────────────────────
 * Os pares saem de `confusableWith`, que é conteúdo revisado. É a mesma regra
 * de `jogos.ts`: uma segunda lista aqui seria uma segunda fonte de verdade
 * sobre o que se parece com o quê, e um dia as duas discordariam.
 */

import type { Letter } from '@/lib/content';
import { clean, containsLetter, isReadableWith } from '@/lib/hebrew';
import { shuffled, take, type Rand } from './rng';
import type { Ctx } from './generators';
import type { Exercise } from './types';

/** Treinar `alvo` contra `glifoRival`, que é um desenho de `rival`. */
export type Contraste = { alvo: Letter; rival: Letter; glifoRival: string };

/** A chave de um par, a mesma nos dois sentidos. */
export const chaveDoPar = (a: Letter, b: Letter): string =>
  [a.id, b.id].sort().join('/');

/**
 * Todo contraste declarado no conteúdo, nos dois sentidos quando dá.
 *
 * O sentido contrário só existe quando o glifo declarado é a forma BASE do
 * rival: {{ד}} declara {{ך}} (o kaf final), e perguntar "qual é Kaf?" com um
 * {{ד}} ao lado já não é o mesmo contraste - a parecida é a forma final, não
 * o {{כ}}. A própria forma final da letra (מ → ם) fica de fora: é a mesma
 * letra, e o curso a treina noutra camada.
 */
export function contrastesDoConteudo(letras: readonly Letter[]): Contraste[] {
  const dono = new Map<string, Letter>();
  for (const l of letras) {
    dono.set(l.letter, l);
    if (l.finalForm) dono.set(l.finalForm, l);
  }
  const out: Contraste[] = [];
  const visto = new Set<string>();
  const junta = (alvo: Letter, rival: Letter, glifoRival: string) => {
    const k = `${alvo.id}>${glifoRival}`;
    if (visto.has(k)) return;
    visto.add(k);
    out.push({ alvo, rival, glifoRival });
  };
  for (const L of letras) {
    for (const g of L.confusableWith) {
      const R = dono.get(g);
      if (!R || R.id === L.id) continue;
      junta(L, R, g);
      if (g === R.letter) junta(R, L, L.letter);
    }
  }
  return out;
}

/** Em que lição o par passa a existir: quando a SEGUNDA metade é ensinada. */
export const ordemDoPar = (c: Contraste): number => Math.max(c.alvo.order, c.rival.order);

/* O que dizer quando o aluno escolhe `o` no lugar de `alvo`: a frase do
   conteúdo que diz ONDE OLHAR, escrita de um lado só do par. */
function porQue(alvo: Letter, o: string, ctx: Ctx): string {
  const meu = alvo.contrastes?.[o];
  if (meu) return meu;
  const dono = ctx.history.find(x => x.letter === o || x.finalForm === o);
  const deles = dono?.contrastes?.[alvo.letter];
  if (deles) return deles;
  return dono ? `Essa é ${dono.namePt}. Olhe o desenho de novo.` : 'Essa é outra letra, bem parecida.';
}

/**
 * Entre as parecidas, qual é a letra - com o RIVAL garantido na mesa.
 *
 * `exConfusablePick` sorteia três das parecidas declaradas, e numa letra com
 * três ou mais o rival do par podia simplesmente não vir. Aqui ele vem sempre;
 * as outras vagas são das parecidas do alvo, e só depois do alfabeto.
 */
export function exContraste(c: Contraste, ctx: Ctx, rand: Rand, i: number): Exercise | null {
  const { alvo, glifoRival } = c;
  const outrasParecidas = alvo.confusableWith.filter(
    g => g !== glifoRival && g !== alvo.letter && g !== alvo.finalForm);
  const enchimento = ctx.allGlyphs.filter(
    g => g !== alvo.letter && g !== alvo.finalForm && g !== glifoRival && !outrasParecidas.includes(g));
  const erradas = [glifoRival, ...take(outrasParecidas, 2, rand), ...shuffled(enchimento, rand)].slice(0, 3);
  const options = shuffled([alvo.letter, ...erradas], rand);
  return {
    id: `${alvo.id}-par-${c.rival.id}-${i}`,
    kind: 'letter-recognition', letterId: alvo.id, skill: 'rec',
    promptPt: `Entre estas parecidas, qual é ${alvo.namePt}?`,
    letter: alvo.letter, options, answer: options.indexOf(alvo.letter),
    whyPt: options.map(o => o === alvo.letter ? null : porQue(alvo, o, ctx)),
    hintsPt: [porQue(alvo, glifoRival, ctx)],
    explainPt: `${alvo.namePt} e ${c.rival.namePt} se confundem. ${porQue(alvo, glifoRival, ctx)}`
  };
}

/**
 * Uma fileira do alvo com UM rival escondido.
 *
 * `exOddOneOut` já existia, mas escolhe a intrusa pela posição na lista de
 * parecidas; aqui a intrusa é o rival do par, que é o ponto do exercício.
 */
export function exIntrusaDoPar(c: Contraste, ctx: Ctx, rand: Rand, i: number): Exercise {
  const { alvo, glifoRival } = c;
  const size = 6;
  const answer = Math.floor(rand() * size);
  const options = Array.from({ length: size }, (_, k) => (k === answer ? glifoRival : alvo.letter));
  return {
    id: `${alvo.id}-parodd-${c.rival.id}-${i}`,
    kind: 'odd-one-out', letterId: alvo.id, skill: 'rec',
    promptPt: `Uma destas não é ${alvo.namePt}. Qual?`,
    options, answer,
    whyPt: options.map((_, k) => k === answer ? null : `Essa é ${alvo.namePt}.`),
    explainPt: `A intrusa era ${glifoRival}, de ${c.rival.namePt}. ${porQue(alvo, glifoRival, ctx)}`
  };
}

/**
 * O par DENTRO de palavras: a certa tem o alvo, as erradas têm o rival.
 *
 * É a discriminação onde ela custa - não entre dois cartões, mas no meio de uma
 * leitura. As palavras erradas não são quaisquer: todas trazem a parecida, e
 * nenhuma traz o alvo, então quem acerta separou as duas de verdade.
 *
 * Só palavras que o aluno CONSEGUE LER, pela mesma regra de todo o motor.
 */
export function exPalavraDoPar(c: Contraste, ctx: Ctx, rand: Rand, i: number): Exercise | null {
  const { alvo, rival } = c;
  const legiveis = ctx.history.flatMap(x => x.wordsToRead)
    .filter(w => isReadableWith(w.he, ctx.alphabet));
  const unicas = [...new Map(legiveis.map(w => [w.he, w])).values()];
  const temRival = (he: string) => clean(he).includes(c.glifoRival)
    || (c.glifoRival === rival.letter && containsLetter(he, rival.letter));
  const com = unicas.filter(w => containsLetter(w.he, alvo.letter) && !temRival(w.he));
  const contra = unicas.filter(w => temRival(w.he) && !containsLetter(w.he, alvo.letter));
  if (!com.length || contra.length < 2) return null;

  const certa = com[i % com.length]!;
  const erradas = take(contra, 3, rand);
  const options = shuffled([certa.he, ...erradas.map(w => w.he)], rand);
  const porHe = new Map([certa, ...erradas].map(w => [w.he, w]));
  return {
    id: `${alvo.id}-parword-${rival.id}-${i}`,
    kind: 'letter-in-word', letterId: alvo.id, skill: 'rec',
    promptPt: `Em qual destas palavras aparece ${alvo.namePt}? As outras têm ${rival.namePt}.`,
    letter: alvo.letter, options, answer: options.indexOf(certa.he),
    whyPt: options.map(o => o === certa.he ? null
      : `${porHe.get(o)?.pt ?? 'Essa'} tem ${rival.namePt}, não ${alvo.namePt}. ${porQue(alvo, c.glifoRival, ctx)}`),
    hintsPt: [porQue(alvo, c.glifoRival, ctx)],
    explainPt: `${certa.he} - ${certa.translit} - ${certa.pt}.`
  };
}
