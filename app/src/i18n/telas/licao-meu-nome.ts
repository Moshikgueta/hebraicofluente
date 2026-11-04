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

const es: Traducao<typeof pt> = {
  montagem: 'Tu nombre en hebreo. Toca una letra para quitarla.',
  toqueNasLetras: 'toca las letras de abajo',
  tirarEspaco: 'Quitar el espacio',
  tirarLetra: g => `Quitar la letra ${g}`,
  disponiveis: 'Letras disponibles',
  porLetra: g => `Poner la letra ${g}`,
  // etapa 3: pronúncia, rever
  porGeresh: 'Poner el guéresh, el signo de ZH, Y y CH',
  // etapa 3: pronúncia, rever
  gereshDica: 'El ׳ convierte ז en ZH, ג en Y y צ en CH',
  espaco: 'espacio',
  seuNomeEmHebraico: 'Tu nombre en hebreo',
  seuNome: 'Tu nombre',
  praticarOuMudar: 'Practicar o cambiar',
  escreva: 'Escribe tu nombre en hebreo',
  jaConsegue: 'Ahora ya puedes escribir tu nombre en hebreo.',
  todasAsLetras: nome => `Todas las letras de “${nome}” ya pasaron por tus lecciones.`,
  escrever: 'Escribir mi nombre',
  faltam: (n, nome) =>
    n === 1
      ? `Te falta 1 letra para escribir “${nome}” en hebreo.`
      : `Te faltan ${n} letras para escribir “${nome}” en hebreo.`
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
