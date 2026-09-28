'use client';

/* Hoje e depois - a transformação, em quatro segundos.
 * ─────────────────────────────────────────────────────────────────────────
 * É a segunda coisa que a página mostra, e existe para resolver a objeção
 * que nenhuma lista de recursos resolve: "isso parece difícil demais para
 * mim". Argumentar contra isso em texto não funciona - quem está olhando
 * caracteres que não reconhece não acredita numa frase dizendo que é fácil.
 *
 * Então a seção não argumenta: ela DEMONSTRA, na ordem em que a coisa
 * acontece de verdade dentro do curso.
 *
 *   ש        uma forma sem significado
 *   שָׁ        a mesma forma com o sinal de vogal - já se lê "sha"
 *   שָׁלוֹם     a palavra inteira
 *   shalóm   como se diz
 *   olá      o que quer dizer
 *
 * Quatro passos, um por vez, encadeados. O leitor acompanha a própria
 * mudança de percepção em segundos - e o que ele sente não é "eles dizem que
 * é fácil", é "eu acabei de entender uma coisa".
 *
 * ── três decisões ────────────────────────────────────────────────────────
 *
 * 1. A palavra é שָׁלוֹם e não uma qualquer: é a única palavra hebraica que um
 *    brasileiro já ouviu. O reconhecimento chega antes da leitura, e é ele
 *    que torna o resto crível.
 *
 * 2. A animação dispara quando a seção ENTRA NA TELA, não no carregamento.
 *    Uma sequência que já terminou antes de a pessoa rolar até ali não
 *    aconteceu para ela.
 *
 * 3. Com `prefers-reduced-motion`, tudo aparece de uma vez, completo. O
 *    estado final é o mesmo - o que muda é só a encenação.
 */

import { useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Container, H2, Reveal } from './base';

/* Os passos da revelação. `mostra` é quantos dos quatro blocos já estão
   visíveis quando este passo chega. */
const PASSOS = [
  { he: 'ש', nota: 'Uma forma. Por enquanto, só isso.' },
  { he: 'שָׁ', nota: 'Com o sinal de vogal, já se lê: sha.' },
  { he: 'שָׁלוֹם', nota: 'As letras viram uma palavra inteira.' }
] as const;

export function Transformacao() {
  const [passo, setPasso] = useState(0);
  const alvo = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = alvo.current;
    if (!el) return;

    const reduz = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const rodar = () => {
      if (reduz) { setPasso(4); return; }
      timers = [500, 1400, 2300, 3200].map((ms, i) =>
        setTimeout(() => setPasso(i + 1), ms));
    };

    /* Sem IntersectionObserver (navegador muito antigo, ou jsdom), mostra
       tudo: um recurso de apoio que some é melhor do que uma seção vazia. */
    if (typeof IntersectionObserver === 'undefined') { setPasso(4); return; }

    const obs = new IntersectionObserver(entradas => {
      if (entradas.some(e => e.isIntersecting)) { rodar(); obs.disconnect(); }
    }, { threshold: 0.45 });
    obs.observe(el);

    return () => { obs.disconnect(); timers.forEach(clearTimeout); };
  }, []);

  const em = (n: number) => passo >= n;

  /* Fica no papel creme, e não na areia: a seção seguinte (o problema) já é
     areia, e duas faixas tingidas coladas viram um bloco só. Quem dá o
     contraste aqui é o cartão branco, que é o objeto da seção. */
  return (
    <section aria-labelledby="transformacao">
      <Container className="pt-4 pb-16 sm:pt-6 sm:pb-[88px]">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1fr)] lg:items-center">
          <Reveal>
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.11em] text-[var(--teal-ink)] mb-3.5">
              Hoje e depois
            </p>
            <H2 id="transformacao" className="max-w-[16ch] mb-4">
              O que parecia impossível começa a fazer sentido.
            </H2>
            <p className="font-ui text-[17px] sm:text-[18px] leading-[1.65] text-ink-muted max-w-[46ch]">
              Agora, <span lang="he" dir="rtl" className="he text-[19px] text-ink">ש מ ל א</span> são desenhos.
              Depois do curso são sons que você reconhece, letras que você lê e palavras que
              você entende. Veja acontecer com a palavra que você já ouviu a vida inteira.
            </p>
          </Reveal>

          <div ref={alvo}>
            <div className="rounded-[26px] bg-[var(--card)] border border-line shadow-[var(--sh)]
                            px-6 py-10 sm:px-10 sm:py-12 grid gap-7 justify-items-center text-center">
              {/* Os três estágios da forma, no mesmo lugar da tela: é a MESMA
                  palavra ganhando informação, e trocá-la de posição faria
                  parecer três coisas diferentes. */}
              <div className="min-h-[104px] sm:min-h-[124px] grid place-items-center">
                {PASSOS.map((p, i) => (
                  <span
                    key={p.he}
                    aria-hidden={passo !== i + 1 && !(i === 2 && em(3))}
                    className="col-start-1 row-start-1 transition-[opacity,transform] duration-[560ms]
                               ease-[var(--ease)]"
                    style={{
                      opacity: passo === i + 1 || (i === 2 && em(3)) ? 1 : 0,
                      transform: passo >= i + 1 ? 'none' : 'translateY(10px)'
                    }}
                  >
                    <He size="display" tone="navy">{p.he}</He>
                  </span>
                ))}
              </div>

              <p
                className="font-ui text-[15px] text-ink-muted min-h-[22px] transition-opacity duration-500"
                style={{ opacity: passo > 0 ? 1 : 0 }}
              >
                {PASSOS[Math.min(Math.max(passo, 1), 3) - 1]!.nota}
              </p>

              <div className="w-full max-w-[280px] h-px bg-[var(--line)]" />

              {/* A leitura e o significado. Entram por último, juntos: é o
                  instante em que a palavra deixa de ser desenho. */}
              <div
                className="grid gap-1.5 transition-[opacity,transform] duration-[620ms] ease-[var(--ease)]"
                style={{ opacity: em(4) ? 1 : 0, transform: em(4) ? 'none' : 'translateY(14px)' }}
              >
                <p className="font-ui text-[15px] tracking-[.02em] text-ink-muted m-0">lê-se shalóm</p>
                <p className="font-display text-[26px] sm:text-[30px] font-semibold tracking-[-0.02em]
                              text-ink m-0">
                  olá · paz
                </p>
              </div>
            </div>

            <p className="mt-4 text-center font-ui text-[14px] text-ink-muted">
              É assim que o curso apresenta cada uma das 22 letras.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
