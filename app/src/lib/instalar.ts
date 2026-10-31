/* Instalar o curso no celular (28/10/2026, pedido do dono: "faz tudo", item 7).
 * ─────────────────────────────────────────────────────────────────────────
 * O Chrome do Android (e o do computador) avisa com `beforeinstallprompt`
 * que pode instalar, e guarda o pedido para a página mostrar quando quiser.
 * O Safari do iPhone não tem esse pedido: lá são dois toques (Compartilhar,
 * Adicionar à Tela de Início), e o que a página pode fazer é dizer quais.
 *
 * O evento chega uma vez, às vezes antes de a tela que o usa montar: por
 * isso ele é ouvido aqui, quando o módulo carrega, e guardado. */

export type ComoInstalar = 'instalado' | 'botao' | 'ios' | 'outro';

type PedidoDeInstalacao = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> };

let pedido: PedidoDeInstalacao | null = null;
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach(f => f());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    pedido = e as PedidoDeInstalacao;
    avisar();
  });
  window.addEventListener('appinstalled', () => { pedido = null; avisar(); });
}

export const temPedido = () => !!pedido;
export function ouvirPedido(f: () => void): () => void {
  ouvintes.add(f);
  return () => { ouvintes.delete(f); };
}

/** Abre o pedido do navegador. `true` = a pessoa instalou. */
export async function pedirInstalacao(): Promise<boolean> {
  if (!pedido) return false;
  const p = pedido;
  pedido = null;
  await p.prompt();
  const { outcome } = await p.userChoice;
  avisar();
  return outcome === 'accepted';
}

/** iPhone e iPad (o iPad novo diz que é Mac, mas tem toque). */
export const ehIos = (ua: string, toques = 0): boolean =>
  /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && toques > 1);

/** O que mostrar. Pura, para o teste. */
export function comoInstalar({ ua, toques = 0, aberto, comPedido }: {
  ua: string; toques?: number; aberto: boolean; comPedido: boolean;
}): ComoInstalar {
  if (aberto) return 'instalado';
  if (comPedido) return 'botao';
  if (ehIos(ua, toques)) return 'ios';
  return 'outro';
}

/** O curso já está aberto como app (pela tela de início)? */
export const abertoComoApp = (): boolean =>
  typeof window !== 'undefined' && (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
