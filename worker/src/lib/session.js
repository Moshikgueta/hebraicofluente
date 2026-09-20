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

const COOKIE = 'hf_session';

/* Sete dias. O cookie é um retrato: sua validade é a pior janela em que uma
   conta apagada continua sendo reconhecida. Trinta dias seria carregar um
   problema por um mês. */
const DAYS = 7;

const enc = new TextEncoder();

export async function makeSessionCookie(env, account) {
  /* Só o que o servidor lê de volta: quem, qual versão, até quando. O
     e-mail e o nome já viajaram aqui dentro e ninguém os lia - e um cookie
     é visível em captura de tela de suporte, em extensão de navegador, em
     log de proxy. O que não está no cookie não vaza pelo cookie. */
  const payload = b64url(enc.encode(JSON.stringify({
    uid: account.id,
    sv: Number(account.session_version) || 0,
    exp: Date.now() + DAYS * 86_400_000
  })));
  const sig = await hmacB64(env.SESSION_SECRET, 'sess:' + payload);
  return `${COOKIE}=${payload}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DAYS * 86_400}`;
}

export const clearSessionCookie =
  `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

/** O conteúdo do cookie, só se a assinatura confere e ele não venceu.
 *  Não consulta o banco: quem precisa da conta de verdade usa `requireAccount`. */
export async function readSession(request, env) {
  if (!env.SESSION_SECRET) return null;
  /* Todos os candidatos com este nome, e vale o primeiro que CONFERE - não
     o primeiro que aparece. Um cookie de mesmo nome plantado com um Path
     mais longo é enviado antes do legítimo, e ficar no primeiro achado
     transformava esse enxerto num logout permanente da vítima. */
  const candidatos = (request.headers.get('Cookie') || '')
    .split(/;\s*/)
    .filter(c => c.startsWith(COOKIE + '='))
    .map(c => c.slice(COOKIE.length + 1))
    .slice(0, 4);

  for (const val of candidatos) {
    const dot = val.lastIndexOf('.');
    if (dot < 0) continue;
    const payload = val.slice(0, dot), sig = val.slice(dot + 1);
    if (!timingSafeEqual(sig, await hmacB64(env.SESSION_SECRET, 'sess:' + payload))) continue;

    let data;
    try { data = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))); }
    catch { continue; }

    if (!data || typeof data.exp !== 'number' || data.exp < Date.now()) continue;
    return data;
  }
  return null;
}
