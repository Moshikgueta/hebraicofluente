import type { Traducao } from '..';

/* lib/motivos-desistencia.ts - os motivos (opcionais) de quem desiste da
   compra. A mesma lista em português está em worker/src/lib/motivos.js. */
const pt = {
  esperava: 'O curso não era o que eu esperava',
  tempo: 'Não tenho tempo agora',
  dificil: 'Achei difícil',
  tecnico: 'Tive um problema técnico',
  engano: 'Comprei por engano',
  outro: 'Outro motivo'
} as const;

const en: Traducao<typeof pt> = {
  esperava: 'The course was not what I expected',
  tempo: 'I do not have time right now',
  dificil: 'I found it hard',
  tecnico: 'I had a technical problem',
  engano: 'I bought it by mistake',
  outro: 'Another reason'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
