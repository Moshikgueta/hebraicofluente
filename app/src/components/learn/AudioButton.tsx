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
 *   · it does not pretend. A missing clip renders as a labelled, disabled
 *     control that says "áudio em breve", so the gap is visible to the learner
 *     and to us, and the listening exercises that depend on it are withheld
 *     rather than turned into guesswork.
 *
 * Clip ids are content hashes of the pointed Hebrew (tools/gen-audio.mjs), so
 * a recording made for the printed workbook plays here with no second naming
 * scheme and no renaming when a lesson is reordered. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';
import { track } from '@/lib/analytics';

/* Which clips exist. Populated at build time from public/audio/; empty today,
   and the UI is built to look right that way rather than to look broken. */
import { AUDIO_MANIFEST } from '@/lib/audio-manifest';

export const hasAudio = (audioId: string | null | undefined): boolean =>
  !!audioId && AUDIO_MANIFEST.includes(audioId);

export const audioAvailable = (): boolean => AUDIO_MANIFEST.length > 0;

export function AudioButton({
  audioId, label = 'Ouvir', size = 'md', slow = false
}: {
  audioId: string | null;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Offer a 0.7× pass as well - useful on syllables and long words. */
  slow?: boolean;
}) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const available = hasAudio(audioId);

  useEffect(() => () => { ref.current?.pause(); }, []);

  const play = useCallback((rate: number) => {
    if (!audioId || !available) return;
    const el = ref.current ?? new Audio(asset(`/audio/${audioId}.mp3`));
    ref.current = el;
    el.playbackRate = rate;
    el.currentTime = 0;
    setPlaying(true);
    el.onended = () => setPlaying(false);
    el.onerror = () => { setPlaying(false); track('audio_unavailable', { audioId }); };
    void el.play().catch(() => setPlaying(false));
    track('audio_played', { audioId });
  }, [audioId, available]);

  const SIZE = {
    sm: 'min-h-[40px] min-w-[40px] px-3 text-sm',
    md: 'min-h-[48px] min-w-[48px] px-4 text-[15px]',
    lg: 'min-h-[56px] min-w-[56px] px-5 text-base'
  } as const;

  if (!available) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-[var(--r-md)] border border-dashed
          border-line text-ink-muted font-ui ${SIZE[size]}`}
        title="As gravações ainda não foram feitas. Nenhuma voz sintética é usada aqui, de propósito."
      >
        <SpeakerOff />
        <span className="text-[13px]">Áudio em breve</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => play(1)}
        aria-label={label}
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
function SpeakerOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="m17 9 4 6M21 9l-4 6" />
    </svg>
  );
}
