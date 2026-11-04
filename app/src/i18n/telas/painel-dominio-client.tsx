import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/meu-hebraico/dominio/DominioClient.tsx - Meu domínio das letras.
   Os nomes dos níveis vêm de lib/dominio.ts (NIVEL_PT) e entram como
   {nivel}, para a explicação nunca discordar do selo. */
type Link = (texto: string) => ReactNode;

const pt = {
  migalha: (link: Link) => <>{link('Meu hebraico')} · Domínio</>,
  titulo: 'Meu domínio das letras',
  intro: 'Concluir uma lição não significa necessariamente dominar uma letra. Aqui, você acompanha seu progresso em três habilidades: reconhecer a letra, identificar seu som e lê-la dentro de palavras. Seu nível de domínio evolui conforme você pratica e revisa ao longo do tempo.',
  vazio: 'Assim que você fizer os primeiros exercícios, seu progresso começará a aparecer aqui.',
  voltarPainel: 'Voltar ao painel',
  resumoAria: 'Resumo',
  habilidadesAria: 'As três habilidades',
  praticarTitulo: 'O que vale praticar agora?',
  revisarEstas: 'Revisar estas letras',
  semReforco: (link: Link) => <>Nenhuma letra precisa de reforço especial agora. Uma leitura no{' '}{link('Laboratório de Leitura')} pode ajudar você a consolidar o que aprendeu.</>,
  letrasAria: 'As letras que você já começou',
  calculo: 'Seu nível de domínio é calculado com base nas suas respostas e revisões. Para considerar uma letra dominada, precisamos observar bons resultados em dias diferentes.',
  comoCalculado: 'Como o nível é calculado?',
  regraPoucos: 'Com menos de {n} respostas numa habilidade, aparece "{nivel}", em vez de um palpite.',
  regraErro: 'Um erro recente baixa o nível até você acertar de novo.',
  regraDominada: '"{nivel}" pede {seguidos} acertos seguidos, uma boa taxa de acertos e acertos em pelo menos {dias} dias diferentes.',
  regraConta: 'Contam os exercícios corrigidos e a revisão. A sua própria avaliação no Laboratório de Leitura não entra nesta conta.'
} as const;

const en: Traducao<typeof pt> = {
  migalha: (link: Link) => <>{link('My Hebrew')} · Mastery</>,
  titulo: 'My letter mastery',
  intro: 'Completing a lesson does not necessarily mean mastering a letter. Here you follow your progress in three skills: recognizing the letter, identifying its sound and reading it inside words. Your mastery level grows as you practice and review over time.',
  vazio: 'As soon as you do your first exercises, your progress will start showing up here.',
  voltarPainel: 'Back to the dashboard',
  resumoAria: 'Summary',
  habilidadesAria: 'The three skills',
  praticarTitulo: 'What is worth practicing now?',
  revisarEstas: 'Review these letters',
  semReforco: (link: Link) => <>No letter needs special reinforcement right now. A reading in the{' '}{link('Reading Lab')} can help you consolidate what you have learned.</>,
  letrasAria: 'The letters you have started',
  calculo: 'Your mastery level is calculated from your answers and reviews. To count a letter as mastered, we need to see good results on different days.',
  comoCalculado: 'How is the level calculated?',
  regraPoucos: 'With fewer than {n} answers in a skill, it shows "{nivel}" instead of a guess.',
  regraErro: 'A recent mistake lowers the level until you get it right again.',
  regraDominada: '"{nivel}" takes {seguidos} right answers in a row, a good accuracy rate and right answers on at least {dias} different days.',
  regraConta: 'Corrected exercises and reviews count. Your own self-assessment in the Reading Lab does not go into this calculation.'
};

const es: Traducao<typeof pt> = {
  migalha: (link: Link) => <>{link('Mi hebreo')} · Dominio</>,
  titulo: 'Mi dominio de las letras',
  intro: 'Completar una lección no significa necesariamente dominar una letra. Aquí sigues tu progreso en tres habilidades: reconocer la letra, identificar su sonido y leerla dentro de palabras. Tu nivel de dominio avanza a medida que practicas y repasas con el tiempo.',
  vazio: 'En cuanto hagas los primeros ejercicios, tu progreso empezará a aparecer aquí.',
  voltarPainel: 'Volver al panel',
  resumoAria: 'Resumen',
  habilidadesAria: 'Las tres habilidades',
  praticarTitulo: '¿Qué vale la pena practicar ahora?',
  revisarEstas: 'Repasar estas letras',
  semReforco: (link: Link) => <>Ninguna letra necesita un refuerzo especial ahora. Una lectura en el{' '}{link('Laboratorio de Lectura')} puede ayudarte a consolidar lo que aprendiste.</>,
  letrasAria: 'Las letras que ya empezaste',
  calculo: 'Tu nivel de dominio se calcula a partir de tus respuestas y repasos. Para considerar una letra dominada, necesitamos ver buenos resultados en días diferentes.',
  comoCalculado: '¿Cómo se calcula el nivel?',
  regraPoucos: 'Con menos de {n} respuestas en una habilidad, aparece "{nivel}" en lugar de una suposición.',
  regraErro: 'Un error reciente baja el nivel hasta que vuelvas a acertar.',
  regraDominada: '"{nivel}" pide {seguidos} aciertos seguidos, una buena tasa de aciertos y aciertos en al menos {dias} días diferentes.',
  regraConta: 'Cuentan los ejercicios corregidos y el repaso. Tu propia evaluación en el Laboratorio de Lectura no entra en esta cuenta.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
