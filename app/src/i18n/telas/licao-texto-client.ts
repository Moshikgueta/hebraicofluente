import type { Traducao } from '..';

/* app/modulo/[n]/texto/TextoClient.tsx */
const pt = {
  semRevisao: 'Este módulo ainda não tem leitura de revisão.',
  semTexto: 'Este módulo ainda não tem texto de leitura.',
  voltarAoModulo: 'Voltar ao módulo',
  modulo: (n: number) => `← Módulo ${n}`,
  leituraDeRevisao: (n: number) => `Leitura de revisão · módulo ${n}`,
  leituraDoModulo: (n: number) => `Leitura do módulo ${n}`,
  segundaLeitura: (n: number) => `Segunda leitura do módulo ${n}`,
  leiaEmVozAlta: 'Leia o texto em voz alta',
  leiaInstrucao: 'Leia o texto inteiro, sem parar em cada palavra, grave e se ouça. Depois leia de novo e compare.',
  nomesEPartes: 'Nomes e partes grudadas na palavra',
  palavrasNovas: 'Palavras novas neste texto',
  ouvir: (translit: string) => `Ouvir ${translit}`,
  entendeu: 'Você entendeu?',
  responda: 'Responda pelo que leu. Não vale nota: o motivo aparece a cada resposta.',
  fechoBom: 'Você leu um texto inteiro em hebraico e entendeu. É para isto que o alfabeto serve.',
  fechoParcial: 'Volte ao texto e toque nas linhas que travaram. Na segunda leitura ele fica mais fácil.',
  entraram: '✓ As palavras novas deste texto entraram no seu vocabulário e no treino de palavras à mão.'
} as const;

const en: Traducao<typeof pt> = {
  semRevisao: 'This module does not have a review reading yet.',
  semTexto: 'This module does not have a reading text yet.',
  voltarAoModulo: 'Back to the module',
  modulo: n => `← Module ${n}`,
  leituraDeRevisao: n => `Review reading · module ${n}`,
  leituraDoModulo: n => `Module ${n} reading`,
  segundaLeitura: n => `Module ${n} second reading`,
  leiaEmVozAlta: 'Read the text aloud',
  leiaInstrucao: 'Read the whole text without stopping at each word, record yourself and listen. Then read it again and compare.',
  nomesEPartes: 'Names and parts attached to the word',
  palavrasNovas: 'New words in this text',
  ouvir: translit => `Listen to ${translit}`,
  entendeu: 'Did you understand it?',
  responda: 'Answer based on what you read. It is not scored: the reason appears after each answer.',
  fechoBom: 'You read a whole text in Hebrew and understood it. This is what the alphabet is for.',
  fechoParcial: 'Go back to the text and tap the lines that tripped you up. It gets easier the second time.',
  entraram: '✓ The new words from this text are now in your vocabulary and in the Words by hand practice.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
