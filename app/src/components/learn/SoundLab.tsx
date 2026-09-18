'use client';

/* The sound lab: every consonant you know, against every vowel.
 * ─────────────────────────────────────────────────────────────────────────
 * Reading Hebrew is one operation repeated fast — consonant plus vowel — and
 * the course taught the pieces without ever laying them out as a system. The
 * lab is that system on one screen: the patach under מ is the same patach
 * under ק, and a learner who can see the column realises it in a second
 * instead of over six lessons.
 *
 * Two rules it obeys:
 *   · only letters already taught. A grid that shows the whole alphabet is a
 *     wall, and a cell the learner cannot read is not practice;
 *   · it plays a RECORDING or it plays nothing. A synthetic voice reading
 *     nikud is wrong often enough to teach the wrong sound, and the learner
 *     would never find out.
 *
 * It is a learning surface, not a test: everything is on screen, nothing is
 * scored. The testing version of the same content is the generated exercise.
 */

import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { AudioButton, hasAudio } from './AudioButton';
import type { Letter, Syllable } from '@/lib/content';
import { nikud } from '@/lib/content';

const VOWELS = ['a', 'e', 'i', 'o', 'u'] as const;
type Vowel = typeof VOWELS[number];

const VOWEL_LABEL: Record<Vowel, string> = {
  a: 'a', e: 'e', i: 'i', o: 'o', u: 'u'
};

export function SoundLab({
  letters, title = 'Laboratório de sons', compact = false
}: {
  /** Already filtered to what the learner has met. */
  letters: Letter[];
  title?: string;
  compact?: boolean;
}) {
  const [picked, setPicked] = useState<{ letter: Letter; syl: Syllable } | null>(null);

  if (!letters.length) return null;

  /* Newest first: the letter just learned is the one being practised, and on a
     phone the top row is the only one visible without scrolling. */
  const rows = [...letters].sort((a, b) => b.order - a.order).slice(0, compact ? 6 : 22);

  return (
    <Card className="overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-[color:var(--line-soft)]
                      flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-[16px] font-bold text-ink">{title}</h3>
        <p className="font-ui text-[12.5px] text-ink-muted">
          toque numa sílaba para ouvir e ver como se lê
        </p>
      </div>

      {/* All five vowel columns fit a 360px phone once the letter NAME is
          dropped — the glyph is the row label that matters, and the name is
          two taps away in the lesson. Scrolls horizontally below that rather
          than shrinking the Hebrew, which is the one thing this component must
          never do. */}
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-[344px] border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-surface px-2 sm:px-3 py-2 text-left
                             font-ui text-[11px] uppercase tracking-[.07em] text-ink-muted">
                Letra
              </th>
              {VOWELS.map(v => (
                <th key={v} className="px-1 py-2 font-ui text-[13px] font-semibold text-[var(--teal-band)]">
                  {VOWEL_LABEL[v]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(L => (
              <tr key={L.id} className="border-t border-[color:var(--line-soft)]">
                <th scope="row" className="sticky left-0 z-10 bg-surface px-2 sm:px-3 py-1.5 text-left">
                  <span className="flex items-center gap-2">
                    <He size="word">{L.letter}</He>
                    <span className="hidden sm:inline font-ui text-[11.5px] text-ink-muted">
                      {L.namePt}
                    </span>
                  </span>
                </th>
                {VOWELS.map(v => {
                  const syl = L.syllables.find(s => s.vowel === v);
                  if (!syl) return <td key={v} />;
                  const on = picked?.syl.he === syl.he && picked.letter.id === L.id;
                  return (
                    <td key={v} className="p-1">
                      <button
                        type="button"
                        onClick={() => setPicked(on ? null : { letter: L, syl })}
                        aria-label={`${L.namePt} com ${VOWEL_LABEL[v]}: ${syl.translit}`}
                        aria-pressed={on}
                        className={`w-full min-h-[56px] rounded-[var(--r-md)] border-2 px-1
                          grid place-items-center transition-colors
                          ${on ? 'border-[var(--teal)] bg-[var(--teal-wash)]'
                               : 'border-transparent hover:border-line hover:bg-surface-2'}`}
                      >
                        <He size="word">{syl.he}</He>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* One detail panel rather than a tooltip per cell: a tooltip on a phone
          is a thing you cannot see because your finger is on it. */}
      <div className="px-4 sm:px-5 py-4 border-t border-[color:var(--line-soft)] min-h-[92px]
                      flex flex-wrap items-center gap-4">
        {picked ? (
          <>
            <He size="lg">{picked.syl.he}</He>
            <div className="grid gap-0.5 min-w-0">
              <p className="font-ui text-[17px] font-semibold text-[var(--teal-band)]">
                {picked.syl.translit}
              </p>
              <p className="font-ui text-[13px] text-ink-muted">{picked.syl.ptApprox}</p>
            </div>
            <div className="ml-auto">
              <AudioButton audioId={picked.syl.audioId} label="Ouvir" slow />
            </div>
          </>
        ) : (
          <p className="font-ui text-[13.5px] text-ink-muted">
            A consoante muda de linha para linha. O sinal é o mesmo em toda a coluna —
            é isso que faz a leitura ficar automática.
          </p>
        )}
      </div>
    </Card>
  );
}

/* ── the signs themselves ───────────────────────────────────────────────
   The lab shows what the signs DO. This says what they are called and where
   they sit, which is the other half — and it is the only place in the course
   where a learner can hear "patach" said out loud. */
export function VowelSigns({ demoLetter }: { demoLetter?: string }) {
  return (
    <div className="grid gap-3">
      {nikud.sounds.map(s => (
        <Card key={s.sound} className="p-4 grid gap-3">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-[22px] font-bold text-[var(--teal-band)]">
              {s.sound}
            </span>
            {s.ptApprox && (
              <span className="font-ui text-[13.5px] text-ink-muted">{s.ptApprox}</span>
            )}
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {s.signs.map(g => (
              <li key={g.namePt}
                  className="flex items-center gap-3 rounded-[var(--r-md)] bg-surface-2 px-3 py-2">
                <He size="lg">{demoLetter ? demoLetter + g.sign : g.demo}</He>
                <span className="grid gap-0.5 min-w-0">
                  <span className="font-ui text-[13.5px] font-medium text-ink">{g.namePt}</span>
                  <span className="font-ui text-[12px] text-ink-muted truncate">{g.position}</span>
                </span>
                {hasAudio(g.nameAudioId) && (
                  <span className="ml-auto">
                    <AudioButton audioId={g.nameAudioId} label="Nome" size="sm" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
