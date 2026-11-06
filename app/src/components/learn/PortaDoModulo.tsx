'use client';

/* O que falta para abrir o módulo seguinte (03/11/2026, decisão do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * A porta entre módulos (lib/state/rules.ts, `PortaDeModulo`) pede a revisão
 * do módulo e as leituras dele. Aqui ela vira uma lista com o que já foi
 * feito e um link para cada coisa que falta, na ordem em que se faz: a
 * revisão (que pode abrir só amanhã), a Primeira Leitura, o texto. */

import Link from 'next/link';
import { tx } from '@/i18n/telas/revisao-entre-modulos';
import { textoDoModulo } from '@/lib/content';
import type { porQueTrancada } from '@/lib/state/rules';

type Porque = NonNullable<ReturnType<typeof porQueTrancada>>;

export type PassoDaPorta = { nome: string; href: string; feito: boolean };

/** Os passos da porta, com nome e destino. Também usado pelo painel. */
export function passosDaPorta(porque: Porque): PassoDaPorta[] {
  const n = porque.modulo!;
  const faltaLer = new Set((porque.faltaLer ?? []).map(l => l.tipo));
  const texto = textoDoModulo(n);
  const passos: PassoDaPorta[] = [
    { nome: tx.passoRevisao(n), href: `/checkpoint/${n}`, feito: !porque.faltaCheckpoint },
    { nome: tx.passoPrimeira, href: `/leitura?primeira=${n}`, feito: !faltaLer.has('primeira') }
  ];
  if (texto) passos.push({ nome: tx.passoTexto(texto.tituloPt), href: `/modulo/${n}/texto`, feito: !faltaLer.has('texto') });
  return passos;
}

export function PortaDoModulo({ porque }: { porque: Porque }) {
  const n = porque.modulo!;
  return (
    <div className="grid gap-3 text-left w-full max-w-[420px] mx-auto">
      <p className="text-[16px] leading-relaxed text-ink-body text-center">{tx.porque(n, n + 1)}</p>
      <ul className="grid gap-2">
        {passosDaPorta(porque).map(p => (
          <li key={p.href} className="flex items-center gap-3 min-h-[44px] rounded-[var(--r-md)] border border-line px-3">
            <span aria-hidden className={p.feito ? 'text-[var(--green)]' : 'text-ink-muted'}>{p.feito ? '✓' : '○'}</span>
            <span className="sr-only">{p.feito ? tx.feito : tx.faltaFazer}: </span>
            {p.feito
              ? <span className="font-ui text-[14.5px] text-ink-muted">{p.nome}</span>
              : <Link href={p.href} className="font-ui text-[14.5px] font-semibold text-[var(--accent)] hover:underline">{p.nome}</Link>}
            {!p.feito && p.href.startsWith('/checkpoint') && porque.abreEm && (
              <span className="ml-auto font-ui text-[12.5px] text-ink-muted">{tx.abreAmanha}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
