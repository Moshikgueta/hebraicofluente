import type { Traducao } from '..';

/* components/learn/SoundLab.tsx */
const pt = {
  titulo: 'Laboratório de sons',
  toque: 'toque numa sílaba para ouvir e ver como se lê',
  letra: 'Letra',
  silaba: (nome: string, vogal: string, translit: string) => `${nome} com ${vogal}: ${translit}`,
  deNovo: 'De novo',
  consoanteMuda:
    'A consoante muda de linha para linha. O sinal é o mesmo em toda a coluna - é isso que faz a leitura ficar automática.',
  ouvirNome: ': ouvir o nome'
} as const;

const en: Traducao<typeof pt> = {
  titulo: 'Sound lab',
  toque: 'tap a syllable to hear it and see how it reads',
  letra: 'Letter',
  silaba: (nome, vogal, translit) => `${nome} with ${vogal}: ${translit}`,
  deNovo: 'Again',
  consoanteMuda:
    'The consonant changes from row to row. The sign is the same down the whole column - that is what makes reading automatic.',
  ouvirNome: ': hear the name'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
