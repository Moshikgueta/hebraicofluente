'use client';

/* "Desafiar um amigo" (28/10/2026): sorteia cinco palavras que o aluno já
 * lê, pede ao servidor a assinatura (worker/src/api/desafio.js) e entrega o
 * link de /desafio-amigo para compartilhar ou copiar. O link não leva a
 * conta de ninguém, e nada é gravado. Fora da build com servidor (o `npm run
 * dev` sem API), o pedido falha e a tela diz isso.
 */

import { useState } from 'react';
import { asset } from '@/lib/asset';
import { tx } from '@/i18n/telas/desafio-amigo';

export const QUANTAS = 5;

type ParaSortear = { he: string; pt?: string };

/** Cinco palavras sorteadas, sem repetir a palavra nem o sentido (as opções
 *  da página do amigo são os cinco sentidos; dois iguais seriam ambíguos). */
export function sortearCinco(palavras: readonly ParaSortear[], aleatorio: () => number = Math.random): string[] {
  const resto = [...palavras];
  const out: ParaSortear[] = [];
  while (out.length < QUANTAS && resto.length) {
    const w = resto.splice(Math.floor(aleatorio() * resto.length), 1)[0]!;
    if (!out.some(o => o.he === w.he || (w.pt && o.pt === w.pt))) out.push(w);
  }
  return out.map(w => w.he);
}

export function DesafiarAmigo({ palavras }: { palavras: readonly ParaSortear[] }) {
  const [estado, setEstado] = useState<'parado' | 'gerando' | 'pronto' | 'falhou'>('parado');
  const [link, setLink] = useState('');
  const [copiado, setCopiado] = useState(false);
  if (new Set(palavras.map(p => p.pt ?? p.he)).size < QUANTAS) return null;

  async function gerar() {
    setEstado('gerando'); setCopiado(false);
    try {
      const r = await fetch(asset('/api/desafio'), {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palavras: sortearCinco(palavras) })
      });
      const d = r.ok ? await r.json() as { token?: string } : {};
      if (!d.token) { setEstado('falhou'); return; }
      setLink(`${window.location.origin}${asset(`/desafio-amigo/?t=${encodeURIComponent(d.token)}`)}`);
      setEstado('pronto');
    } catch { setEstado('falhou'); }
  }

  async function compartilhar() {
    try { await navigator.share({ title: tx.metaTitulo, text: tx.textoDoConvite, url: link }); } catch { /* cancelado */ }
  }
  async function copiar() {
    try { await navigator.clipboard.writeText(link); setCopiado(true); } catch { setCopiado(false); }
  }
  const podeCompartilhar = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div className="grid gap-2 rounded-[var(--r-lg)] border border-line bg-[var(--card)] p-4">
      <p className="m-0 font-ui text-[15px] font-semibold text-ink">{tx.desafiar}</p>
      <p className="m-0 font-ui text-[13.5px] text-ink-muted">{tx.desafiarNota}</p>
      {estado !== 'pronto' && (
        <button type="button" onClick={gerar} disabled={estado === 'gerando'}
                className="justify-self-start min-h-[44px] rounded-[var(--r-md)] bg-[var(--accent-bg)] px-4 font-ui text-[14.5px] font-semibold text-white disabled:opacity-60">
          {estado === 'gerando' ? tx.gerando : tx.desafiar}
        </button>
      )}
      {estado === 'falhou' && <p role="alert" className="m-0 font-ui text-[13.5px] text-[var(--amber)]">{tx.falhou}</p>}
      {estado === 'pronto' && (
        <div className="grid gap-2" aria-live="polite">
          <p className="m-0 font-ui text-[13.5px] text-ink">{tx.pronto}</p>
          <input readOnly value={link} aria-label={tx.pronto} onFocus={e => e.currentTarget.select()}
                 className="min-h-[44px] w-full min-w-0 rounded-[var(--r-md)] border border-line bg-surface px-3 font-ui text-[13px] text-ink" />
          <div className="flex flex-wrap gap-2">
            {podeCompartilhar && (
              <button type="button" onClick={compartilhar}
                      className="min-h-[44px] rounded-[var(--r-md)] bg-[var(--accent-bg)] px-4 font-ui text-[14px] font-semibold text-white">
                {tx.compartilhar}
              </button>
            )}
            <button type="button" onClick={copiar}
                    className="min-h-[44px] rounded-[var(--r-md)] border border-line bg-surface px-4 font-ui text-[14px] font-semibold text-ink">
              {copiado ? tx.copiado : tx.copiar}
            </button>
            <button type="button" onClick={gerar}
                    className="min-h-[44px] px-2 font-ui text-[14px] text-[var(--teal-ink)] underline">
              {tx.outro}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
