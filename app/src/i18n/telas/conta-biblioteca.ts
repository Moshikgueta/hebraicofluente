import type { Traducao } from '..';

/* app/minha-biblioteca: BibliotecaClient.tsx e page.tsx */
const pt = {
  metaTitulo: 'Minha Biblioteca - Hebraico Fluente',
  metaDescricao: 'Os cursos e as experiências da sua conta, num lugar só.',

  resumoCurso: 'Ler e escrever hebraico do zero, letra por letra.',
  resumoLivro: 'Uma experiência digital interativa pela história, a cultura e os lugares de Israel.',
  resumoA1: 'O hebraico do dia a dia, depois do alfabeto.',
  nomeRaizes: 'Raízes Sefarditas',
  resumoRaizes: 'A história, os caminhos e a memória sefardita.',

  abrindo: 'Abrindo a sua biblioteca...',
  entreNaConta: 'Entre na sua conta para ver os cursos e as experiências que você tem.',
  entrar: 'Entrar',
  abrir: 'Abrir',
  acessoAte: (data: string) => `Acesso até ${data}`,
  acessoSemFim: 'Acesso sem data de fim',
  comprasEmSuaContaAntes: 'Compras, recibos e desistência ficam em ',
  suaConta: 'Sua conta',

  conectadoComo: 'Você está conectado como ',
  semNenhumCurso: ', e esta conta ainda não tem nenhum curso.',
  pagamentoEsperando: 'Há um pagamento esperando confirmação',
  pendente: (nome: string, pix: boolean) =>
    `${nome}, ${pix ? 'por PIX' : 'no cartão'}. Assim que o pagamento for confirmado, o curso ` +
    'aparece aqui. Se você ainda não pagou, o código PIX está em Sua conta.',
  conferirPagamento: 'Conferir o pagamento',
  verCodigoPix: 'Ver o código PIX em Sua conta',
  acessoTerminou: (data: string) => `Seu acesso terminou em ${data}`,
  vencido: (nome: string) =>
    `${nome}. Seu progresso continua guardado e volta inteiro quando você renovar.`,
  renovar: 'Renovar o acesso',
  constaComoPago: 'Seu pagamento consta como pago',
  naoPagueDeNovo: 'Não pague de novo.',
  pagoSemAcesso: ' O acesso ainda não apareceu nesta conta: fale com a gente e a gente libera.',
  comecarCurso: 'Começar o curso de hebraico',
  verTudo: 'Ver tudo o que o Hebraico Fluente oferece',
  outroEmail: 'Comprou com outro e-mail? O curso fica na conta do e-mail que pagou.',
  entrarComOutro: 'Entrar com outro e-mail',
  jaPagou: 'Já pagou e o curso não aparece? ',
  faleComAGente: ' Fale com a gente',
  pelo: ' pelo ',
  whatsapp: 'WhatsApp',
  ou: ' ou',
  por: 'por ',
  comEmailDaCompra: ', com o e-mail da compra.',
  minhaBiblioteca: 'Minha Biblioteca'
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'My Library - Hebraico Fluente',
  metaDescricao: 'The courses and experiences in your account, all in one place.',

  resumoCurso: 'Read and write Hebrew from zero, letter by letter.',
  resumoLivro: 'An interactive digital experience through the history, culture and places of Israel.',
  resumoA1: 'Everyday Hebrew, after the alphabet.',
  nomeRaizes: 'Raízes Sefarditas',
  resumoRaizes: 'Sephardic history, journeys and memory.',

  abrindo: 'Opening your library...',
  entreNaConta: 'Sign in to your account to see the courses and experiences you have.',
  entrar: 'Sign in',
  abrir: 'Open',
  acessoAte: (data: string) => `Access until ${data}`,
  acessoSemFim: 'Access with no end date',
  comprasEmSuaContaAntes: 'Purchases, receipts and cancellations are in ',
  suaConta: 'Your account',

  conectadoComo: 'You are signed in as ',
  semNenhumCurso: ', and this account does not have any course yet.',
  pagamentoEsperando: 'A payment is waiting for confirmation',
  // etapa 5/6: Brasil, rever
  pendente: (nome: string, pix: boolean) =>
    `${nome}, ${pix ? 'by PIX' : 'by card'}. As soon as the payment is confirmed, the course ` +
    'shows up here. If you have not paid yet, the PIX code is in Your account.',
  conferirPagamento: 'Check the payment',
  verCodigoPix: 'See the PIX code in Your account',
  acessoTerminou: (data: string) => `Your access ended on ${data}`,
  vencido: (nome: string) =>
    `${nome}. Your progress is still saved and comes back in full when you renew.`,
  renovar: 'Renew access',
  constaComoPago: 'Your payment shows as paid',
  naoPagueDeNovo: 'Do not pay again.',
  pagoSemAcesso: ' Access has not shown up on this account yet: contact us and we will unlock it.',
  comecarCurso: 'Start the Hebrew course',
  verTudo: 'See everything Hebraico Fluente offers',
  outroEmail: 'Bought with a different email? The course stays in the account of the email that paid.',
  entrarComOutro: 'Sign in with another email',
  jaPagou: 'Already paid and the course does not show up? ',
  faleComAGente: ' Contact us',
  pelo: ' on ',
  whatsapp: 'WhatsApp',
  ou: ' or',
  por: 'at ',
  comEmailDaCompra: ', with the email you used to buy.',
  minhaBiblioteca: 'My Library'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
