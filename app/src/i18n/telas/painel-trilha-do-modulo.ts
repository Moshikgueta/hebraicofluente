import type { Traducao } from '..';

/* components/platform/TrilhaDoModulo.tsx - o caminho do módulo no painel. */
const pt = {
  titulo: (n: number) => `Seu caminho no módulo ${n}`,
  verOMapa: 'Ver o mapa →',
  feita: 'concluída',
  daVez: 'a próxima',
  vem: 'ainda não',
  abrir: (rotulo: string) => `${rotulo}. Abrir a lição`,
  checkpoint: 'Checkpoint',
  checkpointDoModulo: (n: number, aprovado: boolean) => `Checkpoint do módulo ${n}${aprovado ? ': aprovado' : ''}`
} as const;

const en: Traducao<typeof pt> = {
  titulo: (n: number) => `Your path in module ${n}`,
  verOMapa: 'See the map →',
  feita: 'done',
  daVez: 'up next',
  vem: 'not yet',
  abrir: (rotulo: string) => `${rotulo}. Open the lesson`,
  checkpoint: 'Checkpoint',
  checkpointDoModulo: (n: number, aprovado: boolean) => `Module ${n} checkpoint${aprovado ? ': passed' : ''}`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
