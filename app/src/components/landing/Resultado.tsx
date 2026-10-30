'use client';

/* "O que você passa a ler" (30/10/2026, pedido do dono: a página de venda
 * precisa mostrar resultado).
 * ─────────────────────────────────────────────────────────────────────────
 * Resultado sem nada inventado, em duas partes:
 *   · a chegada de cada módulo: a frase `milestonePt` do próprio curso (a
 *     mesma do mapa e da página do módulo), com a palavra que ela cita em
 *     destaque. No módulo 6 a palavra é o שָׁלוֹם do módulo 3 sem os pontos,
 *     que é exatamente o que aquele módulo ensina;
 *   · três placas de verdade, fotos aprovadas do Hebraico na rua
 *     (content/vitrine-rua.json, montado pelo exportador), cada uma com o
 *     crédito junto e a palavra do curso que está nela.
 */

import { He } from '@/components/hebrew/He';
import { Prose } from '@/components/hebrew/Prose';
import { course } from '@/lib/content-publico';
import { stripNikud } from '@/lib/hebrew';
import vitrine from '@content/vitrine-rua.json';
import { Container, H2, Lead, Rubrica } from './base';
import { tx } from '@/i18n/telas/venda-resultado';

const marca = (t: string): string | null => t.match(/\{\{([^}]+)\}\}/)?.[1] ?? null;

type Placa = { id: string; arquivo: string; palavra: string; mostraPt: string; autor: string;
  licenca: string; licencaUrl: string; pagina: string; largura: number; altura: number };

export function Resultado() {
  if (process.env.NEXT_PUBLIC_LOCALE === 'en') return null;
  const modulos = course.modules.filter(m => m.milestonePt);
  const doTres = marca(modulos.find(m => Number(m.n) === 3)?.milestonePt ?? '');
  const placas = (vitrine as { placas: Placa[] }).placas;

  return (
    <section id="resultado" aria-labelledby="resultado-titulo" className="mt-20 sm:mt-28 bg-[var(--sand)] border-y border-line">
      <Container className="py-20 sm:py-28">
        <Rubrica className="mb-5">{tx.rubrica}</Rubrica>
        <H2 id="resultado-titulo" className="max-w-[22ch] mb-3">{tx.titulo}</H2>
        <Lead className="m-0 mb-10">{tx.lead}</Lead>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 list-none p-0 m-0">
          {modulos.map(m => {
            const n = Number(m.n);
            const palavra = marca(m.milestonePt!);
            const semPontos = !palavra && n === 6 && doTres ? stripNikud(doTres) : null;
            return (
              <li key={m.n} className="grid content-start gap-3 rounded-[18px] bg-[var(--card)] p-5
                                       shadow-[0_0_0_1px_var(--line),0_14px_30px_-26px_rgba(14,59,67,.35)]">
                <span className="font-ui text-[12.5px] font-bold uppercase tracking-[.1em] text-[var(--teal-ink)]">
                  {tx.modulo(n)}
                </span>
                {(palavra || semPontos) && (
                  <span className="grid justify-items-start gap-0.5">
                    <He size="word" tone="navy" className="!leading-[1.25]">{(palavra ?? semPontos)!}</He>
                    {semPontos && <span className="font-ui text-[13px] text-ink-muted">{tx.semPontos}</span>}
                  </span>
                )}
                <p className="font-ui text-[15px] leading-[1.55] text-ink-body m-0 text-pretty">
                  <Prose text={m.milestonePt!} />
                </p>
              </li>
            );
          })}
        </ol>

        {placas.length > 0 && (
          <div className="mt-14 sm:mt-16">
            <h3 className="font-display text-[clamp(22px,2.4vw,28px)] font-semibold tracking-[-0.02em] text-ink m-0 mb-2">
              {tx.naRuaTitulo}
            </h3>
            <p className="font-ui text-[16px] leading-[1.55] text-ink-muted m-0 mb-6 max-w-[56ch]">{tx.naRuaLead}</p>
            <ul className="grid gap-4 sm:grid-cols-3 list-none p-0 m-0">
              {placas.map(p => (
                <li key={p.id}>
                  <figure className="m-0 grid gap-3">
                    <div className="relative aspect-[4/3] rounded-[16px] overflow-hidden bg-[#1F2A2C]
                                    shadow-[0_0_0_1px_var(--line)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/media/rua/${p.arquivo}`} alt={p.mostraPt} width={p.largura} height={p.altura}
                           loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-contain" />
                    </div>
                    <figcaption className="grid gap-1 px-0.5">
                      <span className="flex items-baseline gap-2 font-ui text-[15px] text-ink">
                        {tx.naPlaca} <He size="lg" tone="navy">{p.palavra}</He>
                      </span>
                      <span className="font-ui text-[14px] leading-[1.45] text-ink-body">{p.mostraPt}</span>
                      {/* O crédito sempre junto da foto (licença Creative Commons). */}
                      <span className="font-ui text-[12.5px] leading-[1.45] text-ink-muted">
                        {tx.foto}{' '}
                        {/[\u0590-\u05FF]/.test(p.autor) ? <He size="inline">{p.autor}</He> : p.autor} ·{' '}
                        <a href={p.licencaUrl} target="_blank" rel="noopener noreferrer license" className="underline underline-offset-2">{p.licenca}</a> ·{' '}
                        <a href={p.pagina} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{tx.origem}</a>
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </section>
  );
}
