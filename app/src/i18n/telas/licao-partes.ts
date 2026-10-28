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

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
