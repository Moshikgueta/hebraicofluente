/* O cérebro dos jogos de reconhecimento.
 * ─────────────────────────────────────────────────────────────────────────
 * Três jogos - Caça à letra, Batalha das parecidas e Impressa × Cursiva -
 * fazem a mesma pergunta de fundo: QUAIS letras mostrar agora, e quais pôr ao
 * lado delas para a escolha custar alguma coisa. Este arquivo responde isso
 * uma vez, e os três componentes só desenham.
 *
 * ── o que ele NÃO faz ───────────────────────────────────────────────────
 * Não guarda nada. Não tem placar, não tem nível, não tem memória de quem
 * erra o quê. Tudo isso já existe e é de outro lugar:
 *
 *   · `state.skills[letra]`      - cinco habilidades, acertos e erros de cada
 *   · `state.confusions`         - `correta>escolhida`, com contagem e decaimento
 *   · `letterMastery()`          - o nível, tirado da habilidade MAIS FRACA
 *   · `state.gym[jogo]`          - o recorde pessoal, por jogo
 *
 * Criar uma segunda memória aqui seria a segunda fonte de verdade que um dia
 * discorda da primeira, e seria ela que o aluno veria.
 *
 * ── a regra que nenhum jogo pode furar ──────────────────────────────────
 * Letra que o aluno ainda não encontrou não entra. Quem decide isso é quem
 * chama (a lista `unlocked`), e é por isso que nenhuma função daqui vai
 * buscar `allLetters()` sozinha: a única forma de mostrar uma letra trancada
 * seria alguém passá-la de fora, de propósito.
 *
 * E o corolário que se esquece: um PAR de letras parecidas só pode ser usado
 * quando as DUAS já foram ensinadas. Mostrar ד contra ר para quem só viu o
 * ד não é treinar discriminação, é adivinhação.
 */

import type { Letter } from '@/lib/content';
import type { LearnerState } from '@/lib/state/types';
import { letterMastery, topConfusions } from '@/lib/state/rules';
import { pick, shuffled, take, type Rand } from './rng';

/* ── o nível ───────────────────────────────────────────────────────────── */

export type Nivel = 'facil' | 'medio' | 'dificil';

export const NIVEL_LABEL: Record<Nivel, string> = {
  facil: 'Aquecimento',
  medio: 'Treino',
  dificil: 'Difícil'
};

/**
 * Em que nível este aluno está, agora.
 *
 * Duas coisas decidem, e as duas são do progresso dele - nunca uma escolha
 * numa tela de opções. Quem está no começo não sabe se quer o difícil, e quem
 * está no fim não deveria ter de pedir.
 *
 *   · QUANTAS letras ele tem. Com quatro letras não existe "misturar
 *     parecidas": não há parecidas suficientes para montar uma grade.
 *   · QUÃO firmes elas estão. Vinte letras todas em `aprendendo` é alguém que
 *     acabou de passar por elas, não alguém pronto para o difícil.
 */
export function nivelDe(state: LearnerState, unlocked: readonly Letter[]): Nivel {
  if (unlocked.length < 6) return 'facil';
  const firmes = unlocked.filter(l => {
    const m = letterMastery(state, l.id);
    return m === 'forte' || m === 'praticando';
  }).length;
  const parte = firmes / unlocked.length;
  if (unlocked.length >= 12 && parte >= 0.6) return 'dificil';
  if (parte >= 0.3) return 'medio';
  return 'facil';
}

/* ── de que letra este aluno precisa ───────────────────────────────────── */

/**
 * O peso de uma letra no sorteio. Quanto maior, mais ela aparece.
 *
 * Não é aleatório uniforme de propósito: um jogo que sorteia por igual gasta
 * metade do tempo do aluno nas letras que ele já domina. O peso vem do mesmo
 * modelo que a revisão usa, então "praticar" e "revisar" concordam sobre
 * quais letras estão devendo.
 *
 * `revisar` pesa mais do que `novo`: uma letra errada e ainda não recuperada
 * é mais urgente do que uma que nunca foi testada.
 */
export function pesoDaLetra(state: LearnerState, letterId: string): number {
  switch (letterMastery(state, letterId)) {
    case 'revisar': return 6;
    case 'aprendendo': return 4;
    case 'novo': return 3;
    case 'praticando': return 2;
    case 'forte': return 1;
  }
}

/** Um sorteio ponderado, com a mesma `Rand` semeada do resto do motor. */
export function sortearPorPeso<T>(
  itens: readonly T[], peso: (t: T) => number, rand: Rand
): T | undefined {
  if (!itens.length) return undefined;
  const total = itens.reduce((s, t) => s + Math.max(0.0001, peso(t)), 0);
  let n = rand() * total;
  for (const t of itens) {
    n -= Math.max(0.0001, peso(t));
    if (n <= 0) return t;
  }
  return itens[itens.length - 1];
}

/** N letras distintas, sorteadas pelo peso. */
export function sortearLetras(
  state: LearnerState, unlocked: readonly Letter[], n: number, rand: Rand
): Letter[] {
  const resto = unlocked.slice();
  const out: Letter[] = [];
  while (out.length < n && resto.length) {
    const L = sortearPorPeso(resto, l => pesoDaLetra(state, l.id), rand);
    if (!L) break;
    out.push(L);
    resto.splice(resto.indexOf(L), 1);
  }
  return out;
}

/* ── quem fica ao lado ─────────────────────────────────────────────────── */

/**
 * As letras que o aluno PODE confundir com esta, entre as que ele já tem.
 *
 * Duas fontes, nesta ordem, e a ordem é a diferença entre um curso genérico e
 * um adaptativo:
 *
 *   1. o que ELE trocou de verdade (`state.confusions`);
 *   2. o que o conteúdo diz que se parece (`confusableWith`), para quem ainda
 *      não errou - esperar o erro para começar a treinar é esperar demais.
 *
 * O filtro por `unlocked` é a regra do parágrafo do topo: um par só existe
 * quando as duas metades já foram ensinadas.
 */
export function parecidasCom(
  state: LearnerState, L: Letter, unlocked: readonly Letter[]
): Letter[] {
  const porGlifo = new Map<string, Letter>();
  for (const o of unlocked) {
    if (o.id === L.id) continue;
    porGlifo.set(o.letter, o);
    if (o.finalForm) porGlifo.set(o.finalForm, o);
  }

  const out: Letter[] = [];
  const junta = (glifo: string) => {
    const o = porGlifo.get(glifo);
    if (o && !out.some(x => x.id === o.id)) out.push(o);
  };

  /* Primeiro as trocas registradas, nos dois sentidos: quem escreve ר no
     lugar de ד também lê ד onde está escrito ר. */
  for (const c of topConfusions(state, 12)) {
    if (c.correct === L.letter || c.correct === L.finalForm) junta(c.chosen);
    if (c.chosen === L.letter || c.chosen === L.finalForm) junta(c.correct);
  }
  for (const glifo of L.confusableWith) junta(glifo);
  return out;
}

/**
 * As alternativas erradas de uma pergunta.
 *
 * O nível decide de onde elas vêm, e é aqui que "adaptar a dificuldade"
 * acontece de verdade - não numa barra de velocidade:
 *
 *   fácil    - letras que não se parecem com a certa. A pergunta é "você
 *              reconhece esta letra?", e nada mais.
 *   médio    - metade parecidas, metade quaisquer.
 *   difícil  - só parecidas, enquanto houver. A pergunta passa a ser "você
 *              distingue esta letra daquela que se parece com ela?", que é
 *              outra habilidade.
 *
 * Quando não há parecidas suficientes - início do curso -, ele completa com
 * quaisquer em vez de devolver menos alternativas: uma pergunta de duas
 * opções vira cara ou coroa.
 */
export function distratores(
  state: LearnerState, alvo: Letter, unlocked: readonly Letter[],
  quantos: number, nivel: Nivel, rand: Rand
): Letter[] {
  const outras = unlocked.filter(l => l.id !== alvo.id);
  const parecidas = parecidasCom(state, alvo, unlocked);
  const distantes = outras.filter(l => !parecidas.some(p => p.id === l.id));

  const quantasParecidas =
    nivel === 'dificil' ? quantos
    : nivel === 'medio' ? Math.ceil(quantos / 2)
    : 0;

  const out = take(parecidas, Math.min(quantasParecidas, parecidas.length), rand);
  const faltam = quantos - out.length;
  if (faltam > 0) out.push(...take(distantes.length ? distantes : outras, faltam, rand));
  return shuffled(out, rand).slice(0, quantos);
}

/* ── o retorno que ensina ──────────────────────────────────────────────── */

/**
 * Por que esta escolha estava errada, em uma frase.
 *
 * Sai do campo `contrastes` das letras - a frase que diz ONDE OLHAR, escrita
 * por letra e por par ("o ם final é quadrado; o ס é redondo"). É a diferença
 * entre "errado" e um retorno que corrige.
 *
 * Devolve `null` quando não há frase para este par, e quem chama cai numa
 * mensagem genérica: inventar uma diferença visual aqui seria ensinar algo
 * que ninguém revisou.
 */
export function porQueErrou(certa: Letter, escolhida: Letter): string | null {
  const c = certa.contrastes;
  if (!c) return null;
  return c[escolhida.letter] ?? (escolhida.finalForm ? c[escolhida.finalForm] ?? null : null);
}

/* ── a grade da Caça à letra ───────────────────────────────────────────── */

export type Caca = {
  alvo: Letter;
  /** O glifo procurado: a forma normal ou a final, quando a rodada é dela. */
  glifo: string;
  /** Cada célula é um glifo, e `certa` diz se ela conta. */
  celulas: { id: string; glifo: string; certa: boolean; letterId: string }[];
  quantas: number;
  nivel: Nivel;
};

/**
 * Monta uma rodada de caça.
 *
 * O tamanho vem do pedido (10 a 25 células) e sobe com o nível, porque uma
 * grade pequena de letras parecidas já é difícil e uma grade grande de letras
 * distintas é só demorada.
 *
 * ── quantas certas ──────────────────────────────────────────────────────
 * Cerca de um quarto da grade, entre 3 e 6. A PROPORÇÃO é o que importa, e
 * ela custou uma captura de tela para ficar óbvia: com um número fixo de 3 a
 * 6 numa grade de 12, uma rodada saiu com SEIS alvos em doze células - metade
 * do tabuleiro era a resposta, e procurar deixou de ser procurar.
 *
 * Os limites continuam: uma grade com uma ocorrência vira agulha no palheiro,
 * e o número é dito no fim ("você encontrou 5"), então precisa ser um número
 * que a pessoa consiga ter contado enquanto jogava.
 */
export function montarCaca(
  state: LearnerState, unlocked: readonly Letter[], rand: Rand, nivel: Nivel
): Caca | null {
  if (unlocked.length < 3) return null;

  const alvo = sortearPorPeso(unlocked, l => pesoDaLetra(state, l.id), rand);
  if (!alvo) return null;

  /* A forma final entra como rodada própria, e só quando a letra tem uma.
     Procurar ם numa grade é um exercício diferente de procurar מ, e é
     justamente o que confunde quem lê uma palavra pela primeira vez. */
  const temFinal = !!alvo.finalForm;
  const usarFinal = temFinal && rand() < 0.35;
  const glifo = usarFinal ? alvo.finalForm! : alvo.letter;

  const total = nivel === 'facil' ? 12 : nivel === 'medio' ? 18 : 24;
  const ideal = Math.round(total * 0.25);
  const quantas = Math.min(6, Math.max(3, ideal + (rand() < 0.4 ? 1 : 0)));

  const ruido = distratores(state, alvo, unlocked, Math.min(6, unlocked.length - 1), nivel, rand);
  if (!ruido.length) return null;

  const celulas: Caca['celulas'] = [];
  for (let i = 0; i < quantas; i++) {
    celulas.push({ id: `c${i}`, glifo, certa: true, letterId: alvo.id });
  }
  for (let i = celulas.length; i < total; i++) {
    const L = ruido[i % ruido.length]!;
    /* O ruído também aparece na forma final quando tem uma: sem isso, toda
       forma final na grade seria a resposta certa, e a pista deixa de ser a
       letra e passa a ser o formato. */
    const g = L.finalForm && rand() < 0.3 ? L.finalForm : L.letter;
    /* Um distrator NUNCA pode ser o glifo procurado. Sem esta guarda, uma
       letra cuja forma final é igual à de outra entraria como "errada" com o
       desenho certo - e o aluno seria punido por acertar. */
    if (g === glifo) { celulas.push({ id: `r${i}`, glifo: L.letter, certa: L.letter === glifo, letterId: L.id }); continue; }
    celulas.push({ id: `r${i}`, glifo: g, certa: false, letterId: L.id });
  }

  const misturadas = shuffled(celulas, rand);
  return {
    alvo, glifo, celulas: misturadas,
    quantas: misturadas.filter(c => c.certa).length,
    nivel
  };
}

/* ── as rodadas da Batalha ─────────────────────────────────────────────── */

export type RodadaBatalha =
  | { tipo: 'qual'; alvo: Letter; glifo: string; opcoes: Letter[] }
  | { tipo: 'todas'; alvo: Letter; outra: Letter; glifo: string;
      fila: { id: string; glifo: string; certa: boolean; letterId: string }[] }
  | { tipo: 'intruso'; alvo: Letter; intruso: Letter;
      fila: { id: string; glifo: string; intruso: boolean; letterId: string }[] };

export type Batalha = {
  /** As duas inimigas do dia. */
  par: [Letter, Letter];
  rodadas: RodadaBatalha[];
  /** Verdadeiro quando o par saiu dos erros DELE, e não do conteúdo. */
  doAluno: boolean;
};

/**
 * Monta a batalha de um par.
 *
 * Três formatos alternados de propósito, porque cada um mede uma coisa:
 *
 *   qual     - a letra sozinha, e o nome. Mede se ele sabe QUAL é.
 *   todas    - uma fileira, toque em todas as X. Mede se ele SEPARA as duas
 *              quando elas estão lado a lado, que é o caso da palavra real.
 *   intruso  - cinco iguais e uma diferente. Mede se ele NOTA a diferença sem
 *              que ninguém aponte para onde olhar.
 *
 * O par vem de fora (`confusionPair`, em gym.ts) para não haver duas regras
 * decidindo qual par treinar.
 */
export function montarBatalha(
  par: [Letter, Letter], doAluno: boolean, rand: Rand, quantas = 8
): Batalha {
  const rodadas: RodadaBatalha[] = [];
  const formas = (L: Letter) => (L.finalForm ? [L.letter, L.finalForm] : [L.letter]);

  for (let i = 0; i < quantas; i++) {
    const alvo = par[i % 2]!;
    const outra = par[(i + 1) % 2]!;
    const glifo = pick(formas(alvo), rand) ?? alvo.letter;

    if (i % 3 === 0) {
      rodadas.push({ tipo: 'qual', alvo, glifo, opcoes: shuffled([alvo, outra], rand) });
      continue;
    }

    if (i % 3 === 1) {
      const n = 6 + Math.floor(rand() * 3);
      const fila = Array.from({ length: n }, (_, k) => {
        const certa = rand() < 0.45;
        const L = certa ? alvo : outra;
        return {
          id: `f${i}-${k}`,
          glifo: pick(formas(L), rand) ?? L.letter,
          certa, letterId: L.id
        };
      });
      /* Uma fileira sem nenhuma certa não tem resposta, e uma só com certas
         não tem escolha. Garante pelo menos uma de cada. */
      if (!fila.some(c => c.certa)) { const f = fila[0]!; f.certa = true; f.glifo = glifo; f.letterId = alvo.id; }
      if (fila.every(c => c.certa)) { const f = fila[fila.length - 1]!; f.certa = false; f.glifo = outra.letter; f.letterId = outra.id; }
      rodadas.push({ tipo: 'todas', alvo, outra, glifo, fila });
      continue;
    }

    const n = 5;
    const onde = Math.floor(rand() * n);
    const fila = Array.from({ length: n }, (_, k) => ({
      id: `i${i}-${k}`,
      glifo: k === onde ? outra.letter : alvo.letter,
      intruso: k === onde,
      letterId: k === onde ? outra.id : alvo.id
    }));
    rodadas.push({ tipo: 'intruso', alvo, intruso: outra, fila });
  }

  return { par, rodadas, doAluno };
}

/* ── as rodadas de Impressa × Cursiva ──────────────────────────────────── */

export type RodadaCursiva =
  | { tipo: 'paraCursiva'; alvo: Letter; opcoes: Letter[] }
  | { tipo: 'paraImpressa'; alvo: Letter; opcoes: Letter[] }
  | { tipo: 'pares'; esquerda: Letter[]; direita: Letter[] };

/**
 * Monta a rodada de impressa × cursiva.
 *
 * As duas formas são O MESMO caractere em duas famílias tipográficas - é
 * assim que o curso ensina (ver `he-cursive` em globals.css e o gerador
 * `exPrintVsCursive`), e é a única forma que garante que a cursiva mostrada
 * aqui seja exatamente a que a lição mostrou. Uma segunda fonte cursiva,
 * escolhida por estética, ensinaria um desenho que o aluno nunca viu.
 *
 * O modo `pares` é o avançado do pedido, e é POR TOQUE: toca numa impressa,
 * toca na cursiva correspondente. Arrastar com o dedo numa grade pequena erra
 * mais do que acerta, e um jogo que pune a mão não ensina a letra.
 */
export function montarCursiva(
  state: LearnerState, unlocked: readonly Letter[], rand: Rand, nivel: Nivel, quantas = 8
): RodadaCursiva[] {
  if (unlocked.length < 3) return [];
  const out: RodadaCursiva[] = [];
  const opcoesN = nivel === 'facil' ? 3 : 4;

  for (let i = 0; i < quantas; i++) {
    /* A cada quatro rodadas, uma de pares - e só a partir do médio, porque
       ela exige seis letras firmes na cabeça ao mesmo tempo. */
    if (nivel !== 'facil' && i > 0 && i % 4 === 3 && unlocked.length >= 4) {
      const n = Math.min(4, unlocked.length);
      const letras = sortearLetras(state, unlocked, n, rand);
      out.push({
        tipo: 'pares',
        esquerda: shuffled(letras, rand),
        direita: shuffled(letras, rand)
      });
      continue;
    }

    const alvo = sortearPorPeso(unlocked, l => pesoDaLetra(state, l.id), rand);
    if (!alvo) continue;
    const opcoes = shuffled(
      [alvo, ...distratores(state, alvo, unlocked, opcoesN - 1, nivel, rand)], rand
    );
    out.push({ tipo: i % 2 === 0 ? 'paraCursiva' : 'paraImpressa', alvo, opcoes });
  }
  return out;
}
