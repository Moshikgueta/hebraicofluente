'use client';

/* A foto de verdade da missão (28/10/2026, pedido do dono: "missões com
 * fotos reais").
 * ─────────────────────────────────────────────────────────────────────────
 * O mesmo cuidado das fotos de Raízes: só do Wikimedia Commons, com autor,
 * licença e página de origem, e o crédito SEMPRE junto da imagem (é o que as
 * licenças CC BY pedem). A legenda diz só o que a ficha do arquivo diz. A
 * largura e a altura vão no <img>, para a página não pular. Tocar amplia. */

import { useRef, useState } from 'react';
import type { FotoDaMissao as Foto } from '@/lib/engine/missao';
import { tx } from '@/i18n/telas/licao-foto-da-missao';

export function FotoDaMissao({ foto }: { foto: Foto }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [grande, setGrande] = useState(false);
  const src = `/media/missoes/${foto.arquivo}`;
  const licenca = foto.licenca === 'Public domain' ? tx.dominioPublico : foto.licenca;
  const credito = (
    <>
      {foto.autor}{foto.data ? `, ${foto.data}` : ''} ·{' '}
      {foto.licencaUrl
        ? <a href={foto.licencaUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{licenca}</a>
        : licenca} ·{' '}
      <a href={foto.pagina} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{tx.origem}</a>
    </>
  );
  return (
    <figure className="m-0 grid gap-1.5">
      <p className="m-0 font-ui text-[12.5px] font-bold uppercase tracking-[.08em] text-[var(--teal-ink)]">{tx.emIsrael}</p>
      <button type="button" aria-label={tx.ampliar(foto.mostra)}
              onClick={() => { setGrande(true); dialogo.current?.showModal(); }}
              className="block overflow-hidden rounded-[var(--r-lg)] border border-line bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={foto.mostra} width={foto.largura} height={foto.altura} loading="lazy" decoding="async"
             className="block w-full h-auto max-h-[300px] object-cover" />
      </button>
      <figcaption className="grid gap-0.5">
        <span className="font-ui text-[13px] leading-snug text-ink-body">{foto.mostra}</span>
        <span className="font-ui text-[11.5px] leading-snug text-ink-muted [overflow-wrap:anywhere]">{credito}</span>
      </figcaption>
      <dialog ref={dialogo} aria-label={foto.mostra} onClose={() => setGrande(false)}
              onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
              className="m-auto w-[min(96vw,900px)] rounded-[var(--r-lg)] bg-[var(--ink)] p-0 backdrop:bg-black/70">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {grande && <img src={src} alt={foto.mostra} width={foto.largura} height={foto.altura} className="block w-full h-auto" />}
        <p className="m-0 p-3 font-ui text-[12.5px] leading-snug text-white/85 [overflow-wrap:anywhere]">{foto.mostra} · {credito}</p>
        <button type="button" onClick={() => dialogo.current?.close()}
                className="m-3 mt-0 min-h-[44px] rounded-[var(--r-md)] border border-white/60 px-4 font-ui text-[14px] font-semibold text-white">
          {tx.fechar}
        </button>
      </dialog>
    </figure>
  );
}
