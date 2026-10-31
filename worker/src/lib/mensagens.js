/* Os e-mails ao aluno no idioma certo (PLANO-INGLES.md).
 *
 * `mensagens(idioma)` devolve as funções de lib/mail.js (português) ou de
 * lib/mail-en.js (inglês), com os mesmos nomes. O idioma vem de
 * lib/idioma.js: o do site para o que a pessoa pediu agora, o da conta para
 * o que sai do agendamento. Só entram aqui os e-mails que já existem nos dois
 * idiomas; os outros continuam importados direto de lib/mail.js.
 */

import * as pt from './mail.js';
import * as en from './mail-en.js';

const PT = {
  recuperacao: pt.mensagemDeRecuperacao,
  confirmacao: pt.mensagemDeConfirmacao,
  estorno: pt.mensagemDeEstorno,
  vencimento: pt.mensagemDeVencimento,
  ativacao: pt.mensagemDeAtivacao,
  compra: pt.mensagemDeCompra,
  arrependimento: pt.mensagemDeArrependimento,
  segundaLetra: pt.mensagemDaSegundaLetra,
  confirmacaoDaLista: pt.mensagemDeConfirmacaoDaLista,
  sequencia: pt.mensagemDaSequencia,
  lembrete: pt.mensagemDeLembrete,
  data: pt.dataBR
};

const EN = {
  recuperacao: en.mensagemDeRecuperacao,
  confirmacao: en.mensagemDeConfirmacao,
  estorno: en.mensagemDeEstorno,
  vencimento: en.mensagemDeVencimento,
  ativacao: en.mensagemDeAtivacao,
  compra: en.mensagemDeCompra,
  arrependimento: en.mensagemDeArrependimento,
  segundaLetra: en.mensagemDaSegundaLetra,
  confirmacaoDaLista: en.mensagemDeConfirmacaoDaLista,
  sequencia: en.mensagemDaSequencia,
  lembrete: en.mensagemDeLembrete,
  data: en.dataEN
};

export const mensagens = idioma => (idioma === 'en' ? EN : PT);
