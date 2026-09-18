/* Criptografia: senhas, assinaturas e ids.
 * ─────────────────────────────────────────────────────────────────────────
 * Tudo aqui é WebCrypto, que existe no runtime do Worker sem dependência
 * nenhuma. Três coisas merecem o comentário:
 *
 * 1. O número de iterações do PBKDF2 é GRAVADO EM CADA LINHA da tabela de
 *    contas. É isso que permite aumentar o custo depois sem invalidar a senha
 *    de ninguém: uma conta antiga continua sendo verificada com o número dela,
 *    e qualquer senha definida a partir de agora usa o novo.
 *
 * 2. `fakeVerify` queima o mesmo trabalho quando a conta não existe. Sem isso,
 *    o tempo de resposta responde "esse e-mail é cliente?" para qualquer um
 *    com um formulário e paciência — e a mensagem de erro cuidadosamente
 *    genérica não adianta nada.
 *
 * 3. Toda assinatura HMAC leva um PREFIXO de domínio ('sess:', 'mp:'). Sem
 *    ele, um token emitido para uma finalidade pode ser reapresentado como se
 *    fosse de outra. É barato e fecha uma classe inteira de erro.
 */

const enc = new TextEncoder();

/** 310.000 — o piso recomendado pelo OWASP para PBKDF2-HMAC-SHA256. */
export const PBKDF2_ITER = 310_000;

const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const unhex = s => Uint8Array.from(s.match(/../g).map(h => parseInt(h, 16)));

export function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(s) {
  let t = s.replace(/-/g, '+').replace(/_/g, '/');
  while (t.length % 4) t += '=';
  const bin = atob(t);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Comparação de tempo constante. Comparar assinatura com `===` vaza, por
 *  tempo, quantos bytes iniciais estavam certos. */
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function sha256hex(s) {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(String(s))));
}

/** Ids opacos. O cliente NUNCA escolhe um id de pedido: ele é a chave
 *  primária da tabela, e chave escolhida por quem chama é endereço para a
 *  linha de outra pessoa. */
export function newId(prefix) {
  const b = crypto.getRandomValues(new Uint8Array(16));
  return prefix + [...b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/* ── senhas ─────────────────────────────────────────────────────────────── */

export async function hashPassword(pass, saltHex, iterations = PBKDF2_ITER) {
  const salt = saltHex ? unhex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(String(pass)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return { hash: hex(bits), salt: hex(salt), iterations };
}

export async function verifyPassword(pass, saltHex, hashHex, iterations) {
  const iter = Number(iterations) > 0 ? Number(iterations) : PBKDF2_ITER;
  const { hash } = await hashPassword(pass, saltHex, iter);
  return timingSafeEqual(hash, hashHex);
}

const DUMMY_SALT = '00000000000000000000000000000000';
export async function fakeVerify(pass) {
  await hashPassword(String(pass || ''), DUMMY_SALT, PBKDF2_ITER);
  return false;
}

/* ── assinaturas ────────────────────────────────────────────────────────── */

export async function hmacRaw(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(String(secret)),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', key, enc.encode(String(data)));
}

export const hmacB64 = async (secret, data) => b64url(await hmacRaw(secret, data));
export const hmacHex = async (secret, data) => hex(await hmacRaw(secret, data));
