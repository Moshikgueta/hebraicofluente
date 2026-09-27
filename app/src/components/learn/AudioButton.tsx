'use client';

/* Audio playback - and, more often today, the honest absence of it.
 * ─────────────────────────────────────────────────────────────────────────
 * There is no recorded audio for this course yet. Two things this component
 * refuses to do about that:
 *
 *   · it does not fall back to the browser's speech engine. `he-IL` synthesis
 *     is poor and most engines ignore nikud entirely - which makes it worse
 *     than useless in a course whose whole claim is "this letter makes this
 *     sound". A learner would rehearse a wrong pronunciation and never know.
 *   · it does not pretend. A missing clip renders NOTHING, and the listening
 *     exercises that depend on it are withheld rather than turned into
 *     guesswork. It used to render "áudio em breve"; that read as a promise
 *     rather than as information, twenty-two letters in a row - see the note
 *     at the early return below. The gap stays visible where it is a business
 *     decision (`npm run check-audio`, the manifest, the sales page) instead
 *     of where it is only noise to someone learning a letter.
 *
 * Clip ids are content hashes of the pointed Hebrew (tools/gen-audio.mjs), so
 * a recording made for the printed workbook plays here with no second naming
 * scheme and no renaming when a lesson is reordered. */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { track } from '@/lib/analytics';

/* Which clips exist: the studio files the build found in public/audio/, plus
   the ones recorded from the admin panel after the build (lib/audio-registro).
   The UI is built to look right with none of either. */
import {
  algumClipe, assinar, clipeDoPainel, temClipe, urlDoClipe, versaoDoRegistro
} from '@/lib/audio-registro';

export const hasAudio = (audioId: string | null | undefined): boolean => temClipe(audioId);

export const audioAvailable = (): boolean => algumClipe();

/** Re-render when the panel's list arrives. The server snapshot is 0, so the
    first client render matches the static HTML and only then picks up clips. */
export const useRegistroDeAudio = (): number =>
  useSyncExternalStore(assinar, versaoDoRegistro, () => 0);

/**
 * Tocar um clipe direto, sem botão (27/09/2026): o toque NA sílaba ou NA
 * vogal toca o som - o dono do curso pediu para não precisar de um segundo
 * botão. Um elemento só para a página inteira: tocar outra sílaba corta a
 * anterior, em vez de sobrepor as duas. Respeita o corte do painel igual
 * ao botão. Sem clipe, não faz nada (nunca voz sintética - ver o topo).
 */
let tocador: HTMLAudioElement | null = null;
export function tocarClipe(audioId: string | null | undefined, rate = 1): void {
  if (!audioId || !temClipe(audioId) || typeof Audio === 'undefined') return;
  const src = urlDoClipe(audioId);
  if (!tocador || tocador.dataset.src !== src) {
    tocador?.pause();
    tocador = new Audio(src);
    tocador.dataset.src = src;
  }
  const el = tocador;
  const corte = clipeDoPainel(audioId);
  const fim = corte?.fim != null ? corte.fim / 1000 : null;
  el.playbackRate = rate;
  el.currentTime = corte?.inicio != null ? corte.inicio / 1000 : 0;
  el.ontimeupdate = fim === null ? null : () => { if (el.currentTime >= fim) el.pause(); };
  void el.play().catch(() => { /* bloqueado ou sem rede: fica o botão */ });
  track('audio_played', { audioId });
}

export function AudioButton({
  audioId, label = 'Ouvir', ariaLabel, size = 'md', slow = false
}: {
  audioId: string | null;
  label?: string;
  /** O nome para o leitor de tela, quando vários botões "Ouvir" dividem a tela. */
  ariaLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Offer a 0.7× pass as well - useful on syllables and long words. */
  slow?: boolean;
}) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  useRegistroDeAudio();
  const available = hasAudio(audioId);

  useEffect(() => () => { ref.current?.pause(); }, []);

  const play = useCallback((rate: number) => {
    if (!audioId || !available) return;
    /* A gravação do painel pode ter sido substituída desde o último toque:
       o endereço muda com ela, e o elemento velho é trocado. */
    const src = urlDoClipe(audioId);
    if (!ref.current || ref.current.dataset.src !== src) {
      ref.current?.pause();
      ref.current = new Audio(src);
      ref.current.dataset.src = src;
    }
    const el = ref.current;
    /* O trecho da voz, quando o painel mediu um: o arquivo gravado no
       celular tem silêncio antes e depois. O fragmento `#t=` do endereço
       vale para o primeiro toque; a partir do segundo, quem corta é isto. */
    const corte = clipeDoPainel(audioId);
    const inicio = corte?.inicio != null ? corte.inicio / 1000 : 0;
    const fim = corte?.fim != null ? corte.fim / 1000 : null;
    el.playbackRate = rate;
    el.currentTime = inicio;
    setPlaying(true);
    el.onended = () => setPlaying(false);
    el.onpause = () => setPlaying(false);
    el.ontimeupdate = fim === null ? null : () => { if (el.currentTime >= fim) el.pause(); };
    el.onerror = () => { setPlaying(false); track('audio_unavailable', { audioId }); };
    void el.play().catch(() => setPlaying(false));
    track('audio_played', { audioId });
  }, [audioId, available]);

  const SIZE = {
    sm: 'min-h-[40px] min-w-[40px] px-3 text-sm',
    md: 'min-h-[48px] min-w-[48px] px-4 text-[15px]',
    lg: 'min-h-[56px] min-w-[56px] px-5 text-base'
  } as const;

  /* A AUSÊNCIA NÃO É DITA NA TELA DO ALUNO.
     ─────────────────────────────────────────────────────────────────────
     Até aqui, um clipe que falta rendia a linha "Áudio em breve". A ideia
     era honestidade, e a régua era a nossa: mostrar a lacuna para não
     parecer que havia som onde não há.

     Mas quem paga não está auditando o curso, está aprendendo uma letra, e
     para essa pessoa a linha não informava - prometia. Aparecia duas ou três
     vezes por etapa, vinte e duas letras seguidas, sempre dizendo que o bom
     ainda vem. Uma promessa repetida que não tem data é pior do que silêncio:
     ela transforma o que existe em versão incompleta do que não existe.

     Então não se diz nada. O que a etapa tem - a forma, a comparação com um
     som do português, o traçado - fica sozinho, que é como deve ser julgado.

     Isto NÃO relaxa nenhuma das duas recusas do cabeçalho: continua sem voz
     sintética, e os exercícios de escuta continuam retirados em vez de
     virarem adivinhação. A ausência segue visível onde precisa ser vista -
     em `npm run check-audio`, no manifesto e na vitrine, que é onde ela vira
     decisão de negócio em vez de ruído para o aluno. */
  if (!available) return null;

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => play(1)}
        aria-label={ariaLabel ?? label}
        className={`inline-flex items-center justify-center gap-2 rounded-[var(--r-md)]
          bg-[var(--accent-wash)] text-[var(--accent)] font-ui font-medium
          transition-transform duration-[var(--dur)] ease-[var(--ease)]
          hover:brightness-95 active:scale-[.97] ${SIZE[size]}
          ${playing ? 'animate-pop' : ''}`}
      >
        <SpeakerOn />
        <span>{label}</span>
      </button>
      {slow && (
        <button
          type="button"
          onClick={() => play(0.7)}
          aria-label="Ouvir devagar"
          className={`inline-flex items-center justify-center rounded-[var(--r-md)]
            border border-line text-ink-muted font-ui text-[13px] ${SIZE.sm}`}
        >
          0,7×
        </button>
      )}
    </span>
  );
}

function SpeakerOn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}
