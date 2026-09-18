/* O adaptador local: a plataforma inteira dentro do localStorage.
 * ─────────────────────────────────────────────────────────────────────────
 * Existe por dois motivos práticos e um de honestidade.
 *
 * Práticos: `npm run dev` roda sem Cloudflare, sem D1 e sem chave da Mercado
 * Pago; e o export estático que hoje vai para o GitHub Pages não tem /api
 * nenhum, então sem isto as telas de conta e checkout não teriam como ser
 * vistas, revisadas ou testadas.
 *
 * Honestidade: ele guarda senha com o MESMO PBKDF2 do servidor — 310.000
 * iterações, SHA-256, sal de 16 bytes, aleatório por conta. Um mock que
 * guarda senha em texto puro ensina o formato errado para quem for ler o
 * código depois, e mais cedo ou mais tarde alguém copia o mock.
 *
 * O que ele explicitamente NÃO faz é fingir que cobrou. `startOrder` devolve
 * um pedido marcado como demonstração, e a UI diz isso na tela.
 */

import type { PlatformApi } from './api';
import {
  AuthError, emailLooksValid, normalizeEmail, passwordOk,
  type Entitlement, type Order, type PaymentMethod, type Session
} from './types';
import { getCourse } from '@/lib/catalog';
import { cents } from '@/lib/catalog';

const KEY = 'hf-platform-local-v1';

/* Os mesmos parâmetros do Worker. Se um dos dois mudar, os dois mudam — o
   hash gravado carrega o número de iterações justamente para que uma conta
   antiga continue abrindo depois de uma subida de custo. */
const ITERATIONS = 310_000;
const KEYLEN = 32;

type Stored = {
  v: 1;
  accounts: Record<string, {
    id: string; name: string; email: string; createdAt: string;
    pw: string;                       // pbkdf2$<iter>$<saltB64>$<hashB64>
    entitlements: Entitlement[];
    orders: Order[];
  }>;
  /** E-mail da conta logada, ou null. */
  current: string | null;
};

const EMPTY: Stored = { v: 1, accounts: {}, current: null };

function read(): Stored {
  if (typeof localStorage === 'undefined') return { ...EMPTY };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Stored;
    return parsed?.v === 1 && parsed.accounts ? parsed : { ...EMPTY };
  } catch { return { ...EMPTY }; }
}

function write(s: Stored): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* janela anônima */ }
}

const b64 = (b: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64 = (s: string): Uint8Array =>
  Uint8Array.from(atob(s), c => c.charCodeAt(0));

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    key, KEYLEN * 8
  );
  return b64(bits);
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${b64(salt.buffer as ArrayBuffer)}$${hash}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iter, salt, hash] = stored.split('$');
  if (scheme !== 'pbkdf2') return false;
  const got = await derive(password, unb64(salt!), Number(iter));
  /* Comparação de tempo constante. Aqui, num mock de navegador, não protege
     de nada — mas é o formato que o Worker copia, e lá protege. */
  if (got.length !== hash!.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hash!.charCodeAt(i);
  return diff === 0;
}

const id = (p: string): string =>
  `${p}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;

/** Um atraso curto, para que a UI de "entrando…" seja exercitada de verdade
 *  em vez de piscar. Não é teatro: sem isto, estados de carregamento nunca
 *  aparecem em desenvolvimento e quebram só em produção. */
const tick = () => new Promise(r => setTimeout(r, 180));

export class LocalApi implements PlatformApi {
  readonly mode = 'local' as const;

  private session(s: Stored): Session | null {
    const a = s.current ? s.accounts[s.current] : undefined;
    if (!a) return null;
    return {
      account: { id: a.id, name: a.name, email: a.email, createdAt: a.createdAt },
      entitlements: a.entitlements
    };
  }

  async me(): Promise<Session | null> {
    return this.session(read());
  }

  async signUp({ name, email, password }: { name: string; email: string; password: string }) {
    await tick();
    const mail = normalizeEmail(email);
    if (!emailLooksValid(mail)) throw new AuthError('invalid-email');
    if (!passwordOk(password)) throw new AuthError('weak-password');
    const s = read();
    if (s.accounts[mail]) throw new AuthError('email-taken');
    s.accounts[mail] = {
      id: id('acc'), name: name.trim() || 'Aluno', email: mail,
      createdAt: new Date().toISOString(),
      pw: await hashPassword(password), entitlements: [], orders: []
    };
    s.current = mail;
    write(s);
    return this.session(s)!;
  }

  async signIn({ email, password }: { email: string; password: string }) {
    await tick();
    const s = read();
    const a = s.accounts[normalizeEmail(email)];
    /* Verifica a senha mesmo sem conta, contra um hash descartável: senão o
       tempo de resposta diz quais e-mails existem. */
    const ok = a ? await verifyPassword(password, a.pw)
                 : (await hashPassword(password), false);
    if (!a || !ok) throw new AuthError('bad-credentials');
    s.current = a.email;
    write(s);
    return this.session(s)!;
  }

  async signOut(): Promise<void> {
    const s = read();
    s.current = null;
    write(s);
  }

  async startOrder(
    { courseSlug, method }: { courseSlug: string; method: PaymentMethod; installments?: number }
  ): Promise<Order & { redirectUrl?: string }> {
    await tick();
    const s = read();
    const a = s.current ? s.accounts[s.current] : undefined;
    if (!a) throw new AuthError('not-signed-in');
    const course = getCourse(courseSlug);
    if (!course) throw new AuthError('server', 'Curso inexistente.');

    const order: Order = {
      id: id('demo'),
      courseSlug,
      amountCents: cents(course.price.brl),
      method,
      /* Pendente, e não pago. O acesso é liberado por `orderStatus`, exatamente
         como no servidor — a tela de checkout não ganha um caminho especial
         que só ela conhece. */
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...(method === 'pix' ? {
        pix: {
          code: '00020101021126PLATAFORMA-EM-MODO-DEMONSTRACAO-NENHUM-PAGAMENTO-E-REAL',
          qrPngBase64: null,
          expiresAt: new Date(Date.now() + 30 * 60_000).toISOString()
        }
      } : {})
    };
    a.orders.unshift(order);
    write(s);
    return order;
  }

  /** No modo demonstração o pedido "compensa" na primeira consulta feita pelo
   *  menos três segundos depois — tempo de a tela de PIX existir e ser vista,
   *  sem transformar a revisão do produto numa espera. */
  async orderStatus(orderId: string): Promise<Order> {
    const s = read();
    const a = s.current ? s.accounts[s.current] : undefined;
    if (!a) throw new AuthError('not-signed-in');
    const order = a.orders.find(o => o.id === orderId);
    if (!order) throw new AuthError('server', 'Pedido não encontrado.');

    const age = Date.now() - new Date(order.createdAt).getTime();
    if (order.status === 'pending' && age > 3_000) {
      order.status = 'paid';
      const course = getCourse(order.courseSlug);
      if (course && !a.entitlements.some(e => e.courseSlug === order.courseSlug)) {
        const expires = new Date();
        expires.setMonth(expires.getMonth() + course.accessMonths);
        a.entitlements.push({
          courseSlug: order.courseSlug,
          grantedAt: new Date().toISOString(),
          expiresAt: expires.toISOString(),
          orderId: order.id
        });
      }
      write(s);
    }
    return order;
  }

  async orders(): Promise<Order[]> {
    const s = read();
    const a = s.current ? s.accounts[s.current] : undefined;
    return a ? a.orders.slice() : [];
  }
}
