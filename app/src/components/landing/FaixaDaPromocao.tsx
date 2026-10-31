/* A promoção do pré-lançamento, dita de uma vez (31/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * Logo abaixo do hero: o preço no cartão, o preço no PIX, até quando vale, o
 * que vem depois e os dias para desistir. Tudo sai do catálogo
 * (data/courses.json: `brl`, `pixDiscountPct`, `listBrl`, `preLancamentoAte`)
 * e de data/empresa.json, os mesmos que o checkout cobra.
 *
 * A data é de verdade: no dia seguinte, a Action "Virar o preço" sobe o
 * preço para o `listBrl` sozinha (virar-preco.yml, agendada), e esta faixa
 * some com ele, porque sem `listBrl` não há pré-lançamento. Data sem subida
 * seria escassez falsa (CDC art. 37).
 *
 * Os dias para desistir são o direito de arrependimento (CDC art. 49), dito
 * como ele é: nunca "garantia".
 */

import { ancora, brl, fimDoPreLancamento, flagship, parcelasMax, pixPrice } from '@/lib/catalog';
import { empresa, parcelasCurto, soPix, temCartao, temPix } from '@/lib/empresa';
import { Container } from './base';
import { tx } from '@/i18n/telas/venda-promocao';

export function FaixaDaPromocao() {
  if (process.env.NEXT_PUBLIC_LOCALE === 'en') return null;
  const c = flagship();
  const cheio = ancora(c.price);
  const ate = fimDoPreLancamento(c.price);
  if (!cheio || !ate) return null;
  const curta = ate.slice(0, 5);
  const cartao = temCartao() && !soPix();
  const pix = temPix() && c.price.pixDiscountPct > 0;
  const dias = empresa.politicas.arrependimentoDias;

  return (
    <section aria-label={tx.rotulo(curta)} id="promocao">
      <Container className="pt-10 sm:pt-14">
        <div className="relative overflow-hidden rounded-[22px] bg-[var(--navy)] text-white
                        shadow-[0_24px_48px_-28px_rgba(14,59,67,.55)]
                        px-5 py-6 sm:px-9 sm:py-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="grid gap-3 min-w-0">
            <p className="m-0 justify-self-start inline-flex items-center gap-2 rounded-full bg-[var(--gold-soft)]
                          px-3.5 py-1.5 font-ui text-[12.5px] font-bold uppercase tracking-[.1em] text-[var(--gold-ink)]">
              <span aria-hidden>★</span>{tx.rotulo(curta)}
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-x-5 gap-y-1.5">
              {cartao && (
                <p className="m-0 grid">
                  <span className="font-display text-[44px] sm:text-[52px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-white">
                    {brl(c.price.brl)}
                  </span>
                  <span className="font-ui text-[14.5px] text-white/80 mt-1.5">
                    {tx.noCartao(parcelasCurto(parcelasMax(c.price)))}
                  </span>
                </p>
              )}
              {cartao && pix && (
                <span className="font-ui text-[15px] font-semibold text-white/70 sm:pb-7">{tx.ou}</span>
              )}
              {pix && (
                <p className="m-0 grid">
                  <span className="font-display text-[44px] sm:text-[52px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-[#9FE3D6]">
                    {brl(pixPrice(c.price))}
                  </span>
                  <span className="font-ui text-[14.5px] text-white/80 mt-1.5">
                    {tx.noPix(c.price.pixDiscountPct)}
                  </span>
                </p>
              )}
            </div>
            <p className="m-0 font-ui text-[15px] leading-[1.5] text-white/85">
              {tx.depois(curta, brl(cheio))}{' '}
              <a href="#preco" className="font-semibold text-white underline underline-offset-4 whitespace-nowrap">
                {tx.verPreco} ↓
              </a>
            </p>
          </div>

          <SeloDosDias dias={dias} />
        </div>
      </Container>
    </section>
  );
}

/* O selo redondo dos dias para desistir. O mesmo desenho do selo da caixa
   de preço (Fecho.tsx), maior. */
export function SeloDosDias({ dias, claro = false }: { dias: number; claro?: boolean }) {
  return (
    <div className={`flex items-center gap-3.5 rounded-[18px] px-4 py-3.5 justify-self-start
                     ${claro ? 'bg-[var(--card)] shadow-[0_0_0_1px_var(--line)]' : 'bg-white/10'}`}>
      <span aria-hidden className="relative grid place-items-center w-[64px] h-[64px] shrink-0">
        <svg viewBox="0 0 64 64" width="64" height="64" className="absolute inset-0">
          <circle cx="32" cy="32" r="29" fill={claro ? 'var(--teal-soft)' : '#E6F4F1'}
                  stroke="var(--teal)" strokeWidth="2.5" strokeDasharray="4 3" />
          <circle cx="32" cy="32" r="23" fill="none" stroke="var(--teal)" strokeWidth="1.4" />
        </svg>
        <span className="relative grid justify-items-center leading-none">
          <span className="font-display text-[24px] font-bold text-[var(--teal-ink)] tabular-nums">{dias}</span>
          <span className="font-ui text-[9.5px] font-bold uppercase tracking-[.08em] text-[var(--teal-ink)]">{tx.dias}</span>
        </span>
      </span>
      <span className="grid leading-[1.3]">
        <strong className={`font-ui text-[16px] font-bold ${claro ? 'text-ink' : 'text-white'}`}>{tx.selo(dias)}</strong>
        <span className={`font-ui text-[13.5px] ${claro ? 'text-ink-body' : 'text-white/80'}`}>{tx.seloLinha}</span>
      </span>
    </div>
  );
}
