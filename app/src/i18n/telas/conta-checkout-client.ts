import type { Traducao } from '..';

/* app/checkout/[slug]: CheckoutClient.tsx e page.tsx */
const pt = {
  metaTitulo: (titulo: string) => `Comprar ${titulo} - Hebraico Fluente`,
  metaTituloPadrao: 'Checkout - Hebraico Fluente',
  oLivro: 'O Israel Além do Óbvio',
  oCombo: 'O combo',
  oCurso: 'O curso',

  emConfiguracao: 'Em configuração',
  pagamentoDesligado: 'O pagamento ainda não está ativado.',
  pagamentoDesligadoTexto:
    'A plataforma já está no ar, mas o meio de pagamento está sendo configurado. Sua conta ficou ' +
    'criada - escreva para o endereço abaixo com este e-mail e liberamos o acesso na mão enquanto isso.',
  voltarAoCurso: 'Voltar ao curso',

  jaTemParte: 'Você já tem parte do pacote',
  leveSoOQueFalta: 'Leve só o que falta.',
  pacoteCobrariaDeNovo: 'O pacote cobraria de novo o que já está na sua conta.',
  comprar: (titulo: string, preco: string) => `Comprar ${titulo} · ${preco}`,

  jaESeu: 'Já é seu',
  livroJaNaConta: 'O Israel Além do Óbvio já está na sua conta.',
  cursoJaNaConta: 'Este curso já está na sua conta.',
  nadaAPagar: 'Nada a pagar.',
  nadaAPagarContinue: 'Nada a pagar. Continue de onde você parou.',
  abrirLivro: 'Abrir o Israel Além do Óbvio',
  irParaMeuHebraico: 'Ir para Meu Hebraico',

  pagamentoConfirmado: 'Pagamento confirmado',
  prontoESeu: (oQue: string) => `Pronto. ${oQue} é seu.`,
  livroLiberado: (meses: number) => `Versão interativa liberada por ${meses} meses.`,
  comboLiberado:
    'O curso e o Israel Além do Óbvio estão liberados, no mesmo login. Os dois ficam na Minha Biblioteca.',
  cursoLiberado: (meses: number) =>
    `Acesso liberado por ${meses} meses. A primeira letra leva cerca de dez minutos.`,
  abrirBiblioteca: 'Abrir a Minha Biblioteca',
  comecarAgora: 'Começar agora',

  passo1: 'Passo 1 de 2',
  primeiroSuaConta: 'Primeiro, sua conta.',
  primeiroSuaContaTexto:
    'É ela que guarda o acesso. Leva quinze segundos e o pagamento vem logo em seguida, nesta mesma página.',

  parceriaAntes: 'Preço especial garantido pelo seu link: ',
  parceriaAte: (data: string) => `, até ${data}`,
  passo2: 'Passo 2 de 2',
  comoQuerPagar: 'Como você quer pagar?',
  cartaoDeCredito: 'Cartão de crédito',
  soCartao: (preco: string, parcelas: string) =>
    ` · ${preco} à vista, ou parcelado ${parcelas} (o total aparece antes de confirmar).`,
  pix: 'PIX',
  soPix: (preco: string, desconto: number) =>
    ` · ${preco}${desconto > 0 ? ` (${desconto}% de desconto)` : ''}. Você paga pelo aplicativo do seu banco.`,
  formaDePagamento: 'Forma de pagamento',
  pixComDesconto: (preco: string, desconto: number) =>
    `${preco} - ${desconto}% de desconto. Cai em segundos.`,
  pixSemDesconto: (preco: string) => `${preco}. Cai em segundos.`,
  cartaoDetalhe: (preco: string, parcelas: string) =>
    `${preco} à vista, ou parcelado ${parcelas} (o total aparece antes de confirmar).`,
  cartaoNaMercadoPago:
    'O número do cartão é digitado na tela da Mercado Pago, não aqui. Esta plataforma nunca ' +
    'recebe os dados do seu cartão. É lá também que você escolhe em quantas vezes pagar e vê o ' +
    'valor de cada parcela e o total, com os juros do parcelamento, antes de confirmar.',
  aguardandoConfirmacao: 'Aguardando a confirmação do pagamento…',
  gerando: 'Gerando…',
  pagar: (preco: string) => `Pagar ${preco}`,
  aoContinuar: 'Ao continuar você concorda com os',
  termosDeUso: 'Termos de Uso',
  eComA: 'e com a',
  politicaDePrivacidade: 'Política de Privacidade',

  condicoes: 'Condições desta compra',
  oQueVoceLeva: 'O que você leva',
  levaLivro: (titulo: string) => `${titulo}: uma experiência digital interativa, pelo navegador.`,
  levaCombo:
    'Acesso completo ao curso interativo de Alfabetização em Hebraico e à plataforma Israel Além do Óbvio.',
  levaCurso: (titulo: string) => `Acesso completo ao ${titulo}, dentro da plataforma, pelo navegador.`,
  porQuantoTempo: 'Por quanto tempo',
  tempoRenovacao: (meses: number) => `Mais ${meses} meses, somados ao fim do acesso atual.`,
  tempoLivro: (meses: number, inicio: string) => `A versão interativa por ${meses} meses, ${inicio}.`,
  tempoCurso: (meses: number, inicio: string) => `${meses} meses, ${inicio}.`,
  cobranca: 'Cobrança',
  cobrancaTexto:
    'Pagamento único. Não há assinatura nem renovação automática: ao fim do prazo, o acesso ' +
    'termina e nada mais é cobrado.',
  naoVemJunto: 'O que não vem junto',
  naoVemLivro:
    'O curso de hebraico: o Israel Além do Óbvio é sobre Israel, e não ensina a ler hebraico como ' +
    'as lições do curso.',
  naoVemCurso:
    'Aulas ao vivo e correção por professor: o curso é autoinstrucional, e a plataforma corrige ' +
    'cada exercício na hora.',
  termos: 'Termos',
  quandoAbre: 'Quando abre',
  abreComPix: 'Na hora em que o pagamento for confirmado - em minutos, no PIX.',
  abreSemPix: 'Na hora em que o pagamento for confirmado.',
  abreManual: (dias: string | number) =>
    `Depois que conferirmos o pagamento: a liberação é feita à mão, em até ${dias} dias úteis. ` +
    'Você entra na plataforma com seu e-mail e senha.',
  seDesistir: 'Se você desistir',
  desistirTexto: (dias: string | number) =>
    `${dias} dias para cancelar e receber 100% de volta, sem justificar.`,
  politicaDeReembolso: 'Política de reembolso',

  pixRetomado: (hora: string) =>
    `Este é o mesmo código PIX que você gerou antes, e ele vale até as ${hora}. Se você já pagou, ` +
    'não pague de novo: o acesso entra sozinho.',
  pixCopiaECola: 'PIX copia e cola',
  copiado: 'Copiado ✓',
  copiarCodigo: 'Copiar código',
  pixManual: (dias: string | number) =>
    `Pague pelo aplicativo do seu banco. Conferimos o pagamento e liberamos seu acesso à mão, em ` +
    `até ${dias} dias úteis. Você pode fechar esta página: para ver o curso, entre com o mesmo ` +
    'e-mail e a mesma senha que você acabou de usar.',
  sePassarDoPrazo: 'Se passar desse prazo, escreva para',
  comONumero: 'com o número do pedido: ',
  pagamentoNaoApareceu:
    'O pagamento ainda não apareceu por aqui. Se você já pagou, o acesso entra sozinho assim que ' +
    'o banco confirmar - recarregue esta página em alguns minutos. Se não pagou, dá para gerar um ' +
    'código novo.',
  gerarOutroCodigo: 'Gerar outro código',
  esperandoPagamento:
    'Esperando o pagamento cair. Pode deixar esta página aberta - ela se atualiza sozinha.',

  voceEstaEm: 'Você está em',
  pagamento: 'Pagamento',
  seuPedido: 'Seu pedido',
  resumoLivro: (capitulos: number, meses: number) =>
    `Experiência interativa · ${capitulos} capítulos · ${meses} meses de acesso`,
  resumoCombo: (meses: number) =>
    `Combo: curso de alfabetização + Israel Além do Óbvio · ${meses} meses de acesso`,
  resumoCurso: (modulos: number, licoes: number | null, meses: number) =>
    `${modulos} módulos${licoes ? ` · ${licoes} lições` : ''} · ${meses} meses de acesso`,
  noPix: 'no PIX',
  descontoSobre: (desconto: number, preco: string) => ` · ${desconto}% de desconto sobre ${preco}`,
  preLancamento: (ate: string | null, depois: string) =>
    `Pré-lançamento${ate ? ` até ${ate}` : ''} · depois, ${depois}`,
  ouNoCartao: (parcelas: string) => `ou ${parcelas} no cartão`,
  pixDesconto: (preco: string, desconto: number) => `${preco} no PIX · ${desconto}% de desconto`,
  resumoDesistir: (dias: string | number) =>
    `${dias} dias para desistir e receber 100% de volta, sem justificar.`,
  /* O checkout do Paddle (site em inglês, etapa 5). O português existe só
     porque todo dicionário tem os dois lados: a build brasileira não usa. */
  paddleComoPaga: 'Cartão, PayPal, Apple Pay ou Google Pay',
  paddleTexto: (preco: string) =>
    `${preco}, impostos incluídos, em pagamento único. Você paga no checkout seguro do Paddle, nosso ` +
    'revendedor oficial: ele processa o pagamento e recolhe o imposto do seu país. Esta plataforma ' +
    'nunca recebe os dados do seu cartão.',
  paddleAbrindo: 'Abrindo o pagamento…',
  paddleFechou: 'A janela de pagamento foi fechada sem concluir. Quando quiser, é só clicar de novo.',
  paddleNaoCarregou:
    'A janela de pagamento não abriu. Confira a conexão, desligue bloqueadores nesta página e tente de novo.',
  paddleConfirmando: 'Pagamento recebido. Confirmando o seu acesso…',
  paddleResumo: 'Pagamento único · impostos incluídos',
} as const;

/* etapa 5/6: Brasil, rever - quase tudo aqui é a cobrança brasileira (PIX,
   parcelamento, Mercado Pago, prazo de desistência do CDC). */
const en: Traducao<typeof pt> = {
  metaTitulo: (titulo: string) => `Buy ${titulo} - Hebraico Fluente`,
  metaTituloPadrao: 'Checkout - Hebraico Fluente',
  oLivro: 'Israel Alem do Obvio',
  oCombo: 'The bundle',
  oCurso: 'The course',

  emConfiguracao: 'Being set up',
  pagamentoDesligado: 'Payment is not enabled yet.',
  pagamentoDesligadoTexto:
    'The platform is already live, but the payment method is still being set up. Your account ' +
    'has been created - write to the address below from this email and we will unlock your ' +
    'access by hand in the meantime.',
  voltarAoCurso: 'Back to the course',

  jaTemParte: 'You already have part of the bundle',
  leveSoOQueFalta: 'Get only what is missing.',
  pacoteCobrariaDeNovo: 'The bundle would charge you again for what is already in your account.',
  comprar: (titulo: string, preco: string) => `Buy ${titulo} · ${preco}`,

  jaESeu: 'Already yours',
  livroJaNaConta: 'Israel Alem do Obvio is already in your account.',
  cursoJaNaConta: 'This course is already in your account.',
  nadaAPagar: 'Nothing to pay.',
  nadaAPagarContinue: 'Nothing to pay. Pick up where you left off.',
  abrirLivro: 'Open Israel Alem do Obvio',
  irParaMeuHebraico: 'Go to My Hebrew',

  pagamentoConfirmado: 'Payment confirmed',
  prontoESeu: (oQue: string) => `Done. ${oQue} is yours.`,
  livroLiberado: (meses: number) => `Interactive version unlocked for ${meses} months.`,
  comboLiberado:
    'The course and Israel Alem do Obvio are unlocked, under the same login. Both are in My Library.',
  cursoLiberado: (meses: number) =>
    `Access unlocked for ${meses} months. The first letter takes about ten minutes.`,
  abrirBiblioteca: 'Open My Library',
  comecarAgora: 'Start now',

  passo1: 'Step 1 of 2',
  primeiroSuaConta: 'First, your account.',
  primeiroSuaContaTexto:
    'It is what holds your access. It takes fifteen seconds and payment comes right after, on this same page.',

  parceriaAntes: 'Special price guaranteed by your link: ',
  parceriaAte: (data: string) => `, until ${data}`,
  passo2: 'Step 2 of 2',
  comoQuerPagar: 'How would you like to pay?',
  cartaoDeCredito: 'Credit card',
  soCartao: (preco: string, parcelas: string) =>
    ` · ${preco} in full, or in installments ${parcelas} (the total is shown before you confirm).`,
  pix: 'PIX',
  soPix: (preco: string, desconto: number) =>
    ` · ${preco}${desconto > 0 ? ` (${desconto}% off)` : ''}. You pay through your bank app.`,
  formaDePagamento: 'Payment method',
  pixComDesconto: (preco: string, desconto: number) =>
    `${preco} - ${desconto}% off. Clears in seconds.`,
  pixSemDesconto: (preco: string) => `${preco}. Clears in seconds.`,
  cartaoDetalhe: (preco: string, parcelas: string) =>
    `${preco} in full, or in installments ${parcelas} (the total is shown before you confirm).`,
  cartaoNaMercadoPago:
    'You type the card number on the Mercado Pago screen, not here. This platform never receives ' +
    'your card details. That is also where you choose how many installments to pay and see the ' +
    'amount of each installment and the total, including installment interest, before you confirm.',
  aguardandoConfirmacao: 'Waiting for payment confirmation…',
  gerando: 'Generating…',
  pagar: (preco: string) => `Pay ${preco}`,
  aoContinuar: 'By continuing you agree to the',
  termosDeUso: 'Terms of Use',
  eComA: 'and the',
  politicaDePrivacidade: 'Privacy Policy',

  condicoes: 'Terms of this purchase',
  oQueVoceLeva: 'What you get',
  levaLivro: (titulo: string) => `${titulo}: an interactive digital experience, in your browser.`,
  levaCombo:
    'Full access to the interactive Hebrew Literacy course and to the Israel Alem do Obvio platform.',
  levaCurso: (titulo: string) => `Full access to ${titulo}, on the platform, in your browser.`,
  porQuantoTempo: 'For how long',
  tempoRenovacao: (meses: number) => `${meses} more months, added to the end of your current access.`,
  tempoLivro: (meses: number, inicio: string) => `The interactive version for ${meses} months, ${inicio}.`,
  tempoCurso: (meses: number, inicio: string) => `${meses} months, ${inicio}.`,
  cobranca: 'Billing',
  cobrancaTexto:
    'One-time payment. There is no subscription and no automatic renewal: at the end of the ' +
    'period, access ends and nothing else is charged.',
  naoVemJunto: 'What is not included',
  naoVemLivro:
    'The Hebrew course: Israel Alem do Obvio is about Israel, and does not teach you to read ' +
    'Hebrew like the course lessons do.',
  naoVemCurso:
    'Live classes and grading by a teacher: the course is self-paced, and the platform checks ' +
    'every exercise instantly.',
  termos: 'Terms',
  quandoAbre: 'When it opens',
  abreComPix: 'As soon as the payment is confirmed - within minutes, with PIX.',
  abreSemPix: 'As soon as the payment is confirmed.',
  abreManual: (dias: string | number) =>
    `After we check the payment: access is unlocked by hand, within ${dias} business days. ` +
    'You sign in to the platform with your email and password.',
  seDesistir: 'If you change your mind',
  desistirTexto: (dias: string | number) =>
    `${dias} days to cancel and get 100% back, no reason needed.`,
  politicaDeReembolso: 'Refund policy',

  pixRetomado: (hora: string) =>
    `This is the same PIX code you generated before, and it is valid until ${hora}. If you ` +
    'already paid, do not pay again: access comes through on its own.',
  pixCopiaECola: 'PIX copy and paste',
  copiado: 'Copied ✓',
  copiarCodigo: 'Copy code',
  pixManual: (dias: string | number) =>
    `Pay through your bank app. We check the payment and unlock your access by hand, within ` +
    `${dias} business days. You can close this page: to see the course, sign in with the same ` +
    'email and password you just used.',
  sePassarDoPrazo: 'If it takes longer than that, write to',
  comONumero: 'with the order number: ',
  pagamentoNaoApareceu:
    'The payment has not shown up here yet. If you already paid, access comes through on its ' +
    'own as soon as the bank confirms - reload this page in a few minutes. If you did not pay, ' +
    'you can generate a new code.',
  gerarOutroCodigo: 'Generate another code',
  esperandoPagamento:
    'Waiting for the payment to clear. You can leave this page open - it updates on its own.',

  voceEstaEm: 'You are here',
  pagamento: 'Payment',
  seuPedido: 'Your order',
  resumoLivro: (capitulos: number, meses: number) =>
    `Interactive experience · ${capitulos} chapters · ${meses} months of access`,
  resumoCombo: (meses: number) =>
    `Bundle: literacy course + Israel Alem do Obvio · ${meses} months of access`,
  resumoCurso: (modulos: number, licoes: number | null, meses: number) =>
    `${modulos} modules${licoes ? ` · ${licoes} lessons` : ''} · ${meses} months of access`,
  noPix: 'with PIX',
  descontoSobre: (desconto: number, preco: string) => ` · ${desconto}% off ${preco}`,
  preLancamento: (ate: string | null, depois: string) =>
    `Pre-launch${ate ? ` until ${ate}` : ''} · then ${depois}`,
  ouNoCartao: (parcelas: string) => `or ${parcelas} by card`,
  pixDesconto: (preco: string, desconto: number) => `${preco} with PIX · ${desconto}% off`,
  resumoDesistir: (dias: string | number) =>
    `${dias} days to cancel and get 100% back, no reason needed.`,
  paddleComoPaga: 'Card, PayPal, Apple Pay or Google Pay',
  paddleTexto: (preco: string) =>
    `${preco}, taxes included, one-time payment. You pay on the secure checkout of Paddle, our ` +
    'authorized reseller: Paddle processes the payment and handles the sales tax for your country. ' +
    'This platform never receives your card details.',
  paddleAbrindo: 'Opening checkout…',
  paddleFechou: 'The payment window was closed before finishing. Click again whenever you are ready.',
  paddleNaoCarregou:
    'The payment window did not open. Check your connection, turn off any blocker on this page and try again.',
  paddleConfirmando: 'Payment received. Confirming your access…',
  paddleResumo: 'One-time payment · taxes included',
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
