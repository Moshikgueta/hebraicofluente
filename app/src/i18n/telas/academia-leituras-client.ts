import type { Traducao } from '..';

/* app/leituras/LeiturasClient.tsx e app/leituras/page.tsx */
const pt = {
  metaTitulo: 'Leituras - Hebraico Fluente',
  metaDescricao: 'Os exercícios de leitura do curso num lugar só: o laboratório, a Primeira Leitura, os mini-textos e as leituras de revisão.',

  titulo: 'Leituras',
  intro: 'Todos os exercícios de leitura do curso num lugar só, módulo por módulo. Cada um usa só as letras que você já aprendeu naquele ponto.',
  laboratorio: 'Laboratório de leitura',
  laboratorioDesc: 'Uma palavra por vez, com a ajuda que você escolher.',
  abrir: 'Abrir',
  modulo: (n: number, titulo: string) => `Módulo ${n} · ${titulo}`,
  primeira: 'Minha Primeira Leitura',
  primeiraDesc: 'Palavras do módulo para você ler sozinho e depois conferir.',
  primeiraDepois: 'Abre quando você concluir as letras do módulo.',
  texto: (tipo: string) => `Mini-texto · ${tipo}`,
  revisao: 'Leitura de revisão',
  revisaoDesc: 'Um texto só com palavras que você já acumulou.',
  feito: 'Feito',
  depoisDoModulo: (n: number) => `Chega com o módulo ${n}.`,
  nenhumaAinda: 'As leituras deste módulo aparecem quando os textos forem revisados.',
  bonus: 'Leituras bônus',
  bonusDesc: 'Textos bíblicos para trocar por XP em Recompensas.',
  feitas: (n: number, total: number) => `${n} de ${total} feitas`
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'Readings - Hebraico Fluente',
  metaDescricao: 'All the reading exercises of the course in one place: the lab, the First Reading, the short texts and the review readings.',

  titulo: 'Readings',
  intro: 'Every reading exercise of the course in one place, module by module. Each one uses only the letters you have already learned at that point.',
  laboratorio: 'Reading lab',
  laboratorioDesc: 'One word at a time, with the help you choose.',
  abrir: 'Open',
  modulo: (n: number, titulo: string) => `Module ${n} · ${titulo}`,
  primeira: 'My First Reading',
  primeiraDesc: 'Words from the module for you to read on your own and then check.',
  primeiraDepois: 'Opens when you complete the letters of the module.',
  texto: (tipo: string) => `Short text · ${tipo}`,
  revisao: 'Review reading',
  revisaoDesc: 'A text made only of words you have already collected.',
  feito: 'Done',
  depoisDoModulo: (n: number) => `Comes with module ${n}.`,
  nenhumaAinda: 'The readings of this module appear once the texts are reviewed.',
  bonus: 'Bonus readings',
  bonusDesc: 'Biblical texts to trade for XP in Rewards.',
  feitas: (n: number, total: number) => `${n} of ${total} done`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
