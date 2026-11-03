// Configuracao lida do ambiente. Nada de segredo escrito no codigo: em
// producao, MCD_SECRET ausente derruba o servidor em vez de usar um padrao.

const DEV_SECRET = 'dev-somente-local-nunca-em-producao-0000000000';

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function serverSecret(): string {
  const s = process.env.MCD_SECRET;
  if (s && s.length >= 32) return s;
  if (isProduction() && process.env.MCD_ALLOW_DEV_SECRET !== '1') {
    throw new Error('MCD_SECRET precisa existir (32+ caracteres) em producao.');
  }
  return DEV_SECRET;
}

// O endereco publico sai da configuracao, nunca do cabecalho Host: um pedido
// forjado nao pode fazer a plataforma montar links de convite para outro lugar.
export function publicUrl(): string {
  return (process.env.MCD_PUBLIC_URL ?? 'http://localhost:3100').replace(/\/+$/, '');
}

export function pbkdf2Iterations(): number {
  const n = Number(process.env.MCD_PBKDF2_ITERATIONS ?? 600_000);
  return Number.isFinite(n) && n >= 1000 ? Math.floor(n) : 600_000;
}
