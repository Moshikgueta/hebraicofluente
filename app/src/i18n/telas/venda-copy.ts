import type { Traducao } from '..';

/* components/landing/copy.ts: as afirmações da página de venda. Cada frase
   sobre gravação tem as duas versões (com e sem áudio); quem escolhe continua
   sendo o manifesto, lá no copy.ts. */
const pt = {
  aulaLabel: 'Aula',
  aulaKicker: 'Aprender',
  aulaTitle: 'A letra primeiro, sempre sozinha.',
  aulaBodyAudio: 'Uma forma por tela. O nome, o som, o áudio e a explicação em português - nada mais disputando atenção.',
  aulaBodySemAudio: 'Uma forma por tela. O nome, o som e a explicação em português - nada mais disputando atenção.',
  aulaPontoAudio: 'Áudio gravado por falante nativo',
  aulaPontoSemAudio: 'O som comparado com um som do português',
  aulaPonto2: 'Explicação escrita em português',
  aulaPonto3: 'Uma palavra de exemplo, já com nikud',

  escritaLabel: 'Escrita',
  escritaKicker: 'Escrever',
  escritaTitle: 'Você escreve a letra, com o dedo na tela.',
  escritaBody: 'O curso mostra a ordem dos traços e depois devolve a caneta para você. Escrever é o que separa reconhecer de saber - a mão aprende o que o olho só reconhece.',
  escritaPonto1: 'A ordem dos traços, movimento a movimento',
  escritaPonto2: 'Traçado com o dedo, direto no celular',
  escritaPonto3: 'A forma exata da cursiva israelense, e não um desenho aproximado',

  praticaLabel: 'Prática',
  praticaKicker: 'Fixar',
  praticaTitleAudio: 'Cinco tipos de exercício, alternados.',
  praticaTitleSemAudio: 'Quatro tipos de exercício, alternados.',
  praticaBodyAudio: 'Múltipla escolha, digitação, associação, escuta e leitura. A alternância é o que impede a decoreba.',
  praticaBodySemAudio: 'Múltipla escolha, digitação, associação e leitura. A alternância é o que impede a decoreba.',
  praticaPonto1: 'Correção imediata, com explicação',
  praticaPonto2: 'Erro não bloqueia: você tenta de novo',
  praticaPonto3: 'Nos jogos, a dificuldade sobe conforme você acerta',

  revisaoLabel: 'Revisão',
  revisaoKicker: 'Consolidar',
  revisaoTitle: 'O que você errou volta na hora certa.',
  revisaoBody: 'As letras que ainda escapam reaparecem em intervalos crescentes, até ficarem automáticas.',
  revisaoPonto1: 'Revisões curtas, de 3 a 5 minutos',
  revisaoPonto2: 'Só o que precisa - não repete o que já domina',
  revisaoPonto3: 'Aviso quando há revisão pendente',

  progressoLabel: 'Progresso',
  progressoKicker: 'Acompanhar',
  progressoTitle: 'Você vê exatamente onde está.',
  progressoBody: 'Letras dominadas, letras em progresso, letras a revisar. Sem pontuação inflada: o número reflete leitura real.',
  progressoPonto1: 'Percentual por módulo',
  progressoPonto2: 'Mapa de domínio das 22 letras',
  progressoPonto3: 'Tempo de estudo por semana',

  maquetePraticaRotuloAudio: 'Escuta',
  maquetePraticaRotuloSemAudio: 'Reconhecer',
  maquetePraticaPerguntaAudio: 'Qual som você ouviu?',
  maquetePraticaPerguntaSemAudio: 'Qual destas letras faz o som SH?',
  maqueteHeroiPergunta: 'Qual é o som desta letra?'
} as const;

const en: Traducao<typeof pt> = {
  aulaLabel: 'Lesson',
  aulaKicker: 'Learn',
  aulaTitle: 'The letter first, always on its own.',
  aulaBodyAudio: 'One form per screen. The name, the sound, the audio and the explanation in English - nothing else competing for attention.',
  aulaBodySemAudio: 'One form per screen. The name, the sound and the explanation in English - nothing else competing for attention.',
  aulaPontoAudio: 'Audio recorded by a native speaker',
  // etapa 3: pronúncia, rever
  aulaPontoSemAudio: 'The sound compared with a sound in English',
  aulaPonto2: 'Written explanation in English',
  aulaPonto3: 'An example word, already with nikud',

  escritaLabel: 'Writing',
  escritaKicker: 'Write',
  escritaTitle: 'You write the letter with your finger on the screen.',
  escritaBody: 'The course shows the stroke order and then hands the pen back to you. Writing is what separates recognizing from knowing - the hand learns what the eye only recognizes.',
  escritaPonto1: 'The stroke order, movement by movement',
  escritaPonto2: 'Trace with your finger, right on your phone',
  escritaPonto3: 'The exact shape of Israeli cursive, not a rough drawing',

  praticaLabel: 'Practice',
  praticaKicker: 'Reinforce',
  praticaTitleAudio: 'Five types of exercise, mixed together.',
  praticaTitleSemAudio: 'Four types of exercise, mixed together.',
  praticaBodyAudio: 'Multiple choice, typing, matching, listening and reading. Mixing them is what keeps you from rote memorizing.',
  praticaBodySemAudio: 'Multiple choice, typing, matching and reading. Mixing them is what keeps you from rote memorizing.',
  praticaPonto1: 'Instant feedback, with an explanation',
  praticaPonto2: 'A mistake does not block you: you try again',
  praticaPonto3: 'In the games, the difficulty goes up as you get answers right',

  revisaoLabel: 'Review',
  revisaoKicker: 'Consolidate',
  revisaoTitle: 'What you got wrong comes back at the right time.',
  revisaoBody: 'The letters that still slip away come back at growing intervals until they become automatic.',
  revisaoPonto1: 'Short reviews, 3 to 5 minutes',
  revisaoPonto2: 'Only what you need - it does not repeat what you already know',
  revisaoPonto3: 'A reminder when a review is due',

  progressoLabel: 'Progress',
  progressoKicker: 'Track',
  progressoTitle: 'You see exactly where you are.',
  progressoBody: 'Letters mastered, letters in progress, letters to review. No inflated scores: the number reflects real reading.',
  progressoPonto1: 'Percentage per module',
  progressoPonto2: 'A mastery map of the 22 letters',
  progressoPonto3: 'Study time per week',

  maquetePraticaRotuloAudio: 'Listening',
  maquetePraticaRotuloSemAudio: 'Recognize',
  maquetePraticaPerguntaAudio: 'Which sound did you hear?',
  maquetePraticaPerguntaSemAudio: 'Which of these letters makes the SH sound?',
  maqueteHeroiPergunta: 'What sound does this letter make?'
};

const es: Traducao<typeof pt> = {
  aulaLabel: 'Clase',
  aulaKicker: 'Aprender',
  aulaTitle: 'La letra primero, siempre sola.',
  aulaBodyAudio: 'Una forma por pantalla. El nombre, el sonido, el audio y la explicación en español - nada más compitiendo por tu atención.',
  aulaBodySemAudio: 'Una forma por pantalla. El nombre, el sonido y la explicación en español - nada más compitiendo por tu atención.',
  aulaPontoAudio: 'Audio grabado por un hablante nativo',
  // etapa 3: pronúncia, rever
  aulaPontoSemAudio: 'El sonido comparado con un sonido del español',
  aulaPonto2: 'Explicación escrita en español',
  aulaPonto3: 'Una palabra de ejemplo, ya con nikud',

  escritaLabel: 'Escritura',
  escritaKicker: 'Escribir',
  escritaTitle: 'Escribes la letra con el dedo en la pantalla.',
  escritaBody: 'El curso muestra el orden de los trazos y después te devuelve la pluma. Escribir es lo que separa reconocer de saber - la mano aprende lo que el ojo solo reconoce.',
  escritaPonto1: 'El orden de los trazos, movimiento a movimiento',
  escritaPonto2: 'Trazado con el dedo, directo en el celular',
  escritaPonto3: 'La forma exacta de la cursiva israelí, y no un dibujo aproximado',

  praticaLabel: 'Práctica',
  praticaKicker: 'Fijar',
  praticaTitleAudio: 'Cinco tipos de ejercicio, alternados.',
  praticaTitleSemAudio: 'Cuatro tipos de ejercicio, alternados.',
  praticaBodyAudio: 'Opción múltiple, escritura, asociación, escucha y lectura. La alternancia es lo que evita memorizar sin entender.',
  praticaBodySemAudio: 'Opción múltiple, escritura, asociación y lectura. La alternancia es lo que evita memorizar sin entender.',
  praticaPonto1: 'Corrección inmediata, con explicación',
  praticaPonto2: 'Un error no te bloquea: lo intentas de nuevo',
  praticaPonto3: 'En los juegos, la dificultad sube a medida que aciertas',

  revisaoLabel: 'Repaso',
  revisaoKicker: 'Consolidar',
  revisaoTitle: 'Lo que fallaste vuelve en el momento justo.',
  revisaoBody: 'Las letras que todavía se te escapan reaparecen en intervalos cada vez más largos, hasta volverse automáticas.',
  revisaoPonto1: 'Repasos cortos, de 3 a 5 minutos',
  revisaoPonto2: 'Solo lo que hace falta - no repite lo que ya dominas',
  revisaoPonto3: 'Aviso cuando hay un repaso pendiente',

  progressoLabel: 'Progreso',
  progressoKicker: 'Seguir',
  progressoTitle: 'Ves exactamente dónde estás.',
  progressoBody: 'Letras dominadas, letras en progreso, letras por repasar. Sin puntajes inflados: el número refleja lectura real.',
  progressoPonto1: 'Porcentaje por módulo',
  progressoPonto2: 'Mapa de dominio de las 22 letras',
  progressoPonto3: 'Tiempo de estudio por semana',

  maquetePraticaRotuloAudio: 'Escucha',
  maquetePraticaRotuloSemAudio: 'Reconocer',
  maquetePraticaPerguntaAudio: '¿Qué sonido escuchaste?',
  maquetePraticaPerguntaSemAudio: '¿Cuál de estas letras hace el sonido SH?',
  maqueteHeroiPergunta: '¿Cuál es el sonido de esta letra?'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
