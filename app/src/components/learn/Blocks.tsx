'use client';

/* The teaching blocks: the pieces of a lesson that present rather than test. */

import { useState } from 'react';
import Link from 'next/link';
import { He, HeSeq } from '@/components/hebrew/He';
import { AudioButton } from './AudioButton';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Letter, Scene, Syllable, Word } from '@/lib/content';
import { supportLabel, supportLevel } from '@/lib/state/rules';
import { useProgress } from '@/lib/state/store';
import { track } from '@/lib/analytics';

/* ── the Brazilian interference note ─────────────────────────────────────
   Not a generic study tip: every letter carries the specific way Portuguese
   pushes a learner toward the wrong sound. It is the clearest thing this
   course has that a generic app does not, so it gets a strong treatment. */
export function BrazilianTip({ mistake }: { mistake: Letter['brazilianMistake'] }) {
  return (
    <Card tone="amber" className="p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-3">
        <span aria-hidden className="text-lg">🇧🇷</span>
        <h3 className="text-[15px] font-semibold text-[var(--amber)] uppercase tracking-[.06em]">
          Cuidado para brasileiros
        </h3>
      </div>
      <dl className="grid gap-3">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-start">
          <dt className="font-ui text-xs font-semibold text-ink-muted pt-[3px] uppercase tracking-wider">Sai</dt>
          <dd className="text-[15px] leading-relaxed text-ink-body"><Prose text={mistake.wrong} /></dd>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-start">
          <dt className="font-ui text-xs font-semibold text-[var(--green)] pt-[3px] uppercase tracking-wider">Certo</dt>
          <dd className="text-[15px] leading-relaxed text-ink"><Prose text={mistake.right} /></dd>
        </div>
      </dl>
      <p className="mt-3 pt-3 border-t border-[color:var(--line-soft)] text-[13.5px] leading-relaxed text-ink-muted">
        <Prose text={mistake.why} />
      </p>
    </Card>
  );
}

/* Prose from the data files marks Hebrew as {{…}}. Authors never write a
   direction span by hand; this wraps it, and everything outside the braces
   stays ordinary Portuguese - so the quotes and parentheses that bled into the
   reference PDF's Hebrew runs physically cannot get inside a span. */
export function Prose({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let i = 0, k = 0;
  for (;;) {
    const open = text.indexOf('{{', i);
    if (open < 0) { parts.push(text.slice(i)); break; }
    const close = text.indexOf('}}', open);
    if (close < 0) { parts.push(text.slice(i)); break; }
    parts.push(text.slice(i, open));
    parts.push(<He key={`he-${k++}`} size="inline">{text.slice(open + 2, close).trim()}</He>);
    i = close + 2;
  }
  return <>{parts}</>;
}

/* ── syllables ──────────────────────────────────────────────────────────
   Learning mode, explicitly: the reading is on screen. The testing version of
   the same content is a generated exercise, and keeping the two apart is what
   the brief means by "do not show every answer immediately". */
export function SyllableTrainer({ letter }: { letter: Letter }) {
  const [active, setActive] = useState<number | null>(null);
  const shown: Syllable[] = letter.syllables;

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {shown.map((s, i) => (
          <button
            key={s.he}
            type="button"
            onClick={() => setActive(active === i ? null : i)}
            aria-expanded={active === i}
            className={`group rounded-[var(--r-lg)] border p-4 text-center transition-all
              duration-[var(--dur)] ease-[var(--ease)] min-h-[108px]
              flex flex-col items-center justify-center gap-1.5
              ${active === i
                ? 'border-[var(--accent-soft)] bg-[var(--accent-wash)]'
                : 'border-line bg-surface hover:border-[var(--accent-soft)]'}`}
          >
            <He size="lg">{s.he}</He>
            <span className="font-ui text-[15px] font-semibold text-[var(--accent)] tracking-wide">
              {s.translit || '-'}
            </span>
            {/* A instrução vive uma vez, acima da grade. Repetida em baixo de
                cada uma das seis sílabas ela virava ruído - seis linhas de
                texto idêntico numa tela em que o assunto é a letra. */}
            {active === i && (
              <span className="font-ui text-[12px] text-ink-muted leading-snug">
                {s.ptApprox}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <AudioButton audioId={letter.audioId} label={`Ouvir ${letter.namePt}`} slow />
        <p className="font-ui text-[13px] text-ink-muted">
          Leia cada sílaba em voz alta três vezes. É a repetição falada que fixa o som.
        </p>
      </div>
    </div>
  );
}

/* ── word discovery ─────────────────────────────────────────────────────
   Hebrew first, always. The learner attempts the decoding before any support
   appears, and the support arrives in two steps so that "como se lê" and "o
   que quer dizer" are separate acts. */
export function WordReveal({ word, mark }: { word: Word; mark?: string | null }) {
  const { mastered } = useProgress();
  const level = supportLevel(mastered);
  /* Early on the reading is simply printed: a learner who cannot decode
     anything yet gains nothing from a hidden answer. Later it costs a tap, and
     at the far end it has to be asked for. */
  const [step, setStep] = useState<0 | 1 | 2>(level === 'always' ? 1 : 0);

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 min-h-[64px]">
        <He size="xl" mark={mark ?? null}>{word.he}</He>
        <AudioButton audioId={word.audioId} label="Ouvir" size="sm" />
      </div>

      <div className="grid gap-2" aria-live="polite">
        {step >= 1 ? (
          <p className="font-ui text-[17px] font-semibold text-[var(--accent)] tracking-wide">
            {word.translit}
          </p>
        ) : null}
        {step >= 2 ? (
          <p className="text-[17px] text-ink">{word.pt}</p>
        ) : null}
      </div>

      {step < 2 && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setStep(s => (s === 0 ? 1 : 2))}
          className="self-start"
        >
          {step === 0 ? supportLabel(level) : 'Mostrar significado'}
        </Button>
      )}
    </Card>
  );
}

/* ── the bridge words ───────────────────────────────────────────────────
   The teacher's-guide device: meet the letter inside a loanword you already
   know. Recognition only - these are full of letters not yet taught, and the
   copy says so, because a learner who tries to read them and fails learns the
   wrong lesson. */
export function BridgeWords({ letter }: { letter: Letter }) {
  if (!letter.bridgeWords.length) return null;
  return (
    <Card tone="wash" className="p-5 sm:p-6">
      <Badge tone="accent">Você já conhece estas palavras</Badge>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-body">
        O hebraico moderno importou centenas de palavras. Você já sabe o que elas
        querem dizer - só nunca as viu escritas assim. Ache o{' '}
        <He size="inline">{letter.letter}</He> dentro de cada uma.
      </p>
      <ul className="mt-4 grid gap-2">
        {letter.bridgeWords.map(b => (
          <li key={b.he}
              className="flex items-center justify-between gap-4 rounded-[var(--r-md)]
                         bg-surface px-4 py-3 border border-[color:var(--line-soft)]">
            <He size="word" mark={letter.letter}>{b.he}</He>
            <span className="font-ui text-[14px] text-ink-muted text-right">{b.pt}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-ui text-[12.5px] text-ink-muted">
        Não tente ler a palavra inteira ainda - ela usa letras que você ainda não aprendeu.
      </p>
    </Card>
  );
}

/* ── Hebrew in the world ────────────────────────────────────────────────
   Only ever built from words the learner can already decode, so this reads as
   a reward rather than a wall. */
const SCENE_ICON: Record<string, string> = {
  placa: '▭', rotulo: '▤', cardapio: '▥', recibo: '▦', mensagem: '▣',
  jornal: '▨', etiqueta: '▧', anuncio: '▩', vitrine: '▢', conversa: '❝'
};

export function RealWorldHebrew({ scene }: { scene: Scene }) {
  const { mastered } = useProgress();
  const level = supportLevel(mastered);
  const [shown, setShown] = useState(false);
  const word: Word = {
    he: scene.he, translit: scene.translit, pt: scene.pt, use: null, audioId: scene.audioId
  };
  const contextPt = scene.contextPt;
  const sceneLabel = scene.labelPt;
  const icon = SCENE_ICON[scene.sceneType] ?? '▭';
  return (
    <Card tone="surface" className="overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[color:var(--line-soft)]">
        <span aria-hidden>🇮🇱</span>
        <h3 className="font-ui text-[13px] font-semibold uppercase tracking-[.07em] text-ink-muted">
          Hebraico no mundo real
        </h3>
        <span aria-hidden className="ml-auto text-ink-muted">{icon}</span>
      </div>
      <div className="p-5 sm:p-6 grid gap-4">
        <p className="font-ui text-[13.5px] text-ink-muted">{sceneLabel}</p>
        {/* The word alone, big, on a plain surface - the closest a screen gets
            to seeing it on a sign. */}
        <div className="rounded-[var(--r-md)] bg-surface-2 py-9 px-5 flex items-center justify-center">
          <He size="display">{word.he}</He>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[15px] leading-relaxed text-ink-body flex-1 min-w-[16ch]">
            <Prose text={contextPt} />
          </p>
          <AudioButton audioId={word.audioId} label="Ouvir" size="sm" />
        </div>
        {shown ? (
          <div className="grid gap-1 animate-rise border-t border-[color:var(--line-soft)] pt-4">
            <p className="font-ui text-[16px] font-semibold text-[var(--accent)]">{word.translit}</p>
            <p className="text-[16px] text-ink">{word.pt}</p>
          </div>
        ) : (
          <Button variant="secondary" size="sm" className="self-start" onClick={() => setShown(true)}>
            {level === 'on-request' ? 'Você consegue ler? Conferir' : 'Você consegue ler? Mostrar resposta'}
          </Button>
        )}
      </div>
    </Card>
  );
}

/* ── the printed workbook ───────────────────────────────────────────────
   The PDF is not replaced by the app; handwriting on paper is still the best
   way to learn to write. The link names the exact pages. */
export function WorkbookLink({ pages, what }: { pages: { from: number; to: number } | null; what: string }) {
  if (!pages) return null;
  return (
    <Link
      href="/workbook"
      onClick={() => track('workbook_opened', { pages: `${pages.from}-${pages.to}` })}
      className="flex items-center justify-between gap-4 rounded-[var(--r-md)] border border-dashed
                 border-line px-4 py-3 text-ink-body hover:bg-surface-2 transition-colors"
    >
      <span className="font-ui text-[14px]">
        Quer praticar {what} à mão? Workbook impresso, páginas {pages.from}-{pages.to}
      </span>
      <span aria-hidden className="text-ink-muted">→</span>
    </Link>
  );
}

/* ── a letter, big ──────────────────────────────────────────────────────── */
export function HebrewLetterCard({ letter }: { letter: Letter }) {
  return (
    <div className="grid sm:grid-cols-[1fr_auto] items-center gap-6">
      <div className="grid gap-3">
        <div className="flex items-baseline gap-4 flex-wrap">
          <He size="hero">{letter.letter}</He>
          {letter.finalForm && (
            <span className="flex items-baseline gap-2">
              <He size="xl" dim>{letter.finalForm}</He>
              <span className="font-ui text-[12px] text-ink-muted">no fim da palavra</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[28px] sm:text-[34px] font-bold">{letter.namePt}</h1>
          <span className="font-ui text-[17px] text-[var(--accent)] font-semibold">{letter.sound}</span>
          <He size="word" dim>{letter.nameHe}</He>
        </div>
      </div>
      <div className="grid gap-2 justify-items-start sm:justify-items-end">
        <AudioButton audioId={letter.audioId} label="Ouvir a letra" slow />
      </div>
    </div>
  );
}

/* ── the sequence strip used all over the lesson ─────────────────────────── */
export function ReadAloudRow({ items, label }: { items: string[]; label: string }) {
  return (
    <Card className="p-5 grid gap-3">
      <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">{label}</p>
      <HeSeq items={items} size="word" />
    </Card>
  );
}
