import type { Traducao } from '..';

/* lib/cta.ts - o botão e a linha miúda do próximo passo de cada pessoa. */
const pt = {
  embreveLabel: 'Ver o que vem neste curso',
  embreveMicro: 'Em breve. A página mostra o plano completo.',
  continuarLabel: 'Continuar de onde parei',
  continuarMicro: 'Seu progresso está salvo.',
  acessoImediato: 'Acesso imediato',
  acessoEmAte: 'Acesso em até {n} dias úteis',
  liberar: 'Liberar meu acesso',
  comecar: 'Quero começar',
  micro: '{quando} · {meses} meses · sem mensalidade'
} as const;

const en: Traducao<typeof pt> = {
  embreveLabel: 'See what is coming in this course',
  embreveMicro: 'Coming soon. The page shows the full plan.',
  continuarLabel: 'Pick up where I left off',
  continuarMicro: 'Your progress is saved.',
  acessoImediato: 'Instant access',
  acessoEmAte: 'Access within {n} business days',
  liberar: 'Unlock my access',
  comecar: 'I want to start',
  micro: '{quando} · {meses} months · no monthly fee'
};

const es: Traducao<typeof pt> = {
  embreveLabel: 'Ver lo que viene en este curso',
  embreveMicro: 'Muy pronto. La página muestra el plan completo.',
  continuarLabel: 'Continuar donde lo dejé',
  continuarMicro: 'Tu progreso está guardado.',
  acessoImediato: 'Acceso inmediato',
  acessoEmAte: 'Acceso en hasta {n} días hábiles',
  liberar: 'Liberar mi acceso',
  comecar: 'Quiero empezar',
  micro: '{quando} · {meses} meses · sin mensualidad'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
