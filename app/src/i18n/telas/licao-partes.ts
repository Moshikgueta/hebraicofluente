import type { Traducao } from '..';

/* components/learn/Partes.tsx */
const pt = {
  fecharTodas: 'Fechar todas as partes',
  abrirTodas: 'Abrir todas as partes'
} as const;

const en: Traducao<typeof pt> = {
  fecharTodas: 'Close all sections',
  abrirTodas: 'Open all sections'
};

const es: Traducao<typeof pt> = {
  fecharTodas: 'Cerrar todas las partes',
  abrirTodas: 'Abrir todas las partes'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
