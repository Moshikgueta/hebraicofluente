import type { Traducao } from '..';

/* components/learn/CompartilharConquista.tsx */
const pt = {
  /** O formato da data escrita na imagem. */
  dataLocale: 'pt-BR',
  compartilhar: 'Compartilhar',
  compartilharInstagram: 'Compartilhar no Instagram',
  preparando: 'Preparando…',
  preparandoImagem: 'Preparando a imagem…',
  baixada: 'A imagem foi baixada. Publique no Instagram pelo celular.',
  falhou: 'Não consegui gerar a imagem agora.',
  dialogo: 'A imagem da conquista',
  tocarESegurar: 'Toque e segure na imagem para salvar no celular. Depois, publique no story do Instagram.',
  fechar: 'Fechar'
} as const;

const en: Traducao<typeof pt> = {
  dataLocale: 'en-US',
  compartilhar: 'Share',
  compartilharInstagram: 'Share on Instagram',
  preparando: 'Preparing…',
  preparandoImagem: 'Preparing the image…',
  baixada: 'The image was downloaded. Post it on Instagram from your phone.',
  falhou: 'I couldn\'t create the image right now.',
  dialogo: 'The achievement image',
  tocarESegurar: 'Tap and hold the image to save it to your phone. Then post it to your Instagram story.',
  fechar: 'Close'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
