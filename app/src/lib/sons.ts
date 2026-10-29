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
 * Desde 29/09/2026 cada lado tem a sua lição sem o outro: Bet, Kaf e Pe só
 * com o ponto, Vet, Chaf e Fe só sem ele, e o contraste dos três pares na
 * lição 20, a última do módulo 5 (`som: "contraste"` em modules.json).
 *
 * Aqui mora a parte que não precisa de navegador: a ordem de ensino (que a
 * trava de progressão, o mapa e o painel usam) e os exercícios de cada som.
 */

import type { Exercise } from '@/lib/engine/types';
import type { SomLicao } from '@/lib/engine/extras';
import { rng, shuffled, take, type Rand } from '@/lib/engine/rng';
import { ehLicaoDeSom, SOM_PREFIXO } from '@/lib/state/rules';
import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/motor-sons';

export const idDoSom = (id: string) => `${SOM_PREFIXO}${id}`;

/** Para onde leva uma lição do caminho, seja letra ou som. */
export const rotaDaLicao = (id: string) =>
  id === 'aula-0' ? '/inicio'
    : ehLicaoDeSom(id) ? `/som/${id.slice(SOM_PREFIXO.length)}` : `/licao/${id}`;

/** O nome de uma lição do caminho: "Bet", "Vet". */
export function nomeDaLicao(
  id: string,
  letras: readonly { id: string; namePt: string }[],
  modulos: readonly { lessons: readonly { som?: string; nomePt?: string }[] }[]
): string {
  if (id === 'aula-0') return tx.aula0;
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

/** A leitura errada que o aluno faria sem olhar o ponto: "tov" → "tob".
 *  O "ss" entre vogais é um S só, escrito dobrado para o brasileiro não ler Z
 *  (convenção de 06/10/2026): a troca leva as duas letras, "nassí" → "nashí",
 *  e não "nasshí". */
export function leituraTrocada(translit: string, som: string, parSom: string): string {
  let i = translit.toLowerCase().lastIndexOf(som);
  if (i < 0) return translit;
  let n = som.length;
  if (som.length === 1 && i > 0 && translit[i - 1]!.toLowerCase() === som) { i -= 1; n = 2; }
  return translit.slice(0, i) + parSom + translit.slice(i + n);
}

/**
 * Os exercícios de CONTRASTE de um som: "este ou o do par" - com ponto ou
 * sem, ponto à direita ou à esquerda. É a decisão que o aluno vai ter de
 * tomar lendo. O Sin os usa na própria lição; Vet, Chaf e Fe, desde
 * 29/09/2026, só na lição 20, a do contraste (ver `bancoDoContraste`).
 */
function exerciciosDeContraste(S: SomLicao, temAudio: (id: string) => boolean, rand: Rand): Exercise[] {
  const out: Exercise[] = [];
  const letterId = S.parId;
  /* As duas sílabas de OUTRA vogal, a deste som e a do par: com elas a
     pergunta tem quatro alternativas (duas leituras × duas vogais), e chutar
     dá 25%, não 50% (auditoria de 01/10/2026, CONT-013). A vogal errada é um
     erro que o aluno também comete, então o distrator ensina. Sem uma
     segunda vogal na lição, fica com duas. */
  const outraVogal = (i: number): { s: { he: string; translit: string }; par: { he: string; translit: string } } | null => {
    const s = S.silabas[i]!;
    const par = S.parSilabas[i];
    for (let k = 1; k < S.silabas.length; k++) {
      const j = (i + k) % S.silabas.length;
      const sj = S.silabas[j]!, pj = S.parSilabas[j];
      if (!pj) continue;
      const usados = [s.translit, par?.translit, s.he, par?.he];
      if (usados.includes(sj.translit) || usados.includes(pj.translit)) continue;
      if (usados.includes(sj.he) || usados.includes(pj.he)) continue;
      return { s: sj, par: pj };
    }
    return null;
  };
  /* 1. a sílaba: como se lê? (a do par é a errada) */
  S.silabas.forEach((s, i) => {
    const par = S.parSilabas[i];
    const ov = outraVogal(i);
    const { options, answer } = comOpcoes(s.translit,
      [par?.translit ?? S.parSom, ...(ov ? [ov.s.translit, ov.par.translit] : [])], rand);
    out.push({
      id: `som-${S.id}-sil-${i}`, kind: 'syllable-reading', letterId, skill: 'som',
      promptPt: tx.silabaLeitura, he: s.he, options, answer,
      explainPt: fmt(tx.contrasteSilaba, { he: s.he, rotulo: S.rotuloPt, leitura: s.translit, parHe: par?.he ?? S.parHe, parRotulo: S.parRotuloPt, parLeitura: par?.translit ?? S.parSom })
    });
  });
  /* 2. o som dado, o desenho pedido: com ponto ou sem? */
  S.silabas.forEach((s, i) => {
    const par = S.parSilabas[i];
    if (!par) return;
    const ov = outraVogal(i);
    const { options, answer } = comOpcoes(s.he, [par.he, ...(ov ? [ov.s.he, ov.par.he] : [])], rand);
    out.push({
      id: `som-${S.id}-des-${i}`, kind: 'sound-to-syllable', letterId, skill: 'ler',
      promptPt: tx.seLeAssim, sound: s.translit, options, answer,
      explainPt: fmt(tx.contrasteDesenho, { leitura: s.translit, he: s.he, rotulo: S.rotuloPt, parHe: par.he, parRotulo: S.parRotuloPt, parLeitura: par.translit })
    });
  });
  /* 3. a palavra: a leitura certa contra a de quem não olhou o ponto */
  S.palavras.forEach((w, i) => {
    const errada = leituraTrocada(w.translit, S.som, S.parSom);
    if (errada === w.translit) return;
    const { options, answer } = comOpcoes(w.translit, [errada], rand);
    out.push({
      id: `som-${S.id}-ler-${i}`, kind: 'syllable-reading', letterId, skill: 'ler',
      promptPt: tx.palavraLeitura, he: w.he, options, answer,
      explainPt: fmt(tx.contrastePalavra, { he: w.he, leitura: w.translit, sentido: w.pt, rotulo: S.rotuloPt, som: S.som.toUpperCase() })
    });
  });
  /* 4. ouvir a sílaba e achar o desenho, onde houver gravação */
  S.silabas.forEach((s, i) => {
    const par = S.parSilabas[i];
    if (!par || !temAudio(s.audioId)) return;
    const ov = outraVogal(i);
    const { options, answer } = comOpcoes(s.he, [par.he, ...(ov ? [ov.s.he, ov.par.he] : [])], rand);
    out.push({
      id: `som-${S.id}-ouv-${i}`, kind: 'listen-syllable', letterId, skill: 'ouvir',
      promptPt: tx.ouvirSilaba, audioId: s.audioId, options, answer,
      explainPt: fmt(tx.foiRotulo, { he: s.he, leitura: s.translit, rotulo: S.rotuloPt })
    });
  });
  return out;
}

/**
 * Os exercícios de Vet, Chaf e Fe SEM o par (29/09/2026). O dono do curso
 * pediu cada som sem daguesh numa lição só dele: comparar com o lado do ponto
 * fica para a lição 20, no fim do módulo. Aqui as opções erradas são as
 * outras sílabas e palavras do MESMO som - o que se decide é a vogal, a
 * palavra e o sentido, e a letra é sempre a sem ponto.
 */
function exerciciosDoSomSuave(S: SomLicao, temAudio: (id: string) => boolean, rand: Rand): Exercise[] {
  const out: Exercise[] = [];
  const letterId = S.parId;
  const outras = <T,>(lista: readonly T[], x: T, n: number) => take(lista.filter(y => y !== x), n, rand);
  /* 1. a sílaba: como se lê? (as outras vogais do mesmo som são as erradas) */
  S.silabas.forEach((s, i) => {
    const { options, answer } = comOpcoes(s.translit, outras(S.silabas, s, 2).map(x => x.translit), rand);
    out.push({
      id: `som-${S.id}-suave-sil-${i}`, kind: 'syllable-reading', letterId, skill: 'som',
      promptPt: tx.silabaLeitura, he: s.he, options, answer,
      explainPt: fmt(tx.suaveSilaba, { he: s.he, leitura: s.translit, letra: S.he, rotulo: S.rotuloPt, som: S.som.toUpperCase() })
    });
  });
  /* 2. o som dado, a sílaba pedida */
  S.silabas.forEach((s, i) => {
    const { options, answer } = comOpcoes(s.he, outras(S.silabas, s, 2).map(x => x.he), rand);
    out.push({
      id: `som-${S.id}-suave-des-${i}`, kind: 'sound-to-syllable', letterId, skill: 'ler',
      promptPt: tx.seLeAssim, sound: s.translit, options, answer,
      explainPt: fmt(tx.suaveDesenho, { leitura: s.translit, he: s.he })
    });
  });
  /* 3. a palavra: como se lê? (as erradas são outras palavras do som) */
  S.palavras.forEach((w, i) => {
    const { options, answer } = comOpcoes(w.translit, outras(S.palavras, w, 2).map(x => x.translit), rand);
    out.push({
      id: `som-${S.id}-suave-ler-${i}`, kind: 'syllable-reading', letterId, skill: 'ler',
      promptPt: tx.palavraLeitura, he: w.he, options, answer,
      explainPt: fmt(tx.suavePalavra, { he: w.he, leitura: w.translit, sentido: w.pt, letra: S.he, som: S.som.toUpperCase() })
    });
  });
  /* 4. a palavra lida: o que quer dizer? */
  S.palavras.forEach((w, i) => {
    const { options, answer } = comOpcoes(w.pt, outras(S.palavras, w, 2).map(x => x.pt), rand);
    out.push({
      id: `som-${S.id}-suave-pal-${i}`, kind: 'word-meaning', letterId, skill: 'ler',
      promptPt: tx.leiaPalavra, he: w.he, options, answer,
      explainPt: fmt(tx.palavraSentido, { he: w.he, leitura: w.translit, sentido: w.pt })
    });
  });
  /* 5. ouvir a sílaba e achar o desenho, onde houver gravação */
  S.silabas.forEach((s, i) => {
    if (!temAudio(s.audioId)) return;
    const { options, answer } = comOpcoes(s.he, outras(S.silabas, s, 2).map(x => x.he), rand);
    out.push({
      id: `som-${S.id}-suave-ouv-${i}`, kind: 'listen-syllable', letterId, skill: 'ouvir',
      promptPt: tx.ouvirSilaba, audioId: s.audioId, options, answer,
      explainPt: fmt(tx.foi, { he: s.he, leitura: s.translit })
    });
  });
  return out;
}

/**
 * O banco de exercícios de um som. A prática e a fixação sorteiam daqui,
 * com sementes diferentes.
 *
 *   · Sin: contraste com o Shin (ponto à esquerda ou à direita);
 *   · Vet, Chaf, Fe: só o som sem ponto - o contraste é a lição 20;
 *   · Tch, Dj, J: com guéresh ou sem.
 */
export function bancoDoSom(S: SomLicao, temAudio: (id: string) => boolean): Exercise[] {
  const rand = rng(`banco-${S.id}`);
  if (S.tipo === 'ponto') return exerciciosDeContraste(S, temAudio, rand);
  if (S.tipo === 'daguesh') return exerciciosDoSomSuave(S, temAudio, rand);

  const out: Exercise[] = [];
  const letterId = 'mod7';
  /* 1. a letra com guéresh: que som? (o da letra sem o sinal é a errada) */
  const s1 = comOpcoes(S.som, [S.parSom], rand);
  out.push({
    id: `som-${S.id}-letra`, kind: 'syllable-reading', letterId, skill: 'som',
    promptPt: tx.qualSom, he: S.he, options: s1.options, answer: s1.answer,
    explainPt: fmt(tx.gerechLetra, { he: S.he, som: S.som, como: S.comoPt, parHe: S.parHe, parSom: S.parSom })
  });
  const s2 = comOpcoes(S.he, [S.parHe], rand);
  out.push({
    id: `som-${S.id}-desenho`, kind: 'sound-to-syllable', letterId, skill: 'ler',
    promptPt: tx.seLeAssim, sound: S.som, options: s2.options, answer: s2.answer,
    explainPt: fmt(tx.gerechDesenho, { som: S.som, he: S.he, parHe: S.parHe, parSom: S.parSom })
  });
  /* 2. a palavra de fora: o que quer dizer? */
  S.palavras.forEach((w, i) => {
    const erradas = take(S.palavras.filter(x => x.he !== w.he).map(x => x.pt), 2, rand);
    const { options, answer } = comOpcoes(w.pt, erradas, rand);
    out.push({
      id: `som-${S.id}-pal-${i}`, kind: 'word-meaning', letterId, skill: 'ler',
      promptPt: tx.leiaPalavra, he: w.he, options, answer,
      explainPt: fmt(tx.gerechPalavra, { he: w.he, leitura: w.translit, sentido: w.pt, letra: S.he, som: S.som })
    });
  });
  /* 3. qual palavra tem o som? (as outras têm a letra SEM o guéresh) */
  S.palavras.forEach((w, i) => {
    if (S.parPalavras.length < 2) return;
    const erradas = take(S.parPalavras.map(x => x.he), 2, rand);
    const { options, answer } = comOpcoes(w.he, erradas, rand);
    out.push({
      id: `som-${S.id}-qual-${i}`, kind: 'letter-in-word', letterId, skill: 'rec',
      promptPt: fmt(tx.palavraComSom, { som: S.som }), letter: S.he, options, answer,
      explainPt: fmt(tx.gerechQual, { he: w.he, letra: S.he, parHe: S.parHe, parSom: S.parSom })
    });
  });
  if (temAudio(S.audioId)) {
    const s3 = comOpcoes(S.he, [S.parHe], rand);
    out.push({
      id: `som-${S.id}-ouvir`, kind: 'listen-syllable', letterId, skill: 'ouvir',
      promptPt: tx.ouvirLetra, audioId: S.audioId, options: s3.options, answer: s3.answer,
      explainPt: fmt(tx.gerechOuvir, { he: S.he, som: S.som })
    });
  }
  return out;
}

/* ── a lição 20: o contraste dos três pares ─────────────────────────────
   Bet/Vet, Kaf/Chaf e Pe/Fe lado a lado, no fim do módulo 5, depois de cada
   lado ter tido a sua lição. Os exercícios são os de contraste das três
   lições de som, juntos. */

/** O id da lição 20 em modules.json (`som: "contraste"`): entra no caminho,
 *  na trava e na porcentagem como uma lição de som, `som-contraste`. */
export const CONTRASTE = 'contraste';
export const ehContraste = (som: string | undefined | null) => som === CONTRASTE;

export function bancoDoContraste(sons: readonly SomLicao[], temAudio: (id: string) => boolean): Exercise[] {
  return sons.filter(S => S.tipo === 'daguesh')
    .flatMap(S => exerciciosDeContraste(S, temAudio, rng(`contraste-${S.id}`)));
}

/**
 * Uma rodada: `count` exercícios do banco, sem repetir tipo em sequência
 * quando dá. A prática (etapa 4) e a fixação (etapa 5) chamam com sementes
 * diferentes, e a fixação muda a cada tentativa.
 */
export function rodadaDoSom(
  S: SomLicao, opts: { seed: string; count: number; temAudio: (id: string) => boolean }
): Exercise[] {
  return rodadaDe(bancoDoSom(S, opts.temAudio), opts);
}

/** A rodada da lição 20: os três pares misturados. */
export function rodadaDoContraste(
  sons: readonly SomLicao[], opts: { seed: string; count: number; temAudio: (id: string) => boolean }
): Exercise[] {
  return rodadaDe(bancoDoContraste(sons, opts.temAudio), opts);
}

function rodadaDe(bancoInteiro: Exercise[], opts: { seed: string; count: number }): Exercise[] {
  const banco = shuffled(bancoInteiro, rng(opts.seed));
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

/**
 * A letra como a SUA lição a mostra: sem as palavras que são ensinadas na
 * lição de som seguinte (טוֹב e לֵב saem do Bet e ficam para o Vet). As
 * palavras continuam no conteúdo da letra - missões, cenas e jogos as contam
 * como sabidas a partir dali -, só a tela e os exercícios da lição da letra
 * não as usam, porque o som delas ainda não foi ensinado.
 */
export function semPalavrasDeSom<T extends { wordsToRead: readonly { som?: string | null }[]; wordsToRecognize: readonly { som?: string | null }[] }>(
  letra: T
): T {
  const fica = (w: { som?: string | null }) => !w.som;
  if (!letra.wordsToRead.some(w => w.som) && !letra.wordsToRecognize.some(w => w.som)) return letra;
  return { ...letra, wordsToRead: letra.wordsToRead.filter(fica), wordsToRecognize: letra.wordsToRecognize.filter(fica) };
}

/* O som suave que a GRAFIA pede: ב, כ ou פ sem o daguesh, e as finais ך e ף
   (que são sempre o lado suave). É a grafia que decide, e não só a marca `som`
   do dado: as mesmas palavras aparecem também como "para reconhecer" em lições
   anteriores (מֶלֶךְ no Mem, יָפֶה no Yod, חָבֵר no Resh), sem marca nenhuma. */
const SUAVE: Record<string, string> = { 'ב': 'vet', 'כ': 'chaf', 'פ': 'fe', 'ך': 'chaf', 'ף': 'fe' };
const MARCA = /[\u0591-\u05C7]/;

/** Os sons de lição própria (vet, chaf, fe) que esta palavra pede para ser lida. */
export function sonsDaPalavra(he: string, som?: string | null): string[] {
  const out = new Set<string>(som ? [som] : []);
  const cs = [...he.normalize('NFC')];
  for (let i = 0; i < cs.length; i++) {
    const c = cs[i]!;
    if (!SUAVE[c]) continue;
    if (c === 'ך' || c === 'ף') { out.add(SUAVE[c]!); continue; }
    let k = i + 1, daguesh = false;
    while (k < cs.length && MARCA.test(cs[k]!)) { if (cs[k] === '\u05BC') daguesh = true; k++; }
    if (!daguesh) out.add(SUAVE[c]!);
  }
  return [...out];
}

/**
 * A letra com as palavras de som que o aluno JÁ pode ler (27/10/2026, pedido
 * do dono: "tem palavras com vet na seção de bet"). `semPalavrasDeSom` tira
 * as marcadas, para a tela da lição da letra; esta tira toda palavra que pede
 * um som cuja lição ainda não foi feita (`feito` recebe o id do som: 'vet',
 * 'chaf', 'fe'). É o que o vocabulário e a academia usam: terminar o Bet não
 * pode pôr טוֹב na lista de "palavras que você já lê" antes da lição do Vet.
 */
export function comOsSonsFeitos<T extends { wordsToRead: readonly { he: string; som?: string | null }[]; wordsToRecognize: readonly { he: string; som?: string | null }[] }>(
  letra: T, feito: (som: string) => boolean
): T {
  const fica = (w: { he: string; som?: string | null }) => sonsDaPalavra(w.he, w.som).every(feito);
  if (letra.wordsToRead.every(fica) && letra.wordsToRecognize.every(fica)) return letra;
  return { ...letra, wordsToRead: letra.wordsToRead.filter(fica), wordsToRecognize: letra.wordsToRecognize.filter(fica) };
}

const DAGUESH = 'ּ';

/**
 * Bet, Kaf e Pe como a SUA lição os mostra (29/09/2026): só o lado com o
 * ponto. O quadro das leituras (B/V, K/Ch, P/F) e os exercícios de variante
 * saíam na lição da letra, antes de o som sem ponto ter lição - e o dono do
 * curso pediu cada lado na sua lição, com o contraste só na lição 20. As
 * variantes continuam no conteúdo (revisões e módulo 6 usam as duas); é a
 * tela da letra que fica com uma.
 *
 * O Shin não muda: nenhuma das duas leituras dele tem daguesh, e o Sin segue
 * ensinado pelo contraste.
 */
export function soOLadoDoPonto<T extends { sound: string; variantes: readonly { he: string; som: string }[]; finalForm?: string | null }>(
  letra: T
): T {
  const comPonto = letra.variantes.filter(v => v.he.includes(DAGUESH));
  if (!comPonto.length || comPonto.length === letra.variantes.length) return letra;
  /* 27/10/2026, pedidos do dono: a letra que faz o som da lição aparece com o
     daguesh (כּ, e não כ, ao lado de "/k/"), e a forma final suave (ך, ף)
     sai da lição da letra e fica na do som, junto com o lado sem o ponto. */
  const finalSuave = !!letra.finalForm && FINAIS_SUAVES.has(letra.finalForm);
  return {
    ...letra,
    variantes: comPonto,
    sound: comPonto.map(v => v.som).join(' '),
    letraComPonto: comPonto[0]!.he,
    ...(finalSuave ? { finalForm: null, finalDoSom: letra.finalForm } : {})
  };
}

const FINAIS_SUAVES = new Set(['ך', 'ף']);

/** O desenho que a lição mostra para a letra: com o daguesh no Bet, Kaf e Pe. */
export const glifoDaLicao = (l: { letter: string; letraComPonto?: string }): string =>
  l.letraComPonto ?? l.letter;
