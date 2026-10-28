import type { Traducao } from '..';

/* components/platform/CompartilharCertificado.tsx */
const pt = {
  depoisWhatsapp: 'A imagem foi salva e o texto já vai na conversa - é só anexar a imagem.',
  depoisInstagram: 'A imagem foi salva e o texto copiado. Abra o Instagram e publique.',
  depoisColar: 'A imagem foi salva e o texto copiado - cole na publicação e anexe a imagem.',
  naoSalvou: 'Não consegui salvar a imagem aqui. Use o botão "Baixar PNG" acima.',
  publicarNumaRede: 'Publicar numa rede',
  imagemNoAparelho:
    'A imagem é gerada no seu aparelho e não fica guardada em nenhum servidor - por isso ela vai ' +
    'anexada por você, e não pelo link.',
  salvando: 'Salvando a imagem…'
} as const;

const en: Traducao<typeof pt> = {
  depoisWhatsapp: 'The image was saved and the text is already in the chat - just attach the image.',
  depoisInstagram: 'The image was saved and the text copied. Open Instagram and post.',
  depoisColar: 'The image was saved and the text copied - paste it into the post and attach the image.',
  naoSalvou: 'I could not save the image here. Use the "Download PNG" button above.',
  publicarNumaRede: 'Post on a network',
  imagemNoAparelho:
    'The image is created on your device and is not stored on any server - that is why you ' +
    'attach it yourself, rather than through the link.',
  salvando: 'Saving the image…'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
