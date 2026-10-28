import type { Traducao } from '..';

/* Rótulos curtos de vários módulos de lib/ (uma família pequena):
   vocabulario.ts, tempo-de-etapa.ts, engine/jogos.ts, nome-decorado.ts,
   state/types.ts e account/local-api.ts. */
const pt = {
  /* lib/vocabulario.ts */
  leituraNenhuma: 'Ainda nenhuma palavra - ela chega com a próxima letra.',
  leituraUma: 'Você já consegue ler 1 palavra em hebraico.',
  leituraVarias: (n: number): string => `Você já consegue ler ${n} palavras em hebraico.`,
  /* lib/tempo-de-etapa.ts */
  faixa0: 'menos de 1 min',
  faixa1: '1 a 2 min',
  faixa2: '2 a 4 min',
  faixa3: '4 a 7 min',
  faixa4: '7 a 12 min',
  faixa5: '12 a 20 min',
  faixa6: '20 min ou mais',
  /* lib/engine/jogos.ts */
  nivelFacil: 'Aquecimento',
  nivelMedio: 'Treino',
  nivelDificil: 'Difícil',
  /* lib/nome-decorado.ts */
  formatoCelular: 'Papel de parede',
  formatoQuadrado: 'Quadrado',
  /* lib/state/types.ts */
  skillRec: 'Reconhecimento',
  skillSom: 'Som',
  skillLer: 'Leitura',
  skillOuvir: 'Audição',
  skillEscrever: 'Escrita',
  /* lib/account/local-api.ts */
  pedidoNaoEncontrado: 'Pedido não encontrado.'
} as const;

const en: Traducao<typeof pt> = {
  leituraNenhuma: 'No words yet - they arrive with the next letter.',
  leituraUma: 'You can already read 1 word in Hebrew.',
  leituraVarias: (n: number): string => `You can already read ${n} words in Hebrew.`,
  faixa0: 'under 1 min',
  faixa1: '1 to 2 min',
  faixa2: '2 to 4 min',
  faixa3: '4 to 7 min',
  faixa4: '7 to 12 min',
  faixa5: '12 to 20 min',
  faixa6: '20 min or more',
  nivelFacil: 'Warm-up',
  nivelMedio: 'Practice',
  nivelDificil: 'Hard',
  formatoCelular: 'Wallpaper',
  formatoQuadrado: 'Square',
  skillRec: 'Recognition',
  skillSom: 'Sound',
  skillLer: 'Reading',
  skillOuvir: 'Listening',
  skillEscrever: 'Writing',
  pedidoNaoEncontrado: 'Order not found.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
