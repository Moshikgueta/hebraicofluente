import type { Traducao } from '..';

/* components/shell/PublicShell.tsx: o cabeçalho e o rodapé do site público */
const pt = {
  linkMetodo: 'O método',
  linkSobre: 'Sobre',
  linkDuvidas: 'Dúvidas',
  paginaInicial: 'Hebraico Fluente, página inicial',
  navegacao: 'Navegação do site',
  meuHebraico: 'Meu Hebraico',
  minhaConta: 'Minha conta',
  comecar: 'Começar',
  comecarOCurso: 'Começar o curso',
  entrar: 'Entrar',
  comecarAgora: 'Começar agora',
  fecharMenu: 'Fechar menu',
  abrirMenu: 'Abrir menu',

  rodapeTexto:
    'Hebraico para brasileiros, começando pelo alfabeto. Feito para adulto que estuda sozinho, ' +
    'no celular, sem professor do lado.',
  inspiradoEm: 'Método inspirado em',
  creditoDepois: (translit: string, autor: string) => `(${translit}), de ${autor}.`,
  contato: 'Contato',
  whatsapp: (numero: string) => `WhatsApp ${numero}`,
  horario: (horario: string, prazo: string) => `${horario}. Resposta ${prazo}.`,
  pagamentoSoPix: 'Pagamento por PIX. Acesso liberado depois de conferido o pagamento.',
  pagamentoPixECartao: (parcelas: string) =>
    `Pagamento por PIX ou cartão, ${parcelas}. Acesso liberado na hora.`,
  pagamentoCartao: (parcelas: string) =>
    `Pagamento por cartão de crédito, ${parcelas}. Acesso liberado na hora.`,
  pagamentoPixNaHora: 'Pagamento por PIX. Acesso liberado na hora.',

  aprender: 'Aprender',
  alfabetizacao: 'Alfabetização em Hebraico',
  osCursos: 'Os cursos',
  alfabetoHebraico: 'Alfabeto hebraico',
  lerABiblia: 'Ler a Bíblia?',
  proximosCursos: 'Próximos cursos, à parte e ainda em produção:',
  e: ' e',
  ajuda: 'Ajuda',
  suporte: 'Suporte',
  sobreOMoshik: 'Sobre o Moshik',
  acessibilidade: 'Acessibilidade',
  legal: 'Legal',
  termosDeUso: 'Termos de Uso',
  politicaDePrivacidade: 'Política de Privacidade',
  reembolso: 'Reembolso e Cancelamento',
  cnpj: (numero: string) => `CNPJ ${numero}`,
  direitos: (ano: number, nome: string) => `© ${ano} ${nome}. Todos os direitos reservados.`
} as const;

const en: Traducao<typeof pt> = {
  linkMetodo: 'The method',
  linkSobre: 'About',
  linkDuvidas: 'FAQ',
  paginaInicial: 'Hebraico Fluente, home page',
  navegacao: 'Site navigation',
  meuHebraico: 'My Hebrew',
  minhaConta: 'My account',
  comecar: 'Start',
  comecarOCurso: 'Start the course',
  entrar: 'Sign in',
  comecarAgora: 'Start now',
  fecharMenu: 'Close menu',
  abrirMenu: 'Open menu',

  rodapeTexto:
    'Hebrew for English speakers, starting with the alphabet. Made for adults who study on their ' +
    'own, on their phone, with no teacher beside them.',
  inspiradoEm: 'Method inspired by',
  creditoDepois: (translit: string, autor: string) => `(${translit}), by ${autor}.`,
  contato: 'Contact',
  whatsapp: (numero: string) => `WhatsApp ${numero}`,
  horario: (horario: string, prazo: string) => `${horario}. Reply ${prazo}.`,
  // etapa 5/6: Brasil, rever
  pagamentoSoPix: 'Payment by PIX. Access unlocked once the payment is checked.',
  pagamentoPixECartao: (parcelas: string) =>
    `Payment by PIX or card, ${parcelas}. Access unlocked instantly.`,
  pagamentoCartao: (parcelas: string) =>
    `Payment by credit card, ${parcelas}. Access unlocked instantly.`,
  pagamentoPixNaHora: 'Payment by PIX. Access unlocked instantly.',

  aprender: 'Learn',
  alfabetizacao: 'Hebrew Literacy',
  osCursos: 'The courses',
  alfabetoHebraico: 'Hebrew alphabet',
  lerABiblia: 'Read the Bible?',
  proximosCursos: 'Upcoming courses, sold separately and still in production:',
  e: ' and',
  ajuda: 'Help',
  suporte: 'Support',
  sobreOMoshik: 'About Moshik',
  acessibilidade: 'Accessibility',
  legal: 'Legal',
  termosDeUso: 'Terms of Use',
  politicaDePrivacidade: 'Privacy Policy',
  reembolso: 'Refunds and Cancellation',
  // etapa 5/6: Brasil, rever
  cnpj: (numero: string) => `CNPJ ${numero}`,
  direitos: (ano: number, nome: string) => `© ${ano} ${nome}. All rights reserved.`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
