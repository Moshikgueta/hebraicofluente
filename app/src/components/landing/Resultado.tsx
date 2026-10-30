'use client';

/* "O que você passa a ler" (30/10/2026, pedido do dono: a página de venda
 * precisa mostrar resultado).
 * ─────────────────────────────────────────────────────────────────────────
 * Resultado sem nada inventado: três placas de verdade, fotos aprovadas do
 *     Hebraico na rua
 *     (content/vitrine-rua.json, montado pelo exportador), cada uma com o
 *     crédito junto e a palavra do curso que está nela. Fica logo depois do
 *     currículo, que mostra a chegada de cada módulo (Curriculo, Secoes.tsx).
 */

import { He } from '@/components/hebrew/He';
import vitrine from '@content/vitrine-rua.json';
import { Container, H2, Lead, Rubrica } from './base';
import { tx } from '@/i18n/telas/venda-resultado';

type Placa = { id: string; arquivo: string; palavra: string; mostraPt: string; autor: string;
  licenca: string; licencaUrl: string; pagina: string; largura: number; altura: number };

export function Resultado() {
  if (process.env.NEXT_PUBLIC_LOCALE === 'en') return null;
  const placas = (vitrine as { placas: Placa[] }).placas;
  if (!placas.length) return null;

  return (
    <section id="resultado" aria-labelledby="resultado-titulo" className="mt-20 sm:mt-28 bg-[var(--sand)] border-y border-line">
      <Container className="py-16 sm:py-24">
        <Rubrica className="mb-5">{tx.rubrica}</Rubrica>
        <H2 id="resultado-titulo" className="max-w-[22ch] mb-3">{tx.naRuaTitulo}</H2>
        <Lead className="m-0 mb-8">{tx.naRuaLead}</Lead>
        {/* No celular, uma fileira que se arrasta com o dedo (como a galeria de telas):
            empilhadas, as três fotos ocupavam três telas. */}
        <ul className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory
                       list-none py-0 m-0 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-px-4 pb-3 sm:pb-0 [scrollbar-width:thin]">
          {placas.map(p => (
            <li key={p.id} className="snap-start shrink-0 w-[82%] sm:w-auto">
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
      </Container>
    </section>
  );
}
