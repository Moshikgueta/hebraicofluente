// Primitivas de criptografia em WebCrypto: rodam igual no Node e no Workers.

import { pbkdf2Iterations, serverSecret } from './env';

const enc = new TextEncoder();

export function toBase64Url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomToken(bytes = 32): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256Hex(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(serverSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

export async function hmacHex(text: string): Promise<string> {
  return toHex(await crypto.subtle.sign('HMAC', await hmacKey(), enc.encode(text)));
}

// Comparacao em tempo constante para dois textos do mesmo formato.
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ─── Senhas: PBKDF2-SHA256 ───────────────────────────────────────────────────
// Formato guardado: pbkdf2$sha256$<iteracoes>$<sal>$<hash>. As iteracoes vao
// junto, entao subir o numero no futuro nao invalida as senhas antigas.

export async function hashPassword(password: string, iterations = pbkdf2Iterations()): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await derive(password, salt, iterations);
  return `pbkdf2$sha256$${iterations}$${toBase64Url(salt)}$${toBase64Url(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, hash, iter, saltB64, expected] = stored.split('$');
  if (scheme !== 'pbkdf2' || hash !== 'sha256' || !iter || !saltB64 || !expected) return false;
  const bits = await derive(password, fromBase64Url(saltB64), Number(iter));
  return safeEqual(toBase64Url(bits), expected);
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

// ─── Cifra simetrica (AES-GCM) para o codigo do convite ─────────────────────

async function aesKey(): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest('SHA-256', enc.encode(`mcd-convite:${serverSecret()}`));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encryptText(plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(), enc.encode(plain));
  return `${toBase64Url(iv)}.${toBase64Url(new Uint8Array(ct))}`;
}

export async function decryptText(cipher: string): Promise<string | null> {
  const [ivB64, ctB64] = cipher.split('.');
  if (!ivB64 || !ctB64) return null;
  try {
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64Url(ivB64) as BufferSource },
      await aesKey(),
      fromBase64Url(ctB64) as BufferSource,
    );
    return new TextDecoder().decode(pt);
  } catch {
    return null;
  }
}
