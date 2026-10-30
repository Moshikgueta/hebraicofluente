import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { partes } from '@/lib/alfabeto-publico';
import type { Bloco } from '@/lib/blog';
import { tx } from '@/i18n/telas/blog';

/* O corpo de um artigo do blog (data/blog.json). Todo hebraico passa pelo
   <He>, a única porta do hebraico no site. Componente de servidor. */

export function Texto({ t }: { t: string }) {
  return <>{partes(t).map((p, i) => (p.he ? <He key={i}>{p.t}</He> : <span key={i}>{p.t}</span>))}</>;
}

export function BlocosDoArtigo({ blocos }: { blocos: Bloco[] }) {
  return (
    <div className="grid gap-5 max-w-[66ch]">
      {blocos.map((b, i) => {
        switch (b.t) {
          case 'h2':
            return (
              <h2 key={i} className="font-display text-[clamp(23px,2.6vw,28px)] font-semibold leading-[1.2]
                                     tracking-[-0.02em] text-ink m-0 mt-5 text-balance">
                <Texto t={b.x} />
              </h2>
            );
          case 'p':
            return (
              <p key={i} className="font-ui text-[17px] sm:text-[18px] leading-[1.7] text-ink-body m-0 text-pretty">
                <Texto t={b.x} />
              </p>
            );
          case 'lista':
            return (
              <ul key={i} className="grid gap-2.5 m-0 pl-5 list-disc marker:text-[var(--teal)]">
                {b.itens.map((it, k) => (
                  <li key={k} className="font-ui text-[17px] sm:text-[18px] leading-[1.6] text-ink-body pl-1">
                    <Texto t={it} />
                  </li>
                ))}
              </ul>
            );
          case 'palavras':
            return (
              <ul key={i} className="grid gap-2.5 sm:grid-cols-2 list-none p-0 m-0">
                {b.itens.map(w => (
                  <li key={w.he} className="flex items-center justify-between gap-4 rounded-[14px] bg-[var(--card)] px-4 py-3
                                            shadow-[0_0_0_1px_var(--line)]">
                    <span className="grid gap-0.5 min-w-0">
                      <span className="font-ui text-[16px] font-semibold text-ink">{w.translit}</span>
                      <span className="font-ui text-[14.5px] text-ink-muted">{w.pt}</span>
                    </span>
                    <He size="lg" tone="navy">{w.he}</He>
                  </li>
                ))}
              </ul>
            );
          case 'veja':
            return (
              <p key={i} className="m-0">
                <Link href={b.href}
                      className="group inline-flex items-center gap-2 font-ui text-[16.5px] font-semibold text-[var(--teal-ink)]
                                 underline underline-offset-[3px] decoration-[1.5px]">
                  {b.x}
                  <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-[3px]">→</span>
                </Link>
              </p>
            );
          case 'cta':
            return (
              <div key={i} className="mt-4 rounded-[18px] bg-[var(--sand)] p-5 sm:p-6 grid gap-2 shadow-[0_0_0_1px_var(--line)]">
                <p className="font-display text-[20px] font-semibold tracking-[-0.015em] text-ink m-0">{tx.testeTitulo}</p>
                <p className="font-ui text-[15.5px] leading-[1.55] text-ink-body m-0">{tx.testeLinha}</p>
                <p className="m-0 mt-2">
                  <Link href="/#experimente"
                        className="inline-flex items-center gap-2 rounded-[12px] min-h-[48px] px-5 bg-[var(--accent-bg)] text-white
                                   font-ui font-semibold text-[16px] transition-[background-color,transform] duration-150
                                   hover:bg-[var(--navy-2)] active:scale-[.98]">
                    {tx.testeBotao}
                    <span aria-hidden>→</span>
                  </Link>
                </p>
              </div>
            );
        }
      })}
    </div>
  );
}
