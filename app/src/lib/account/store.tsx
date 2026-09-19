'use client';

/* A sessão, no React.
 * ─────────────────────────────────────────────────────────────────────────
 * Um provider acima de tudo, um hook em todo lugar. O que vale a pena
 * explicar é o estado `ready`.
 *
 * Saber se existe sessão custa uma viagem de rede (o cookie é HttpOnly; esta
 * página não consegue ler o cookie e concluir sozinha). Durante essa viagem a
 * resposta certa não é "não está logado" - é "ainda não sei". Tratar as duas
 * como a mesma coisa produz o pior bug de plataforma que existe: o aluno que
 * já pagou recarrega a página e é mandado para a tela de vendas por um
 * instante. Por isso `ready` é separado de `session`, e todo portão espera.
 *
 * O progresso (lib/state) continua sendo do APARELHO, não da conta. Isso é
 * uma escolha, não um esquecimento: o curso funciona sem conta nenhuma desde
 * o primeiro dia, e sincronizar progresso exige decidir o que fazer quando
 * dois aparelhos discordam - um problema de fusão, não de armazenamento.
 * Ver ARCHITECTURE.md §11.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode
} from 'react';
import { api, apiMode, isDemo, type ApiMode } from './api';
import { hasAccess, type Order, type PaymentMethod, type Session } from './types';

type AccountValue = {
  /** A sessão já foi consultada? Antes disso, nada de decidir nada. */
  ready: boolean;
  session: Session | null;
  signedIn: boolean;
  mode: ApiMode;
  /** Nenhuma cobrança desta build é real. */
  demo: boolean;

  signUp(i: { name: string; email: string; password: string }): Promise<void>;
  signIn(i: { email: string; password: string }): Promise<void>;
  signOut(): Promise<void>;
  /** Recarrega a sessão do servidor - depois de um pagamento, por exemplo. */
  refresh(): Promise<Session | null>;

  startOrder(i: { courseSlug: string; method: PaymentMethod; installments?: number }):
    Promise<Order & { redirectUrl?: string }>;
  orderStatus(id: string): Promise<Order>;

  /** Este aluno pode abrir este curso agora? */
  can(courseSlug: string): boolean;
};

const Ctx = createContext<AccountValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  /* Evita gravar estado depois de o provider sair - acontece de verdade
     quando alguém troca de rota no meio do /api/me. */
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const refresh = useCallback(async () => {
    const s = await (await api()).me().catch(() => null);
    if (alive.current) { setSession(s); setReady(true); }
    return s;
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo<AccountValue>(() => ({
    ready,
    session,
    signedIn: session !== null,
    mode: apiMode(),
    demo: isDemo(),

    async signUp(i) { setSession(await (await api()).signUp(i)); setReady(true); },
    async signIn(i) { setSession(await (await api()).signIn(i)); setReady(true); },
    async signOut() { await (await api()).signOut(); setSession(null); },
    refresh,

    startOrder: async i => (await api()).startOrder(i),
    orderStatus: async id => (await api()).orderStatus(id),

    can: slug => hasAccess(session, slug)
  }), [ready, session, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccount(): AccountValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAccount fora de <AccountProvider>');
  return v;
}
