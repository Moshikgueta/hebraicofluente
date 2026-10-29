import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/som/[id]/SomLessonClient.tsx (e as peças que ContrasteClient importa
   dele: Trancada, useDestino, Par, Linha). */
const pt = {
  conhecer: 'Conhecer',
  palavras: 'Palavras',
  ler: 'Ler',
  contraste: 'Contraste',
  fixacao: 'Fixação',
  exercicios: 'Exercícios',
  naoAbriu: (nome: string) => `O som ${nome} ainda não abriu`,
  mapa: '← Mapa',
  badge: (modulo: number, licao: number, nome: string) => `Módulo ${modulo} · lição ${licao} · som ${nome}`,
  etapas: 'Etapas da lição',
  etapaDe: (n: number, rotulo: string) => `Etapa ${n} de 5 - ${rotulo}`,
  exerciciosSom: (nome: string) => `Exercícios - som ${nome}`,
  emSeguidaPares: 'Em seguida: os três pares lado a lado',
  emSeguidaSom: (nome: string) => `Em seguida: o som ${nome}`,
  emSeguidaLetra: (nome: string) => `Em seguida: letra ${nome}`,
  emSeguidaCheckpoint: (n: number) => `Em seguida: Checkpoint ${n}`,
  emSeguidaSons: 'Em seguida: os três sons juntos, e o fecho do alfabeto',
  deVolta: 'De volta ao mapa do curso',
  trancadaAula0: 'Antes das letras e dos sons, conclua a Aula 0.',
  trancadaLicao: (anterior: ReactNode): ReactNode =>
    <>Esta lição vem depois de {anterior}, e essa lição ainda não foi concluída.</>,
  trancadaNota: (anterior: ReactNode, nota: number, libera: number): ReactNode =>
    <>Faltam os exercícios de {anterior}: sua melhor nota lá foi {nota}%, e esta lição abre a partir de {libera}%.</>,
  irPara: (nome: string) => `Ir para ${nome}`,
  verMapa: 'Ver o mapa',
  noFimDaPalavraTitulo: 'No fim da palavra',
  noComeco: 'no começo e no meio',
  noFim: 'no fim',
  noFimAMao: 'no fim, à mão',
  finalMuda: (nome: string) =>
    `No fim da palavra a letra muda de desenho e desce abaixo da linha. Ela nunca leva o ponto dentro, então no fim o som é sempre o do ${nome}.`,
  formaFinal: (nome: string) => `${nome} - forma final`,
  noFimDaPalavra: 'no fim da palavra',
  ouvir: (nome: string) => `Ouvir ${nome}`,
  comoPronunciar: 'Como pronunciar?',
  soaComo: (como: ReactNode): ReactNode => <>Soa como {como}.</>,
  quandoTem: 'Quando a letra tem este som?',
  comCadaVogal: 'O som com cada vogal',
  emTodas: (rotulo: string) => `${rotulo}, em todas. Leia da direita para a esquerda.`,
  entendeu: 'Entendeu? Perguntas rápidas',
  naoVaiNota: 'Não vale nota e não tranca nada. Se errar, a explicação aparece na hora.',
  fechoBom: 'Boa. Agora as palavras que têm este som.',
  fechoParcial: 'Vale reler o quadro "Quando a letra tem este som" - é a decisão que você vai tomar em toda palavra.',
  continuarPalavras: 'Continuar para as palavras',
  palavrasComOSom: (nome: string) => `Palavras com o som ${nome}`,
  vieramDeFora: 'Palavras que vieram de fora: você já sabe como soam. Leia antes de revelar.',
  tenteLer: (rotulo: string) => `Tente ler antes de revelar. A letra destacada está ${rotulo}.`,
  comparepalavras: 'Compare a sua leitura das palavras com a do curso',
  continuarLeitura: 'Continuar para a leitura',
  continuarContraste: 'Continuar para o contraste',
  lerEmVozAlta: (nome: string) => `Ler o ${nome} em voz alta`,
  soOSom: (som: ReactNode, final: ReactNode): ReactNode =>
    <>Só o som {som}, sem pressa. Leia cada sílaba e cada palavra em voz alta, da direita para a esquerda{final ? <>, e repare no {final} do fim da palavra</> : null}.</>,
  comOSom: (som: string) => `Com o som ${som} · `,
  leiaPalavras: 'Leia as palavras em voz alta',
  leiaPalavrasInstrucao: (som: string, somMaiusculo: string) =>
    `Leia as palavras com ${som}, grave e confira se o som saiu ${somMaiusculo} em todas.`,
  continuarFixacao: 'Continuar para a fixação',
  ouPar: (par: string, nome: string) => `${par} ou ${nome}?`,
  ladoALado: (parRotulo: string, rotulo: string, parSom: ReactNode, som: ReactNode): ReactNode =>
    <>Lado a lado: {parRotulo} e {rotulo}. Leia cada linha em voz alta, primeiro a coluna da direita e depois a da esquerda, e sinta a boca mudar: {parSom} e {som}.</>,
  comTraco: (parHe: ReactNode, parSom: ReactNode, he: ReactNode, som: ReactNode): ReactNode =>
    <>Lado a lado, com e sem o traço. Sem ele, {parHe} é {parSom}; com ele, {he} é {som}.</>,
  leiaColunas: 'Leia as duas colunas em voz alta',
  leiaColunasInstrucao: (som: string, parSom: string) =>
    `Leia as palavras com ${som} e depois as com ${parSom}, grave e confira se a diferença aparece.`,
  ouvirItem: (translit: string) => `Ouvir ${translit}`,
  placar: (certas: number, total: number, pct: number) => `${certas} de ${total} · ${pct}%`,
  firme: (nome: string) => `O som ${nome} está firme.`,
  vamosFirmar: (nome: string) => `Vamos firmar o ${nome}.`,
  daguheshBom: (he: string, rotulo: string, som: string) =>
    `Você lê ${he} ${rotulo} como ${som}, com cada vogal. Pode seguir.`,
  daguheshRefaca: (libera: number) =>
    `Refaça quando quiser: as perguntas mudam. A próxima lição abre a partir de ${libera}%.`,
  decideBom: (parSom: string, som: string) => `Você decide entre ${parSom} e ${som} olhando a letra. Pode seguir.`,
  decideRefaca: (parSom: string, som: string, libera: number) =>
    `Refaça quando quiser: as perguntas mudam, e o que conta é decidir entre ${parSom} e ${som} sem hesitar. A próxima lição abre a partir de ${libera}%.`,
  refazer: 'Refazer os exercícios',
  concluir: 'Concluir e continuar'
} as const;

const en: Traducao<typeof pt> = {
  conhecer: 'Meet',
  palavras: 'Words',
  ler: 'Read',
  contraste: 'Contrast',
  fixacao: 'Reinforce',
  exercicios: 'Exercises',
  naoAbriu: nome => `The sound ${nome} is not open yet`,
  mapa: '← Map',
  badge: (modulo, licao, nome) => `Module ${modulo} · lesson ${licao} · sound ${nome}`,
  etapas: 'Lesson steps',
  etapaDe: (n, rotulo) => `Step ${n} of 5 - ${rotulo}`,
  exerciciosSom: nome => `Exercises - sound ${nome}`,
  emSeguidaPares: 'Next: the three pairs side by side',
  emSeguidaSom: nome => `Next: the sound ${nome}`,
  emSeguidaLetra: nome => `Next: the letter ${nome}`,
  emSeguidaCheckpoint: n => `Next: Checkpoint ${n}`,
  emSeguidaSons: 'Next: the three sounds together, and the end of the alphabet',
  deVolta: 'Back to the course map',
  trancadaAula0: 'Before the letters and the sounds, finish Lesson 0.',
  trancadaLicao: anterior => <>This lesson comes after {anterior}, and that lesson is not finished yet.</>,
  trancadaNota: (anterior, nota, libera) =>
    <>The exercises for {anterior} are still to do: your best score there was {nota}%, and this lesson opens at {libera}%.</>,
  irPara: nome => `Go to ${nome}`,
  verMapa: 'See the map',
  noFimDaPalavraTitulo: 'At the end of a word',
  noComeco: 'at the start and in the middle',
  noFim: 'at the end',
  noFimAMao: 'at the end, by hand',
  finalMuda: nome =>
    `At the end of a word the letter changes shape and drops below the line. It never takes the dot inside, so at the end the sound is always the ${nome} sound.`,
  formaFinal: nome => `${nome} - final form`,
  noFimDaPalavra: 'at the end of a word',
  ouvir: nome => `Listen to ${nome}`,
  comoPronunciar: 'How do you pronounce it?',
  // etapa 3: pronúncia, rever
  soaComo: como => <>It sounds like {como}.</>,
  quandoTem: 'When does the letter have this sound?',
  comCadaVogal: 'The sound with each vowel',
  emTodas: rotulo => `${rotulo}, in all of them. Read from right to left.`,
  entendeu: 'Got it? Quick questions',
  naoVaiNota: 'Not scored and nothing gets locked. If you get one wrong, the explanation appears right away.',
  fechoBom: 'Nice. Now the words that have this sound.',
  fechoParcial: 'Worth rereading the box "When does the letter have this sound" - it is the decision you will make in every word.',
  continuarPalavras: 'Continue to the words',
  palavrasComOSom: nome => `Words with the sound ${nome}`,
  vieramDeFora: 'Words that came from other languages: you already know how they sound. Read before revealing.',
  tenteLer: rotulo => `Try to read before revealing. The highlighted letter is ${rotulo}.`,
  comparepalavras: 'Compare your reading of the words with the course',
  continuarLeitura: 'Continue to the reading',
  continuarContraste: 'Continue to the contrast',
  lerEmVozAlta: nome => `Read ${nome} aloud`,
  soOSom: (som, final) =>
    <>Just the sound {som}, no rush. Read each syllable and each word aloud, from right to left{final ? <>, and notice the {final} at the end of the word</> : null}.</>,
  comOSom: som => `With the sound ${som} · `,
  leiaPalavras: 'Read the words aloud',
  leiaPalavrasInstrucao: (som, somMaiusculo) =>
    `Read the words with ${som}, record yourself and check that the sound came out as ${somMaiusculo} in all of them.`,
  continuarFixacao: 'Continue to Reinforce',
  ouPar: (par, nome) => `${par} or ${nome}?`,
  ladoALado: (parRotulo, rotulo, parSom, som) =>
    <>Side by side: {parRotulo} and {rotulo}. Read each row aloud, first the right column and then the left, and feel your mouth change: {parSom} and {som}.</>,
  comTraco: (parHe, parSom, he, som) =>
    <>Side by side, with and without the mark. Without it, {parHe} is {parSom}; with it, {he} is {som}.</>,
  leiaColunas: 'Read both columns aloud',
  leiaColunasInstrucao: (som, parSom) =>
    `Read the words with ${som} and then the ones with ${parSom}, record yourself and check that the difference comes through.`,
  ouvirItem: translit => `Listen to ${translit}`,
  placar: (certas, total, pct) => `${certas} of ${total} · ${pct}%`,
  firme: nome => `The sound ${nome} is solid.`,
  vamosFirmar: nome => `Let's make ${nome} solid.`,
  daguheshBom: (he, rotulo, som) =>
    `You read ${he} ${rotulo} as ${som}, with every vowel. You can move on.`,
  daguheshRefaca: libera =>
    `Redo it whenever you like: the questions change. The next lesson opens at ${libera}%.`,
  decideBom: (parSom, som) => `You choose between ${parSom} and ${som} by looking at the letter. You can move on.`,
  decideRefaca: (parSom, som, libera) =>
    `Redo it whenever you like: the questions change, and what counts is choosing between ${parSom} and ${som} without hesitating. The next lesson opens at ${libera}%.`,
  refazer: 'Redo the exercises',
  concluir: 'Finish and continue'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
