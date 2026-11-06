import type { Traducao } from '..';

/* O que a Yael diz nos balões (components/aventura/Yael.tsx, YaelDiz).
   Frases curtas, sempre em português (o hebraico só entra pelo curso). */
const pt = {
  oi: 'Oi! Eu sou a Yael. Vou com você pelas 22 letras.',
  fimAula0: 'Pronto! Agora a gente começa pelas letras.',
  lugarNovo: (lugar: string) => `Chegamos! Vamos explorar ${lugar}?`,
  moduloFechado: (n: number) => `Módulo ${n} fechado! Que orgulho.`,
  checkpointQuase: 'Quase! A gente tenta de novo, junto.',
  alfabeto: 'As 22 letras são suas. Que viagem a gente fez!'
} as const;

const en: Traducao<typeof pt> = {
  oi: "Hi! I'm Yael. I'll go with you through all 22 letters.",
  fimAula0: "All set! Now we start with the letters.",
  lugarNovo: lugar => `We made it! Shall we explore ${lugar}?`,
  moduloFechado: n => `Module ${n} done! So proud of you.`,
  checkpointQuase: "Almost! Let's try again, together.",
  alfabeto: 'All 22 letters are yours. What a journey we had!'
};

const es: Traducao<typeof pt> = {
  oi: '¡Hola! Soy Yael. Voy contigo por las 22 letras.',
  fimAula0: '¡Listo! Ahora empezamos con las letras.',
  lugarNovo: lugar => `¡Llegamos! ¿Exploramos ${lugar}?`,
  moduloFechado: n => `¡Módulo ${n} terminado! Qué orgullo.`,
  checkpointQuase: '¡Casi! Lo intentamos de nuevo, juntos.',
  alfabeto: 'Las 22 letras son tuyas. ¡Qué viaje hicimos!'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
