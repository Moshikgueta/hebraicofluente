/* O checkout do Paddle no navegador (site em inglês, PLANO-INGLES.md etapa 5).
 * ─────────────────────────────────────────────────────────────────────────
 * O Paddle.js é baixado SÓ quando a pessoa clica em pagar, e só no checkout:
 * a CSP do Worker libera cdn.paddle.com e o iframe de buy.paddle.com apenas
 * em /checkout/ (worker.js, `comPaddle`). Ele abre o pagamento por cima da
 * página; o número do cartão nunca passa por aqui.
 *
 * O acesso NÃO é liberado pelo aviso do navegador (`checkout.completed`):
 * esse aviso só faz a tela começar a perguntar ao servidor, que pergunta ao
 * Paddle. Qualquer um consegue disparar um evento no próprio navegador.
 */
import type { PaddleCheckout } from '@/lib/account/types';

type EventoPaddle = { name?: string };
type Paddle = {
  Environment: { set: (e: 'sandbox' | 'production') => void };
  Initialize: (o: { token: string; eventCallback?: (e: EventoPaddle) => void }) => void;
  Update: (o: { eventCallback?: (e: EventoPaddle) => void }) => void;
  Checkout: { open: (o: Record<string, unknown>) => void };
};

const SCRIPT = 'https://cdn.paddle.com/paddle/v2/paddle.js';
let carregando: Promise<Paddle> | null = null;
let iniciado = '';

function carregar(): Promise<Paddle> {
  const w = window as unknown as { Paddle?: Paddle };
  if (w.Paddle) return Promise.resolve(w.Paddle);
  if (carregando) return carregando;
  carregando = new Promise<Paddle>((ok, falha) => {
    const s = document.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => (w.Paddle ? ok(w.Paddle) : falha(new Error('paddle.js sem Paddle'))); // i18n-ok: erro interno, nunca vai à tela
    s.onerror = () => { carregando = null; falha(new Error('paddle.js não carregou')); }; // i18n-ok: erro interno, nunca vai à tela
    document.head.appendChild(s);
  });
  return carregando;
}

/** Abre o checkout da transação. `aoConcluir` quando o Paddle diz que o
 *  pagamento passou; `aoFechar` quando a pessoa fecha a janela sem pagar. */
export async function abrirCheckout(
  dados: PaddleCheckout,
  { email, aoConcluir, aoFechar }: { email?: string; aoConcluir: () => void; aoFechar: () => void }
): Promise<void> {
  const paddle = await carregar();
  const eventCallback = (e: EventoPaddle) => {
    if (e.name === 'checkout.completed') aoConcluir();
    else if (e.name === 'checkout.closed') aoFechar();
  };
  /* `Initialize` vale uma vez por página; depois só se troca o retorno. */
  if (iniciado !== dados.clientToken) {
    if (dados.sandbox) paddle.Environment.set('sandbox');
    paddle.Initialize({ token: dados.clientToken, eventCallback });
    iniciado = dados.clientToken;
  } else {
    paddle.Update({ eventCallback });
  }
  paddle.Checkout.open({
    transactionId: dados.transactionId,
    ...(email ? { customer: { email } } : {}),
    settings: { displayMode: 'overlay', locale: 'en', theme: 'light', allowLogout: false }
  });
}
