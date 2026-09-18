/* A conta do aluno.
 * ─────────────────────────────────────────────────────────────────────────
 * O tipo mais importante aqui é `Entitlement`, e o detalhe mais importante
 * dele é `expiresAt`. Acesso comprado tem prazo (12 meses, por curso), e um
 * sistema que guarda "comprou: sim" sem guardar até quando não consegue
 * responder a pergunta que importa no décimo terceiro mês.
 *
 * O que NÃO está aqui, de propósito:
 *   · senha, em qualquer forma. O hash vive no servidor e não sai de lá.
 *   · progresso. O progresso é do aparelho (lib/state), não da conta — ver
 *     a nota em account/store.tsx sobre por que ainda é assim.
 *   · cartão, CPF, endereço. A plataforma nunca vê: quem processa é a
 *     Mercado Pago, e o que volta é um id de pagamento.
 */

export type Account = {
  id: string;
  name: string;
  /** Sempre em minúsculas e sem espaços nas pontas — normalizado na entrada. */
  email: string;
  createdAt: string;
};

export type Entitlement = {
  courseSlug: string;
  grantedAt: string;
  /** ISO. `null` = acesso vitalício; nenhum curso vende isso hoje. */
  expiresAt: string | null;
  /** O pedido que gerou o acesso. É por aqui que um estorno o encontra. */
  orderId: string;
};

export type Session = {
  account: Account;
  entitlements: Entitlement[];
};

/** Um pedido em andamento, do ponto de vista do aluno. */
export type Order = {
  id: string;
  courseSlug: string;
  /** Centavos. Dinheiro em ponto flutuante é como se perde um centavo por venda. */
  amountCents: number;
  method: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  /** Só para PIX: o copia-e-cola e o QR. */
  pix?: { code: string; qrPngBase64: string | null; expiresAt: string };
};

export type PaymentMethod = 'pix' | 'card';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'expired';

/* ── erros ──────────────────────────────────────────────────────────────
   Códigos fechados, e cada um com uma frase em português que pode ir direto
   para a tela. Um erro de autenticação que chega ao aluno como "Error 401"
   é um aluno perdido. */

export type AuthErrorCode =
  | 'bad-credentials' | 'email-taken' | 'weak-password' | 'invalid-email'
  | 'not-signed-in' | 'offline' | 'server' | 'rate-limited';

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode, message?: string) {
    super(message ?? MESSAGES[code]);
    this.name = 'AuthError';
  }
}

export const MESSAGES: Record<AuthErrorCode, string> = {
  /* Não diz se foi o e-mail ou a senha: dizer entrega quais e-mails têm conta. */
  'bad-credentials': 'E-mail ou senha não conferem.',
  'email-taken': 'Já existe uma conta com esse e-mail. Tente entrar.',
  'weak-password': 'A senha precisa de pelo menos 8 caracteres.',
  'invalid-email': 'Esse e-mail não parece válido.',
  'not-signed-in': 'Você precisa entrar para continuar.',
  'offline': 'Sem conexão. Tente de novo em um instante.',
  'server': 'Alguma coisa quebrou do nosso lado. Tente de novo.',
  'rate-limited': 'Tentativas demais. Espere um minuto.'
};

/* ── regras de acesso ────────────────────────────────────────────────────
   Uma função, usada pela tela, pelo painel e pelo portão de rota. Se houver
   duas cópias desta regra, uma delas vai discordar da outra num dia ruim. */

export function entitlementFor(
  session: Session | null, courseSlug: string, now: Date = new Date()
): Entitlement | null {
  if (!session) return null;
  const e = session.entitlements.find(x => x.courseSlug === courseSlug);
  if (!e) return null;
  if (e.expiresAt && new Date(e.expiresAt).getTime() <= now.getTime()) return null;
  return e;
}

export const hasAccess = (
  session: Session | null, courseSlug: string, now?: Date
): boolean => entitlementFor(session, courseSlug, now) !== null;

/** Dias restantes, para o aviso de renovação. `null` quando não há acesso. */
export function daysLeft(
  session: Session | null, courseSlug: string, now: Date = new Date()
): number | null {
  const e = entitlementFor(session, courseSlug, now);
  if (!e || !e.expiresAt) return null;
  const ms = new Date(e.expiresAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/* ── validação de entrada ────────────────────────────────────────────────
   Do lado do cliente isto é cortesia: dá o erro antes da viagem de rede. O
   servidor valida tudo de novo, porque validação de cliente é sugestão. */

/** Deliberadamente frouxo. Um regex "correto" de e-mail rejeita endereços
 *  válidos, e o único teste que vale é o e-mail chegar. */
export const emailLooksValid = (s: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

export const normalizeEmail = (s: string): string => s.trim().toLowerCase();

/** Oito caracteres. Nada de exigir maiúscula e símbolo: isso produz senhas
 *  piores, escritas em post-it, e o NIST recomenda o contrário desde 2017. */
export const MIN_PASSWORD = 8;
export const passwordOk = (s: string): boolean => s.length >= MIN_PASSWORD;
