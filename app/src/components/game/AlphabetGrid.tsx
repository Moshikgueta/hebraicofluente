'use client';

/* The 22 letters, all at once.
 * ─────────────────────────────────────────────────────────────────────────
 * This is the panel that justifies a desktop version. On a phone the course
 * answers "what now?" with one card, because one card is all that fits and all
 * that a bus ride needs. At a desk the useful question is "where am I in this
 * alphabet?" - and the honest answer is the whole alphabet with your progress
 * written on it, not a percentage.
 *
 * Three states, and the third matters: done, current, and not yet - drawn but
 * never hidden. Hiding the road is what makes a course feel endless, and a
 * beginner staring at 22 unknown shapes needs to watch them turn over one by
 * one. A letter part-way through shows its stage count rather than a tick,
 * because "3 de 5" is information and a half-filled tick is not.
 */

import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { useProgress } from '@/lib/state/store';
import { allLetters, course, type Letter } from '@/lib/content';
import { isLessonComplete, STAGE_COUNT } from '@/lib/state/rules';

/* Os quatro estados do mapa de domínio, com os nomes e as cores do design.
   Cada um é cor + ícone + palavra, nunca cor sozinha - a mesma regra do
   retorno de resposta, e pelo mesmo motivo. */
export type EstadoLetra = 'dominada' | 'revisar' | 'progresso' | 'nova';

const ESTADO: Record<EstadoLetra, { fundo: string; borda: string; tinta: string; rotulo: string }> = {
  dominada:  { fundo: 'var(--teal-soft)', borda: 'var(--edge-teal)', tinta: 'var(--teal-ink)', rotulo: 'Dominada' },
  revisar:   { fundo: 'var(--gold-soft)', borda: 'var(--edge-gold)', tinta: 'var(--gold)',     rotulo: 'Revisar' },
  progresso: { fundo: 'var(--card)',      borda: 'var(--line)',      tinta: 'var(--teal)',     rotulo: 'Em progresso' },
  nova:      { fundo: 'var(--sand)',      borda: 'var(--line)',      tinta: 'var(--locked)',   rotulo: 'Não vista' }
};

export function AlphabetGrid({ compact = false }: { compact?: boolean }) {
  const p = useProgress();
  const letters = allLetters();

  /* Quais letras pedem revisão hoje. `weakLetters` já ordena por quanto
     custaram; aqui só interessa a pertinência ao conjunto. */
  const aRevisar = new Set(p.weak);

  /* The first unfinished letter is "current". Everything before it is open for
     revisiting, everything after is reachable - nothing is locked, because a
     lock is a promise the course does not need to make. */
  const currentId = letters.find(l => !isLessonComplete(p.state, l.id))?.id;

  const estadoDe = (L: Letter): EstadoLetra => {
    const feita = isLessonComplete(p.state, L.id);
    if (aRevisar.has(L.id)) return 'revisar';
    if (feita) return 'dominada';
    if ((p.state.lessons[L.id]?.stagesDone.length ?? 0) > 0 || L.id === currentId) return 'progresso';
    return 'nova';
  };

  return (
    <div className="grid gap-3">
      {/* Célula menor no telefone, com o mesmo componente. Em quatro colunas
          de 135px a grade ocupava 1.100px - mais de uma tela inteira só para
          a tabela de referência, dentro do painel que existe para dizer o que
          fazer agora. Em cinco ou seis colunas curtas ela vira o que sempre
          foi: um cartaz do alfabeto, lido de relance. */}
      <div
        className={`grid gap-2 ${compact
          ? 'grid-cols-[repeat(auto-fill,minmax(52px,1fr))]'
          : 'grid-cols-[repeat(auto-fill,minmax(52px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(64px,1fr))]'}`}
      >
        {letters.map(L => (
          <LetterCell
            key={L.id}
            letter={L}
            estado={estadoDe(L)}
            feita={isLessonComplete(p.state, L.id)}
            stages={p.state.lessons[L.id]?.stagesDone.length ?? 0}
            compact={compact}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-ui text-[11.5px] text-ink-muted">
        {(['dominada', 'revisar', 'progresso', 'nova'] as const).map(e => {
          const quantas = letters.filter(L => estadoDe(L) === e).length;
          if (quantas === 0) return null;
          return <Legend key={e} estado={e} label={`${quantas} ${ESTADO[e].rotulo.toLowerCase()}`} />;
        })}
      </div>
    </div>
  );
}

function Legend({ estado, label }: { estado: EstadoLetra; label: string }) {
  const e = ESTADO[estado];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="w-3 h-3 rounded-[4px] border"
            style={{ background: e.fundo, borderColor: e.borda }} />
      {label}
    </span>
  );
}

/** O sinal de cada estado. Cor nunca sozinha: o ícone diz o mesmo. */
function SinalEstado({ estado }: { estado: EstadoLetra }) {
  const cor = ESTADO[estado].tinta;
  if (estado === 'dominada') return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3.2 8.3 6.2 11.3 12.8 4.7" stroke={cor} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (estado === 'revisar') return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 3v8M4.8 8.2 8 11.4l3.2-3.2" stroke={cor} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (estado === 'progresso') return (
    <span aria-hidden className="w-[7px] h-[7px] rounded-full" style={{ background: cor }} />
  );
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3.4" y="7" width="9.2" height="6.2" rx="1.6" stroke={cor} strokeWidth="1.4" />
      <path d="M5.6 7V5.4a2.4 2.4 0 0 1 4.8 0V7" stroke={cor} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function LetterCell({
  letter: L, estado, feita, stages, compact
}: { letter: Letter; estado: EstadoLetra; feita: boolean; stages: number; compact: boolean }) {
  const e = ESTADO[estado];
  /* A contagem de etapas só faz sentido enquanto a lição não fechou. Uma
     letra concluída que voltou para revisão mostra o NOME, e não "5/5" - o
     5/5 diria a coisa certa pelo motivo errado. */
  const parcial = !feita && stages > 0;
  const dito = estado === 'progresso' && stages > 0
    ? `${stages} de ${STAGE_COUNT} etapas`
    : e.rotulo.toLowerCase();

  return (
    <Link
      href={`/licao/${L.id}`}
      title={`${L.order}. ${L.namePt} - ${dito}`}
      aria-label={`Letra ${L.order}, ${L.namePt}: ${dito}`}
      style={{ background: e.fundo, borderColor: e.borda }}
      className={`group relative rounded-[var(--r-md)] border transition-colors
        ${compact ? 'min-h-[56px] p-1.5' : 'min-h-[56px] p-1.5 sm:min-h-[74px] sm:p-2'}
        grid place-items-center gap-0.5`}
    >
      <span aria-hidden className="absolute top-1 left-1.5 font-ui text-[9.5px] tabular-nums text-ink-muted">
        {L.order}
      </span>
      <He size={compact ? 'word' : 'lg'} dim={estado === 'nova'}>{L.letter}</He>
      {!compact && (
        /* O nome da letra só a partir de sm. Num telefone ele é 10px debaixo
           de cada uma das 22 células, e o nome de cada letra está no mapa e
           na lição - aqui ele custava mais altura do que informava. O `title`
           e o `aria-label` da célula continuam dizendo tudo. */
        <span className="hidden sm:block font-ui text-[10px] leading-none text-ink-muted truncate max-w-full">
          {parcial ? `${stages}/${STAGE_COUNT}` : L.namePt}
        </span>
      )}
      {!compact && parcial && (
        <span aria-hidden
              className="sm:hidden absolute bottom-0.5 font-ui text-[9px] leading-none text-[var(--teal)] tabular-nums">
          {stages}/{STAGE_COUNT}
        </span>
      )}
      <span aria-hidden className="absolute top-1 right-1.5 grid place-items-center">
        <SinalEstado estado={estado} />
      </span>
    </Link>
  );
}

/* ── module progress ────────────────────────────────────────────────────
   The teaching plan's own units, with how far each one got. A learner who
   stalls does it inside a module, and this is where that shows. */
export function ModuleProgress() {
  const p = useProgress();

  return (
    /* Two columns while this is a full-width block under the alphabet; one
       column from lg up, where it lives in the ~350px rail and a second column
       would truncate every module title to "As s…". */
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
      {course.modules.map(m => {
        const own = allLetters().filter(l => l.module === m.n);
        const isExtra = own.length === 0;
        const doneCount = isExtra
          ? Math.min(3, p.state.lessons[m.id]?.stagesDone.length ?? 0)
          : own.filter(l => isLessonComplete(p.state, l.id)).length;
        const total = isExtra ? 3 : own.length;
        const cpPassed = !!p.state.checkpoints[`cp${m.n}`]?.passedAt;
        const href = isExtra
          ? `/modulo/${m.n}`
          : `/licao/${own.find(l => !isLessonComplete(p.state, l.id))?.id ?? own[0]!.id}`;

        return (
          <li key={m.id}>
            <Link
              href={href}
              className="block rounded-[var(--r-md)] border border-line bg-surface p-3
                         hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-ui text-[10.5px] uppercase tracking-[.07em] text-ink-muted shrink-0">
                  Mód {m.n}
                </span>
                <span className="font-ui text-[13px] font-medium text-ink truncate">{m.titlePt}</span>
                <span className="ml-auto font-ui text-[11.5px] tabular-nums text-ink-muted shrink-0">
                  {cpPassed ? '✓' : `${doneCount}/${total}`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-500
                    ${cpPassed ? 'bg-[var(--green)]' : 'bg-[var(--accent)]'}`}
                  style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
