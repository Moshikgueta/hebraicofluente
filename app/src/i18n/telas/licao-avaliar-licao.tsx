import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/learn/AvaliarLicao.tsx */
const pt = {
  facil: 'Fácil',
  ok: 'Ok',
  dificil: 'Difícil',
  obrigado: (forte: (t: string) => ReactNode): ReactNode =>
    <>{forte('Obrigado!')} A sua resposta ajuda a melhorar as lições.</>,
  pergunta: 'Como foi esta lição?',
  opcional: 'Opcional. A sua resposta não fica ligada à sua conta.',
  contar: 'Quer contar algo? (opcional)',
  exemplo: 'O que ajudou, o que ficou confuso...',
  erro: 'Não consegui enviar agora. Tente de novo em instantes.',
  enviando: 'Enviando…',
  enviar: 'Enviar'
} as const;

const en: Traducao<typeof pt> = {
  facil: 'Easy',
  ok: 'OK',
  dificil: 'Hard',
  obrigado: forte => <>{forte('Thank you!')} Your answer helps improve the lessons.</>,
  pergunta: 'How was this lesson?',
  opcional: 'Optional. Your answer is not linked to your account.',
  contar: 'Anything you want to tell us? (optional)',
  exemplo: 'What helped, what was confusing...',
  erro: 'I couldn\'t send it right now. Try again in a moment.',
  enviando: 'Sending…',
  enviar: 'Send'
};

const es: Traducao<typeof pt> = {
  facil: 'Fácil',
  ok: 'Bien',
  dificil: 'Difícil',
  obrigado: forte => <>{forte('¡Gracias!')} Tu respuesta ayuda a mejorar las lecciones.</>,
  pergunta: '¿Cómo te fue en esta lección?',
  opcional: 'Opcional. Tu respuesta no queda vinculada a tu cuenta.',
  contar: '¿Quieres contarnos algo? (opcional)',
  exemplo: 'Lo que ayudó, lo que quedó confuso...',
  erro: 'No pude enviarlo ahora. Intenta de nuevo en un momento.',
  enviando: 'Enviando…',
  enviar: 'Enviar'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
