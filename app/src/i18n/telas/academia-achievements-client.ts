import type { Traducao } from '..';

/* app/conquistas/AchievementsClient.tsx */
const pt = {
  localeNumero: 'pt-BR',
  titulo: 'Seu progresso',
  seusNumeros: 'Seus números',
  xp: 'XP',
  letras: 'Letras',
  sequencia: 'Sequência',
  recorde: 'Recorde',
  colecao: 'Sua coleção de letras',
  deTotal: (n: number, total: number) => `${n} de ${total}`,
  colecaoTexto: 'Cada letra concluída vira uma carta, e o selo dourado marca as dominadas. Toque numa carta para rever a lição.',
  conquistas: 'Conquistas',
  viagem: 'Viagem pela história do hebraico',
  cartasAbertas: (abertas: number, total: number) => `${abertas} de ${total} cartas abertas`,
  recompensas: 'Recompensas',
  saldo: (saldo: string) => `◆ ${saldo} de saldo para trocar`,
  recomecar: 'Recomeçar do zero',
  recomecarTexto: 'Apaga todo o seu progresso, em todos os aparelhos: XP, sequência, lições e revisões. Não dá para desfazer.',
  confirmarApagar: 'Apagar todo o seu progresso? Isso não pode ser desfeito.',
  apagar: 'Apagar progresso'
} as const;

const en: Traducao<typeof pt> = {
  localeNumero: 'en-US',
  titulo: 'Your progress',
  seusNumeros: 'Your numbers',
  xp: 'XP',
  letras: 'Letters',
  sequencia: 'Streak',
  recorde: 'Best streak',
  colecao: 'Your letter collection',
  deTotal: (n, total) => `${n} of ${total}`,
  colecaoTexto: 'Each completed letter becomes a card, and the gold seal marks the mastered ones. Tap a card to review the lesson.',
  conquistas: 'Achievements',
  viagem: 'Journey through the history of Hebrew',
  cartasAbertas: (abertas, total) => `${abertas} of ${total} cards open`,
  recompensas: 'Rewards',
  saldo: saldo => `◆ ${saldo} balance to trade`,
  recomecar: 'Start over from scratch',
  recomecarTexto: 'Erases all your progress, on every device: XP, streak, lessons and reviews. This cannot be undone.',
  confirmarApagar: 'Erase all your progress? This cannot be undone.',
  apagar: 'Erase progress'
};

const es: Traducao<typeof pt> = {
  localeNumero: 'es-419',
  titulo: 'Tu progreso',
  seusNumeros: 'Tus números',
  xp: 'XP',
  letras: 'Letras',
  sequencia: 'Racha',
  recorde: 'Mejor racha',
  colecao: 'Tu colección de letras',
  deTotal: (n, total) => `${n} de ${total}`,
  colecaoTexto: 'Cada letra terminada se convierte en una tarjeta, y el sello dorado marca las dominadas. Toca una tarjeta para repasar la lección.',
  conquistas: 'Logros',
  viagem: 'Viaje por la historia del hebreo',
  cartasAbertas: (abertas, total) => `${abertas} de ${total} tarjetas abiertas`,
  recompensas: 'Recompensas',
  saldo: saldo => `◆ ${saldo} de saldo para canjear`,
  recomecar: 'Empezar de cero',
  recomecarTexto: 'Borra todo tu progreso, en todos los dispositivos: XP, racha, lecciones y repasos. No se puede deshacer.',
  confirmarApagar: '¿Borrar todo tu progreso? Esto no se puede deshacer.',
  apagar: 'Borrar progreso'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
