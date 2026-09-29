/* A sessão: um cookie assinado, sem estado no servidor.
 * ─────────────────────────────────────────────────────────────────────────
 * O cookie carrega só a identidade - quem é, e até quando este cookie vale.
 * O que ele NÃO carrega é o que a pessoa comprou.
 *
 * Isso é a decisão importante do arquivo e vale contra o instinto: pôr os
 * cursos dentro do cookie economizaria uma consulta por requisição, e faria
 * um estorno levar até sete dias para fechar a porta - o tempo de o cookie
 * antigo expirar. Direito de acesso é lido do banco, toda vez. O cookie diz
 * QUEM, o banco diz O QUÊ.
 *
 * `sv` (session version) é a saída de emergência: subir o número na linha da
 * conta invalida todo cookie já emitido para ela - troca de senha, suspeita de
 * vazamento, conta compartilhada aos montes.
 *
 * HttpOnly porque o JavaScript da página não tem por que ler isto (e um XSS
 * então não leva sessão nenhuma embora); Secure porque só trafega em HTTPS;
 * SameSite=Lax porque ele TEM de sobreviver ao redirect de volta da Mercado
 * Pago, que é uma navegação de topo vinda de outro site.
 */

import { b64url, b64urlDecode, hmacB64, timingSafeEqual } from './crypto.js';

/* `__Host-` é uma trava do NAVEGADOR: ele só aceita um cookie com esse
   prefixo se vier com Secure, Path=/ e SEM Domain - ou seja, só este host
   consegue gravá-lo. Um subdomínio (hoje não há nenhum além do www, que só
   redireciona) não consegue plantar um cookie de sessão com este nome no
   navegador de alguém - por exemplo, o de uma conta do atacante, para que
   a vítima estude e pague dentro dela. */
const COOKIE = '__Host-hf_session';

/* O nome antigo, sem o prefixo. Aceito só até LEGADO_ATE, para que a troca
   de nome não deslogue todo mundo de uma vez: um cookie antigo válido é
   trocado pelo novo na primeira chamada a /api/me (ver `me` em
   api/auth.js), que o app faz a cada página. Cookie de sessão dura sete
   dias, então passado esse prazo depois da publicação não sobra nenhum
   legítimo - e aceitar o nome antigo depois disso só manteria aberta a
   porta que o prefixo fecha. Quando a data passar, esta constante e o ramo
   que a usa podem sair. */
const LEGADO = 'hf_session';
export const LEGADO_ATE = Date.UTC(2026, 9, 15);   // 15/10/2026

/* Sete dias. O cookie é um retrato: sua validade é a pior janela em que uma
   conta apagada continua sendo reconhecida. Trinta dias seria carregar um
   problema por um mês. */
const DAYS = 7;

const enc = new TextEncoder();

export async function makeSessionCookie(env, account, ap = null) {
  /* Só o que o servidor lê de volta: quem, qual versão, até quando, qual
     aparelho. O
     e-mail e o nome já viajaram aqui dentro e ninguém os lia - e um cookie
     é visível em captura de tela de suporte, em extensão de navegador, em
     log de proxy. O que não está no cookie não vaza pelo cookie. */
  const payload = b64url(enc.encode(JSON.stringify({
    uid: account.id,
    sv: Number(account.session_version) || 0,
    exp: Date.now() + DAYS * 86_400_000,
    /* O aparelho desta entrada (lib/aparelhos.js): um id aleatório, que só
       diz qual das três vagas da conta este navegador ocupa. */
    ...(ap ? { ap } : {})
  })));
  const sig = await hmacB64(env.SESSION_SECRET, 'sess:' + payload);
  return `${COOKIE}=${payload}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DAYS * 86_400}`;
}

/* Dois cabeçalhos: o nome novo e o antigo. Sair tem de apagar os dois, senão
   o antigo continuaria no navegador valendo até LEGADO_ATE. `json()` em
   lib/http.js manda um array como vários Set-Cookie. */
export const clearSessionCookie = [
  `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  `${LEGADO}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
];

/** O Set-Cookie que apaga só o nome antigo, para quem acabou de ser migrado. */
export const clearLegacyCookie =
  `${LEGADO}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

/** O conteúdo do cookie, só se a assinatura confere e ele não venceu.
 *  Não consulta o banco: quem precisa da conta de verdade usa `requireAccount`. */
export async function readSession(request, env) {
  if (!env.SESSION_SECRET) return null;
  /* Todos os candidatos com este nome, e vale o primeiro que CONFERE - não
     o primeiro que aparece. Um cookie de mesmo nome plantado com um Path
     mais longo é enviado antes do legítimo, e ficar no primeiro achado
     transformava esse enxerto num logout permanente da vítima. */
  /* O teto é de TRABALHO, não de contagem: um cookie legítimo tem uns 200
     caracteres, então tudo acima de 512 é descartado sem gastar um HMAC, e
     até 32 candidatos são conferidos. Um teto de quatro, que já esteve aqui,
     reabria a porta que ele fechava - bastavam cinco enxertos para o
     legítimo nunca entrar no laço. Conferir trinta HMACs curtos custa menos
     de um milissegundo. */
  const partes = (request.headers.get('Cookie') || '').split(/;\s*/);
  const doNome = nome => partes
    .filter(c => c.startsWith(nome + '=') && c.length <= 512)
    .map(val => ({ val: val.slice(nome.length + 1), legado: nome === LEGADO }));
  /* O nome novo primeiro: com os dois presentes, vale o novo. */
  const candidatos = [
    ...doNome(COOKIE),
    ...(Date.now() < LEGADO_ATE ? doNome(LEGADO) : [])
  ].slice(0, 32);

  for (const { val, legado } of candidatos) {
    const dot = val.lastIndexOf('.');
    if (dot < 0) continue;
    const payload = val.slice(0, dot), sig = val.slice(dot + 1);
    if (!timingSafeEqual(sig, await hmacB64(env.SESSION_SECRET, 'sess:' + payload))) continue;

    let data;
    try { data = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))); }
    catch { continue; }

    if (!data || typeof data.exp !== 'number' || data.exp < Date.now()) continue;
    return legado ? { ...data, legado: true } : data;
  }
  return null;
}
