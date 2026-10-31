'use client';

/* A galeria das aberturas de capítulo do Israel Além do Óbvio.
 * ─────────────────────────────────────────────────────────────────────────
 * Usada em dois lugares: a página de venda (LivroClient, desligada enquanto
 * o livro tem `aVenda: false`) e a página "Em breve" (/israel-alem-do-obvio,
 * pedido do dono de 23/10/2026). Só ilustração: sem preço nem compra.
 *
 * As imagens são do próprio livro e nascem na publicação
 * (scripts/vitrine-do-livro.mjs), em /vitrine-livro/, fora do git: o livro
 * mora no repositório privado. Os títulos dos capítulos vêm do catálogo.
 *
 * Movimento: galeria-do-livro.css, só CSS, parado com "reduzir movimento".
 */

import './galeria-do-livro.css';
import { useRef } from 'react';
import { Container } from '@/components/landing/base';
import type { CatalogCourse } from '@/lib/catalog';

export const V = '/vitrine-livro';

/* As aberturas de capítulo, com o texto alternativo que o próprio livro dá a
   cada uma (o aria-label do SVG) e o capítulo de onde vêm. */
export const GALERIA = [
  { arquivo: 'abertura-israel-no-mapa', cap: 1, alt: 'A paisagem de oeste a leste, do mar à praia, à planície, às montanhas e à descida até um lago no fundo de um vale, com aves migrando no céu.' },
  { arquivo: 'abertura-jerusalem', cap: 3, alt: 'A muralha da Cidade Antiga, com ameias e um portão em arco, e atrás dela casas, uma torre e uma cúpula dourada.' },
  { arquivo: 'abertura-alem-de-jerusalem', cap: 4, alt: 'Um platô de topo reto no deserto, um lago azul lá embaixo, o sol e duas tamareiras.' },
  { arquivo: 'abertura-vida-real', cap: 5, alt: 'Uma rua no fim da tarde, com o sol baixo, janelas acesas, portas de loja baixando e um ponto de ônibus vazio.' },
  { arquivo: 'abertura-sabores', cap: 6, alt: 'Uma mesa vista de cima, com um prato grande de homus no centro, um pratinho de falafel, pitas empilhadas, salada, berinjela e um copo de água.' },
  { arquivo: 'abertura-pratica', cap: 8, alt: 'Uma mala, um passaporte e uma passagem.' },
  { arquivo: 'abertura-diario', cap: 11, alt: 'Um caderno aberto com linhas e pequenos desenhos de uma cúpula e de ondas, e um lápis.' }
] as const;

export function GaleriaDoLivro({ c }: { c: CatalogCourse }) {
  const trilho = useRef<HTMLUListElement>(null);
  const andar = (dir: 1 | -1) => {
    const t = trilho.current;
    if (!t) return;
    const passo = (t.querySelector('li') as HTMLElement | null)?.offsetWidth ?? 320;
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    t.scrollBy({ left: dir * (passo + 16), behavior: suave ? 'smooth' : 'auto' });
  };
  const capitulo = (n: number) => c.modules.find(m => m.n === n);
  const seta = `grid place-items-center w-11 h-11 rounded-full border border-line bg-[var(--card)] text-ink
                font-ui text-[18px] hover:border-[#C9C3B4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--teal)]`;
  return (
    <section aria-labelledby="galeria-titulo" className="bg-[var(--gold-soft)] overflow-hidden">
      <Container className="py-16 sm:py-24 grid gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-3 max-w-[30ch]">
            <p className="m-0 font-ui text-[12.5px] font-semibold uppercase tracking-[.16em] text-[var(--gold-ink)]">Ilustrações do livro</p>
            <h2 id="galeria-titulo" className="m-0 font-display font-semibold text-[clamp(28px,4vw,44px)] leading-[1.06] tracking-[-0.03em] text-ink text-balance">
              Uma pequena amostra do Israel que você vai descobrir.
            </h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <button type="button" className={seta} onClick={() => andar(-1)} aria-label="Ilustração anterior">←</button>
            <button type="button" className={seta} onClick={() => andar(1)} aria-label="Próxima ilustração">→</button>
          </div>
        </div>
        <ul ref={trilho} tabIndex={0} aria-label="Galeria de ilustrações, role para o lado"
            className="lv-galeria flex gap-4 overflow-x-auto list-none p-0 m-0 -mx-4 px-4 sm:-mx-6 sm:px-6 scroll-px-4 sm:scroll-px-6 pb-2
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--teal)]">
          {GALERIA.map(g => {
            const m = capitulo(g.cap);
            return (
              <li key={g.arquivo} className="shrink-0 w-[82%] sm:w-[46%] lg:w-[31%]">
                <figure className="lv-folha m-0 grid gap-3">
                  <div className="rounded-[18px] overflow-hidden bg-[var(--navy)] shadow-[0_24px_50px_-30px_rgba(6,42,48,.6)]">
                    <img src={`${V}/${g.arquivo}.svg`} width={1480} height={1300} loading="lazy" decoding="async" alt={g.alt}
                         className="block w-full h-auto" />
                  </div>
                  <figcaption className="grid gap-0.5 px-1">
                    <span className="font-ui text-[12px] font-semibold uppercase tracking-[.14em] text-[var(--gold-ink)]">Capítulo {g.cap}</span>
                    <span className="font-display text-[18px] font-semibold text-ink">{m?.titlePt}</span>
                    {m?.subPt && <span className="font-ui text-[14px] text-ink-muted">{m.subPt}</span>}
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
