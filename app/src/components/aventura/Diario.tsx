'use client';

/* O Diário de descobertas (28/10/2026, master prompt 3.0, parte 7).
 * ─────────────────────────────────────────────────────────────────────────
 * Três páginas: a linha do tempo (o que o aluno fez, com a data), os lugares
 * da aventura (carimbados quando visitados) e as palavras que ele já lê.
 * Tudo sai de lib/diario.ts, que só lê o progresso: o diário não grava nada
 * e não inventa entrada. As letras ficam na coleção, logo abaixo, na mesma
 * página.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import type { CourseModule, Letter } from '@/lib/content';
import type { LearnerState } from '@/lib/state/types';
import { entradasDoDiario, lugaresVisitados, porDia, type TipoDeEntrada } from '@/lib/diario';
import { alfabetoDe, palavrasLegiveis, vocabularioDoCurso } from '@/lib/engine/palavras';
import { Cenario, LUGAR, type IdDoCenario } from '@/components/aventura/Cenarios';
import { tx } from '@/i18n/telas/academia-diario';

type Pagina = 'tempo' | 'lugares' | 'palavras';
const PAGINAS: { id: Pagina; nome: string }[] = [
  { id: 'tempo', nome: tx.abaRegistros }, { id: 'lugares', nome: tx.abaLugares }, { id: 'palavras', nome: tx.abaPalavras }
];

const CARIMBO: Record<TipoDeEntrada, string> = {
  aula0: '0', letra: '', checkpoint: '✓', leitura: '≡', texto: '✎', missao: '★', conquista: '◆'
};

const dataPorExtenso = (dia: string) => {
  const t = new Date(`${dia}T12:00:00`).toLocaleDateString(tx.localeData, { day: 'numeric', month: 'long', year: 'numeric' });
  return t;
};

export function Diario({ state, letras, modulos, comecadas }: {
  state: LearnerState;
  letras: readonly Letter[];
  modulos: readonly CourseModule[];
  /** As letras com lição começada: a régua das palavras que o aluno lê. */
  comecadas: readonly Letter[];
}) {
  const [pagina, setPagina] = useState<Pagina>('tempo');
  const [tudo, setTudo] = useState(false);
  const entradas = useMemo(() => entradasDoDiario(state, letras, modulos), [state, letras, modulos]);
  const dias = useMemo(() => porDia(tudo ? entradas : entradas.slice(0, 10)), [entradas, tudo]);
  const visitados = useMemo(() => lugaresVisitados(state, letras, modulos), [state, letras, modulos]);
  const palavras = useMemo(
    () => palavrasLegiveis(vocabularioDoCurso(letras), alfabetoDe(comecadas)), [letras, comecadas]);

  return (
    <section id="diario" aria-labelledby="t-diario"
             className="relative rounded-[var(--r-lg)] border border-line bg-[var(--card)] shadow-[var(--sh)] overflow-hidden scroll-mt-20">
      {/* A capa: a faixa de papel e a lombada do caderno. */}
      <div aria-hidden className="absolute left-0 top-0 bottom-0 w-2 bg-[var(--accent-bg)]" />
      <div className="pl-6 pr-5 pt-5 pb-5 grid gap-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 id="t-diario" className="m-0 font-display text-[20px] font-semibold">{tx.titulo}</h2>
          <span className="font-ui text-[13px] text-ink-muted tabular-nums">
            {tx.nRegistros(entradas.length)}
          </span>
        </div>

        <div role="tablist" aria-label={tx.paginas} className="flex gap-1 rounded-[var(--r-md)] bg-surface-2 p-1">
          {PAGINAS.map(pg => (
            <button key={pg.id} role="tab" type="button" aria-selected={pagina === pg.id}
                    aria-controls={`diario-${pg.id}`} id={`aba-${pg.id}`}
                    onClick={() => setPagina(pg.id)}
                    className={`flex-1 min-h-[44px] rounded-[calc(var(--r-md)-4px)] font-ui text-[14px] font-semibold
                                transition-[background-color,color] duration-[var(--dur-toque)]
                                ${pagina === pg.id ? 'bg-[var(--card)] text-ink shadow-[0_1px_2px_rgba(0,0,0,.08)]' : 'text-ink-muted hover:text-ink'}`}>
              {pg.nome}
            </button>
          ))}
        </div>

        <div key={pagina} id={`diario-${pagina}`} role="tabpanel" aria-labelledby={`aba-${pagina}`} className="hf-passo">
          {pagina === 'tempo' && (entradas.length === 0 ? (
            <p className="m-0 font-ui text-[15px] leading-relaxed text-ink-body">
              {tx.vazio}
            </p>
          ) : (
            <div className="grid gap-4">
              {dias.map(d => (
                <div key={d.dia} className="grid gap-2">
                  <p className="m-0 font-ui text-[12px] font-bold uppercase tracking-[.1em] text-[var(--accent)]">{dataPorExtenso(d.dia)}</p>
                  <ul className="grid gap-1.5 list-none p-0 m-0 border-l-2 border-dashed border-line pl-3">
                    {d.entradas.map(x => (
                      <li key={x.id} className="flex items-center gap-3">
                        <span aria-hidden
                              className={`shrink-0 grid place-items-center w-9 h-9 rounded-full border-2 font-ui text-[13px] font-bold
                                ${x.tipo === 'conquista' ? 'border-[var(--gold)] text-[var(--gold-ink)] bg-[var(--gold-soft)]'
                                  : 'border-[var(--teal)] text-[var(--teal-ink)] bg-[var(--teal-soft)]'} -rotate-6`}>
                          {x.letra ? <He size="inline">{x.letra}</He> : CARIMBO[x.tipo]}
                        </span>
                        {x.href
                          ? <Link href={x.href} className="font-ui text-[15px] text-ink hover:text-[var(--accent)] min-h-[40px] inline-flex items-center">{x.texto}</Link>
                          : <span className="font-ui text-[15px] text-ink">{x.texto}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {entradas.length > 10 && (
                <button type="button" onClick={() => setTudo(t => !t)}
                        className="justify-self-start min-h-[44px] px-1 font-ui text-[14px] font-semibold text-[var(--accent)] underline underline-offset-4">
                  {tudo ? tx.verRecentes : tx.verTodos(entradas.length)}
                </button>
              )}
            </div>
          ))}

          {pagina === 'lugares' && (
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 list-none p-0 m-0">
              {([1, 2, 3, 4, 5, 6, 7] as IdDoCenario[]).map(n => {
                const foi = visitados.has(n);
                return (
                  <li key={n} className={`relative rounded-[14px] border overflow-hidden ${foi ? 'border-line' : 'border-dashed border-line'}`}>
                    <span aria-hidden className="block h-[64px]"><Cenario n={n} trancado={!foi} /></span>
                    <span className="grid px-2.5 py-2 gap-0.5">
                      <span className="font-ui text-[13px] font-semibold text-ink first-letter:uppercase">{LUGAR[n].pt}</span>
                      <span className="font-ui text-[12px] text-ink-muted">{tx.modulo(n, foi)}</span>
                    </span>
                    {foi && (
                      <span aria-hidden className="absolute right-2 top-2 grid place-items-center w-11 h-11 rounded-full border-2 border-[var(--gold)]
                                                   bg-[var(--card)]/85 text-[var(--gold-ink)] font-ui text-[9px] font-bold uppercase tracking-[.06em] rotate-12">
                        {tx.visto}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {pagina === 'palavras' && (
            <div className="grid gap-3">
              <p className="m-0 font-ui text-[15px] text-ink-body">
                {palavras.length === 0
                  ? tx.semPalavras
                  : tx.jaLe(palavras.length)}
              </p>
              {palavras.length > 0 && (
                <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                  {palavras.slice(-18).reverse().map(w => (
                    <li key={w.he} className="grid justify-items-center rounded-[12px] border border-line bg-surface px-3 py-1.5">
                      <He size="word">{w.he}</He>
                      <span className="font-ui text-[12px] text-ink-muted">{w.pt}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/vocabulario" className="justify-self-start min-h-[44px] inline-flex items-center font-ui text-[14px] font-semibold text-[var(--accent)] underline underline-offset-4">
                {tx.verVocabulario}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
