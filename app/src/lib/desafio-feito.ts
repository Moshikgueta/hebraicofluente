/* O "feito hoje" do desafio do dia, à parte do motor de exercícios: o painel
   só precisa saber se foi feito, e não deve carregar o motor para isso
   (lib/engine/desafio.ts monta as perguntas). */
import type { LearnerState } from '@/lib/state/types';

export const DESAFIO_ID = 'desafio-do-dia';

export const desafioFeitoHoje = (state: LearnerState, dia: string): boolean =>
  state.gym?.[DESAFIO_ID]?.lastOn === dia;
