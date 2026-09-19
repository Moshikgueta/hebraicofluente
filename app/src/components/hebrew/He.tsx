/* The direction contract, as components.
 * ─────────────────────────────────────────────────────────────────────────
 * <He> is the ONLY way a Hebrew codepoint reaches the DOM. Everything else in
 * the app that wants to show Hebrew goes through it or through one of the
 * three wrappers below.
 *
 * Why this is a rule and not a preference - three real bugs from the printed
 * reference this course is built from:
 *
 *   · "A letra מ - Mem (מֵם)" printed with the closing paren on the wrong
 *     side, because a neutral character between an RTL run and the line end
 *     goes wherever the algorithm sends it;
 *   · "Encontre todas as letras מ: מים / בית / מה" printed with the whole list
 *     reversed, because the colon and the slashes joined the RTL run;
 *   · worst, a matching exercise that re-paired itself - Mayim shown against
 *     מי and Mi against מים - silently teaching the wrong answer.
 *
 * Two invariants prevent all three:
 *   1. every Hebrew run is its own bidi isolate;
 *   2. punctuation NEVER goes inside the span.
 *
 * (2) is enforced in development by throwing, because a soft failure here is
 * invisible in code review and only shows up as a wrong answer on a page.
 */

import { clean } from '@/lib/hebrew';

/* Bidi-neutral characters. Adjacent to an RTL run they reorder; kept outside
   the span they belong to the surrounding Portuguese and stay put. */
const FORBIDDEN = /[()[\]{}:;/,<>«»"|]/;

export type HeSize = 'inline' | 'word' | 'lg' | 'xl' | 'plate' | 'display' | 'hero';

/* Os tamanhos, e a entrelinha que cada um pede.
   O hebraico vocalizado precisa de mais entrelinha que o latino: o nikud
   desce abaixo da linha de base e sobe acima do topo da letra, e a 1.2 ele
   encosta na linha de cima. A especificação pede 1.35-1.4 em corpo grande e
   1.1-1.15 em letra isolada grande - que é exatamente a diferença entre uma
   palavra dentro de um parágrafo e a letra sozinha no cartão da lição.

   Nada de ensino desce abaixo de 20px: menor que isso o nikud vira sujeira. */
const SIZE: Record<HeSize, string> = {
  inline:  'text-[1.15em] leading-[1.6]',
  word:    'text-[28px] sm:text-[32px] leading-[1.38]',
  lg:      'text-[40px] sm:text-[48px] leading-[1.3]',
  xl:      'text-[56px] sm:text-[68px] leading-[1.2]',
  /* A letra sozinha dentro de um bloco de cor: o mockup do hero e o painel
     da demonstração. É o tamanho em que a forma da letra vira o assunto da
     tela, e o design usa 76-88px para isso. */
  plate:   'text-[76px] sm:text-[88px] leading-[1.1]',
  display: 'text-[84px] sm:text-[104px] leading-[1.15]',
  hero:    'text-[120px] sm:text-[160px] leading-[1.1]'
};

/** As cores em que o hebraico aparece. `paper` é para bloco navy - a letra
 *  fica na cor do papel, que é o contraste que o design usa lá. `teal` é o
 *  destaque (o א do hero, a sílaba marcada dentro de uma palavra). */
const TONE = {
  ink:   'text-ink',
  muted: 'text-ink-muted',
  paper: 'text-[var(--cream)]',
  teal:  'text-[var(--teal)]',
  navy:  'text-[var(--navy)]',
  /* Teal claro: existe SÓ sobre navy - a marca, os rótulos e os ícones
     dentro dos blocos escuros. Sobre creme ele não passa em contraste. */
  lite:  'text-[var(--teal-lite)]'
} as const;

export function He({
  children, size = 'inline', cursive = false, mark, className = '', dim = false,
  tone = 'ink'
}: {
  children: string;
  size?: HeSize;
  cursive?: boolean;
  /** Highlight the first occurrence of this glyph inside the word. */
  mark?: string | null;
  className?: string;
  /** Atalho antigo para `tone="muted"`. Mantido: está em muitas telas. */
  dim?: boolean;
  tone?: keyof typeof TONE;
}) {
  const raw = clean(children);
  if (!raw) return null;

  if (process.env.NODE_ENV !== 'production' && FORBIDDEN.test(raw)) {
    throw new Error(
      `<He> received punctuation inside a Hebrew run: ${JSON.stringify(raw)}. ` +
      `Put the Hebrew in its own <He> and the punctuation outside it.`
    );
  }

  /* A cor é do componente, e por isso ela precisa ser uma OPÇÃO do
     componente. Envolver um <He> numa span colorida não funciona - a classe
     de cor daqui ganha - e tentar vencer por `className` depende da ordem em
     que o Tailwind gera as regras, que não é uma coisa para se apostar.
     Já custou o hebraico sumir, preto sobre preto, num painel escuro. */
  const cls = [
    'he', cursive && 'he-cursive', SIZE[size],
    TONE[dim ? 'muted' : tone], className
  ].filter(Boolean).join(' ');

  const m = mark ? clean(mark) : '';
  const at = m ? raw.indexOf(m) : -1;

  return (
    <span className={cls} lang="he">
      {at >= 0 ? (
        <>
          {raw.slice(0, at)}
          <b className="font-normal text-[var(--accent-soft)]">{m}</b>
          {raw.slice(at + m.length)}
        </>
      ) : raw}
    </span>
  );
}

/**
 * A sequence read in Hebrew order: items[0] is RIGHTMOST. The container is an
 * RTL isolate and the children lay out in DOM order, so the author writes the
 * list the way a Hebrew reader meets it and the separators stay between the
 * items instead of collecting at one end.
 */
export function HeSeq({
  items, size = 'word', cursive = false, sep = '·', className = ''
}: {
  items: readonly string[];
  size?: HeSize;
  cursive?: boolean;
  sep?: string | null;
  className?: string;
}) {
  return (
    <span className={`he-seq ${className}`} lang="he">
      {items.map((t, i) => (
        <span key={`${t}-${i}`} className="inline-flex items-center gap-[.6em]">
          <He size={size} cursive={cursive}>{t}</He>
          {sep && i < items.length - 1 && (
            <span aria-hidden className="text-ink-muted text-[.5em] select-none">{sep}</span>
          )}
        </span>
      ))}
    </span>
  );
}

/**
 * A word with letters missing. `parts` is in READING order - right to left -
 * with `null` for each blank, exactly as `gapAtLetter` returns it.
 */
export function HeCloze({
  parts, size = 'word', filled
}: {
  parts: readonly (string | null)[];
  size?: HeSize;
  /** What the learner has put in the gap so far, if anything. */
  filled?: string | null;
}) {
  return (
    <span className="he-seq gap-0" lang="he">
      {parts.map((p, i) =>
        p == null ? (
          <span
            key={`gap-${i}`}
            className={[
              'inline-block align-baseline mx-[.12em] rounded-[4px] border-b-[3px]',
              'min-w-[.9em] text-center',
              filled ? 'border-[var(--accent-soft)]' : 'border-dashed border-ink-muted'
            ].join(' ')}
          >
            {filled ? <He size={size}>{filled}</He> : <span className="opacity-0">.</span>}
          </span>
        ) : (
          <He key={`p-${i}`} size={size}>{p}</He>
        )
      )}
    </span>
  );
}

/**
 * A "Latin • Hebrew" pair for matching. Each side is its own isolate and the
 * bullet lives in a neutral span of its own, so a row physically cannot
 * re-pair itself.
 */
export function HePair({ latin, hebrew }: { latin: string; hebrew: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-ui text-sm text-ink-body">{latin}</span>
      <span aria-hidden className="text-ink-muted">•</span>
      <He size="word">{hebrew}</He>
    </span>
  );
}
