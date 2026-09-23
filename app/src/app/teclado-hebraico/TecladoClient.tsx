'use client';

/* O guia do teclado hebraico, como página de consulta.
 * O mesmo componente aparece dentro da academia, como etapa antes do primeiro
 * exercício de digitação; aqui ele fica à mão para quem troca de aparelho. */

import Link from 'next/link';
import { GuiaTeclado } from '@/components/learn/GuiaTeclado';
import { useProgress } from '@/lib/state/store';
import { track } from '@/lib/analytics';

export function TecladoClient() {
  const p = useProgress();
  const confirmado = !!p.state.firsts['teclado-hebraico'];
  return (
    <div className="focus-col grid gap-6 py-2">
      <header className="grid gap-2">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">Ferramentas</p>
        <h1 className="text-[28px] font-bold m-0 text-balance">O teclado hebraico no seu aparelho</h1>
        <p className="font-ui text-[16px] leading-relaxed text-ink-body m-0">
          Ele só é necessário para os exercícios de digitação da academia. Todo o
          resto do curso se faz tocando.
        </p>
      </header>
      <GuiaTeclado
        confirmado={confirmado}
        onConfirmar={confirmado ? undefined : () => {
          p.markFirst('teclado-hebraico');
          track('keyboard_confirmed', {});
        }}
      />
      {confirmado && (
        <p className="font-ui text-[15px] text-[var(--mint-ink)] m-0">
          ✓ Você já confirmou o teclado.{' '}
          <Link href="/academia" className="underline">Ir para a digitação, na academia</Link>.
        </p>
      )}
    </div>
  );
}
