/* De onde veio a visita (23/10/2026, plano de marketing, semana 1).
 * ─────────────────────────────────────────────────────────────────────────
 * Na primeira página da visita, o navegador decide a FONTE (bio, stories,
 * busca, email, anuncio...) a partir do endereço e do site que mandou a
 * pessoa, e a guarda NESTE aparelho por 30 dias. Ela segue para o servidor
 * só em dois momentos: ao abrir a página de venda ou o checkout (contador
 * por dia, `f|<evento>|<fonte>`) e no pedido (`orders.origem`). Sem cookie,
 * sem conta, sem IP. Ver worker/src/lib/origem.js e marketing/04-painel.md.
 *
 * A regra é o primeiro toque com marca: a primeira fonte vale por 30 dias,
 * e "direto" é trocada pela primeira visita que trouxer uma marca.
 *
 * A lista de fontes é a mesma do servidor (tests/origem.test.ts confere).
 * Este arquivo não pode importar nada pesado: roda nas páginas públicas
 * (tests/rotas-leves.test.ts).
 */
import { asset } from '@/lib/asset';

export const FONTES = [
  'direto', 'bio', 'stories', 'dm', 'sefarad', 'instagram', 'previa',
  'busca', 'ia', 'email', 'parceiro', 'anuncio', 'outro'
] as const;
export type Fonte = typeof FONTES[number];

export type Origem = { fonte: Fonte; campanha: string | null };

const CHAVE = 'hf-origem-v1';
const VALIDADE_MS = 30 * 24 * 3_600_000;
const CAMPANHA = /^[a-z0-9][a-z0-9._-]{0,39}$/;

const LINKS = new Map<string, Fonte>([['bio', 'bio'], ['stories', 'stories'], ['dm', 'dm'], ['sefarad', 'sefarad']]);
const MEIOS_PAGOS = new Set(['cpc', 'ppc', 'paid', 'pago', 'ads', 'anuncio', 'paid-social', 'paidsocial', 'paid_social']);
const FONTES_DE_EMAIL = new Set(['email', 'e-mail', 'newsletter', 'resend']);
const MEIOS_DE_PARCEIRO = new Set(['parceiro', 'parceria', 'partner']);

/* Nomes de host, do mais específico ao mais geral: gemini.google.com é IA
   antes de google ser busca. */
const IA = /(^|\.)(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$/;
const BUSCA = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com|ecosia\.org|yandex\.[a-z.]+|search\.brave\.com)$/;
const INSTAGRAM = /(^|\.)instagram\.com$/;

const limpa = (v: string | null) => (v || '').trim().toLowerCase();

/** A campanha (utm_campaign), se couber no formato aceito pelo servidor. */
export function campanhaDe(v: string | null): string | null {
  const c = limpa(v).replace(/\s+/g, '-');
  return CAMPANHA.test(c) ? c : null;
}

/** A fonte de uma visita, pelo endereço e pelo site que mandou a pessoa. Pura. */
export function fonteDe(params: URLSearchParams, referrer: string, hostAtual: string): Fonte {
  const doLink = LINKS.get(limpa(params.get('parceria')));
  if (doLink) return doLink;

  const fonte = limpa(params.get('utm_source'));
  const meio = limpa(params.get('utm_medium'));
  if (MEIOS_PAGOS.has(meio)) return 'anuncio';
  if (limpa(params.get('utm_content')) === 'previa-ebook' || fonte === 'previa') return 'previa';
  if (FONTES_DE_EMAIL.has(fonte) || meio === 'email') return 'email';
  if (fonte === 'parceiro' || MEIOS_DE_PARCEIRO.has(meio)) return 'parceiro';
  if (fonte === 'instagram' || fonte === 'ig') return 'instagram';
  if (fonte) return 'outro';

  let host = '';
  try { host = referrer ? new URL(referrer).hostname.toLowerCase() : ''; } catch { host = ''; }
  if (!host || host === hostAtual.toLowerCase()) return 'direto';
  if (IA.test(host)) return 'ia';
  if (BUSCA.test(host)) return 'busca';
  if (INSTAGRAM.test(host)) return 'instagram';
  return 'outro';
}

function lida(): (Origem & { em: number }) | null {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    if (!v || !(FONTES as readonly string[]).includes(v.fonte) || typeof v.em !== 'number') return null;
    return { fonte: v.fonte, campanha: typeof v.campanha === 'string' ? campanhaDe(v.campanha) : null, em: v.em };
  } catch { return null; }
}

/** Decide a origem desta visita e a guarda, se for a primeira (ou a primeira
 *  com marca). Chamar ANTES de quem limpa o endereço (lib/parceria.ts). */
export function registrarOrigem(agora = Date.now()): void {
  try {
    const url = new URL(window.location.href);
    const fonte = fonteDe(url.searchParams, document.referrer, url.hostname);
    const antes = lida();
    if (antes && agora - antes.em < VALIDADE_MS && (antes.fonte !== 'direto' || fonte === 'direto')) return;
    localStorage.setItem(CHAVE, JSON.stringify({ fonte, campanha: campanhaDe(url.searchParams.get('utm_campaign')), em: agora }));
  } catch { /* sem armazenamento: segue sem origem */ }
}

/** A origem guardada neste aparelho, ou null. */
export function origemAtual(agora = Date.now()): Origem | null {
  const v = lida();
  return v && agora - v.em < VALIDADE_MS ? { fonte: v.fonte, campanha: v.campanha } : null;
}

export type EventoComFonte = 'venda-visto' | 'checkout-aberto';
const enviados = new Set<EventoComFonte>();

/** Conta a abertura da página de venda ou do checkout, com a fonte. Uma vez
 *  por visita. Mesmo endpoint do portal (lib/funil-portal.ts). */
export function contarComOrigem(evento: EventoComFonte): void {
  if (enviados.has(evento)) return;
  enviados.add(evento);
  const fonte = origemAtual()?.fonte ?? 'direto';
  try {
    void fetch(asset('/api/portal'), {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', keepalive: true,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evento, fonte })
    }).catch(() => {});
  } catch { /* sem fetch: segue sem contar */ }
}
