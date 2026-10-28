import type { Traducao } from '..';

/* components/game/TesteFinal.tsx */
const pt = {
  titulo: 'Teste final do alfabeto',
  complete: 'Complete todas as letras para desbloquear o teste final.',
  faltam: (n: number) => (n === 1 ? 'Falta 1 letra.' : `Faltam ${n} letras.`),
  desbloqueado: 'Teste final desbloqueado!',
  /* As quebras de linha e os espaços são os do texto de antes: o navegador
     os junta num espaço só. */
  fechou: (letras: number, partes: number) => `Você fechou as ${letras} letras. O teste final mede o alfabeto
             inteiro, em ${partes} partes.`,
  resumo: (letras: number, partes: number) => `As ${letras} letras, em ${partes} partes, sem transliteração
             para se apoiar.`,
  refazer: 'Refazer o teste final',
  fazer: 'Fazer o teste final'
} as const;

const en: Traducao<typeof pt> = {
  titulo: 'Final alphabet test',
  complete: 'Complete all the letters to unlock the final test.',
  faltam: n => (n === 1 ? '1 letter to go.' : `${n} letters to go.`),
  desbloqueado: 'Final test unlocked!',
  fechou: (letras, partes) => `You have finished all ${letras} letters. The final test covers the whole alphabet, in ${partes} parts.`,
  resumo: (letras, partes) => `All ${letras} letters, in ${partes} parts, with no transliteration to lean on.`,
  refazer: 'Retake the final test',
  fazer: 'Take the final test'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
