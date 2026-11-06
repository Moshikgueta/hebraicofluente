import type { Traducao } from '..';

/* components/platform/TrilhaDoModulo.tsx - o caminho no painel, e
 * components/aventura/estrada-do-modulo.ts - a estrada do curso inteiro. */
const pt = {
  titulo: (n: number) => `Seu caminho no módulo ${n}`,
  tituloCurso: 'Seu caminho no curso',
  verOMapa: 'Ver o mapa →',
  modulo: (n: number) => `Módulo ${n}`,
  abrirModulo: (n: number) => `Abrir o módulo ${n}`,
  feito: 'concluído',
  vem: 'ainda não',
  chegada: 'A chegada',
  certificado: 'Ver o certificado'
} as const;

const en: Traducao<typeof pt> = {
  titulo: (n: number) => `Your path in module ${n}`,
  tituloCurso: 'Your path through the course',
  verOMapa: 'See the map →',
  modulo: (n: number) => `Module ${n}`,
  abrirModulo: (n: number) => `Open module ${n}`,
  feito: 'done',
  vem: 'not yet',
  chegada: 'The finish line',
  certificado: 'See the certificate'
};

const es: Traducao<typeof pt> = {
  titulo: (n: number) => `Tu camino en el módulo ${n}`,
  tituloCurso: 'Tu camino en el curso',
  verOMapa: 'Ver el mapa →',
  modulo: (n: number) => `Módulo ${n}`,
  abrirModulo: (n: number) => `Abrir el módulo ${n}`,
  feito: 'completado',
  vem: 'todavía no',
  chegada: 'La llegada',
  certificado: 'Ver el certificado'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
