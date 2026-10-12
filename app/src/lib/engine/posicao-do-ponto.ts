/* A lição 21: onde o ponto aparece, e como ler sem ele (30/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Até aqui a lição 21 mostrava Bet/Vet, Kaf/Chaf e Pe/Fe lado a lado - o
 * mesmo que a lição 20 passou a fazer. O que faltava no curso era o passo
 * seguinte: fora do livro o ponto não é impresso, e o leitor decide o som
 * pelo LUGAR da letra na palavra. A regra (extras.dagesh.rulePt):
 *
 *   · no começo da palavra, e depois de uma consoante que FECHA a sílaba
 *     (shva no meio da palavra, como em מִשְׁפָּחָה): com o ponto - B, K, P;
 *   · depois de vogal, e também depois de uma letra com shva no começo da
 *     palavra ou de um prefixo (בְּבַקָשָׁה, כְּבָר): sem o ponto - V, CH, F;
 *   · as formas finais ך e ף nunca levam ponto.
 *
 * Tudo aqui sai das palavras que o curso já ensina. Cada palavra é analisada
 * (em que posição a letra está) e conferida contra o ponto que ela TEM no
 * conteúdo: só vira exercício a palavra em que a regra acerta. As que a regra
 * erra porque o ponto dobra a consoante depois de vogal (אַבָּא), e as que
 * ficam sem o ponto depois do shva do começo da palavra (בְּבַקָשָׁה), vão
 * para um quadro à parte, "quando a regra não basta" - é a verdade da língua,
 * e esconder faria o aluno achar que a regra é lei.
 */

import type { Exercise } from './types';
import { rng, shuffled, type Rand } from './rng';
import { clusters } from '@/lib/hebrew';
import type { Letter } from '@/lib/content-publico';
import type { Extras } from './extras';

const DAGUESH = 'ּ';
const SHEVA = 'ְ';
/* Os sinais de vogal (sem o shva, sem o daguesh, sem os pontos do ש). */
const VOGAL = /[ֱ-ׇֻ]/;
const MATER = new Set(['א', 'ה', 'ו', 'י']);

export type LetraDoPonto = { id: 'bet' | 'kaf' | 'pe'; he: string; final: string | null; forte: string; suave: string };
export const LETRAS_DO_PONTO: readonly LetraDoPonto[] = [
  { id: 'bet', he: 'ב', final: null, forte: 'b', suave: 'v' },
  { id: 'kaf', he: 'כ', final: 'ך', forte: 'k', suave: 'ch' },
  { id: 'pe', he: 'פ', final: 'ף', forte: 'p', suave: 'f' }
];

export type Posicao = 'comeco' | 'depois-de-consoante' | 'depois-de-vogal';

export const POSICAO_PT: Record<Posicao, string> = {
  'comeco': 'no começo da palavra',
  'depois-de-consoante': 'depois de consoante que fecha a sílaba (shva no meio da palavra)',
  'depois-de-vogal': 'depois de vogal'
};

export type Analise = {
  letra: LetraDoPonto;
  /** O índice do grupo (consoante + sinais) da letra na palavra. */
  indice: number;
  posicao: Posicao;
  /** O que a regra diz: com o ponto? */
  previsto: boolean;
  /** O que o conteúdo tem: com o ponto? */
  real: boolean;
};

/** A vogal do grupo anterior, dita em palavras: tem vogal, é consoante muda, ou não dá para saber. */
function antes(grupo: string): 'vogal' | 'consoante' | null {
  if (grupo.includes(SHEVA)) return 'consoante';
  if (VOGAL.test(grupo)) return 'vogal';
  /* O וֹ e o וּ: a vogal é a própria letra. */
  if (grupo[0] === 'ו' && grupo.includes(DAGUESH)) return 'vogal';
  if (grupo[0] === 'ו' && grupo.includes('ֹ')) return 'vogal';
  /* Sem sinal nenhum: uma letra de apoio (יִ, וֹ, אָ...) carrega a vogal de
     antes; qualquer outra é uma consoante que não sabemos ler - fica de fora. */
  return MATER.has(grupo[0] ?? '') ? 'vogal' : null;
}

/**
 * As letras do ponto (não finais) de uma palavra, cada uma com a posição e a
 * conferência. Posição incerta (sem pontuação que diga) não entra.
 */
export function analisar(he: string): Analise[] {
  const gs = clusters(he.normalize('NFC'));
  const out: Analise[] = [];
  gs.forEach((g, i) => {
    const letra = LETRAS_DO_PONTO.find(l => g[0] === l.he);
    if (!letra) return;
    let posicao: Posicao;
    if (i === 0) posicao = 'comeco';
    else {
      const a = antes(gs[i - 1]!);
      if (!a) return;
      posicao = a === 'consoante' ? 'depois-de-consoante' : 'depois-de-vogal';
    }
    out.push({
      letra, indice: i, posicao,
      previsto: posicao !== 'depois-de-vogal',
      real: g.includes(DAGUESH)
    });
  });
  return out;
}

export type PalavraDoPonto = { he: string; translit: string; pt: string };

export type Classificada = PalavraDoPonto & { analise: Analise };

/**
 * As palavras boas para o exercício: exatamente UMA letra do ponto (fora as
 * finais), com posição conhecida e a regra acertando. E, à parte, as que a
 * regra erra: o ponto que aparece depois de vogal (o ponto que dobra), e a
 * letra sem o ponto depois de uma consoante com shva - o shva do começo da
 * palavra, que se diz "e" ou não se diz, não fecha sílaba (בְּבַקָשָׁה).
 * Para o quadro das exceções a palavra pode ter mais de uma letra do ponto,
 * desde que a regra erre em uma só.
 */
export function classificar(palavras: readonly PalavraDoPonto[]): { certas: Classificada[]; excecoes: Classificada[] } {
  const vistas = new Set<string>();
  const certas: Classificada[] = [], excecoes: Classificada[] = [];
  for (const w of palavras) {
    const k = w.he.normalize('NFC');
    if (vistas.has(k)) continue;
    vistas.add(k);
    const todas = clusters(k).filter(g => LETRAS_DO_PONTO.some(l => g[0] === l.he));
    const as = analisar(k);
    const erradas = as.filter(a => a.previsto !== a.real);
    const excecao = erradas.length === 1 && as.length === todas.length ? erradas[0]! : null;
    if (excecao && ((excecao.posicao === 'depois-de-vogal' && excecao.real)
      || (excecao.posicao === 'depois-de-consoante' && !excecao.real))) {
      excecoes.push({ ...w, analise: excecao });
      continue;
    }
    if (todas.length !== 1 || as.length !== 1) continue;
    const a = as[0]!;
    if (a.previsto === a.real) certas.push({ ...w, analise: a });
  }
  return { certas, excecoes };
}

/** O grupo (letra + sinais) que a análise olhou - para destacar a letra certa
 *  quando a palavra tem duas letras do ponto (בְּבַקָשָׁה). */
export function grupoAnalisado(w: Classificada): string {
  return clusters(w.he.normalize('NFC'))[w.analise.indice] ?? w.analise.letra.he;
}

/** A palavra com o ponto da letra tirado - como ela aparece fora do livro. */
export function semOPonto(he: string, indice: number): string {
  return clusters(he.normalize('NFC')).map((g, i) => (i === indice ? g.replace(DAGUESH, '') : g)).join('');
}

/** A leitura com o outro som: "báyit" → "váyit". Troca a primeira ocorrência
 *  do som (a palavra só tem uma letra do ponto). */
export function outraLeitura(translit: string, de: string, para: string): string {
  const i = translit.toLowerCase().indexOf(de);
  return i < 0 ? translit : translit.slice(0, i) + para + translit.slice(i + de.length);
}

const comOpcoes = (certa: string, errada: string, rand: Rand) => {
  const options = shuffled([certa, errada], rand);
  return { options, answer: options.indexOf(certa) };
};

/** Os exercícios: a palavra sem o ponto impresso, e as duas leituras. */
export function exerciciosDoPonto(certas: readonly Classificada[], opts: { seed: string; count: number }): Exercise[] {
  const rand = rng(opts.seed);
  const out: Exercise[] = [];
  for (const [i, w] of shuffled([...certas], rand).entries()) {
    if (out.length >= opts.count) break;
    const { letra, posicao, real, indice } = w.analise;
    const [de, para] = real ? [letra.forte, letra.suave] : [letra.suave, letra.forte];
    /* O som tem de aparecer UMA vez na transliteração: "ch" também é o do ח,
       "k" também é o do ק, e trocar o errado inventaria uma palavra. */
    if (w.translit.toLowerCase().split(de).length !== 2) continue;
    const errada = outraLeitura(w.translit, de, para);
    if (errada === w.translit) continue;
    const { options, answer } = comOpcoes(w.translit, errada, rand);
    out.push({
      id: `ponto-${letra.id}-${i}`, kind: 'syllable-reading', letterId: letra.id, skill: 'ler',
      promptPt: 'O ponto não foi impresso. Como se lê?', he: semOPonto(w.he, indice), options, answer,
      explainPt: `A letra ${letra.he} está ${POSICAO_PT[posicao]}: ${real ? 'leva o ponto' : 'fica sem o ponto'}, `
        + `e soa ${(real ? letra.forte : letra.suave).toUpperCase()}. ${w.he} - "${w.translit}", ${w.pt}.`
    });
  }
  return out;
}

/** Todas as palavras do curso com as três letras: as do quadro do ponto, as
 *  das lições de Bet, Kaf e Pe e as das lições de Vet, Chaf e Fe. */
export function palavrasDoPonto(extras: Extras, letras: readonly Letter[]): PalavraDoPonto[] {
  const das = letras.filter(l => LETRAS_DO_PONTO.some(x => x.id === l.id));
  return [
    ...extras.dagesh.letters.flatMap(d => [...d.hardWords, ...d.softWords]),
    ...das.flatMap(l => [...l.wordsToRead, ...l.wordsToRecognize]),
    ...extras.sons.filter(s => s.tipo === 'daguesh').flatMap(s => s.palavras)
  ].map(w => ({ he: w.he, translit: w.translit, pt: w.pt }));
}
