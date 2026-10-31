import type { Traducao } from '..';

/* lib/account/types.ts - a frase de cada código de erro da conta e do
   pagamento, pronta para a tela. */
const pt = {
  badCredentials: 'E-mail ou senha não conferem.',
  emailTaken: 'Já existe uma conta com esse e-mail. Tente entrar.',
  weakPassword: 'A senha precisa de pelo menos 8 caracteres.',
  invalidEmail: 'Esse e-mail não parece válido.',
  termos: 'Para criar a conta, marque que você leu e aceita os Termos de Uso.',
  idade: 'Para criar a conta, confirme que tem 18 anos ou mais, ou que é o responsável por quem vai estudar.',
  notSignedIn: 'Você precisa entrar para continuar.',
  offline: 'Sem conexão. Tente de novo em um instante.',
  server: 'Alguma coisa quebrou do nosso lado. Tente de novo.',
  rateLimited: 'Tentativas demais. Espere um minuto.',
  rateLimitedHora: 'Tentativas demais por agora. Tente de novo daqui a uma hora.',
  paymentsOff: 'O pagamento ainda não está ativado. Escreva para {email} e liberamos seu acesso.',
  badToken: 'Esse link não vale mais. Peça outro - eles duram uma hora e funcionam uma vez só.',
  paymentFailed: 'Não conseguimos gerar o pagamento agora, e o problema é nosso, não seu. Nada foi cobrado. Escreva para {email}: respondemos {prazo}.',
  cardOff: 'No momento só aceitamos PIX. Volte e escolha PIX - o código sai na hora.',
  pixOff: 'No momento só aceitamos cartão de crédito. Volte e escolha cartão - dá para parcelar.',
  alreadyOwned: 'Este curso já está na sua conta. A renovação abre nos últimos 45 dias de acesso.',
  foraDoPrazo: 'O prazo de {dias} dias para desistir desta compra terminou. Se houver problema técnico ou cobrança indevida, escreva para {email}.',
  naoPago: 'Esta compra não está paga, então não há o que devolver.'
} as const;

const en: Traducao<typeof pt> = {
  badCredentials: 'E-mail or password does not match.',
  emailTaken: 'There is already an account with that e-mail. Try signing in.',
  weakPassword: 'The password needs at least 8 characters.',
  invalidEmail: 'That e-mail does not look valid.',
  termos: 'To create the account, check that you have read and accept the Terms of Use.',
  idade: 'To create the account, confirm that you are 18 or older, or the legal guardian of the person who will study.',
  notSignedIn: 'You need to sign in to continue.',
  offline: 'No connection. Try again in a moment.',
  server: 'Something broke on our end. Please try again.',
  rateLimited: 'Too many attempts. Wait a minute.',
  rateLimitedHora: 'Too many attempts for now. Try again in an hour.',
  paymentsOff: 'Payment is not turned on yet. Write to {email} and we will unlock your access.',
  badToken: 'This link is no longer valid. Ask for a new one - they last one hour and work only once.',
  paymentFailed: 'We could not create the payment right now, and the problem is on our side, not yours. Nothing was charged. Write to {email}: we reply {prazo}.',
  // etapa 5/6: Brasil, rever
  cardOff: 'Right now we only accept PIX. Go back and choose PIX - the code is generated right away.',
  // etapa 5/6: Brasil, rever
  pixOff: 'Right now we only accept credit cards. Go back and choose card - you can pay in installments.',
  alreadyOwned: 'This course is already in your account. Renewal opens in the last 45 days of access.',
  foraDoPrazo: 'The {dias}-day period to withdraw from this purchase has ended. If there is a technical problem or an incorrect charge, write to {email}.',
  naoPago: 'This purchase is not paid, so there is nothing to refund.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
