/* Os e-mails ao aluno no idioma certo (PLANO-INGLES.md).
 *
 * `mensagens(idioma)` devolve as funções de lib/mail.js (português) ou de
 * lib/mail-en.js (inglês) ou de lib/mail-es.js (espanhol), com os mesmos nomes. O idioma vem de
 * lib/idioma.js: o do site para o que a pessoa pediu agora, o da conta para
 * o que sai do agendamento. Só entram aqui os e-mails que já existem nos dois
 * idiomas; os outros continuam importados direto de lib/mail.js.
 */

import * as pt from './mail.js';
import * as en from './mail-en.js';
import * as es from './mail-es.js';

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

/* O espanhol (04/11/2026, PLANO-ESPANHOL.md): lib/mail-es.js, os mesmos nomes. */
const ES = {
  recuperacao: es.mensagemDeRecuperacao,
  confirmacao: es.mensagemDeConfirmacao,
  estorno: es.mensagemDeEstorno,
  vencimento: es.mensagemDeVencimento,
  ativacao: es.mensagemDeAtivacao,
  compra: es.mensagemDeCompra,
  arrependimento: es.mensagemDeArrependimento,
  segundaLetra: es.mensagemDaSegundaLetra,
  confirmacaoDaLista: es.mensagemDeConfirmacaoDaLista,
  sequencia: es.mensagemDaSequencia,
  lembrete: es.mensagemDeLembrete,
  data: es.dataES
};

export const mensagens = idioma => (idioma === 'en' ? EN : idioma === 'es' ? ES : PT);
