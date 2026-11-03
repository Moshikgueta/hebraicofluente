// Codigo de convite: 12 caracteres do alfabeto Crockford (sem I, L, O, U, que
// se confundem com 1 e 0 ou viram palavra). 60 bits: com o freio por endereco,
// adivinhar um codigo valido nao e um caminho.

import { encryptText, hmacHex } from '../crypto';

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function generateInviteCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let out = '';
  for (const b of bytes) out += ALPHABET[b & 31];
  return out;
}

// O que a pessoa digita: minusculas, espacos, hifens, O no lugar de 0.
export function normalizeInviteCode(input: string): string | null {
  const s = input
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
  return /^[0-9A-HJKMNP-TV-Z]{12}$/.test(s) ? s : null;
}

export function formatInviteCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

// HMAC com o segredo do servidor: com a tabela vazada e sem o segredo, nao da
// para testar codigos fora do ar.
export function hashInviteCode(code: string): Promise<string> {
  return hmacHex(`convite:${code}`);
}

export async function newInviteCode(): Promise<{ code: string; hash: string; cipher: string; hint: string }> {
  const code = generateInviteCode();
  return { code, hash: await hashInviteCode(code), cipher: await encryptText(code), hint: code.slice(-4) };
}
