'use client';

/* A coleção de letras (28/10/2026, a aventura ilustrada).
 * ─────────────────────────────────────────────────────────────────────────
 * Cada letra concluída vira uma carta: o lugar do módulo dela no alto, a
 * letra impressa e a cursiva, o nome, o som em português e o estado. A
 * coleção é o alfabeto que o aluno montou, e ela só lê o que já existe no
 * progresso (`isLessonComplete`, `isLessonMastered`): não há campo novo no
 * estado, nem moeda, nem sorteio.
 *
 *   dominada  · a fixação passou da nota de domínio (o selo dourado)
 *   concluida · as cinco etapas feitas, ainda abaixo do domínio
 *   adiante   · a carta existe, mas ainda não foi ganha
 *
 * A carta trancada mostra a letra apagada: o alfabeto não é segredo (a
 * grade do painel mostra as 22), e esconder a forma só tiraria do aluno a
 * chance de reconhecer o que vem.
 */

import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { somPt } from '@/lib/som-pt';
import type { Letter } from '@/lib/content';
import { Cenario, type IdDoCenario } from '@/components/aventura/Cenarios';
import { Yael } from '@/components/aventura/Yael';
import { tx } from '@/i18n/telas/academia-aventura';

export type EstadoDaCarta = 'dominada' | 'concluida' | 'adiante';

const ROTULO: Record<EstadoDaCarta, string> = {
  dominada: tx.rotuloDominada, concluida: tx.rotuloConcluida, adiante: tx.rotuloAdiante
};

export function CartaDaLetra({ letter, estado, grande = false, href }: {
  letter: Letter; estado: EstadoDaCarta; grande?: boolean; href?: string;
}) {
  const ganha = estado !== 'adiante';
  const n = Math.min(7, Math.max(1, letter.module)) as IdDoCenario;
  const corpo = (
    <>
      <span aria-hidden className={`block ${grande ? 'h-[70px]' : 'h-[44px]'} overflow-hidden border-b border-line`}>
        <Cenario n={n} trancado={!ganha} vivo={grande} />
      </span>
      <span className={`grid justify-items-center gap-0.5 ${grande ? 'px-4 pt-3 pb-4' : 'px-2 pt-1.5 pb-2.5'}`}>
        <span className="flex items-baseline gap-2">
          <He size={grande ? 'display' : 'word'} dim={!ganha}>{letter.letraComPonto ?? letter.letter}</He>
          <He size={grande ? 'lg' : 'inline'} cursive dim>{letter.letter}</He>
        </span>
        <span className={`font-display font-semibold text-ink ${grande ? 'text-[20px]' : 'text-[13.5px]'}`}>
          {letter.namePt}
        </span>
        <span title={somPt(letter.sound)}
              className={`font-ui text-ink-muted ${grande ? 'text-[14px]' : 'text-[11.5px] line-clamp-2'} leading-tight text-center`}>
          {somPt(letter.sound)}
        </span>
        <span className={`mt-1 rounded-full px-2 py-0.5 font-ui font-semibold
                          ${grande ? 'text-[12.5px]' : 'text-[10.5px]'}
                          ${estado === 'dominada' ? 'bg-[var(--gold-solid)] text-white'
                            : estado === 'concluida' ? 'bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                            : 'bg-[var(--sand)] text-ink-muted'}`}>
          {ROTULO[estado]}
        </span>
      </span>
    </>
  );
  const classe = `relative grid overflow-hidden rounded-[16px] border bg-[var(--card)] text-left
                  ${ganha ? 'border-line shadow-[var(--sh)]' : 'border-dashed border-line'}
                  ${estado === 'dominada' ? 'ring-2 ring-[var(--gold)] ring-offset-0' : ''}`;
  const rotulo = tx.cartaAria(letter.namePt, ROTULO[estado]);
  return href && ganha
    ? <Link href={href} aria-label={tx.abrirLicao(rotulo)}
            className={`${classe} transition-[transform,box-shadow] duration-[var(--dur)] hover:-translate-y-[2px] active:scale-[.97]`}>{corpo}</Link>
    : <div role="img" aria-label={rotulo} className={classe}>{corpo}</div>;
}

/* As faíscas do fim da lição: posições fixas, para não pular entre renders. */
const FAISCAS = [
  { x: '10%', y: '16%', d: '0ms' }, { x: '88%', y: '14%', d: '140ms' },
  { x: '6%', y: '70%', d: '260ms' }, { x: '92%', y: '64%', d: '80ms' },
  { x: '30%', y: '6%', d: '200ms' }, { x: '70%', y: '8%', d: '320ms' }
];

/**
 * O fim da lição, quando a nota passou: a carta da letra entra na coleção.
 * Fica ACIMA do resultado de sempre (a nota, os botões, o "em seguida"), que
 * não muda.
 */
export function CelebracaoDaLetra({ letter }: { letter: Letter }) {
  return (
    <section aria-labelledby="carta-nova"
             className="relative overflow-hidden rounded-[var(--r-lg)] bg-[var(--accent-bg)] text-white
                        px-6 py-7 sm:px-10 sm:py-9 grid gap-4 justify-items-center text-center shadow-[var(--sh)]">
      {FAISCAS.map(f => (
        <span key={f.x + f.y} aria-hidden className="animate-spark absolute w-3 h-3 rounded-[2px] bg-[var(--gold)]"
              style={{ left: f.x, top: f.y, animationDelay: f.d }} />
      ))}
      <p className="m-0 font-ui text-[12.5px] font-bold uppercase tracking-[.12em] text-[var(--teal-lite)]">
        {tx.letraConquistada}
      </p>
      <div className="relative w-[180px] animate-pop text-ink">
        <CartaDaLetra letter={letter} estado="concluida" grande />
        {/* A Yael comemora a carta nova, encostada no canto. */}
        <Yael humor="comemora" className="absolute -right-12 -bottom-3 w-[72px]" />
      </div>
      <h2 id="carta-nova" className="m-0 text-white text-[22px] sm:text-[26px] font-bold leading-tight">
        {tx.entrouNaColecao(letter.namePt)}
      </h2>
      {/* No Áyin, o aluno passa a ler o nome da Yael, a companheira da
          aventura: יָעֵל tem י, ע e ל, e o ע é o que faltava (28/10/2026). */}
      {letter.id === 'ayin' && (
        <div className="flex items-center gap-3 rounded-[var(--r-md)] bg-white/10 px-4 py-3 text-left">
          <Yael humor="feliz" className="w-[64px] shrink-0" />
          <p className="m-0 font-ui text-[15px] leading-snug text-white">
            {tx.leNomeYael(<span className="text-[22px]"><He size="inline" tone="lite">יָעֵל</He></span>)}
            <span className="block text-[13px] text-white/85">{tx.yaelLegenda}</span>
          </p>
        </div>
      )}
      <Link href="/conquistas#colecao"
            className="min-h-[44px] inline-flex items-center px-3 font-ui text-[14.5px] font-semibold
                       text-white underline underline-offset-4">
        {tx.verColecao}
      </Link>
    </section>
  );
}
