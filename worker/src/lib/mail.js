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

/** O nome do aluno entra no HTML. Um nome com `<` não pode virar marcação. */
function escapar(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
