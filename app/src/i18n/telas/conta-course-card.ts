import type { Traducao } from '..';

/* components/platform/CourseCard.tsx e CourseShelf.tsx */
const pt = {
  seuCurso: 'Seu curso',
  disponivel: 'Disponível',
  emBreve: 'Em breve',
  continuar: 'Continuar',
  verOQueVem: 'Ver o que vem',
  verOCurso: 'Ver o curso',
  aindaNaoNaConta: 'Ainda não está na sua conta',
  modulos: (n: number) => `${n} módulos`,
  licoes: (n: number) => ` · ${n} lições`,
  concluido: (pct: number) => `${pct}% concluído`,
  noPix: 'no PIX',
  ouNoCartao: (parcelas: string) => `ou ${parcelas} no cartão`,
  preLancamento: (ate: string | null, depois: string) =>
    `· pré-lançamento${ate ? ` até ${ate}` : ''}, depois ${depois}`,

  cursos: 'Cursos',
  naSuaConta: 'Na sua conta',
  emBreveMinusculo: 'em breve',
  verTodos: 'Ver todos os cursos →'
} as const;

const en: Traducao<typeof pt> = {
  seuCurso: 'Your course',
  disponivel: 'Available',
  emBreve: 'Coming soon',
  continuar: 'Continue',
  verOQueVem: 'See what is coming',
  verOCurso: 'See the course',
  aindaNaoNaConta: 'Not in your account yet',
  modulos: (n: number) => `${n} modules`,
  licoes: (n: number) => ` · ${n} lessons`,
  concluido: (pct: number) => `${pct}% complete`,
  // etapa 5/6: Brasil, rever
  noPix: 'with PIX',
  ouNoCartao: () => '· one-time payment',
  preLancamento: (ate: string | null, depois: string) =>
    `· pre-launch${ate ? ` until ${ate}` : ''}, then ${depois}`,

  cursos: 'Courses',
  naSuaConta: 'In your account',
  emBreveMinusculo: 'coming soon',
  verTodos: 'See all courses →'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
