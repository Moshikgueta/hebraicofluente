/* As lições de som: Sin, Vet, Chaf, Fe, Tch, Dj e J (26/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Bet/Vet, Kaf/Chaf e Pe/Fe eram ensinados juntos, na lição da letra, e os
 * três sons modernos numa página só do módulo 7. Quem gravou o curso inteiro
 * notou o buraco de ouvido: não havia um momento só do V, só do F, só do TCH.
 * Agora cada som é uma lição do caminho, logo depois da letra que ele divide:
 *
 *   ... Lámed → Resh → Sin               (módulo 2: o ponto do ש à esquerda)
 *   Bet → Vet → Kaf → Chaf → Pe → Fe   (módulo 5)
 *   Tch → Dj → J                        (módulo 7)
 *
 * Aqui mora a parte que não precisa de navegador: a ordem de ensino (que a
 * trava de progressão, o mapa e o painel usam) e os exercícios de cada som.
 */

import type { Exercise } from '@/lib/engine/types';
import type { SomLicao } from '@/lib/engine/extras';
import { rng, shuffled, take, type Rand } from '@/lib/engine/rng';
import { ehLicaoDeSom, SOM_PREFIXO } from '@/lib/state/rules';

export const idDoSom = (id: string) => `${SOM_PREFIXO}${id}`;

/** Para onde leva uma lição do caminho, seja letra ou som. */
export const rotaDaLicao = (id: string) =>
  ehLicaoDeSom(id) ? `/som/${id.slice(SOM_PREFIXO.length)}` : `/licao/${id}`;

/** O nome de uma lição do caminho: "Bet", "Vet". */
export function nomeDaLicao(
  id: string,
  letras: readonly { id: string; namePt: string }[],
  modulos: readonly { lessons: readonly { som?: string; nomePt?: string }[] }[]
): string {
  if (!ehLicaoDeSom(id)) return letras.find(l => l.id === id)?.namePt ?? id;
  const som = id.slice(SOM_PREFIXO.length);
  return modulos.flatMap(m => m.lessons).find(l => l.som === som)?.nomePt ?? som;
}

type ItemDeOrdem = { id: string; lesson: number; order: number };

/**
 * A ordem de ensino: as 22 letras e as lições de som, pelo número da lição
 * no plano de aulas. Duas letras na mesma lição (álef, mem e tav na 1) ficam
 * pela ordem da letra.
 *
 * Sai de dado público - o número da lição de cada letra e as lições com
 * `som` em modules.json -, e não do conteúdo pago: a trava precisa da ordem
 * antes de o conteúdo chegar.
 */
export function ordemDeEnsino(
  letras: readonly { id: string; lesson: number; order: number }[],
  modulos: readonly { lessons: readonly { n: number; som?: string }[] }[]
): string[] {
  const itens: ItemDeOrdem[] = [
    ...letras.map(l => ({ id: l.id, lesson: l.lesson, order: l.order })),
    ...modulos.flatMap(m => m.lessons.filter(l => l.som).map(l => ({ id: idDoSom(l.som!), lesson: l.n, order: 0 })))
  ];
  return itens.sort((a, b) => a.lesson - b.lesson || a.order - b.order).map(i => i.id);
}

/* ── os exercícios ─────────────────────────────────────────────────────── */

const comOpcoes = (certa: string, erradas: string[], rand: Rand) => {
  const opcoes = shuffled([...new Set([certa, ...erradas])], rand);
  return { options: opcoes, answer: opcoes.indexOf(certa) };
};

/** A leitura errada que o aluno faria sem olhar o ponto: "tov" → "tob". */
export function leituraTrocada(translit: string, som: string, parSom: string): string {
  const i = translit.toLowerCase().lastIndexOf(som);
  return i < 0 ? translit : translit.slice(0, i) + parSom + translit.slice(i + som.length);
}

/**
 * O banco de exercícios de um som. A prática e a fixação sorteiam daqui,
 * com sementes diferentes.
 *
 * Todo exercício é um CONTRASTE: a pergunta nunca é "que som é este" com
 * quatro sons ao acaso, e sim "este ou o do par" - com ponto ou sem, com
 * gerech ou sem. É a decisão que o aluno vai ter de tomar lendo.
 */
export function bancoDoSom(S: SomLicao, temAudio: (id: string) => boolean): Exercise[] {
  const out: Exercise[] = [];
  const rand = rng(`banco-${S.id}`);
  const letterId = S.tipo === 'gerech' ? 'mod7' : S.parId;

  /* Vet/Chaf/Fe (sem o daguesh) e o Sin (o ponto à esquerda) são o mesmo
     exercício: sílaba contra sílaba, com um sinal de diferença. */
  if (S.tipo !== 'gerech') {
    /* 1. a sílaba sem ponto: como se lê? (a do par é a errada) */
    S.silabas.forEach((s, i) => {
      const par = S.parSilabas[i];
      const { options, answer } = comOpcoes(s.translit, [par?.translit ?? S.parSom], rand);
      out.push({
        id: `som-${S.id}-sil-${i}`, kind: 'syllable-reading', letterId, skill: 'som',
        promptPt: 'Como se lê esta sílaba?', he: s.he, options, answer,
        explainPt: `${s.he}, ${S.rotuloPt}, é "${s.translit}". ${par?.he ?? S.parHe}, ${S.parRotuloPt}, seria "${par?.translit ?? S.parSom}".`
      });
    });
    /* 2. o som dado, o desenho pedido: com ponto ou sem? */
    S.silabas.forEach((s, i) => {
      const par = S.parSilabas[i];
      if (!par) return;
      const { options, answer } = comOpcoes(s.he, [par.he], rand);
      out.push({
        id: `som-${S.id}-des-${i}`, kind: 'sound-to-syllable', letterId, skill: 'ler',
        promptPt: 'Qual destas se lê assim?', sound: s.translit, options, answer,
        explainPt: `"${s.translit}" é ${s.he}, ${S.rotuloPt}. ${par.he}, ${S.parRotuloPt}, é "${par.translit}".`
      });
    });
    /* 3. a palavra: a leitura certa contra a de quem não olhou o ponto */
    S.palavras.forEach((w, i) => {
      const errada = leituraTrocada(w.translit, S.som, S.parSom);
      if (errada === w.translit) return;
      const { options, answer } = comOpcoes(w.translit, [errada], rand);
      out.push({
        id: `som-${S.id}-ler-${i}`, kind: 'syllable-reading', letterId, skill: 'ler',
        promptPt: 'Como se lê esta palavra?', he: w.he, options, answer,
        explainPt: `${w.he} - "${w.translit}", ${w.pt}. A letra está ${S.rotuloPt}: soa ${S.som.toUpperCase()}.`
      });
    });
    /* 4. ouvir a sílaba e achar o desenho, onde houver gravação */
    S.silabas.forEach((s, i) => {
      const par = S.parSilabas[i];
      if (!par || !temAudio(s.audioId)) return;
      const { options, answer } = comOpcoes(s.he, [par.he], rand);
      out.push({
        id: `som-${S.id}-ouv-${i}`, kind: 'listen-syllable', letterId, skill: 'ouvir',
        promptPt: 'Ouça. Qual foi a sílaba?', audioId: s.audioId, options, answer,
        explainPt: `Foi ${s.he}, "${s.translit}" - ${S.rotuloPt}.`
      });
    });
  } else {
    /* 1. a letra com gerech: que som? (o da letra sem o sinal é a errada) */
    const s1 = comOpcoes(S.som, [S.parSom], rand);
    out.push({
      id: `som-${S.id}-letra`, kind: 'syllable-reading', letterId, skill: 'som',
      promptPt: 'Que som esta letra tem?', he: S.he, options: s1.options, answer: s1.answer,
      explainPt: `${S.he}, com o gerech, é ${S.som} - ${S.comoPt}. Sem o sinal, ${S.parHe} é ${S.parSom}.`
    });
    const s2 = comOpcoes(S.he, [S.parHe], rand);
    out.push({
      id: `som-${S.id}-desenho`, kind: 'sound-to-syllable', letterId, skill: 'ler',
      promptPt: 'Qual destas se lê assim?', sound: S.som, options: s2.options, answer: s2.answer,
      explainPt: `${S.som} é ${S.he}, com o traço. ${S.parHe}, sem ele, é ${S.parSom}.`
    });
    /* 2. a palavra de fora: o que quer dizer? */
    S.palavras.forEach((w, i) => {
      const erradas = take(S.palavras.filter(x => x.he !== w.he).map(x => x.pt), 2, rand);
      const { options, answer } = comOpcoes(w.pt, erradas, rand);
      out.push({
        id: `som-${S.id}-pal-${i}`, kind: 'word-meaning', letterId, skill: 'ler',
        promptPt: 'Leia em voz alta. Que palavra é esta?', he: w.he, options, answer,
        explainPt: `${w.he} - "${w.translit}", ${w.pt}. O ${S.he} faz o som ${S.som}.`
      });
    });
    /* 3. qual palavra tem o som? (as outras têm a letra SEM o gerech) */
    S.palavras.forEach((w, i) => {
      if (S.parPalavras.length < 2) return;
      const erradas = take(S.parPalavras.map(x => x.he), 2, rand);
      const { options, answer } = comOpcoes(w.he, erradas, rand);
      out.push({
        id: `som-${S.id}-qual-${i}`, kind: 'letter-in-word', letterId, skill: 'rec',
        promptPt: `Qual destas palavras tem o som ${S.som}?`, letter: S.he, options, answer,
        explainPt: `${w.he} tem ${S.he}, com o traço. As outras têm ${S.parHe} sem o sinal, que soa ${S.parSom}.`
      });
    });
    if (temAudio(S.audioId)) {
      const s3 = comOpcoes(S.he, [S.parHe], rand);
      out.push({
        id: `som-${S.id}-ouvir`, kind: 'listen-syllable', letterId, skill: 'ouvir',
        promptPt: 'Ouça. Qual letra foi dita?', audioId: S.audioId, options: s3.options, answer: s3.answer,
        explainPt: `Foi ${S.he}: ${S.som}.`
      });
    }
  }
  return out;
}

/**
 * Uma rodada: `count` exercícios do banco, sem repetir tipo em sequência
 * quando dá. A prática (etapa 4) e a fixação (etapa 5) chamam com sementes
 * diferentes, e a fixação muda a cada tentativa.
 */
export function rodadaDoSom(
  S: SomLicao, opts: { seed: string; count: number; temAudio: (id: string) => boolean }
): Exercise[] {
  const banco = shuffled(bancoDoSom(S, opts.temAudio), rng(opts.seed));
  const porTipo = new Map<string, Exercise[]>();
  for (const e of banco) porTipo.set(e.kind, [...(porTipo.get(e.kind) ?? []), e]);
  /* Um de cada tipo por vez, em rodízio: dez itens do mesmo formato viram
     reflexo, e o contraste precisa ser decidido de vários jeitos. */
  const out: Exercise[] = [];
  const filas = [...porTipo.values()];
  while (out.length < opts.count && filas.some(f => f.length)) {
    for (const f of filas) if (f.length && out.length < opts.count) out.push(f.shift()!);
  }
  return out;
}
