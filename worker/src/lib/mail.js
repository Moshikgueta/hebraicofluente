/* Mandar um e-mail.
 * ─────────────────────────────────────────────────────────────────────────
 * Existe por um motivo só, e por enquanto tem um cliente só: a recuperação
 * de senha. Um aluno que perde a senha e não tem como recuperá-la sozinho
 * perde o curso que pagou - e escreve para o suporte, que é onde o dono da
 * plataforma descobre que virou o serviço de recuperação de senha.
 *
 * O provedor é a Resend, escolhida por caber inteira numa chamada de fetch:
 * o Worker não tem SMTP, não tem processo em segundo plano e não tem fila.
 * Trocar de provedor é trocar `entregar()`.
 *
 * ── três regras que valem contra o instinto ──────────────────────────────
 *
 * 1. FALHA ABERTA, E RUIDOSA. Um e-mail que não sai nunca derruba a
 *    requisição que o pediu. A pessoa que clicou em "esqueci minha senha"
 *    recebe a mesma resposta de sempre, e o problema vai para o log do
 *    Worker e para `/api/health`. O contrário - um 500 na cara de quem já
 *    está com dificuldade - não faz o e-mail chegar e ainda sugere que a
 *    conta dela não existe.
 *
 * 2. SEM CHAVE, NÃO FINGE QUE MANDOU. `mailReady()` é público e
 *    `/api/health` reporta. Um envio que retorna "ok" sem provedor
 *    configurado é como uma plataforma fica semanas sem recuperar a senha de
 *    ninguém, com todas as telas dizendo "enviamos, confira sua caixa".
 *
 * 3. O TEXTO É CURTO E SEM IMAGEM. E-mail de senha é lido em três segundos,
 *    muitas vezes num filtro de spam que gosta de HTML pesado. Vai `text` e
 *    `html` mínimo, o mesmo conteúdo nos dois.
 */

/**
 * O remetente. Fica em [vars] do wrangler.toml, não é segredo, e precisa ser
 * de um domínio verificado na Resend - senão ela recusa a entrega com 403.
 */
export const mailFrom = env =>
  String((env && env.EMAIL_FROM) || '').trim();

/** Dá para mandar e-mail nesta implantação? É o que /api/health reporta. */
export const mailReady = env => !!(env && env.RESEND_API_KEY && mailFrom(env));

/* A base da API. Existe para o `npm test` apontar para um servidor de
   mentira; não pertence nem ao painel nem ao wrangler.toml. */
const base = env => String((env && env.RESEND_BASE) || 'https://api.resend.com');

/**
 * Manda, e diz o que aconteceu.
 *
 * Nunca lança: quem chama está no meio de um fluxo de conta, e a decisão de
 * o que fazer com a falha é de lá. Devolve
 *   { ok: true }                         entregue à Resend
 *   { ok: false, motivo: 'sem-provedor' } falta RESEND_API_KEY ou EMAIL_FROM
 *   { ok: false, motivo: 'recusado', detalhe, status }
 *   { ok: false, motivo: 'rede', detalhe }
 */
export async function sendMail(env, { to, subject, text, html }) {
  if (!mailReady(env)) return { ok: false, motivo: 'sem-provedor' };

  const corpo = {
    from: mailFrom(env),
    to: [String(to)],
    subject: String(subject),
    text: String(text),
    ...(html ? { html: String(html) } : {})
  };

  let r;
  try {
    r = await fetch(`${base(env)}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(corpo)
    });
  } catch (e) {
    return { ok: false, motivo: 'rede', detalhe: String((e && e.message) || e) };
  }

  if (!r.ok) {
    /* O corpo do erro da Resend diz o que está errado ("domain is not
       verified", "invalid from") - e é justamente isso que alguém vai
       procurar no log às onze da noite. Cabe em 300 caracteres. */
    let detalhe = '';
    try { detalhe = (await r.text()).slice(0, 300); } catch { /* sem corpo */ }
    return { ok: false, motivo: 'recusado', status: r.status, detalhe };
  }

  /* O corpo da resposta (um id de mensagem) não serve a ninguém aqui, mas
     precisa ser consumido: uma resposta de fetch cujo corpo não é lido nem
     cancelado fica pendurada. */
  try { await r.text(); } catch { /* já consumido */ }
  return { ok: true };
}

/* ── a mensagem de recuperação ─────────────────────────────────────────── */

/**
 * O e-mail de "esqueci minha senha", montado num lugar só.
 *
 * Separado do envio de propósito: assim o teste lê o texto e confere que o
 * link está inteiro sem precisar de provedor nenhum, e o texto que o aluno
 * recebe é revisável sem abrir a lógica de HTTP.
 *
 * `minutos` entra no texto porque "o link expira" sem prazo não ajuda
 * ninguém a decidir se clica agora ou depois do jantar.
 */
export function mensagemDeRecuperacao({ nome, link, minutos, marca, suporte }) {
  const ola = nome ? `Oi, ${nome}.` : 'Oi.';
  const assinatura = marca || 'Hebraico Fluente';

  const text = [
    ola,
    '',
    `Alguém pediu para redefinir a senha da sua conta no ${assinatura}.`,
    'Se foi você, use o link abaixo:',
    '',
    link,
    '',
    `O link vale por ${minutos} minutos e funciona uma vez só.`,
    '',
    'Se não foi você, pode ignorar esta mensagem - sua senha continua a mesma,',
    'e ninguém consegue trocá-la sem este link.',
    '',
    suporte ? `Qualquer dúvida, é só responder ou escrever para ${suporte}.` : '',
    '',
    assinatura
  ].filter(l => l !== null).join('\n');

  /* HTML mínimo e sem CSS externo: cliente de e-mail não tem folha de
     estilo, e um <style> no topo é descartado por metade deles. */
  const html = [
    `<p>${escapar(ola)}</p>`,
    `<p>Alguém pediu para redefinir a senha da sua conta no ${escapar(assinatura)}.`,
    ' Se foi você, use o link abaixo:</p>',
    `<p><a href="${escapar(link)}">Escolher uma senha nova</a></p>`,
    `<p>O link vale por ${minutos} minutos e funciona uma vez só.</p>`,
    '<p>Se não foi você, pode ignorar esta mensagem - sua senha continua a',
    ' mesma, e ninguém consegue trocá-la sem este link.</p>',
    suporte ? `<p>Qualquer dúvida, escreva para ${escapar(suporte)}.</p>` : '',
    `<p>${escapar(assinatura)}</p>`
  ].join('');

  return { subject: `Redefinir sua senha - ${assinatura}`, text, html };
}

/* ── a mensagem de confirmação de e-mail ───────────────────────────────── */

/**
 * "Confirme seu e-mail", mandado no cadastro e quando a pessoa pede de novo.
 *
 * O parágrafo que importa é o do fim. Este e-mail chega à DONA do endereço
 * mesmo quando não foi ela quem criou a conta - e é a única chance de ela
 * saber disso. Então ele diz o que fazer: pedir uma senha nova, que só chega
 * a ela e derruba a sessão de quem criou.
 *
 * E ele NÃO diz "clique para confirmar e pronto": o link só confirma com a
 * conta aberta no navegador. Quem não criou a conta e clica por reflexo não
 * confirma nada - a tela pede login, e ela não tem a senha.
 */
export function mensagemDeConfirmacao({ nome, link, dias, esqueci, marca, suporte }) {
  const ola = nome ? `Oi, ${nome}.` : 'Oi.';
  const assinatura = marca || 'Hebraico Fluente';

  const text = [
    ola,
    '',
    `Sua conta no ${assinatura} foi criada com este endereço de e-mail.`,
    'Para confirmar que ele é seu, abra o link abaixo:',
    '',
    link,
    '',
    `O link vale por ${dias} dias. Se ele pedir para entrar, use o e-mail e a`,
    'senha que você escolheu no cadastro.',
    '',
    'Não foi você que criou esta conta? Então alguém usou o seu endereço.',
    `Você pode tomá-la de volta em ${esqueci} - o link de senha nova chega`,
    'só a você, e trocar a senha desconecta quem criou a conta.',
    '',
    suporte ? `Qualquer dúvida, é só responder ou escrever para ${suporte}.` : '',
    '',
    assinatura
  ].join('\n');

  const html = [
    `<p>${escapar(ola)}</p>`,
    `<p>Sua conta no ${escapar(assinatura)} foi criada com este endereço de e-mail.`,
    ' Para confirmar que ele é seu, abra o link abaixo:</p>',
    `<p><a href="${escapar(link)}">Confirmar meu e-mail</a></p>`,
    `<p>O link vale por ${dias} dias. Se ele pedir para entrar, use o e-mail e a`,
    ' senha que você escolheu no cadastro.</p>',
    '<p><strong>Não foi você que criou esta conta?</strong> Então alguém usou o seu',
    ` endereço. Você pode tomá-la de volta em <a href="${escapar(esqueci)}">${escapar(esqueci)}</a>`,
    ' - o link de senha nova chega só a você, e trocar a senha desconecta quem',
    ' criou a conta.</p>',
    suporte ? `<p>Qualquer dúvida, escreva para ${escapar(suporte)}.</p>` : '',
    `<p>${escapar(assinatura)}</p>`
  ].join('');

  return { subject: `Confirme seu e-mail - ${assinatura}`, text, html };
}

/* ── o aviso de presente aguardando ────────────────────────────────────── */

/**
 * Vai para o DONO, não para o aluno.
 *
 * Alguém acabou de criar conta com um endereço que tem presente reservado
 * (`liberar` sem conta existente). Antes isso virava acesso sozinho, e era o
 * furo F-18: bastava saber o endereço presenteado para chegar antes. Agora o
 * dono confere e libera - ele é quem sabe para quem deu.
 *
 * O e-mail do aluno APARECE aqui de propósito: quem lê é o dono, e sem o
 * endereço o aviso não serve para nada. É o único e-mail nosso que carrega
 * endereço de cliente, e vai para um destinatário só.
 */
export function mensagemDeConvitePendente({ email, nome, cursos, marca, painel }) {
  const assinatura = marca || 'Hebraico Fluente';
  const lista = (cursos || []).join(', ');

  const text = [
    'Alguém se cadastrou com um endereço que tem presente reservado.',
    '',
    `Endereço: ${email}`,
    nome ? `Nome no cadastro: ${nome}` : '',
    `Presente aguardando: ${lista}`,
    '',
    'O acesso NÃO foi liberado sozinho, de propósito: quem sabe para quem',
    'você deu o presente é você. Se for a pessoa certa, libere em',
    '',
    painel || 'GitHub → Actions → Acesso → liberar',
    '',
    'Se não for, não faça nada - o convite continua esperando.',
    '',
    assinatura
  ].filter(l => l !== '').join('\n');

  const html = [
    '<p>Alguém se cadastrou com um endereço que tem presente reservado.</p>',
    `<p>Endereço: <strong>${escapar(email)}</strong><br>`,
    nome ? `Nome no cadastro: ${escapar(nome)}<br>` : '',
    `Presente aguardando: ${escapar(lista)}</p>`,
    '<p>O acesso <strong>não</strong> foi liberado sozinho, de propósito: quem',
    ' sabe para quem você deu o presente é você. Se for a pessoa certa, libere',
    ` em ${escapar(painel || 'GitHub → Actions → Acesso → liberar')}.</p>`,
    '<p>Se não for, não faça nada - o convite continua esperando.</p>',
    `<p>${escapar(assinatura)}</p>`
  ].join('');

  return { subject: `Presente aguardando confirmação - ${assinatura}`, text, html };
}

/* ── a confirmação de compra ───────────────────────────────────────────── */

/**
 * Vai para o ALUNO, quando o pagamento é aprovado.
 *
 * Havia um buraco aqui que ninguém tinha visto: a pessoa pagava, o acesso
 * abria na tela, e a caixa de entrada dela ficava vazia. Sem recibo, sem link
 * para voltar, sem nada. Quem fechasse a aba precisava lembrar o nome do
 * site; quem quisesse conferir o que comprou não tinha onde.
 *
 * Com uma venda por semana isso não aparece. Com trinta, vira fila de suporte
 * com "paguei e não recebi nada" - e quem escreve isso não está enganado.
 *
 * ── o que esta mensagem carrega, e por quê ──────────────────────────────
 *
 *   O QUE ABRIU       o curso pelo nome e o link para começar. É a única
 *                     coisa que a pessoa quer nos primeiros dez segundos;
 *   COM QUE ENTRAR    o endereço desta mensagem. É a dúvida número um do
 *                     suporte de qualquer plataforma com conta;
 *   ATÉ QUANDO        a data, escrita. "12 meses" obriga a pessoa a fazer
 *                     conta a partir de um dia que ela já não lembra;
 *   QUANTO            o valor e o número do pedido. É o recibo, e o número é
 *                     o que torna uma dúvida respondível pelo suporte;
 *   O ARREPENDIMENTO  os sete dias do Código de Defesa do Consumidor. Não
 *                     está aqui por obrigação e sim porque dizer isso em voz
 *                     alta, por escrito, na hora da compra, é o que separa um
 *                     curso de um golpe aos olhos de quem acabou de pagar.
 *                     Quem confia pede menos reembolso, não mais.
 *
 * Sem anexo e sem imagem: a primeira mensagem de um remetente novo é a mais
 * provável de cair no spam, e HTML pesado com imagem remota é o que faz cair.
 */
export function mensagemDeCompra({
  nome, curso, valor, pedido, expiraEm, link, marca, suporte, arrependimentoDias, renovacao
}) {
  const ola = nome ? `Oi, ${nome}.` : 'Oi.';
  const assinatura = marca || 'Hebraico Fluente';
  /* "ao CURSO X", e não "ao X": o título vem do catálogo e pode começar com
     palavra de qualquer gênero - "ao Alfabetização em Hebraico" não é
     português. O substantivo no meio resolve para qualquer título futuro. */
  const abertura = renovacao
    ? `Seu acesso ao curso ${curso} foi renovado.`
    : `Seu acesso ao curso ${curso} está liberado.`;

  const text = [
    ola,
    '',
    abertura,
    '',
    `Comece por aqui: ${link}`,
    '',
    'Entre com este mesmo endereço de e-mail e a senha que você escolheu na',
    'compra. Seu progresso fica na conta, então dá para estudar no celular e',
    'continuar no computador de onde parou.',
    '',
    '---',
    `Curso: ${curso}`,
    `Valor: ${valor}`,
    expiraEm ? `Acesso até: ${expiraEm}` : null,
    `Pedido: ${pedido}`,
    '---',
    '',
    arrependimentoDias
      ? `Você tem ${arrependimentoDias} dias para desistir, contados a partir de agora, sem ` +
        'precisar justificar. É o Código de Defesa do Consumidor, e basta pedir: o valor volta integral.'
      : null,
    '',
    suporte ? `Qualquer dúvida, responda esta mensagem ou escreva para ${suporte}.` : null,
    '',
    assinatura
  /* `null` para a linha que não sai, `''` para a linha em branco que fica.
     Filtrar por `''` comia as duas e a mensagem chegava num bloco só. */
  ].filter(l => l !== null).join('\n');

  const html = [
    `<p>${escapar(ola)}</p>`,
    `<p><strong>${escapar(abertura)}</strong></p>`,
    `<p><a href="${escapar(link)}">Começar o curso</a></p>`,
    '<p>Entre com este mesmo endereço de e-mail e a senha que você escolheu na',
    ' compra. Seu progresso fica na conta, então dá para estudar no celular e',
    ' continuar no computador de onde parou.</p>',
    '<hr>',
    `<p>Curso: ${escapar(curso)}<br>`,
    `Valor: ${escapar(valor)}<br>`,
    expiraEm ? `Acesso até: ${escapar(expiraEm)}<br>` : '',
    `Pedido: ${escapar(pedido)}</p>`,
    '<hr>',
    arrependimentoDias
      ? `<p>Você tem ${arrependimentoDias} dias para desistir, contados a partir de agora,` +
        ' sem precisar justificar. É o Código de Defesa do Consumidor, e basta pedir:' +
        ' o valor volta integral.</p>'
      : '',
    suporte
      ? `<p>Qualquer dúvida, responda esta mensagem ou escreva para ${escapar(suporte)}.</p>`
      : '',
    `<p>${escapar(assinatura)}</p>`
  ].join('');

  return {
    subject: renovacao ? `Acesso renovado - ${curso}` : `Seu acesso está liberado - ${curso}`,
    text,
    html
  };
}

/**
 * A data em português, no fuso de quem compra.
 *
 * `toLocaleDateString` não é usado de propósito: o Worker roda em UTC, e um
 * acesso que vence às 23h de uma terça em São Paulo sairia escrito como
 * quarta - um dia a mais numa data que a pessoa vai cobrar. O Brasil não tem
 * horário de verão desde 2019, então o deslocamento fixo de três horas é
 * exato, e não uma aproximação.
 */
export function dataBR(ms) {
  if (ms === null || ms === undefined || !Number.isFinite(Number(ms))) return '';
  const d = new Date(Number(ms) - 3 * 60 * 60 * 1000);
  const dois = n => String(n).padStart(2, '0');
  return `${dois(d.getUTCDate())}/${dois(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

/** Centavos em reais, como o site escreve. */
export function reaisBR(centavos, moeda = 'BRL') {
  const v = Number(centavos || 0) / 100;
  const n = v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return moeda === 'BRL' ? `R$ ${n}` : `${n} ${moeda}`;
}

/** O nome do aluno entra no HTML. Um nome com `<` não pode virar marcação. */
function escapar(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
