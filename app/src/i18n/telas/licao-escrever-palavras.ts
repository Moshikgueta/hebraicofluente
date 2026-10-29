import type { Traducao } from '..';

/* components/learn/EscreverPalavras.tsx */
const pt = {
  porCima: 'Por cima do modelo',
  porCimaDica: 'Passe o dedo por cima da palavra, começando pela direita.',
  fraco: 'Modelo fraco',
  fracoDica: 'O modelo quase sumiu. Siga assim mesmo.',
  semModelo: 'Sem modelo',
  semModeloDica: 'Agora sozinho. Escreva a palavra de memória.',
  semPalavra:
    'Ainda não há palavra inteira para escrever: elas chegam quando todas as letras de uma palavra já foram ensinadas. Continue as lições e volte aqui.',
  completa: 'Rodada completa',
  escreveu: (n: number, boas: number) =>
    `Você escreveu ${n} palavras à mão${boas ? `, ${boas} delas sem modelo e bem parecidas com o original` : ''}.`,
  palavrasDaRodada: 'As palavras desta rodada',
  maisCinco: 'Mais cinco palavras',
  palavraDe: (n: number, total: number, etapa: string) => `Palavra ${n} de ${total} · ${etapa}`,
  aMao: 'À mão, sem os pontinhos das vogais.',
  proximaEtapa: 'Próxima etapa',
  proximaPalavra: 'Próxima palavra',
  terminar: 'Terminar',
  conferir: 'Conferir',
  tentarDeNovo: 'Tentar de novo',
  limpar: 'Limpar'
} as const;

const en: Traducao<typeof pt> = {
  porCima: 'Over the model',
  porCimaDica: 'Run your finger over the word, starting from the right.',
  fraco: 'Faint model',
  fracoDica: 'The model has almost disappeared. Follow it anyway.',
  semModelo: 'No model',
  semModeloDica: 'Now on your own. Write the word from memory.',
  semPalavra:
    'There is no whole word to write yet: words arrive once every letter in them has been taught. Keep going with the lessons and come back here.',
  completa: 'Round complete',
  escreveu: (n, boas) =>
    `You wrote ${n} words by hand${boas ? `, ${boas} of them without a model and very close to the original` : ''}.`,
  palavrasDaRodada: 'The words in this round',
  maisCinco: 'Five more words',
  palavraDe: (n, total, etapa) => `Word ${n} of ${total} · ${etapa}`,
  aMao: 'By hand, without the little vowel dots.',
  proximaEtapa: 'Next step',
  proximaPalavra: 'Next word',
  terminar: 'Finish',
  conferir: 'Check',
  tentarDeNovo: 'Try again',
  limpar: 'Clear'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
