import type { Traducao } from '..';

/* components/learn/ExercisePlayer.tsx */
const pt = {
  boa: 'Boa! É essa mesma.',
  quaseTroca: 'Quase!',
  quase: 'Quase. Olhe com calma:',
  aCerta: (nome: string) => `a certa: ${nome}`,
  aEscolhida: (nome: string) => `a escolhida: ${nome}`,
  observeAsDuas: 'Observe as duas letras.',
  volta: 'Esta questão volta daqui a pouco, para você acertar.',
  semTranslit: 'Você acabou de ler hebraico sem transliteração.',
  decodificou: 'Sem o apoio embaixo, sem decorar - você decodificou. É isto que o curso inteiro estava construindo.',
  verResultado: 'Ver resultado',
  continuar: 'Continuar',
  ouvir: 'Ouvir',
  sinalNaoFaz: (som: string) => `Esse sinal não faz “${som}”.`,
  ordemNaoFecha: 'A ordem não fecha. Em hebraico a primeira letra fica à direita.',
  paresErrados: (n: number) => `Você juntou ${n === 1 ? 'um par' : `${n} pares`} que não combinam.`,
  primeiraTentativa: (posicao: number, esperada: string, posta: string) =>
    `Na primeira tentativa, a ${posicao}ª letra era ${esperada}, e não ${posta}.`,
  procure: 'procure',
  leitura: 'leitura ←',
  assimQueSoa: 'é assim que soa',
  ouvirDeNovo: 'Ouvir de novo',
  posicao: (n: number) => `Posição ${n}`,
  seguidas: (n: number) => `${n} acertos seguidos!`
} as const;

const en: Traducao<typeof pt> = {
  boa: 'Nice! That\'s the one.',
  quaseTroca: 'Almost!',
  quase: 'Almost. Take a careful look:',
  aCerta: nome => `the right one: ${nome}`,
  aEscolhida: nome => `your choice: ${nome}`,
  observeAsDuas: 'Look closely at the two letters.',
  volta: 'This question comes back in a little while, so you can get it right.',
  semTranslit: 'You just read Hebrew without transliteration.',
  decodificou: 'No support underneath, no memorizing - you decoded it. This is what the whole course has been building toward.',
  verResultado: 'See result',
  continuar: 'Continue',
  ouvir: 'Listen',
  sinalNaoFaz: som => `That sign does not make “${som}”.`,
  ordemNaoFecha: 'The order is off. In Hebrew the first letter goes on the right.',
  paresErrados: n => `You matched ${n === 1 ? 'a pair' : `${n} pairs`} that do not go together.`,
  primeiraTentativa: (posicao, esperada, posta) =>
    `On your first try, letter number ${posicao} was ${esperada}, not ${posta}.`,
  procure: 'look for',
  leitura: 'reading ←',
  assimQueSoa: 'this is how it sounds',
  ouvirDeNovo: 'Listen again',
  posicao: n => `Position ${n}`,
  seguidas: n => `${n} in a row!`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
