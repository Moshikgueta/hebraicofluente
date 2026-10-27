/* O que a Fixação guiada mostra, montado a partir dos dados de uma lição.
 * ─────────────────────────────────────────────────────────────────────────
 * A tela (components/learn/FixacaoGuiada.tsx) não sabe de letras nem de
 * sons; estas duas funções traduzem uma lição de letra e uma lição de som
 * para o mesmo formato. Ficam aqui, fora do componente, para os testes
 * conferirem as 22 letras e os sons sem montar tela nenhuma
 * (tests/fixacao.test.ts).
 */

import type { Letter } from '@/lib/content-publico';
import type { SomLicao } from '@/lib/engine/extras';
import type { AlvoFixacao, ComparacaoDaFixacao, PalavraDaFixacao } from '@/components/learn/FixacaoGuiada';
import { consonantsOf } from '@/lib/hebrew';

/* Desenhos para a memória visual quando o curso ainda não tem letras
   anteriores suficientes (a primeira lição). A memória visual é sobre FORMA,
   não sobre saber ler: mostrar uma letra que ainda não foi ensinada como
   distrator não pede que o aluno a conheça. */
const GLIFOS_RESERVA = ['ב', 'ג', 'ד', 'ע', 'צ', 'ש'];
/* Sons de reserva, pelo mesmo motivo: na primeira lição não há outros sons. */
const SONS_RESERVA = ['/m/', '/t/', '/n/', '/l/'];

const unicos = <T,>(xs: readonly T[]): T[] => [...new Set(xs)];
/* Sem os sinais de vogal, daguesh e pontos de shin/sin; o gerech fica. */
const semPontos = (he: string): string => he.normalize('NFD').replace(/[\u0591-\u05C7]/g, '');

export function alvoDaLetra(letter: Letter, history: readonly Letter[]): AlvoFixacao {
  const anteriores = history.filter(l => l.order < letter.order);
  const ontem = anteriores.find(l => l.order === letter.order - 1) ?? anteriores.at(-1) ?? null;
  /* As parecidas que o aluno já conhece: elas são a revisão que mais vale. */
  const parecidas = anteriores.filter(l => letter.confusableWith.includes(l.letter));
  const notaDoPar = (o: Letter): string | null =>
    letter.contrastes?.[o.letter] ?? o.contrastes?.[letter.letter] ?? null;
  const comparar: ComparacaoDaFixacao[] = unicos([...parecidas, ...(ontem ? [ontem] : [])])
    .slice(0, 2)
    .map(o => ({ glifo: o.letter, nome: o.namePt, som: o.sound, audioId: o.audioId, notaPt: notaDoPar(o) }));

  const palavras: PalavraDaFixacao[] = letter.wordsToRead.length
    ? letter.wordsToRead.slice(0, 3).map(w => ({ he: w.he, translit: w.translit, pt: w.pt, audioId: w.audioId }))
    /* O álef não tem palavra legível na lição 1: as sílabas fazem o papel. */
    : letter.syllables.slice(0, 3).map(s => ({ he: s.he, translit: s.translit, pt: s.ptApprox, audioId: s.audioId }));

  const outrosGlifos = unicos([
    ...letter.confusableWith,
    ...anteriores.map(l => l.letter).reverse(),
    ...GLIFOS_RESERVA
  ]).filter(g => g !== letter.letter && g !== letter.finalForm);

  const outrosSons = unicos([
    ...anteriores.map(l => l.sound).reverse(),
    ...SONS_RESERVA
  ]).filter(s => s !== letter.sound);

  return {
    id: letter.id,
    glifo: letter.letter,
    final: letter.finalForm,
    nome: letter.namePt,
    som: letter.sound,
    audioId: letter.audioId,
    lembrePt: letter.ensino.lembrePt,
    cursiva: true,
    palavras,
    destaque: [letter.letter, ...(letter.finalForm ? [letter.finalForm] : [])],
    comparar,
    outrosGlifos,
    outrosSons
  };
}

export function alvoDoSom(S: SomLicao): AlvoFixacao {
  const base = consonantsOf(S.he)[0] ?? S.he;
  const palavras: PalavraDaFixacao[] = (S.palavras.length ? S.palavras : S.silabas.map(s => ({ ...s, pt: '' })))
    .slice(0, 3)
    .map(w => ({ he: w.he, translit: w.translit, pt: w.pt, audioId: w.audioId }));
  return {
    id: `som-${S.id}`,
    glifo: S.he,
    final: S.finalHe,
    nome: S.namePt,
    som: S.som,
    audioId: S.audioId,
    lembrePt: S.regraPt,
    /* A cursiva também nas lições de som (27/10/2026, pedido do dono: "falta
       a cursiva aqui", no Vet). À mão não se escrevem os pontos, então o
       desenho sai sem eles; o gerech (׳) fica, porque é ele que faz o som. */
    cursiva: true,
    glifoCursivo: semPontos(S.he),
    palavras,
    destaque: [base, ...(S.finalHe ? [S.finalHe] : [])],
    comparar: [{ glifo: S.parHe, nome: S.parNomePt, som: S.parSom, audioId: null, notaPt: S.irmaoPt }],
    outrosGlifos: unicos([S.parHe, ...GLIFOS_RESERVA]).filter(g => g !== S.he),
    outrosSons: unicos([S.parSom, ...SONS_RESERVA]).filter(s => s !== S.som)
  };
}
