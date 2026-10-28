'use client';

/* "Me explica, Moshik" (28/10/2026, master prompt 3.0, parte 13).
 * ─────────────────────────────────────────────────────────────────────────
 * Um botão discreto no alto da lição, em toda etapa: abre uma folha com a
 * explicação curta da letra, sem sair do lugar. NADA aqui é texto novo: é o
 * que a lição já ensina, reunido para quem travou no meio de um exercício -
 * o que lembrar, o que a letra faz, como se pronuncia, o erro de brasileiro,
 * as letras que se parecem com ela, e as gravações do professor quando
 * existem (sem gravação, o quadro não aparece; ver GravacaoDoProfessor).
 *
 * É um <dialog> nativo: prende o foco, fecha com Esc e devolve o foco ao
 * botão. A folha sobe 12 px ao abrir (220 ms); com movimento reduzido, abre
 * no lugar. Fechar não muda nada no progresso.
 */

import { tx } from '@/i18n/telas/licao-me-explica';
import { useRef } from 'react';
import { He } from '@/components/hebrew/He';
import { Prose } from '@/components/hebrew/Prose';
import { GravacaoDoProfessor } from '@/components/learn/GravacaoDoProfessor';
import { AudioButton } from '@/components/learn/AudioButton';
import { getLetter, type Letter } from '@/lib/content';
import { somPt } from '@/lib/som-pt';

export function MeExplica({ letter }: { letter: Letter }) {
  const ref = useRef<HTMLDialogElement>(null);
  const parecidas = letter.confusableWith.map(id => getLetter(id)).filter((l): l is Letter => !!l);
  const e = letter.ensino;
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()}
              aria-haspopup="dialog"
              className="inline-flex items-center gap-1.5 min-h-[40px] rounded-full border border-[var(--accent-soft)]
                         bg-[var(--accent-wash)] px-3 font-ui text-[13px] font-semibold text-[var(--teal-ink)]
                         transition-[transform,background-color] duration-[var(--dur-toque)] active:scale-[.97]">
        <span aria-hidden className="grid place-items-center w-5 h-5 rounded-full bg-[var(--teal)] text-white text-[12px] font-bold">?</span>
        {tx.meExplica}
      </button>

      <dialog ref={ref} aria-labelledby={`me-explica-${letter.id}`}
              onClick={ev => { if (ev.target === ref.current) ref.current?.close(); }}
              className="hf-folha m-0 mt-auto sm:m-auto w-full max-w-[560px] max-h-[86dvh] overflow-y-auto
                         rounded-t-[22px] sm:rounded-[22px] border border-line bg-[var(--card)] p-0 text-ink
                         backdrop:bg-black/40">
        <div className="grid gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="m-0 font-ui text-[12px] font-bold uppercase tracking-[.1em] text-[var(--accent)]">{tx.meExplica}</p>
              <h2 id={`me-explica-${letter.id}`} className="m-0 flex items-baseline gap-3 text-[24px] font-bold">
                <He size="xl">{letter.letraComPonto ?? letter.letter}</He>
                <span>{letter.namePt}</span>
              </h2>
              <p className="m-0 font-ui text-[15px] text-[var(--teal-ink)] font-semibold">{somPt(letter.sound)}</p>
            </div>
            <button type="button" onClick={() => ref.current?.close()} aria-label={tx.fechar}
                    className="shrink-0 grid place-items-center w-11 h-11 rounded-full text-[20px] text-ink-muted hover:bg-surface-2">
              ✕
            </button>
          </div>

          <AudioButton audioId={letter.audioId} label={tx.ouvirLetra} />

          {e?.lembrePt && (
            <section className="rounded-[var(--r-md)] bg-[var(--teal-soft)] px-4 py-3 grid gap-1">
              <h3 className="m-0 font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--teal-ink)]">{tx.lembrar}</h3>
              <p className="m-0 text-[15.5px] leading-relaxed text-ink"><Prose text={e.lembrePt} /></p>
            </section>
          )}
          {e?.funcaoPt && (
            <section className="grid gap-1">
              <h3 className="m-0 font-display text-[16px] font-semibold">{tx.faz}</h3>
              <p className="m-0 text-[15px] leading-relaxed text-ink-body"><Prose text={e.funcaoPt} /></p>
            </section>
          )}
          <section className="grid gap-1">
            <h3 className="m-0 font-display text-[16px] font-semibold">{tx.pronunciar}</h3>
            <p className="m-0 text-[15px] leading-relaxed text-ink-body"><Prose text={letter.soundNotePt} /></p>
          </section>
          <section className="grid gap-1.5 rounded-[var(--r-md)] border border-line px-4 py-3">
            <h3 className="m-0 font-display text-[16px] font-semibold">{tx.erroComum}</h3>
            <p className="m-0 text-[14.5px] leading-relaxed text-ink-body"><strong className="font-semibold">{tx.sai}</strong> <Prose text={letter.brazilianMistake.wrong} /></p>
            <p className="m-0 text-[14.5px] leading-relaxed text-ink"><strong className="font-semibold text-[var(--teal-ink)]">{tx.certo}</strong> <Prose text={letter.brazilianMistake.right} /></p>
          </section>
          {parecidas.length > 0 && (
            <section className="grid gap-2">
              <h3 className="m-0 font-display text-[16px] font-semibold">{tx.naoConfunda}</h3>
              <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                {parecidas.map(l => (
                  <li key={l.id} className="flex items-center gap-2 rounded-[12px] bg-surface-2 px-3 py-1.5">
                    <He size="word">{l.letter}</He>
                    <span className="font-ui text-[13px] text-ink-muted">{l.namePt}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <GravacaoDoProfessor id={`letter-${letter.id}-intro`} textoPt={tx.gravacao(letter.namePt)} />
          <GravacaoDoProfessor id={`letter-${letter.id}-common-mistake`} />

          <button type="button" onClick={() => ref.current?.close()}
                  className="min-h-[52px] rounded-[var(--r-md)] bg-[var(--navy)] font-ui text-[15.5px] font-semibold text-white active:scale-[.98]">
            {tx.entendi}
          </button>
        </div>
      </dialog>
    </>
  );
}
