'use client';

// Hebraico para a viagem: categorias, cartoes e o botao de ouvir.
//
// Audio: so a gravacao cadastrada (audio_assets, de pessoa) aparece como
// "gravação". Sem gravacao, e se o aparelho tiver voz em hebraico, oferecemos a
// voz sintetica DO APARELHO, com esse nome no botao. Nunca uma pela outra.

import { useEffect, useRef, useState } from 'react';
import { IconSpeaker } from '../icons';
import { cx, He } from '../ui';
import type { SnapshotExpression } from '@/lib/domain/snapshot';

type Category = { id: string; label: string; intro: string };

function useHebrewVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const pick = () => setVoice(window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('he') || v.lang.toLowerCase().startsWith('iw')) ?? null);
    pick();
    window.speechSynthesis.addEventListener('voiceschanged', pick);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pick);
  }, []);
  return voice;
}

function Listen({ e, voice }: { e: SnapshotExpression; voice: SpeechSynthesisVoice | null }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  if (e.audio && e.audio.source === 'native_recording') {
    return (
      <>
        <audio ref={audio} src={e.audio.url} preload="none" onEnded={() => setPlaying(false)} />
        <button
          type="button"
          onClick={() => {
            void audio.current?.play();
            setPlaying(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-small font-semibold text-brand-ink"
        >
          <IconSpeaker size={18} /> {playing ? 'Tocando…' : 'Ouvir gravação'}
        </button>
      </>
    );
  }
  if (!voice) return null;
  return (
    <button
      type="button"
      onClick={() => {
        const u = new SpeechSynthesisUtterance(e.hebrew.replace(/[?!.,]/g, ''));
        u.voice = voice;
        u.lang = voice.lang;
        u.rate = 0.85;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-small font-semibold text-ink-soft ring-1 ring-stone-300 hover:bg-stone-100"
    >
      <IconSpeaker size={18} /> Voz sintética do aparelho
    </button>
  );
}

export function HebrewBrowser({ categories, expressions, initial }: { categories: Category[]; expressions: SnapshotExpression[]; initial: string | null }) {
  const [cat, setCat] = useState(initial && categories.some((c) => c.id === initial) ? initial : (categories[0]?.id ?? ''));
  const [pointed, setPointed] = useState(false);
  const voice = useHebrewVoice();
  const current = categories.find((c) => c.id === cat);
  const list = expressions.filter((e) => e.category === cat);
  const hasRecordings = expressions.some((e) => e.audio?.source === 'native_recording');

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Situações">
        <div className="flex gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === cat}
              onClick={() => setCat(c.id)}
              className={cx(
                'shrink-0 rounded-full px-4 py-2 text-small font-semibold transition',
                c.id === cat ? 'bg-ink text-paper' : 'bg-paper-raised text-ink-soft ring-1 ring-stone-300 hover:bg-stone-100',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-small text-stone-600">{current?.intro}</p>
        <label className="inline-flex cursor-pointer items-center gap-2 text-small font-semibold text-ink-soft">
          <input type="checkbox" checked={pointed} onChange={(ev) => setPointed(ev.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
          Mostrar as vogais (nikud)
        </label>
      </div>

      <ul className="mt-5 space-y-3" role="tabpanel" aria-label={current?.label}>
        {list.map((e) => (
          <li key={e.slug} className="rounded-md bg-paper-raised p-5 ring-1 ring-stone-200">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-[1.35rem] font-medium italic leading-tight text-ink">{e.transliteration}</p>
                <p className="mt-1 text-ink-soft">{e.translation}</p>
              </div>
              <He className="shrink-0 text-right text-[1.9rem] leading-[1.35] text-brand-text">{pointed && e.hebrewPointed ? e.hebrewPointed : e.hebrew}</He>
            </div>
            {e.usageNote && <p className="mt-3 text-small text-stone-600">{e.usageNote}</p>}
            {e.exampleHe && (
              <div className="mt-3 rounded-sm bg-sand/60 px-3.5 py-2.5 text-small">
                <He className="text-[1.1rem] text-ink">{e.exampleHe}</He>
                <p className="italic text-ink">{e.exampleTranslit}</p>
                <p className="text-stone-600">{e.exampleTranslation}</p>
              </div>
            )}
            <div className="mt-3 flex items-center gap-3">
              <Listen e={e} voice={voice} />
            </div>
          </li>
        ))}
      </ul>
      {!hasRecordings && (
        <p className="mt-5 text-micro text-stone-600">
          As gravações de falante nativo ainda não foram feitas para esta caravana. Se o seu aparelho tiver voz em hebraico, o botão de voz sintética aparece em cada
          expressão; ela pode errar a pronúncia.
        </p>
      )}
    </div>
  );
}
