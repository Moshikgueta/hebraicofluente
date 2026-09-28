/* O teste A/B do hero da capa (28/09/2026), do lado do navegador.
 * ─────────────────────────────────────────────────────────────────────────
 * A: o híbrido - "Ler e escrever hebraico, do zero." com os três desejos
 * como selos. B: as perguntas ("Quer viajar para Israel? Ler as letras da
 * Bíblia no original?"). O botão é o mesmo: o teste compara só a mensagem.
 * Cada navegador sorteia uma versão uma vez e fica com ela (localStorage),
 * para que a mesma pessoa não veja as duas.
 *
 * O que sai daqui é só `{exp, v, evento}` para /api/ab (worker/src/api/ab.js),
 * que soma totais diários. "visto" e "checkout" contam uma vez por sessão,
 * "compra" uma vez por navegador; "clique" conta cada clique. Na build de
 * demonstração não há servidor, e nada é enviado.
 *
 * Para encerrar o teste: fixar a versão vencedora no Hero e apagar este
 * arquivo e as chamadas a `contarAB`.
 */

export const EXP_HERO = 'hero-2026-09';
const CHAVE = `hf-ab-${EXP_HERO}`;

export type VersaoHero = 'a' | 'b';
export type EventoAB = 'visto' | 'clique' | 'checkout' | 'compra';

/** Sorteia (uma vez) e devolve a versão do hero deste navegador. */
export function versaoDoHero(): VersaoHero {
  try {
    let v = localStorage.getItem(CHAVE);
    if (v !== 'a' && v !== 'b') {
      v = Math.random() < 0.5 ? 'a' : 'b';
      localStorage.setItem(CHAVE, v);
    }
    return v as VersaoHero;
  } catch {
    /* Sem armazenamento (navegação privada restrita): mostra a versão nova e
       não entra na conta - um sorteio que não se lembra contaria a mesma
       pessoa nos dois lados. */
    return 'b';
  }
}

/** A versão que este navegador já recebeu na capa, ou nada. */
function versaoGuardada(): VersaoHero | null {
  try {
    const v = localStorage.getItem(CHAVE);
    return v === 'a' || v === 'b' ? v : null;
  } catch { return null; }
}

function primeiraVez(onde: Storage, chave: string): boolean {
  try {
    if (onde.getItem(chave)) return false;
    onde.setItem(chave, '1');
    return true;
  } catch { return false; }
}

/** Conta um evento do teste, se este navegador passou pela capa. */
export function contarAB(evento: EventoAB): void {
  if (process.env.NEXT_PUBLIC_PLATFORM_API !== 'worker') return;
  const v = versaoGuardada();
  if (!v) return;
  if (evento === 'visto' || evento === 'checkout') {
    if (!primeiraVez(sessionStorage, `${CHAVE}-${evento}`)) return;
  }
  if (evento === 'compra' && !primeiraVez(localStorage, `${CHAVE}-compra`)) return;
  void fetch('/api/ab', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exp: EXP_HERO, v, evento }),
    keepalive: true,
    credentials: 'same-origin'
  }).catch(() => { /* o teste nunca atrapalha a página */ });
}
