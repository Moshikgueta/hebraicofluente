import type { Traducao } from '..';

/* components/learn/WritingCanvas.tsx */
const pt = {
  ver: 'Ver',
  verDica: 'Veja por onde a caneta começa.',
  tracar: 'Traçar',
  tracarDica: 'Passe o dedo por cima do modelo.',
  guiaFraco: 'Guia fraco',
  guiaFracoDica: 'O modelo está mais fraco. Siga assim mesmo.',
  semModelo: 'Sem modelo',
  semModeloDica: 'Agora sozinho. Escreva de memória.',
  etapas: 'Etapas da escrita',
  cursiva: 'A cursiva é a que se escreve à mão - ninguém escreve hebraico em letra de imprensa.',
  comecar: 'Começar a traçar',
  direcao: '← escreva nesta direção ←',
  conferir: 'Conferir',
  limpar: 'Limpar',
  verTracado: 'Ver o traçado',
  proxima: 'Próxima etapa →'
} as const;

const en: Traducao<typeof pt> = {
  ver: 'Watch',
  verDica: 'See where the pen starts.',
  tracar: 'Trace',
  tracarDica: 'Run your finger over the model.',
  guiaFraco: 'Faint guide',
  guiaFracoDica: 'The model is fainter now. Follow it anyway.',
  semModelo: 'No model',
  semModeloDica: 'Now on your own. Write it from memory.',
  etapas: 'Writing steps',
  cursiva: 'Cursive is what people write by hand - nobody writes Hebrew in print letters.',
  comecar: 'Start tracing',
  direcao: '← write in this direction ←',
  conferir: 'Check',
  limpar: 'Clear',
  verTracado: 'See the strokes',
  proxima: 'Next step →'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
