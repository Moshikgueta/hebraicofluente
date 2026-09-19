/* A porta única entre o app e a plataforma.
 * ─────────────────────────────────────────────────────────────────────────
 * Duas implementações, uma interface:
 *
 *   · `worker`  - fala com /api/* (Cloudflare Worker + D1 + Mercado Pago).
 *                 É o que roda em produção.
 *   · `local`   - guarda tudo no localStorage do próprio navegador. É o que
 *                 roda em `npm run dev` e no export estático do GitHub Pages,
 *                 onde não existe /api nenhum.
 *
 * O adaptador local NÃO é um servidor de mentira que finge ser o de verdade
 * em silêncio. `mode` é público, a interface toda devolve ele, e a UI mostra
 * uma tarja dizendo que nada ali é cobrança real. Um checkout que parece ter
 * funcionado e não cobrou nada é a pior forma de bug que um produto pago pode
 * ter - vale mais um aviso feio.
 *
 * Qual dos dois entra é decidido em tempo de build por NEXT_PUBLIC_PLATFORM_API
 * (o padrão é 'local', porque é o que um clone recém-baixado consegue rodar).
 * Uma sonda em runtime seria mais esperta e daria um piscar de tela em toda
 * primeira carga, e escondereria uma implantação mal configurada em vez de
 * escancará-la.
 */

import type { Order, PaymentMethod, Session } from './types';

export type ApiMode = 'worker' | 'local';

export interface PlatformApi {
  readonly mode: ApiMode;

  /** A sessão atual, ou null. Nunca lança por falta de sessão. */
  me(): Promise<Session | null>;

  signUp(input: { name: string; email: string; password: string }): Promise<Session>;
  signIn(input: { email: string; password: string }): Promise<Session>;
  signOut(): Promise<void>;

  /** Começa um pedido. Para PIX volta com o copia-e-cola; para cartão, com a
   *  URL do checkout da Mercado Pago em `redirectUrl`. */
  startOrder(input: { courseSlug: string; method: PaymentMethod; installments?: number }):
    Promise<Order & { redirectUrl?: string }>;

  /** O estado de um pedido, do servidor - nunca dos parâmetros de redirect.
   *  É esta chamada, e só ela, que diz se o acesso foi liberado. */
  orderStatus(orderId: string): Promise<Order>;

  /** Pedidos da conta, mais recente primeiro. Para a página de perfil. */
  orders(): Promise<Order[]>;
}

const MODE: ApiMode =
  (process.env.NEXT_PUBLIC_PLATFORM_API as ApiMode | undefined) === 'worker'
    ? 'worker' : 'local';

let instance: PlatformApi | null = null;

/** O adaptador desta build. Criado uma vez, tarde - nada de tocar em
 *  localStorage no topo do módulo, que quebraria o prerender. */
export async function api(): Promise<PlatformApi> {
  if (instance) return instance;
  instance = MODE === 'worker'
    ? new (await import('./worker-api')).WorkerApi()
    : new (await import('./local-api')).LocalApi();
  return instance;
}

export const apiMode = (): ApiMode => MODE;

/** Verdadeiro quando nenhuma cobrança desta build é real. A UI usa isto para
 *  a tarja de demonstração, e o checkout para não prometer nada. */
export const isDemo = (): boolean => MODE === 'local';
