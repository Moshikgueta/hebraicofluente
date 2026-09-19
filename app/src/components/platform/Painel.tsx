'use client';

/* As peças do painel, no desenho do design.
 * ─────────────────────────────────────────────────────────────────────────
 * O cartão navy, os quatro números, o cartão de revisão em gold e o gráfico
 * da semana. Todos leem o progresso real - nenhum número aqui é ilustração.
 *
 * O gráfico da semana merece uma nota, porque o dado não é óbvio: o estado
 * guarda `units`, que são blocos de VINTE SEGUNDOS de prática, e não minutos.
 * Contar questões respondidas seria mentir para baixo - a maior parte do que
 * se faz numa lição (traçar, ler em voz alta, ouvir) não é uma alternativa
 * marcada. Então minutos = units / 3, e é o mesmo número que alimenta a meta
 * diária.
 */

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { useProgress } from '@/lib/state/store';
import { getLetter } from '@/lib/content';

/* ── o cartão do curso ──────────────────────────────────────────────────── */
export function CartaoCurso({
  kicker, titulo, sub, pct, href, cta
}: {
  kicker: string; titulo: string; sub: string; pct: number; href: string; cta: string;
}) {
  /* A barra começa em zero e cresce depois de montada: o movimento é o que
     diz "você avançou até aqui". Pintada já no lugar final, ela é só uma
     barra. 260ms é o tempo de a tela assentar antes de ela partir. */
  const [largura, setLargura] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setLargura(pct), 260);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-[var(--navy)] px-6 py-7 sm:px-[30px] sm:pb-[26px] sm:pt-[30px]">
      <span aria-hidden className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(70% 140% at 92% 0%, rgba(143,214,200,.18), transparent 60%)' }} />
      <div className="relative grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <p className="font-ui text-[13px] font-bold uppercase tracking-[.1em] text-[var(--teal-lite)] mb-2.5">
            {kicker}
          </p>
          <p className="font-display text-[22px] sm:text-[25px] font-semibold tracking-[-0.025em] text-white mb-1.5">
            {titulo}
          </p>
          <p className="font-ui text-[15.5px] text-white/[.66] mb-5">{sub}</p>
          <div className="flex items-center gap-3.5 max-w-[420px]">
            <span className="flex-1 h-2 rounded-full bg-white/15 overflow-hidden"
                  role="progressbar" aria-valuenow={Math.round(pct * 100)}
                  aria-valuemin={0} aria-valuemax={100} aria-label="Progresso no curso">
              <span className="block h-full rounded-full transition-[width] duration-[1200ms] ease-[var(--ease-fill)]"
                    style={{ width: `${Math.round(largura * 100)}%`,
                             background: 'linear-gradient(90deg,var(--teal),var(--teal-lite))' }} />
            </span>
            <span className="font-ui text-[15px] font-bold text-white tabular-nums">
              {Math.round(pct * 100)}%
            </span>
          </div>
        </div>
        <Link href={href}
              className="justify-self-start sm:justify-self-end inline-flex items-center justify-center
                         rounded-[13px] bg-white text-[var(--navy)] font-ui font-semibold text-[16.5px]
                         px-[26px] py-[15px] whitespace-nowrap
                         transition-transform duration-[180ms] hover:-translate-y-[2px]">
          {cta}
        </Link>
      </div>
    </div>
  );
}

/* ── os quatro números ──────────────────────────────────────────────────── */
export function CartaoNumero({
  n, rotulo, tom = 'teal', icone
}: { n: ReactNode; rotulo: string; tom?: 'teal' | 'gold' | 'neutro'; icone: ReactNode }) {
  const FUNDO = {
    teal: 'bg-[var(--teal-soft)] text-[var(--teal)]',
    gold: 'bg-[var(--gold-soft)] text-[var(--gold)]',
    neutro: 'bg-[var(--sand)] text-ink-muted'
  } as const;
  return (
    <Card className="p-5">
      <span aria-hidden className={`mb-2.5 w-[30px] h-[30px] rounded-[9px] grid place-items-center ${FUNDO[tom]}`}>
        {icone}
      </span>
      <p className="font-display text-[26px] sm:text-[29px] font-semibold tracking-[-0.03em] leading-none text-ink tabular-nums">
        {n}
      </p>
      <p className="font-ui text-[14px] text-ink-muted mt-1">{rotulo}</p>
    </Card>
  );
}

/* ── revisar ────────────────────────────────────────────────────────────── */
export function CartaoRevisao() {
  const p = useProgress();
  if (p.dueCount === 0) return null;

  const letras = p.weak.map(id => getLetter(id)).filter(l => !!l).slice(0, 5);
  const minutos = Math.max(3, Math.round(p.dueCount * 0.8));

  return (
    <Card tone="ember" className="p-6">
      <p className="flex items-center gap-2.5 mb-3">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M17 7A7.5 7.5 0 1 0 18 10.5" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M17 3.2V7h-3.8" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-display text-[18px] font-semibold tracking-[-0.018em] text-[var(--gold-ink)]">
          Hora de revisar
        </span>
      </p>
      <p className="font-ui text-[15.5px] leading-[1.55] text-[var(--gold-body)] mb-4">
        {p.dueCount === 1
          ? 'Uma letra precisa de uma revisão rápida.'
          : `${p.dueCount} letras precisam de uma revisão rápida.`}{' '}
        Leva cerca de {minutos} minutos.
      </p>
      {letras.length > 0 && (
        <div className="flex flex-wrap gap-[7px] mb-[18px]">
          {letras.map(l => (
            <span key={l!.id} title={l!.namePt}
                  className="w-[38px] h-[38px] rounded-[11px] bg-[var(--card)] grid place-items-center">
              <He size="inline" tone="navy" className="!text-[22px] !leading-none">{l!.letter}</He>
            </span>
          ))}
        </div>
      )}
      <Link href="/revisao"
            className="inline-flex items-center rounded-[12px] bg-[var(--gold)] text-white
                       font-ui font-semibold text-[15.5px] px-[22px] py-3
                       transition-transform duration-[180ms] hover:-translate-y-[2px]">
        Começar revisão
      </Link>
    </Card>
  );
}

/* ── a semana ───────────────────────────────────────────────────────────── */
const DIA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function CartaoSemana() {
  const p = useProgress();

  /* Sete dias terminando hoje. A data é montada em UTC a partir da chave
     YYYY-MM-DD do próprio estado, e não com `new Date()` local: o dia do
     estudo é o que o app gravou, e não o fuso de quem está olhando. */
  const hoje = p.day;
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${hoje}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    const chave = d.toISOString().slice(0, 10);
    return { chave, dow: d.getUTCDay(), units: p.state.days[chave]?.units ?? 0 };
  });

  const total = dias.reduce((n, d) => n + d.units, 0);
  const teto = Math.max(...dias.map(d => d.units), 1);
  const minutos = Math.round(total / 3);
  const h = Math.floor(minutos / 60);

  return (
    <Card className="p-6">
      <p className="font-display text-[18px] font-semibold tracking-[-0.018em] text-ink mb-1">Sua semana</p>
      <p className="font-ui text-[14px] text-ink-muted mb-5">
        {total === 0
          ? 'Nada estudado ainda esta semana.'
          : `${h > 0 ? `${h}h ` : ''}${minutos % 60}min estudados`}
      </p>
      <div className="flex items-end gap-[9px] h-[92px]">
        {dias.map((d, i) => {
          const eHoje = d.chave === hoje;
          const altura = d.units === 0 ? 4 : Math.max(8, Math.round((d.units / teto) * 100));
          return (
            <div key={d.chave} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span
                className="w-full rounded-[7px] transition-[height] duration-700 ease-[var(--ease-fill)]"
                style={{
                  height: `${altura}%`,
                  background: d.units === 0 ? '#EDEAE2' : eHoje ? 'var(--teal)' : 'var(--edge-teal)'
                }}
              />
              <span className={`font-ui text-[12px] ${eHoje ? 'font-bold text-[var(--teal-ink)]' : 'text-ink-muted'}`}>
                {DIA[d.dow] ?? DIA[i]}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* Os ícones dos quatro números. Traço, 16px, herdando a cor do selo. */
export const IconeLetras = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15.5 10 4l6 11.5M6.4 11.6h7.2" stroke="currentColor" />
  </svg>
);
export const IconeLicoes = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10.5 8 14.5 16 5.5" stroke="currentColor" />
  </svg>
);
export const IconeRevisar = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 6.6A6.6 6.6 0 1 0 17 10M16 3v3.6h-3.6" stroke="currentColor" />
  </svg>
);
export const IconeTempo = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="6.8" stroke="currentColor" />
    <path d="M10 6.2V10l2.6 1.8" stroke="currentColor" />
  </svg>
);
