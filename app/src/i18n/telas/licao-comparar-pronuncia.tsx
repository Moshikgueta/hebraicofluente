import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/learn/CompararPronuncia.tsx */
const pt = {
  titulo: 'Compare a sua pronúncia com a do curso',
  modelo: '▶ Modelo',
  parar: '■ Parar',
  gravarDeNovo: 'Gravar de novo',
  gravarMinha: 'Gravar a minha',
  ouvirOsDois: '▶ Ouvir os dois',
  soAMinha: 'Só a minha',
  gravando: 'Gravando… diga o item uma vez e toque em Parar.',
  negado: 'O navegador não deixou usar o microfone. Toque no cadeado ao lado do endereço, permita o microfone e tente de novo.',
  semSuporte: 'Este navegador não grava áudio. Tente pelo Chrome, Edge, Firefox ou Safari atualizados.',
  erro: 'Não consegui gravar ou ler a gravação. Tente de novo.',
  soNoAparelho: 'A sua gravação fica só neste aparelho. Nada é enviado.',
  curso: 'Curso',
  voce: 'Você',
  silabas: 'Sílabas',
  ouvirEPraticar: (item: string) => `${item}: ouvir e praticar`,
  praticar: (item: string) => `Praticar ${item}`,
  agoraVoce: (he: ReactNode, translit?: string | null): ReactNode =>
    <>Agora você: grave {he}{translit ? <> ({translit})</> : null} e compare com o curso.</>,
  escolhaUmItem: 'Escolha um item, ouça o modelo, grave o seu e compare: as duas ondas ficam na mesma escala de tempo.',
  itemParaComparar: 'Item para comparar'
} as const;

const en: Traducao<typeof pt> = {
  titulo: 'Compare your pronunciation with the course',
  modelo: '▶ Model',
  parar: '■ Stop',
  gravarDeNovo: 'Record again',
  gravarMinha: 'Record mine',
  ouvirOsDois: '▶ Listen to both',
  soAMinha: 'Just mine',
  gravando: 'Recording… say the item once and tap Stop.',
  negado: 'The browser did not allow the microphone. Tap the lock next to the address, allow the microphone and try again.',
  semSuporte: 'This browser does not record audio. Try an up-to-date Chrome, Edge, Firefox or Safari.',
  erro: 'I couldn\'t record or read the recording. Try again.',
  soNoAparelho: 'Your recording stays only on this device. Nothing is sent.',
  curso: 'Course',
  voce: 'You',
  silabas: 'Syllables',
  ouvirEPraticar: item => `${item}: listen and practice`,
  praticar: item => `Practice ${item}`,
  agoraVoce: (he, translit) =>
    <>Now you: record {he}{translit ? <> ({translit})</> : null} and compare it with the course.</>,
  escolhaUmItem: 'Choose an item, listen to the model, record yours and compare: both waves are on the same time scale.',
  itemParaComparar: 'Item to compare'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
