import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/learn/FalarECorrigir.tsx */
const pt = {
  pronto: '■ Pronto',
  fale: 'Fale e seja corrigido',
  acertos: (n: number) => `✓ ${n} ${n === 1 ? 'acerto' : 'acertos'}`,
  ouvindo: (he: ReactNode, translit?: string | null): ReactNode =>
    <>Ouvindo… diga {he}{translit ? <> ({translit})</> : null}.</>,
  certo: (he: ReactNode): ReactNode => <>✓ Certo! Ouvi {he}.</>,
  quase: 'Quase.',
  ouvi: (he: ReactNode): ReactNode => <>Ouvi {he}. </>,
  tenteDeNovo: 'Ouça o modelo e tente de novo, devagar.',
  nada: 'Não ouvi nada. Toque de novo e fale logo em seguida, perto do microfone.',
  negado: 'O navegador não deixou usar o microfone. Permita o microfone para este site e tente de novo.',
  semHebraico: 'O reconhecimento de fala deste navegador não entende hebraico. Use a gravação e a comparação acima.',
  erro: 'O reconhecimento de fala não respondeu. Confira a internet e tente de novo.',
  nota: 'Para corrigir, a sua voz vai para o serviço de fala do navegador (Google ou Apple). A gravação acima não sai do aparelho.'
} as const;

const en: Traducao<typeof pt> = {
  pronto: '■ Done',
  fale: 'Speak and get feedback',
  acertos: n => `✓ ${n} correct`,
  ouvindo: (he, translit) => <>Listening… say {he}{translit ? <> ({translit})</> : null}.</>,
  certo: he => <>✓ Correct! I heard {he}.</>,
  quase: 'Almost.',
  ouvi: he => <>I heard {he}. </>,
  tenteDeNovo: 'Listen to the model and try again, slowly.',
  nada: 'I didn\'t hear anything. Tap again and speak right away, close to the microphone.',
  negado: 'The browser did not allow the microphone. Allow the microphone for this site and try again.',
  semHebraico: 'This browser\'s speech recognition does not understand Hebrew. Use the recording and the comparison above.',
  erro: 'Speech recognition did not respond. Check your internet connection and try again.',
  nota: 'To check your answer, your voice goes to the browser\'s speech service (Google or Apple). The recording above never leaves your device.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
