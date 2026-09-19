/* O adaptador de produção: /api/*, servido pelo Cloudflare Worker.
 * ─────────────────────────────────────────────────────────────────────────
 * Três decisões que aparecem em cada método:
 *
 *   1. `credentials: 'same-origin'`. A sessão é um cookie assinado, HttpOnly -
 *      o JavaScript desta página não consegue lê-lo, e é exatamente por isso
 *      que ele é seguro. Não há token em localStorage; um XSS aqui não leva
 *      sessão nenhuma embora.
 *
 *   2. Erro é um código, não um texto. O servidor devolve
 *      `{ error: 'bad-credentials' }` e a frase em português sai de
 *      types.ts - um só lugar para reescrever o que o aluno lê.
 *
 *   3. Nada de confiar em parâmetro de redirect. `orderStatus` sempre pergunta
 *      ao servidor, que por sua vez reconfere com a Mercado Pago. É a regra
 *      que o projeto irmão em espanhol aprendeu da pior maneira, e está
 *      escrita no IMPLEMENTATION.md dele: acesso nunca é liberado a partir
 *      do que volta na URL do navegador.
 */

import type { PlatformApi } from './api';
import { AuthError, type AuthErrorCode, type Order, type PaymentMethod, type Session } from './types';

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

const CODES: readonly string[] = [
  'bad-credentials', 'email-taken', 'weak-password', 'invalid-email',
  'not-signed-in', 'offline', 'server', 'rate-limited', 'payments-off'
];

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...init,
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) }
    });
  } catch {
    /* Rede caiu, DNS falhou, o usuário está no metrô. Não é erro de servidor
       e não adianta pedir para "tentar de novo mais tarde" com outra palavra. */
    throw new AuthError('offline');
  }

  if (res.status === 204) return undefined as T;

  let body: unknown = null;
  try { body = await res.json(); } catch { /* resposta vazia ou HTML de erro */ }

  if (!res.ok) {
    const code = (body as { error?: string } | null)?.error;
    throw new AuthError(
      code && CODES.includes(code) ? (code as AuthErrorCode)
        : res.status === 401 ? 'not-signed-in'
        : res.status === 429 ? 'rate-limited'
        : 'server'
    );
  }
  return body as T;
}

export class WorkerApi implements PlatformApi {
  readonly mode = 'worker' as const;

  async me(): Promise<Session | null> {
    try {
      return await call<Session>('/me');
    } catch (e) {
      /* Sem sessão é uma resposta, não uma falha: é o estado de todo visitante
         que ainda não entrou. Só relança o que for realmente um problema. */
      if (e instanceof AuthError && e.code === 'not-signed-in') return null;
      throw e;
    }
  }

  signUp(input: { name: string; email: string; password: string }): Promise<Session> {
    return call<Session>('/auth/signup', { method: 'POST', body: JSON.stringify(input) });
  }

  signIn(input: { email: string; password: string }): Promise<Session> {
    return call<Session>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
  }

  signOut(): Promise<void> {
    return call<void>('/auth/logout', { method: 'POST' });
  }

  startOrder(input: { courseSlug: string; method: PaymentMethod; installments?: number }) {
    return call<Order & { redirectUrl?: string }>('/pay/create', {
      method: 'POST', body: JSON.stringify(input)
    });
  }

  orderStatus(orderId: string): Promise<Order> {
    return call<Order>(`/pay/verify?order=${encodeURIComponent(orderId)}`);
  }

  orders(): Promise<Order[]> {
    return call<{ orders: Order[] }>('/orders').then(r => r.orders);
  }
}
