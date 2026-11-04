import type { Traducao } from '..';

/* components/learn/GravarLeitura.tsx */
const pt = {
  titulo: 'Leia em voz alta e se ouça',
  parar: 'Parar',
  gravando: (tempo: string) => `Gravando · ${tempo}`,
  gravarDeNovo: 'Gravar de novo',
  gravarMinha: 'Gravar minha leitura',
  ouvirOriginal: 'Ouvir o original',
  suaLeitura: 'A sua leitura:',
  procure: 'Ouça procurando onde a voz parou ou hesitou: é ali que vale ler de novo.',
  negado:
    'O navegador não deixou usar o microfone. Para gravar, toque no cadeado ao lado do endereço do site e permita o microfone, depois tente de novo.',
  semSuporte: 'Este navegador não grava áudio. Tente pelo Chrome, Edge, Firefox ou Safari atualizados.',
  erro: 'Não foi possível abrir o microfone. Confira se ele não está sendo usado por outro app.',
  soNoAparelho: 'A gravação fica só neste aparelho e some quando você sai da página. Nada é enviado.'
} as const;

const en: Traducao<typeof pt> = {
  titulo: 'Read aloud and listen to yourself',
  parar: 'Stop',
  gravando: tempo => `Recording · ${tempo}`,
  gravarDeNovo: 'Record again',
  gravarMinha: 'Record my reading',
  ouvirOriginal: 'Listen to the original',
  suaLeitura: 'Your reading:',
  procure: 'Listen for where your voice stopped or hesitated: that is the part worth reading again.',
  negado:
    'The browser did not allow the microphone. To record, tap the lock next to the site address and allow the microphone, then try again.',
  semSuporte: 'This browser does not record audio. Try an up-to-date Chrome, Edge, Firefox or Safari.',
  erro: 'The microphone could not be opened. Check that another app is not using it.',
  soNoAparelho: 'The recording stays only on this device and disappears when you leave the page. Nothing is sent.'
};

const es: Traducao<typeof pt> = {
  titulo: 'Lee en voz alta y escúchate',
  parar: 'Detener',
  gravando: tempo => `Grabando · ${tempo}`,
  gravarDeNovo: 'Grabar de nuevo',
  gravarMinha: 'Grabar mi lectura',
  ouvirOriginal: 'Escuchar el original',
  suaLeitura: 'Tu lectura:',
  procure: 'Escucha buscando dónde la voz se detuvo o dudó: ahí vale la pena leer de nuevo.',
  negado:
    'El navegador no permitió usar el micrófono. Para grabar, toca el candado junto a la dirección del sitio y permite el micrófono, después intenta de nuevo.',
  semSuporte: 'Este navegador no graba audio. Prueba con Chrome, Edge, Firefox o Safari actualizados.',
  erro: 'No se pudo abrir el micrófono. Revisa que no lo esté usando otra app.',
  soNoAparelho: 'La grabación queda solo en este dispositivo y desaparece cuando sales de la página. No se envía nada.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
