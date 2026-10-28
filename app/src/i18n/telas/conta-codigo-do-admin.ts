import type { Traducao } from '..';

/* components/platform/CodigoDoAdmin.tsx: o segundo fator do administrador */
const pt = {
  codigoInvalido: 'Código errado. Confira os seis números do e-mail.',
  codigoVencido: 'Este código venceu ou foi errado vezes demais. Peça outro.',
  semEmail: 'O envio de e-mail do site não está funcionando agora, então o código não pode sair.',
  muitosPedidos: 'Muitos códigos pedidos na última hora. Espere um pouco e tente de novo.',
  naoDeuMandar: 'Não deu para mandar o código agora. Tente de novo.',
  semConexao: 'Sem conexão. Tente de novo.',
  naoDeuConferir: 'Não deu para conferir agora. Tente de novo.',
  titulo: 'Confirme que é você',
  texto:
    'Os painéis de administrador pedem, além da senha, um código de seis números mandado ao ' +
    'e-mail desta conta. Ele abre os painéis por 12 horas, só neste aparelho.',
  enviando: 'Enviando…',
  mandarCodigo: 'Mandar o código para o meu e-mail',
  codigoRecebido: 'Código recebido por e-mail (vale 10 minutos)',
  conferindo: 'Conferindo…',
  entrarNoPainel: 'Entrar no painel',
  mandarOutro: 'Mandar outro código'
} as const;

const en: Traducao<typeof pt> = {
  codigoInvalido: 'Wrong code. Check the six digits in the email.',
  codigoVencido: 'This code has expired or was entered wrong too many times. Ask for another.',
  semEmail: 'The site cannot send email right now, so the code cannot go out.',
  muitosPedidos: 'Too many codes requested in the last hour. Wait a little and try again.',
  naoDeuMandar: 'Could not send the code right now. Try again.',
  semConexao: 'No connection. Try again.',
  naoDeuConferir: 'Could not check it right now. Try again.',
  titulo: 'Confirm it is you',
  texto:
    'The admin panels ask, besides the password, for a six-digit code sent to this account\'s ' +
    'email. It opens the panels for 12 hours, on this device only.',
  enviando: 'Sending…',
  mandarCodigo: 'Send the code to my email',
  codigoRecebido: 'Code received by email (valid for 10 minutes)',
  conferindo: 'Checking…',
  entrarNoPainel: 'Open the panel',
  mandarOutro: 'Send another code'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
