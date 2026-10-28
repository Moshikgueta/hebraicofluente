import type { Traducao } from '..';

/* app/conta-apagada/page.tsx */
const pt = {
  metaTitulo: 'Conta apagada - Hebraico Fluente',
  metaDescricao: 'A confirmação de que a conta e os dados pessoais foram apagados.',
  titulo: 'Conta apagada',
  feito: 'Está feito, e não é preciso fazer mais nada.',
  oQueFoiApagado: 'O que foi apagado',
  apagadoTexto:
    'Seu e-mail, seu nome, sua senha, todo o seu progresso e o seu acesso ao curso. Você já foi ' +
    'desconectado de todos os aparelhos onde estivesse logado.',
  oQueFicou: 'O que ficou, e por quê',
  ficouTexto:
    'O registro das suas compras, sem o seu nome e sem o seu e-mail. Guardar nota de venda é ' +
    'obrigação legal de quem vende, e a própria LGPD prevê essa guarda. O que sobrou é valor, ' +
    'data e situação do pagamento - nada que aponte para você.',
  voltar: 'Se um dia quiser voltar',
  voltarTexto:
    'É só criar uma conta nova com o mesmo e-mail. Ela começa do zero, porque não sobrou nada ' +
    'para recuperar - nem as letras que você já tinha aprendido.',
  paginaInicial: 'Ir para a página inicial',
  falarComAGente: 'Falar com a gente',
  duvida: 'Ficou alguma dúvida sobre os seus dados? Escreva para'
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'Account deleted - Hebraico Fluente',
  metaDescricao: 'Confirmation that the account and personal data were deleted.',
  titulo: 'Account deleted',
  feito: 'It is done, and there is nothing else you need to do.',
  oQueFoiApagado: 'What was deleted',
  apagadoTexto:
    'Your email, your name, your password, all your progress and your access to the course. You ' +
    'have already been signed out of every device where you were signed in.',
  oQueFicou: 'What was kept, and why',
  // etapa 5/6: Brasil, rever (LGPD e a nota de venda brasileira)
  ficouTexto:
    'The record of your purchases, without your name and without your email. Keeping sales ' +
    'invoices is a legal obligation for sellers, and Brazil\'s data protection law (LGPD) itself ' +
    'allows for keeping them. What remains is the amount, date and status of the payment - ' +
    'nothing that points to you.',
  voltar: 'If you ever want to come back',
  voltarTexto:
    'Just create a new account with the same email. It starts from zero, because nothing was ' +
    'left to recover - not even the letters you had already learned.',
  paginaInicial: 'Go to the home page',
  falarComAGente: 'Contact us',
  duvida: 'Any questions about your data? Write to'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
