import type { Traducao } from '..';

/* components/learn/MeuNome.tsx */
const pt = {
  montagem: 'O seu nome em hebraico. Toque numa letra para tirá-la.',
  toqueNasLetras: 'toque nas letras abaixo',
  tirarEspaco: 'Tirar o espaço',
  tirarLetra: (g: string) => `Tirar a letra ${g}`,
  disponiveis: 'Letras disponíveis',
  porLetra: (g: string) => `Pôr a letra ${g}`,
  porGeresh: 'Pôr o guéresh, o sinal do J',
  gereshDica: 'O ׳ transforma ז em J, ג em DJ e צ em TCH',
  espaco: 'espaço',
  seuNomeEmHebraico: 'O seu nome em hebraico',
  seuNome: 'O seu nome',
  praticarOuMudar: 'Praticar ou mudar',
  escreva: 'Escreva o seu nome em hebraico',
  jaConsegue: 'Agora você já consegue escrever o seu nome em hebraico.',
  todasAsLetras: (nome: string) => `Todas as letras de “${nome}” já passaram pelas suas lições.`,
  escrever: 'Escrever o meu nome',
  faltam: (n: number, nome: string) =>
    n === 1
      ? `Falta 1 letra para você escrever “${nome}” em hebraico.`
      : `Faltam ${n} letras para você escrever “${nome}” em hebraico.`
} as const;

const en: Traducao<typeof pt> = {
  montagem: 'Your name in Hebrew. Tap a letter to remove it.',
  toqueNasLetras: 'tap the letters below',
  tirarEspaco: 'Remove the space',
  tirarLetra: g => `Remove the letter ${g}`,
  disponiveis: 'Available letters',
  porLetra: g => `Add the letter ${g}`,
  // etapa 3: pronúncia, rever
  porGeresh: 'Add the geresh, the sign for J, ZH and CH',
  // etapa 3: pronúncia, rever
  gereshDica: 'The ׳ turns ז into ZH (as in measure), ג into J and צ into CH',
  espaco: 'space',
  seuNomeEmHebraico: 'Your name in Hebrew',
  seuNome: 'Your name',
  praticarOuMudar: 'Practice or change',
  escreva: 'Write your name in Hebrew',
  jaConsegue: 'Now you can write your name in Hebrew.',
  todasAsLetras: nome => `Every letter of “${nome}” has already come up in your lessons.`,
  escrever: 'Write my name',
  faltam: (n, nome) =>
    n === 1
      ? `1 more letter and you can write “${nome}” in Hebrew.`
      : `${n} more letters and you can write “${nome}” in Hebrew.`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
