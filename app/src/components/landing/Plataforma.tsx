'use client';

/* Por dentro da plataforma (29/10/2026, pedido do dono: "a galeria de telas,
 * com foco na parte visual e nos exercícios diferentes; destaca também a
 * Yael").
 * ─────────────────────────────────────────────────────────────────────────
 * Duas peças:
 *   · a Yael de verdade (o mesmo desenho do curso, components/aventura), com
 *     o balão de apresentação e as três caras que ela faz nas lições;
 *   · uma fileira de celulares com telas REAIS da plataforma, capturadas da
 *     lição do Lámed a 390 px (public/media/plataforma/), cada uma com o
 *     nome do exercício. Rola de lado com o dedo (scroll-snap) e, no
 *     computador, pelos dois botões.
 *
 * As capturas são do site em português: no site em inglês (LOCALE=en) a
 * seção não aparece até existirem as telas em inglês.
 */

import { useEffect, useRef, useState } from 'react';
import { Yael, YaelDiz, type HumorDaYael } from '@/components/aventura/Yael';
import { Container, H2, Lead, Rubrica } from './base';
import { tx } from '@/i18n/telas/venda-plataforma';

const TELAS = [
  { img: 'conhecer', t: tx.conhecerT, d: tx.conhecerD, alt: tx.conhecerAlt },
  { img: 'escrever', t: tx.escreverT, d: tx.escreverD, alt: tx.escreverAlt },
  { img: 'ligue', t: tx.ligueT, d: tx.ligueD, alt: tx.ligueAlt },
  { img: 'monte', t: tx.monteT, d: tx.monteD, alt: tx.monteAlt },
  { img: 'mao', t: tx.maoT, d: tx.maoD, alt: tx.maoAlt },
  { img: 'frase', t: tx.fraseT, d: tx.fraseD, alt: tx.fraseAlt },
  { img: 'correcao', t: tx.correcaoT, d: tx.correcaoD, alt: tx.correcaoAlt },
  { img: 'mapa', t: tx.mapaT, d: tx.mapaD, alt: tx.mapaAlt }
] as const;

const HUMORES: readonly { h: HumorDaYael; rotulo: string }[] = [
  { h: 'feliz', rotulo: tx.humorFeliz },
  { h: 'quase', rotulo: tx.humorQuase },
  { h: 'comemora', rotulo: tx.humorComemora }
];

export function Plataforma() {
  if (process.env.NEXT_PUBLIC_LOCALE === 'en') return null;
  return (
    <section id="plataforma" aria-labelledby="plataforma-titulo" className="overflow-hidden">
      <Container className="pt-20 sm:pt-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end lg:gap-16">
          <div>
            <Rubrica className="mb-5">{tx.rubrica}</Rubrica>
            <H2 id="plataforma-titulo" className="max-w-[20ch] mb-3">{tx.titulo}</H2>
            <Lead className="m-0">{tx.lead}</Lead>
          </div>
          <CartaoDaYael />
        </div>
        <Galeria />
      </Container>
    </section>
  );
}

/* A Yael, viva: o balão de apresentação e as três reações das lições. */
function CartaoDaYael() {
  return (
    <div className="rounded-[20px] bg-[var(--sand)] p-5 sm:p-6
                    shadow-[0_0_0_1px_var(--line),0_20px_40px_-28px_rgba(14,59,67,.35)]">
      <YaelDiz humor="parada" tamanho={84}>{tx.yaelBalao}</YaelDiz>
      <p className="font-display text-[19px] font-semibold tracking-[-0.015em] text-ink m-0 mt-4 mb-1.5">{tx.yaelTitulo}</p>
      <p className="font-ui text-[15px] leading-[1.55] text-ink-body m-0 mb-4 text-pretty">{tx.yaelTexto}</p>
      <ul className="grid grid-cols-3 gap-2 list-none p-0 m-0">
        {HUMORES.map(({ h, rotulo }) => (
          <li key={h} className="grid justify-items-center gap-1 rounded-[14px] bg-[var(--card)] px-2 pt-2 pb-2.5
                                 shadow-[0_0_0_1px_var(--line)]">
            <Yael humor={h} className="w-[56px]" />
            <span className="font-ui text-[12.5px] font-semibold text-ink-muted text-center leading-tight">{rotulo}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* A fileira de celulares. O dedo rola de lado (scroll-snap); os botões
   andam uma tela por vez e se apagam nas pontas. */
function Galeria() {
  const trilho = useRef<HTMLUListElement>(null);
  const [pontas, setPontas] = useState({ inicio: true, fim: false });

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const medir = () => setPontas({
      inicio: el.scrollLeft <= 4,
      fim: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    });
    medir();
    el.addEventListener('scroll', medir, { passive: true });
    window.addEventListener('resize', medir);
    return () => { el.removeEventListener('scroll', medir); window.removeEventListener('resize', medir); };
  }, []);

  function andar(sentido: 1 | -1) {
    const el = trilho.current;
    const item = el?.querySelector('li');
    if (!el || !item) return;
    const passo = item.getBoundingClientRect().width + 20;
    const reduz = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: sentido * passo, behavior: reduz ? 'auto' : 'smooth' });
  }

  return (
    <div className="mt-10 sm:mt-12">
      <ul ref={trilho} aria-label={tx.telas}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory list-none py-0 m-0 scroll-px-4 sm:scroll-px-6
                     -mx-4 px-4 sm:-mx-6 sm:px-6 pb-4 [scrollbar-width:thin]">
        {TELAS.map(s => (
          <li key={s.img} className="snap-start shrink-0 w-[62%] min-[480px]:w-[42%] sm:w-[31%] lg:w-[calc((100%-60px)/4)]">
            <figure className="m-0">
              <div className="rounded-[26px] p-[6px] bg-[var(--navy)]
                              shadow-[0_0_0_1px_rgba(255,255,255,.06)_inset,0_24px_44px_-22px_rgba(6,42,48,.55)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/media/plataforma/${s.img}.webp`} alt={s.alt} width={540} height={1169}
                     loading="lazy" decoding="async" className="block w-full h-auto rounded-[20px]" />
              </div>
              <figcaption className="mt-3.5 px-1">
                <span className="block font-ui text-[15.5px] font-semibold text-ink">{s.t}</span>
                <span className="block font-ui text-[14px] leading-[1.45] text-ink-muted mt-0.5 text-pretty">{s.d}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end gap-2.5">
        <BotaoSeta rotulo={tx.anterior} desligado={pontas.inicio} onClick={() => andar(-1)} sentido="esq" />
        <BotaoSeta rotulo={tx.proxima} desligado={pontas.fim} onClick={() => andar(1)} sentido="dir" />
      </div>
    </div>
  );
}

function BotaoSeta({ rotulo, desligado, onClick, sentido }: {
  rotulo: string; desligado: boolean; onClick: () => void; sentido: 'esq' | 'dir';
}) {
  return (
    <button type="button" aria-label={rotulo} disabled={desligado} onClick={onClick}
            className="grid place-items-center w-12 h-12 rounded-full bg-[var(--card)] text-ink
                       shadow-[0_0_0_1px_var(--line),0_1px_2px_rgba(27,33,31,.06)]
                       transition-[opacity,transform] duration-150 ease-out active:scale-[.96]
                       disabled:opacity-35 disabled:cursor-default">
      <svg aria-hidden viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {sentido === 'esq' ? <path d="M12.5 4.5 7 10l5.5 5.5" /> : <path d="M7.5 4.5 13 10l-5.5 5.5" />}
      </svg>
    </button>
  );
}
