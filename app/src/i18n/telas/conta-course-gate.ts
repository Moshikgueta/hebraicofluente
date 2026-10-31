import type { Traducao } from '..';

/* components/shell/CourseGate.tsx */
const pt = {
  naoCarregou: 'Não consegui carregar a aula.',
  acessoEmDia:
    'Seu acesso está em dia - o que falhou foi buscar o conteúdo. Quase sempre é a conexão.',
  tentarDeNovo: 'Tentar de novo',
  semCurso: 'Este curso ainda não está na sua conta.',
  entreParaContinuar: 'Entre para continuar.',
  raizesNaoAVenda:
    'Raízes Sefarditas ainda não está à venda. Ele aparece aqui quando o acesso for liberado na sua conta.',
  liberadoAoPagar: (curso: string) => `O ${curso} é liberado assim que o pagamento é confirmado.`,
  ficamNaConta: 'Suas aulas, seu progresso e seu certificado ficam na sua conta.',
  verOCurso: 'Ver o curso',
  entrar: 'Entrar'
} as const;

const en: Traducao<typeof pt> = {
  naoCarregou: 'I could not load the lesson.',
  acessoEmDia:
    'Your access is up to date - what failed was fetching the content. It is almost always the connection.',
  tentarDeNovo: 'Try again',
  semCurso: 'This course is not in your account yet.',
  entreParaContinuar: 'Sign in to continue.',
  raizesNaoAVenda:
    'Raizes Sefarditas is not on sale yet. It shows up here once access is unlocked on your account.',
  liberadoAoPagar: (curso: string) => `${curso} is unlocked as soon as the payment is confirmed.`,
  ficamNaConta: 'Your lessons, your progress and your certificate are kept in your account.',
  verOCurso: 'See the course',
  entrar: 'Sign in'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
