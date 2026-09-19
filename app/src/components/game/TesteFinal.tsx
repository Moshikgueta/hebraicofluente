'use client';

/* O cartão do teste final do alfabeto, trancado e destrancado.
 * ─────────────────────────────────────────────────────────────────────────
 * Trancar alguma coisa neste curso precisa de justificativa, porque a regra
 * geral é o contrário: nada é bloqueado, nem a lição 20 para quem está na 3.
 *
 * O teste final é a exceção, e por um motivo pedagógico e não comercial: ele
 * mede leitura do alfabeto INTEIRO. Aberto na letra 7, ele não mede nada -
 * pergunta sobre quinze letras que a pessoa nunca viu e devolve um número
 * que só serve para desanimar. O cadeado aqui protege o significado da nota.
 *
 * Por isso o cadeado DIZ quantas faltam, e some sozinho: no momento em que a
 * última letra fecha, o cartão vira, avisa, e fica um instante em destaque.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useProgress } from '@/lib/state/store';
import { allLetters, course } from '@/lib/content';
import { alphabetComplete, lettersLeft } from '@/lib/state/rules';
import { track } from '@/lib/analytics';

const LETRAS = allLetters().map(l => l.id);

/** A chave do "já avisei uma vez" - o aviso de desbloqueio aparece uma vez só. */
const AVISADO = 'hf-teste-final-avisado';

export function TesteFinalCard({ compacto = false }: { compacto?: boolean }) {
  const p = useProgress();
  const liberado = alphabetComplete(p.state, LETRAS);
  const faltam = lettersLeft(p.state, LETRAS);
  const [celebrar, setCelebrar] = useState(false);
  const jaViu = useRef(true);

  /* A festa é a TRANSIÇÃO, não o estado. Quem já destrancou há uma semana vê
     o cartão normal; quem acabou de fechar a última letra vê o aviso - uma
     vez, e a marca fica no aparelho. Sem isso, "desbloqueado!" apareceria em
     todo carregamento da página até o fim do curso. */
  useEffect(() => {
    if (!p.ready) return;
    let visto = true;
    try { visto = localStorage.getItem(AVISADO) === '1'; } catch { /* janela anônima */ }
    jaViu.current = visto;
    if (liberado && !visto) {
      setCelebrar(true);
      try { localStorage.setItem(AVISADO, '1'); } catch { /* idem */ }
      track('first_reached', { itemId: 'teste-final-desbloqueado' });
      const t = setTimeout(() => setCelebrar(false), 6000);
      return () => clearTimeout(t);
    }
  }, [p.ready, liberado]);

  if (!p.ready) return null;

  if (!liberado) {
    return (
      <Card tone="sand" className={`grid gap-2.5 ${compacto ? 'p-4' : 'p-5 sm:p-6'}`}>
        <p className="flex items-center gap-2.5">
          <span aria-hidden className="w-9 h-9 rounded-[11px] bg-[var(--card)] border border-line
                                       grid place-items-center shrink-0">
            <Cadeado />
          </span>
          <span className="font-display text-[17px] sm:text-[18px] font-semibold
                           tracking-[-0.018em] text-ink-muted">
            Teste final do alfabeto
          </span>
        </p>
        <p className="font-ui text-[14px] leading-[1.5] text-ink-muted">
          Complete todas as letras para desbloquear o teste final.
          {' '}
          <strong className="font-semibold text-ink-body tabular-nums">
            {faltam === 1 ? 'Falta 1 letra.' : `Faltam ${faltam} letras.`}
          </strong>
        </p>
        <span className="h-1.5 rounded-full bg-[var(--card)] overflow-hidden">
          <span className="block h-full rounded-full bg-[var(--edge-teal)] transition-[width] duration-700"
                style={{ width: `${((course.totalLetters - faltam) / course.totalLetters) * 100}%` }} />
        </span>
      </Card>
    );
  }

  return (
    <Card tone={celebrar ? 'mint' : 'navy'}
          className={`relative overflow-hidden grid gap-2.5 ${compacto ? 'p-4' : 'p-5 sm:p-6'}
                      ${celebrar ? 'animate-pop' : ''}`}>
      {celebrar && <Faiscas />}
      <p className="flex items-center gap-2.5 relative">
        <span aria-hidden className={`w-9 h-9 rounded-[11px] grid place-items-center shrink-0
          ${celebrar ? 'bg-[var(--card)]' : 'bg-white/10'}`}>
          <Estrela cor={celebrar ? 'var(--teal)' : 'var(--teal-lite)'} />
        </span>
        <span className={`font-display text-[17px] sm:text-[18px] font-semibold tracking-[-0.018em]
          ${celebrar ? 'text-[var(--teal-ink)]' : 'text-white'}`}>
          {celebrar ? 'Teste final desbloqueado!' : 'Teste final do alfabeto'}
        </span>
      </p>
      <p className={`font-ui text-[14px] leading-[1.5] relative
        ${celebrar ? 'text-[var(--teal-body)]' : 'text-white/70'}`}>
        {celebrar
          ? 'Você fechou as 22 letras. O teste final mede o alfabeto inteiro, em cinco partes.'
          : 'As 22 letras, em cinco partes, sem transliteração para se apoiar.'}
      </p>
      <Link
        href="/desafio-final"
        className={`relative mt-1 justify-self-start inline-flex items-center rounded-[12px]
                    font-ui font-semibold text-[15px] px-5 py-3 transition-transform duration-[180ms]
                    hover:-translate-y-[2px]
          ${celebrar ? 'bg-[var(--teal)] text-white' : 'bg-white text-[var(--navy)]'}`}
      >
        {p.state.finalChallenge.completedAt ? 'Refazer o teste final' : 'Fazer o teste final'}
      </Link>
    </Card>
  );
}

function Cadeado() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="3.6" y="7.8" width="10.8" height="7.4" rx="2" stroke="var(--locked)" strokeWidth="1.5" />
      <path d="M6.2 7.8V5.9a2.8 2.8 0 0 1 5.6 0v1.9" stroke="var(--locked)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Estrela({ cor }: { cor: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M10 2.6l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.9l5-.7L10 2.6Z"
            stroke={cor} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* Três faíscas, e só três. A festa aqui é do tamanho do acontecimento: o
   alfabeto inteiro merece um instante, não uma chuva de papel picado. Com
   `prefers-reduced-motion` elas não se mexem - a regra global de animação
   já zera a duração. */
function Faiscas() {
  const pontos = [
    { top: '12%', left: '86%', delay: '0s' },
    { top: '62%', left: '92%', delay: '.12s' },
    { top: '30%', left: '78%', delay: '.24s' }
  ];
  return (
    <>
      {pontos.map((s, i) => (
        <span key={i} aria-hidden
              className="absolute w-[11px] h-[11px] animate-spark pointer-events-none"
              style={{ top: s.top, left: s.left, animationDelay: s.delay }}>
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M6 0.6l1.2 3.2L10.4 5 7.2 6.2 6 9.4 4.8 6.2 1.6 5l3.2-1.2L6 .6Z"
                  fill="var(--gold)" />
          </svg>
        </span>
      ))}
    </>
  );
}
