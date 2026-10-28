import type { Traducao } from '..';

/* app/checkout/[slug]/obrigado: ObrigadoClient.tsx e page.tsx */
const pt = {
  metaTitulo: 'Confirmando seu pagamento - Hebraico Fluente',
  confirmando: 'Confirmando seu pagamento…',
  naoFeche: 'Isso costuma levar alguns segundos. Não feche esta página.',
  pagamentoConfirmado: 'Pagamento confirmado',
  prontoLivro: 'Pronto. O Israel Além do Óbvio é seu.',
  prontoCombo: 'Pronto. O combo é seu.',
  prontoCurso: 'Pronto. O curso é seu.',
  livroLiberado: (titulo: string, meses: number) =>
    `${titulo}: versão interativa liberada por ${meses} meses.`,
  comboLiberado:
    'O curso de alfabetização e o Israel Além do Óbvio estão liberados, no mesmo login. Os dois ' +
    'ficam na Minha Biblioteca.',
  cursoLiberado: (titulo: string, meses: number) =>
    `${titulo}, liberado por ${meses} meses. A primeira letra leva cerca de dez minutos.`,
  abrirLivro: 'Abrir o Israel Além do Óbvio',
  abrirBiblioteca: 'Abrir a Minha Biblioteca',
  comecarAgora: 'Começar agora',

  emAnalise: 'Seu pagamento está em análise pela operadora.',
  emAnaliseTexto:
    'A operadora do cartão está conferindo a compra. Você não precisa fazer nada: quando ela ' +
    'aprovar, o acesso entra sozinho e você recebe um e-mail de confirmação.',
  emAnalisePrazoAntes:
    'Isso costuma levar de alguns minutos a dois dias úteis. Se passar disso, escreva para ',
  emAnalisePrazoDepois: ' com o e-mail da compra.',
  irParaMeuHebraico: 'Ir para Meu Hebraico',

  devolvido: 'Este pagamento foi devolvido.',
  devolvidoTextoAntes:
    'O valor desta compra está estornado, e o acesso que ela dava está encerrado. Se você não ' +
    'pediu o estorno, escreva para ',
  devolvidoTextoDepois: '.',
  verMinhasCompras: 'Ver minhas compras',

  recusado: 'O cartão foi recusado.',
  recusadoTexto:
    'Nada foi cobrado. Pode ter sido o limite, um dado digitado errado ou uma recusa do banco. Dá ' +
    'para tentar de novo com outro cartão ou por PIX.',
  tentarDeNovo: 'Tentar de novo',

  expirado: 'O prazo deste pagamento terminou.',
  semPagamento: 'Ainda não há pagamento neste pedido.',
  expiradoTexto:
    'Nenhum pagamento chegou para este pedido, e nada foi cobrado. Para comprar, é só começar de novo.',
  semPagamentoTexto:
    'Se você saiu da tela de pagamento sem concluir, nada foi cobrado: é só tentar de novo. Se ' +
    'acabou de pagar, o acesso entra sozinho assim que a confirmação chegar, e você recebe um e-mail.',
  meuHebraico: 'Meu Hebraico',

  naoConcluido: 'O pagamento não foi concluído.',
  naoConsegui: 'Não consegui confirmar por aqui.',
  naoConcluidoTexto: 'Nada foi cobrado. Dá para tentar de novo, com cartão ou por PIX.',
  naoConseguiTexto:
    'Se você já pagou, o acesso entra sozinho assim que a confirmação chegar: abra Meu Hebraico ' +
    'daqui a alguns minutos. Se não pagou, é só refazer.'
} as const;

/* etapa 5/6: Brasil, rever - cartão, PIX e Mercado Pago. */
const en: Traducao<typeof pt> = {
  metaTitulo: 'Confirming your payment - Hebraico Fluente',
  confirmando: 'Confirming your payment…',
  naoFeche: 'This usually takes a few seconds. Do not close this page.',
  pagamentoConfirmado: 'Payment confirmed',
  prontoLivro: 'Done. Israel Além do Óbvio is yours.',
  prontoCombo: 'Done. The bundle is yours.',
  prontoCurso: 'Done. The course is yours.',
  livroLiberado: (titulo: string, meses: number) =>
    `${titulo}: interactive version unlocked for ${meses} months.`,
  comboLiberado:
    'The literacy course and Israel Além do Óbvio are unlocked, under the same login. Both are ' +
    'in My Library.',
  cursoLiberado: (titulo: string, meses: number) =>
    `${titulo}, unlocked for ${meses} months. The first letter takes about ten minutes.`,
  abrirLivro: 'Open Israel Além do Óbvio',
  abrirBiblioteca: 'Open My Library',
  comecarAgora: 'Start now',

  emAnalise: 'Your payment is under review by the card issuer.',
  emAnaliseTexto:
    'The card issuer is checking the purchase. You do not need to do anything: once it approves, ' +
    'access comes through on its own and you get a confirmation email.',
  emAnalisePrazoAntes:
    'This usually takes from a few minutes to two business days. If it takes longer, write to ',
  emAnalisePrazoDepois: ' with the email you used to buy.',
  irParaMeuHebraico: 'Go to My Hebrew',

  devolvido: 'This payment was refunded.',
  devolvidoTextoAntes:
    'The amount of this purchase has been refunded, and the access it gave has ended. If you did ' +
    'not ask for the refund, write to ',
  devolvidoTextoDepois: '.',
  verMinhasCompras: 'See my purchases',

  recusado: 'The card was declined.',
  recusadoTexto:
    'Nothing was charged. It may have been the limit, a mistyped detail or a decline by the bank. ' +
    'You can try again with another card or by PIX.',
  tentarDeNovo: 'Try again',

  expirado: 'The deadline for this payment has passed.',
  semPagamento: 'There is no payment on this order yet.',
  expiradoTexto:
    'No payment arrived for this order, and nothing was charged. To buy, just start again.',
  semPagamentoTexto:
    'If you left the payment screen without finishing, nothing was charged: just try again. If ' +
    'you just paid, access comes through on its own as soon as the confirmation arrives, and you ' +
    'get an email.',
  meuHebraico: 'My Hebrew',

  naoConcluido: 'The payment was not completed.',
  naoConsegui: 'I could not confirm it from here.',
  naoConcluidoTexto: 'Nothing was charged. You can try again, by card or by PIX.',
  naoConseguiTexto:
    'If you already paid, access comes through on its own as soon as the confirmation arrives: ' +
    'open My Hebrew in a few minutes. If you did not pay, just do it again.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
