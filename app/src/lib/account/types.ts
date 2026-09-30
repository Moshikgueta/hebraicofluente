/* A conta do aluno.
 * ─────────────────────────────────────────────────────────────────────────
 * O tipo mais importante aqui é `Entitlement`, e o detalhe mais importante
 * dele é `expiresAt`. Acesso comprado tem prazo (12 meses, por curso), e um
 * sistema que guarda "comprou: sim" sem guardar até quando não consegue
 * responder a pergunta que importa no décimo terceiro mês.
 *
 * O que NÃO está aqui, de propósito:
 *   · senha, em qualquer forma. O hash vive no servidor e não sai de lá.
 *   · progresso. O progresso é do aparelho (lib/state), não da conta - ver
 *     a nota em account/store.tsx sobre por que ainda é assim.
 *   · cartão, CPF, endereço. A plataforma nunca vê: quem processa é a
 *     Mercado Pago, e o que volta é um id de pagamento.
 */

import { empresa } from '@/lib/empresa';

export type Account = {
  id: string;
  name: string;
  /** Sempre em minúsculas e sem espaços nas pontas - normalizado na entrada. */
  email: string;
  createdAt: string;
  /** O e-mail foi confirmado pelo link? `null` (ou ausente) quando o servidor
   *  não tem como saber - aí a tela não pede nada. Confirmar não bloqueia
   *  nada: a conta e a compra funcionam sem isso. */
  emailVerified?: boolean | null;
  /** Pediu, no perfil, um e-mail quando o próximo curso abrir. Ausente =
   *  não pediu. Ver worker/src/api/novidades.js. */
  novidades?: boolean;
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
  /** Quando o pagamento foi confirmado. */
  paidAt?: string | null;
  /** Até quando o botão "Desistir da compra" vale (CDC, art. 49): o fim do
   *  sétimo dia depois do pagamento, em Brasília. `null` fora de pedido pago. */
  desistirAte?: string | null;
  /** Quando a desistência foi pedida pelo site, se foi. */
  desistenciaEm?: string | null;
  /** Como o dinheiro volta: `automatico` (o site pediu o estorno à Mercado
   *  Pago), `manual` (a equipe devolve) ou null (sem desistência). */
  estorno?: 'automatico' | 'manual' | null;
};

export type PaymentMethod = 'pix' | 'card';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'expired';

/* ── erros ──────────────────────────────────────────────────────────────
   Códigos fechados, e cada um com uma frase em português que pode ir direto
   para a tela. Um erro de autenticação que chega ao aluno como "Error 401"
   é um aluno perdido. */

export type AuthErrorCode =
  | 'bad-credentials' | 'email-taken' | 'weak-password' | 'invalid-email'
  | 'not-signed-in' | 'offline' | 'server' | 'rate-limited' | 'rate-limited-hora' | 'payments-off'
  | 'bad-token' | 'payment-failed' | 'card-off' | 'pix-off' | 'already-owned'
  | 'fora-do-prazo' | 'nao-pago' | 'termos';

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
  'termos': 'Para criar a conta, marque que você leu e aceita os Termos de Uso.',
  'not-signed-in': 'Você precisa entrar para continuar.',
  'offline': 'Sem conexão. Tente de novo em um instante.',
  'server': 'Alguma coisa quebrou do nosso lado. Tente de novo.',
  'rate-limited': 'Tentativas demais. Espere um minuto.',
  /* O teto da hora (worker/src/api/auth.js). Dizer "um minuto" aqui mandaria
     a pessoa tentar de novo em vão sessenta vezes. */
  'rate-limited-hora': 'Tentativas demais por agora. Tente de novo daqui a uma hora.',
  /* Não é erro: é a plataforma no ar antes de o meio de pagamento estar
     ligado. Dizer isso evita que alguém tente três vezes e conclua que o
     cartão dele foi recusado. */
  'payments-off': `O pagamento ainda não está ativado. Escreva para ${empresa.contato.emailSuporte} e liberamos seu acesso.`,
  /* Um código para quatro situações - link errado, vencido, já usado e
     inexistente - porque distinguir só ajuda quem está tentando adivinhar. A
     frase diz o que fazer, que é a única coisa útil nas quatro. */
  'bad-token': 'Esse link não vale mais. Peça outro - eles duram uma hora e funcionam uma vez só.',
  /* O pagamento não chegou a ser criado: o provedor recusou. NÃO manda tentar
     de novo, ao contrário do `server` genérico - a causa é de configuração
     nossa, e repetir vai falhar de novo. A pessoa está com o cartão na mão;
     o que serve a ela é saber que o problema não é dela e ter para onde
     escrever. */
  'payment-failed': `Não conseguimos gerar o pagamento agora, e o problema é nosso, não seu. Escreva para ${empresa.contato.emailSuporte} que a gente resolve na hora - e nada foi cobrado.`,
  /* O checkout não oferece cartão quando só existe PIX, então em uso normal
     ninguém vê esta frase: ela é a rede para um pedido antigo aberto numa aba
     esquecida, ou para alguém chamando a API na mão. Diz o que fazer em vez de
     dizer que deu erro, porque o caminho que funciona está na mesma tela. */
  'card-off': 'No momento só aceitamos PIX. Volte e escolha PIX - o código sai na hora.',
  /* O espelho do de cima, para quando é o PIX que a conta do provedor não
     tem habilitado. Mesma regra: dizer o caminho que funciona, que está na
     mesma tela, em vez de anunciar um defeito. */
  'pix-off': 'No momento só aceitamos cartão de crédito. Volte e escolha cartão - dá para parcelar.',
  /* Não é erro, é a compra repetida barrada. A renovação abre sozinha nos
     últimos 45 dias; antes disso não há o que pagar. */
  'already-owned': 'Este curso já está na sua conta. A renovação abre nos últimos 45 dias de acesso.',
  /* A desistência pelo site. Passado o prazo, o caminho é o mesmo da Política
     de Reembolso para depois dos sete dias: escrever. */
  'fora-do-prazo': `O prazo de ${empresa.politicas.arrependimentoDias} dias para desistir desta compra terminou. Se houver problema técnico ou cobrança indevida, escreva para ${empresa.contato.emailSuporte}.`,
  'nao-pago': 'Esta compra não está paga, então não há o que devolver.'
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
