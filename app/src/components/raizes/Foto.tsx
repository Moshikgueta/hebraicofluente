'use client';

/* Uma foto histórica com o crédito ao lado (22/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Toda foto de Raízes vem do Wikimedia Commons com autor, licença e página de
 * origem (raizes/data/fotos.json), e o crédito aparece SEMPRE junto da imagem,
 * nunca só numa página de créditos: é o que as licenças CC BY pedem. A largura
 * e a altura vão no <img> para a página não pular quando ela carrega. Tocar
 * abre a imagem inteira. */

import { useRef } from 'react';
import type { FotoRaizes } from '@/lib/raizes';

export function Foto({ f, compacta = false }: { f: FotoRaizes; compacta?: boolean }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const src = `/raizes/fotos/${f.arquivo}`;
  const credito = (
    <>
      {f.autor}{f.data ? `, ${f.data}` : ''} ·{' '}
      {f.licencaUrl ? <a href={f.licencaUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{f.licenca}</a> : f.licenca} ·{' '}
      <a href={f.pagina} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Wikimedia Commons</a>
    </>
  );
  return (
    <figure className={`rz-foto m-0 grid gap-1.5 ${compacta ? 'compacta' : ''}`}>
      <button type="button" className="rz-foto-quadro" onClick={() => dialogo.current?.showModal()} aria-label={`Ampliar: ${f.mostra}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={f.mostra} width={f.largura} height={f.altura} loading="lazy" decoding="async" />
      </button>
      <figcaption className="grid gap-0.5">
        <span className="font-ui text-[13px] leading-snug text-[var(--corpo)]">{f.mostra}</span>
        <span className="font-ui text-[11.5px] leading-snug text-[var(--suave)] [overflow-wrap:anywhere]">{credito}</span>
      </figcaption>
      <dialog ref={dialogo} className="rz-foto-grande" aria-label={f.mostra} onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={f.mostra} width={f.largura} height={f.altura} />
        <p className="m-0 p-3 font-ui text-[12.5px] leading-snug text-white/85 [overflow-wrap:anywhere]">{f.mostra} · {credito}</p>
        <button type="button" className="rz-botao claro !text-white !border-white/60 m-3 mt-0" onClick={() => dialogo.current?.close()}>Fechar</button>
      </dialog>
    </figure>
  );
}

/** Uma fileira de fotos (rolagem lateral com encaixe), para um módulo ou um lugar. */
export function Fotos({ fotos, titulo }: { fotos: FotoRaizes[]; titulo: string }) {
  if (!fotos.length) return null;
  if (fotos.length === 1) return <section aria-label={titulo} className="grid gap-2"><p className="rz-rot ocre m-0">{titulo}</p><Foto f={fotos[0]!} /></section>;
  return (
    <section aria-label={titulo} className="grid gap-2">
      <p className="rz-rot ocre m-0">{titulo}</p>
      <ul className="-mx-4 m-0 flex snap-x gap-4 overflow-x-auto px-4 pb-2 list-none [scrollbar-width:thin]">
        {fotos.map(f => <li key={f.id} className="w-[78%] max-w-[420px] shrink-0 snap-start"><Foto f={f} compacta /></li>)}
      </ul>
    </section>
  );
}
