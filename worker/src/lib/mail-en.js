/* Os e-mails ao aluno, em inglês (site em inglês, PLANO-INGLES.md).
 * ─────────────────────────────────────────────────────────────────────────
 * O espelho de lib/mail.js para as contas do site em inglês: mesmas funções,
 * mesmos parâmetros, mesma forma de saída ({ subject, text, html }), as mesmas
 * regras de lá (texto curto, sem imagem, nome só quando é nome, HTML
 * escapado). Quem escolhe entre os dois é lib/mensagens.js.
 *
 * Ficam de fora, de propósito: o recibo de compra (sai com o Paddle, etapa 5,
 * junto com os Termos em inglês), a desistência pelo CDC (lei brasileira; a
 * política do site em inglês é a etapa 6) e os e-mails de propaganda (etapa 7).
 *
 * Primeira versão escrita pelo Claude; a revisão por nativos é a etapa 4.
 */

import { nomeSeguro } from './nome.js';
import { escapar } from './mail.js';

function saudacao(nome) {
  const n = nomeSeguro(nome);
  return n ? `Hi ${n},` : 'Hi,';
}

const MESES = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

/**
 * A data em inglês ("October 28, 2026"), no mesmo fuso de `dataBR`: o prazo
 * do acesso é contado em Brasília, para as duas contas, e as duas datas têm
 * de ser o mesmo dia.
 */
export function dataEN(ms) {
  if (ms === null || ms === undefined || !Number.isFinite(Number(ms))) return '';
  const d = new Date(Number(ms) - 3 * 60 * 60 * 1000);
  return `${MESES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

const contato = suporte => (suporte ? `Any questions? Just reply to this email or write to ${suporte}.` : null);

export function mensagemDeRecuperacao({ nome, link, minutos, marca, suporte }) {
  const ola = saudacao(nome);
  const assinatura = marca || 'Hebraico Fluente';

  const text = [
    ola,
    '',
    `Someone asked to reset the password for your ${assinatura} account.`,
    'If that was you, use the link below:',
    '',
    link,
    '',
    `The link is valid for ${minutos} minutes and works only once.`,
    '',
    'If it was not you, you can ignore this message. Your password stays the same,',
    'and no one can change it without this link.',
    '',
    contato(suporte) ?? '',
    '',
    assinatura
  ].join('\n');

  const html = [
    `<p>${escapar(ola)}</p>`,
    `<p>Someone asked to reset the password for your ${escapar(assinatura)} account.`,
    ' If that was you, use the link below:</p>',
    `<p><a href="${escapar(link)}">Choose a new password</a></p>`,
    `<p>The link is valid for ${minutos} minutes and works only once.</p>`,
    '<p>If it was not you, you can ignore this message. Your password stays the',
    ' same, and no one can change it without this link.</p>',
    suporte ? `<p>Any questions? Write to ${escapar(suporte)}.</p>` : '',
    `<p>${escapar(assinatura)}</p>`
  ].join('');

  return { subject: `Reset your password - ${assinatura}`, text, html };
}

/* O parágrafo do fim é o que importa, como no português: este e-mail chega à
   dona do endereço mesmo quando não foi ela quem criou a conta. */
export function mensagemDeConfirmacao({ nome, link, dias, esqueci, marca, suporte }) {
  const ola = saudacao(nome);
  const assinatura = marca || 'Hebraico Fluente';

  const text = [
    ola,
    '',
    `A ${assinatura} account was created with this email address.`,
    'To confirm that it is yours, open the link below:',
    '',
    link,
    '',
    `The link is valid for ${dias} days. If it asks you to sign in, use the email`,
    'and password you chose when you signed up.',
    '',
    'Did not create this account? Then someone used your address.',
    `You can take it back at ${esqueci}. The new-password link goes only`,
    'to you, and changing the password signs out whoever created the account.',
    '',
    contato(suporte) ?? '',
    '',
    assinatura
  ].join('\n');

  const html = [
    `<p>${escapar(ola)}</p>`,
    `<p>A ${escapar(assinatura)} account was created with this email address.`,
    ' To confirm that it is yours, open the link below:</p>',
    `<p><a href="${escapar(link)}">Confirm my email</a></p>`,
    `<p>The link is valid for ${dias} days. If it asks you to sign in, use the email`,
    ' and password you chose when you signed up.</p>',
    '<p><strong>Did not create this account?</strong> Then someone used your',
    ` address. You can take it back at <a href="${escapar(esqueci)}">${escapar(esqueci)}</a>.`,
    ' The new-password link goes only to you, and changing the password signs out',
    ' whoever created the account.</p>',
    suporte ? `<p>Any questions? Write to ${escapar(suporte)}.</p>` : '',
    `<p>${escapar(assinatura)}</p>`
  ].join('');

  return { subject: `Confirm your email - ${assinatura}`, text, html };
}

export function mensagemDeEstorno({
  nome, curso, valor, pedido, cartao, contestacao = false, restaAte = '', marca, suporte
}) {
  const ola = saudacao(nome);
  const assinatura = marca || 'Hebraico Fluente';
  const abertura = contestacao
    ? `Your purchase of the course ${curso} was disputed with your bank or card issuer, and the amount has been returned.`
    : `The refund for your purchase of the course ${curso} is complete.`;
  const acesso = restaAte
    ? `The months from this purchase are removed from your access, which stays valid until ${restaAte}.`
    : 'Your access to the course has ended.';
  const dinheiro = cartao
    ? 'On a card, the amount shows up on your statement according to your card issuer\'s timeline.'
    : 'The amount goes back through the same payment method.';
  const progresso = 'Your study progress stays saved in your account, in case you come back one day.';

  const text = [
    ola,
    '',
    abertura,
    acesso,
    '',
    '---',
    `Course: ${curso}`,
    `Amount: ${valor}`,
    `Order: ${pedido}`,
    '---',
    '',
    dinheiro,
    progresso,
    '',
    contato(suporte),
    '',
    assinatura
  ].filter(l => l !== null).join('\n');

  const html = [
    `<p>${escapar(ola)}</p>`,
    `<p><strong>${escapar(abertura)}</strong> ${escapar(acesso)}</p>`,
    '<hr>',
    `<p>Course: ${escapar(curso)}<br>`,
    `Amount: ${escapar(valor)}<br>`,
    `Order: ${escapar(pedido)}</p>`,
    '<hr>',
    `<p>${escapar(dinheiro)} ${escapar(progresso)}</p>`,
    suporte ? `<p>${escapar(contato(suporte))}</p>` : '',
    `<p>${escapar(assinatura)}</p>`
  ].join('');

  return {
    subject: contestacao ? `Purchase disputed - ${curso}` : `Refund complete - ${curso}`,
    text,
    html
  };
}

/* `marco`: 'd30' | 'd7' | 'fim', como no português. */
export function mensagemDeVencimento({
  nome, curso, quando, dias, marco, meses, renovar, marca, suporte
}) {
  const ola = saudacao(nome);
  const assinatura = marca || 'Hebraico Fluente';
  const fim = marco === 'fim';
  const faltam = Number(dias) === 1 ? 'tomorrow' : `in ${dias} days`;
  const abertura = fim
    ? `Your access to the course ${curso} ended on ${quando}.`
    : `Your access to the course ${curso} ends on ${quando} (${faltam}).`;
  const como = fim
    ? `To start studying again, renew for ${meses} more months: ${renovar}`
    : `To keep studying, renew for ${meses} more months: ${renovar}`;
  const soma = fim
    ? 'Your progress stays saved in your account and comes back in full when you renew.'
    : `Renewing early does not lose a single day: the ${meses} months are added to the time you have left.`;
  const semAutomatico = 'There is no automatic renewal: nothing is charged unless you ask for it.';

  const text = [
    ola,
    '',
    abertura,
    '',
    como,
    soma,
    '',
    semAutomatico,
    '',
    contato(suporte),
    '',
    assinatura
  ].filter(l => l !== null).join('\n');

  const html = [
    `<p>${escapar(ola)}</p>`,
    `<p><strong>${escapar(abertura)}</strong></p>`,
    `<p><a href="${escapar(renovar)}">Renew for ${escapar(meses)} more months</a></p>`,
    `<p>${escapar(soma)}</p>`,
    `<p>${escapar(semAutomatico)}</p>`,
    suporte ? `<p>${escapar(contato(suporte))}</p>` : '',
    `<p>${escapar(assinatura)}</p>`
  ].join('');

  const subject = fim
    ? `Your access has ended - ${curso}`
    : `Your access ends in ${dias} ${Number(dias) === 1 ? 'day' : 'days'} - ${curso}`;
  return { subject, text, html };
}

/* Os três lembretes dos primeiros dias depois da compra (ver ativacao.js). */
export function mensagemDeAtivacao({ nome, curso, marco, concluidas, inicio, primeira, painel, marca, suporte }) {
  const ola = saudacao(nome);
  const assinatura = marca || 'Hebraico Fluente';
  const feitas = Number(concluidas) || 0;
  const fecho = 'There are only three of these reminders, in the first days after your purchase.';
  const ajuda = suporte
    ? `If something got in the way (signing in on another device, where to start), reply to this message or write to ${suporte}.`
    : 'If something got in the way (signing in on another device, where to start), reply to this message.';

  let subject; let corpo; let link; let rotulo;
  if (marco === 'd1') {
    subject = 'Your first letter takes ten minutes';
    corpo = [
      `Your access to the course ${curso} is ready.`,
      'The easiest way to start is Lesson 0, which shows how Hebrew writing works, and then the first letter, Alef, which takes about ten minutes.'
    ];
    link = inicio; rotulo = 'Start with Lesson 0';
  } else if (marco === 'd3') {
    subject = 'Anything holding you back from starting?';
    corpo = [
      `Your course ${curso} does not have a finished lesson yet.`,
      'Sometimes what holds us back is something small. The first letter is Alef, and with the next one, Mem, you already read your first word.',
      ajuda
    ];
    link = primeira; rotulo = 'Open the first letter';
  } else {
    subject = feitas > 0 ? 'Pick up where you left off' : 'One letter today?';
    corpo = feitas > 0
      ? [
          `You have finished ${feitas} ${feitas === 1 ? 'lesson' : 'lessons'} of the course ${curso}.`,
          'The course remembers where you stopped, on this device and on any other device where you sign in.'
        ]
      : [
          `It has been a week since your access to the course ${curso} was ready.`,
          'One letter at a time: each one takes about ten minutes.',
          ajuda
        ];
    link = feitas > 0 ? painel : primeira; rotulo = feitas > 0 ? 'Continue the course' : 'Open the first letter';
  }

  const text = [ola, '', ...corpo.flatMap(l => [l, '']), `${rotulo}: ${link}`, '', fecho, '', assinatura].join('\n');
  const html = [
    `<p>${escapar(ola)}</p>`,
    ...corpo.map(l => `<p>${escapar(l)}</p>`),
    `<p><a href="${escapar(link)}">${escapar(rotulo)}</a></p>`,
    `<p><small>${escapar(fecho)}</small></p>`,
    `<p>${escapar(assinatura)}</p>`
  ].join('');
  return { subject, text, html };
}
