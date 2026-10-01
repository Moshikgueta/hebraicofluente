'use client';

/* Método · Currículo.
 * ─────────────────────────────────────────────────────────────────────────
 * O miolo da landing. Duas notas que valem para o arquivo inteiro:
 *
 * · O CONTEÚDO REAL MANDA. O protótipo foi desenhado antes de o curso
 *   existir e fala em "6 módulos, 14 lições" com letras inventadas para o
 *   exemplo. Aqui o currículo é montado a partir de content/course.json - os
 *   sete módulos que existem, com as letras e os objetivos que eles de fato
 *   ensinam. Uma landing que promete um número e entrega outro é um pedido
 *   de reembolso com passos extras.
 * · Todo hebraico passa por <He>, inclusive as letras soltas nos cabeçalhos
 *   dos módulos. É o contrato do projeto e não abre exceção para enfeite.
 * · O ÁUDIO É CONDICIONAL, pelo mesmo motivo que em Fecho.tsx - e aqui a
 *   lição foi aprendida mais tarde, o que é o registro honesto. O Fecho já
 *   tinha duas versões de cada frase sobre gravação; este arquivo não, e por
 *   isso o site se contradizia: o FAQ dizia "as gravações estão em produção"
 *   enquanto esta seção listava "Áudio gravado por falante nativo" como coisa
 *   entregue, punha "escuta" entre os tipos de exercício e desenhava uma
 *   maquete de exercício de escuta com botão de tocar. A parte que vendia era
 *   justamente a que estava errada, e no Brasil a oferta vincula.
 *   Quem decide é o manifesto: no dia em que as gravações entrarem, estas
 *   frases voltam sozinhas.
 */

import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Prose } from '@/components/learn/Blocks';
import { course, totalLicoes } from '@/lib/content-publico';
import { Container, H2, Lead, Reveal, Check, Chevron } from './base';
import { PASSOS } from './copy';


/* ── 5 · o método ───────────────────────────────────────────────────────── */

export function Metodo() {
  const { ref, cls } = useLinha();
  return (
    <section id="metodo">
      <Container className="pt-16 sm:pt-24">
        <Reveal><H2 className="max-w-[20ch] mb-3">Um método simples para transformar símbolos em leitura.</H2></Reveal>
        {/* O número vem do ARRAY, nunca escrito à mão. Ele estava: a página
            dizia "Seis passos" e renderizava cinco, porque `PASSOS` perde o
            "Ouça" enquanto não há gravação e ninguém voltou na frase. Um
            número errado na página que explica o método é pequeno e caro -
            é a seção que existe para dizer "aqui a gente é exato". */}
        <Reveal delay={80}><Lead className="mb-10 sm:mb-[46px]">
          {PASSOS.length === 6 ? 'Seis passos' : 'Cinco passos'}, sempre nesta sequência.
          Nenhuma letra avança sem passar por todos.
        </Lead></Reveal>

        <div className="relative">
          {/* A linha que liga os seis passos, crescendo da esquerda. Escondida
              abaixo de sm, onde os passos empilham e ela ligaria o nada. */}
          <span
            ref={ref}
            aria-hidden
            className={`hidden sm:block absolute left-0 right-0 top-[27px] h-[2px] origin-left
                        transition-transform duration-[1100ms] ease-[var(--ease-fill)] ${cls}`}
            style={{ background: 'linear-gradient(90deg,var(--teal),var(--teal-lite))' }}
          />
          <ol className="relative grid gap-[18px] list-none p-0 m-0
                         [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
            {PASSOS.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 70}>
                <span aria-hidden className="mb-4 w-14 h-14 rounded-[16px] bg-[var(--card)]
                                             border-[1.5px] border-[var(--teal)] grid place-items-center
                                             font-ui font-bold text-[18px] text-[var(--teal-ink)]">
                  {i + 1}
                </span>
                <p className="font-display text-[19px] font-semibold tracking-[-0.015em] text-ink mb-1.5">{t}</p>
                <p className="font-ui text-[15px] leading-[1.55] text-ink-muted">{d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/** A linha do método anima `scaleX`, e não opacidade - por isso não usa o
 *  `Reveal` comum. */
function useLinha() {
  const [visivel, setVisivel] = useState(false);
  const ref = (el: HTMLSpanElement | null) => {
    if (!el || visivel) return;
    const reduz = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduz || !('IntersectionObserver' in window)) { setVisivel(true); return; }
    const io = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting) { setVisivel(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
    io.observe(el);
  };
  return { ref, cls: visivel ? 'scale-x-100' : 'scale-x-0' };
}

/* ── 6 · o currículo ────────────────────────────────────────────────────── */

/* O percurso, antes do acordeão.
 * ─────────────────────────────────────────────────────────────────────────
 * Sete módulos fechados num acordeão contam a matéria, mas escondem a FORMA
 * do curso. E a forma aqui tem uma notícia dentro: as letras acabam no
 * módulo 5. Os dois últimos não ensinam letra nenhuma - ensinam a ler o que
 * já se sabe sem as muletas (o ponto que some na rua, o apóstrofo dos sons
 * importados). Quem só vê a lista pensa que o curso perdeu o fôlego no fim;
 * quem vê a barra entende que o fim é outra coisa.
 *
 * Por isso a divisão não está escrita aqui: ela é LIDA de course.json, pelo
 * único critério que a define (`letterIds.length > 0`). No dia em que um
 * módulo novo trouxer letras, a barra se redesenha sozinha - e continua
 * verdadeira, que é o ponto do arquivo inteiro.
 *
 * A largura de cada trecho é proporcional às lições, não igual: um módulo
 * de seis lições ocupando o mesmo espaço de um de duas seria um gráfico
 * mentindo sobre a própria escala.
 */
function Percurso() {
  const mods = course.modules;
  const licoes = totalLicoes();
  const comLetras = mods.filter(m => m.letterIds.length > 0);
  const depois = mods.filter(m => m.letterIds.length === 0);

  /* "Módulos 1-5" / "Módulo 6" - o rótulo acompanha o que o dado disser. */
  const faixa = (lista: typeof mods) => {
    const ns = lista.map(m => m.n);
    const a = Math.min(...ns), b = Math.max(...ns);
    return a === b ? `Módulo ${a}` : `Módulos ${a}-${b}`;
  };

  if (comLetras.length === 0 || depois.length === 0) return null;

  return (
    <Reveal delay={120}>
      <div className="mb-9 sm:mb-11 rounded-[22px] bg-[var(--card)] border border-line p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5 mb-5">
          {([
            [mods.length, 'módulos'],
            [licoes, 'lições'],
            [course.letters.length, 'letras']
          ] as const).map(([n, r]) => (
            <p key={r} className="font-ui text-[15px] text-ink-muted m-0">
              <b className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink
                            tabular-nums align-baseline mr-1.5">{n}</b>
              {r}
            </p>
          ))}
        </div>

        <div className="flex gap-1 h-[10px] mb-4" aria-hidden>
          {mods.map(m => (
            <span
              key={m.id}
              style={{ flexGrow: m.lessons.length || 1 }}
              className={`rounded-full ${m.letterIds.length > 0
                ? 'bg-[var(--teal)]' : 'bg-[var(--gold)]'}`}
            />
          ))}
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 list-none p-0 m-0">
          <li className="flex gap-2.5 items-start">
            <span aria-hidden className="mt-[5px] w-2.5 h-2.5 rounded-full bg-[var(--teal)] shrink-0" />
            <span className="min-w-0">
              <span className="block font-ui text-[15px] font-semibold text-ink">
                {faixa(comLetras)} · as {course.letters.length} letras
              </span>
              <span className="block font-ui text-[14.5px] leading-[1.5] text-ink-muted">
                Uma de cada vez, na ordem em que aparecem nas palavras - e cada uma
                já entra numa palavra de verdade.
              </span>
            </span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span aria-hidden className="mt-[5px] w-2.5 h-2.5 rounded-full bg-[var(--gold)] shrink-0" />
            <span className="min-w-0">
              <span className="block font-ui text-[15px] font-semibold text-ink">
                {faixa(depois)} · ler sem apoio
              </span>
              <span className="block font-ui text-[14.5px] leading-[1.5] text-ink-muted">
                O alfabeto já está completo. Aqui o texto perde as marcas que
                facilitavam, do jeito que ele aparece numa placa ou num cardápio.
              </span>
            </span>
          </li>
        </ul>
      </div>
    </Reveal>
  );
}

export function Curriculo() {
  const [aberto, setAberto] = useState(0);
  const modulos = course.modules;

  return (
    <section>
      <Container className="pt-16 sm:pt-24">
        <Reveal><H2 className="mb-3">O que você estuda, módulo a módulo.</H2></Reveal>
        <Reveal delay={80}><Lead className="mb-8">
          {modulos.length} módulos. As letras aparecem por utilidade, não por ordem
          alfabética - você lê palavras reais já na primeira semana.
        </Lead></Reveal>

        <Percurso />

        <div className="grid gap-2.5">
          {modulos.map((m, i) => {
            const open = aberto === i;
            const letras = m.letterIds
              .map(id => course.letters.find(l => l.id === id)?.letter)
              .filter((x): x is string => !!x);
            return (
              <div
                key={m.id}
                className={`rounded-[18px] bg-[var(--card)] border overflow-hidden
                            transition-[border-color,box-shadow] duration-[250ms]
                            ${open ? 'border-[var(--teal)] shadow-[var(--sh)]' : 'border-line'}`}
              >
                <button
                  type="button"
                  onClick={() => setAberto(open ? -1 : i)}
                  aria-expanded={open}
                  className="w-full flex items-center gap-4 sm:gap-[18px] px-5 sm:px-6 py-[22px] text-left"
                >
                  <span aria-hidden
                        className={`w-11 h-11 rounded-[13px] grid place-items-center shrink-0
                                    font-ui font-bold text-[16px]
                                    ${open ? 'bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                                           : 'bg-[var(--sand)] text-ink-muted'}`}>
                    {String(m.n).padStart(2, '0')}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-display text-[17px] sm:text-[19px] font-semibold
                                     tracking-[-0.018em] text-ink">
                      {m.titlePt}
                    </span>
                    <span className="block font-ui text-[14px] sm:text-[14.5px] text-ink-muted mt-0.5">
                      {m.lessons.length} {m.lessons.length === 1 ? 'lição' : 'lições'}
                      {letras.length > 0 && ` · ${letras.length} ${letras.length === 1 ? 'letra' : 'letras'}`}
                    </span>
                  </span>
                  {letras.length > 0 && (
                    <span className="hidden sm:flex gap-[7px] shrink-0">
                      {letras.map(l => (
                        <He key={l} size="inline" className="!text-[21px] !leading-[1.1]" dim>{l}</He>
                      ))}
                    </span>
                  )}
                  <Chevron open={open} />
                </button>
                <div className="overflow-hidden transition-[max-height] duration-[340ms] ease-[var(--ease)]"
                     style={{ maxHeight: open ? 320 : 0 }}>
                  <div className="px-5 sm:pl-[86px] sm:pr-6 pb-6 grid gap-[18px]
                                  [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                    {m.goalsPt.map((g, k) => (
                      <p key={k} className="flex gap-2.5 items-start font-ui text-[15px] leading-[1.5] text-ink-muted">
                        <span className="mt-1"><Check size={14} /></span>
                        <span className="min-w-0"><Prose text={g} /></span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
