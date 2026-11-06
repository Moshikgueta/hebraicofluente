'use client';

/* O vídeo do professor no "Me explica, Moshik" (28/10/2026, pedido do dono:
   "faz tudo", item 8). Só aparece com o arquivo em video/<letra>.mp4 (ver
   video/README.md e lib/video-manifest.ts, gerado pelo exportador), e só no
   site em português: o vídeo é falado em português.

   `preload="none"`: abrir a folha não baixa nada; o vídeo vem no toque. Sai
   de /video/, atrás do portão (gate.js). Fechar a folha pausa (MeExplica). */

import { forwardRef } from 'react';
import { LOCALE } from '@/i18n';
import { VIDEO_MANIFEST } from '@/lib/video-manifest';
import { tx } from '@/i18n/telas/licao-me-explica';

export const videoDaLetra = (letra: string) =>
  LOCALE === 'pt' ? VIDEO_MANIFEST.find(v => v.letra === letra) ?? null : null;

export const VideoDoMoshik = forwardRef<HTMLVideoElement, { letra: string; nome: string }>(
  function VideoDoMoshik({ letra, nome }, ref) {
    const v = videoDaLetra(letra);
    if (!v) return null;
    return (
      <section className="grid gap-2">
        <h3 className="m-0 font-display text-[16px] font-semibold">{tx.video(nome)}</h3>
        <video ref={ref} controls playsInline preload="none" src={`/video/${letra}.mp4`}
               className="w-full max-h-[60dvh] rounded-[var(--r-md)] bg-black">
          {v.legenda && <track kind="captions" srcLang="pt" label={tx.legenda} src={`/video/${letra}.vtt`} default />}
        </video>
      </section>
    );
  }
);
