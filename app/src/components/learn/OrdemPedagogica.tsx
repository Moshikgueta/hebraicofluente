'use client';

/* Por que o curso não segue א, ב, ג, ד.
 * ─────────────────────────────────────────────────────────────────────────
 * Esta é a única pergunta da auditoria pedagógica que ficou sem resposta
 * até 22/09/2026: o aluno abre o mapa, vê {{מ}} na segunda posição e {{ב}}
 * na vigésima, e não tem onde perguntar. Quem conhece um pouco de hebraico
 * estranha na hora; quem não conhece nada estranha depois, quando descobre
 * que a ordem "de verdade" é outra.
 *
 * As duas reações levam ao mesmo lugar, e é por isso que a resposta não
 * pode ser um rodapé: o aluno precisa saber que a ordem é DELIBERADA, ou
 * ele desconfia do curso inteiro.
 *
 * ── por que aqui, e não na aula 0 ───────────────────────────────────────
 * Porque é aqui que a pergunta nasce. A aula 0 fala do alfabeto antes de o
 * aluno ver letra nenhuma; o estranhamento com a ORDEM só existe depois de
 * ele olhar as 22 numa tela. A aula 0 linka para cá, no ponto em que
 * apresenta o caminho.
 *
 * ── a ordem tradicional é derivada, não digitada ────────────────────────
 * Ela sai da ordem do Unicode, que para o hebraico É a ordem alfabética
 * (U+05D0 alef … U+05EA tav). Uma lista escrita à mão aqui seria mais uma
 * cópia do alfabeto para alguém manter em dia, e a primeira a divergir.
 */

import { tx } from '@/i18n/telas/licao-ordem-pedagogica';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { allLetters } from '@/lib/content';

/** A ordem tradicional, tirada do Unicode. Ver a nota do topo. */
function ordemTradicional() {
  return allLetters()
    .slice()
    .sort((a, b) => a.letter.codePointAt(0)! - b.letter.codePointAt(0)!);
}

export function OrdemPedagogica() {
  const letras = allLetters();
  const tradicional = ordemTradicional();
  /* As quatro primeiras da ordem do curso, para mostrar o contraste com
     nome e não só com desenho. */
  const primeiras = letras.slice(0, 4);

  return (
    <Card className="p-6 sm:p-7 grid gap-5">
      <div className="grid gap-2">
        <h2 className="font-display text-[21px] font-semibold">
          {tx.titulo}
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body max-w-[58ch]">
          {tx.esperando}
        </p>
      </div>

      {/* O contraste, lado a lado. É o que a frase sozinha não faz. */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-2">
          <p className="font-ui text-[12px] uppercase tracking-[.08em] text-ink-muted">
            {tx.tradicional}
          </p>
          <p className="he-seq gap-x-2 justify-start">
            {tradicional.slice(0, 4).map(l => <He key={l.id} size="word">{l.letter}</He>)}
            <span aria-hidden className="font-ui text-[15px] text-ink-muted">…</span>
          </p>
        </div>
        <div className="rounded-[var(--r-md)] bg-[var(--teal-soft)] p-4 grid gap-2">
          <p className="font-ui text-[12px] uppercase tracking-[.08em] text-[var(--teal-ink)]">
            {tx.desteCurso}
          </p>
          <p className="he-seq gap-x-2 justify-start">
            {primeiras.map(l => <He key={l.id} size="word">{l.letter}</He>)}
            <span aria-hidden className="font-ui text-[15px] text-ink-muted">…</span>
          </p>
        </div>
      </div>

      <p className="text-[16px] leading-relaxed text-ink rounded-[var(--r-md)]
                    border border-[color:var(--edge-teal)] bg-[var(--teal-soft)] px-4 py-3">
        <strong className="font-semibold">{tx.foraDeOrdem}</strong> {tx.pensada}
      </p>

      {/* ── como a ordem ajuda: a peça que aumenta o que dá para montar ── */}
      <div className="grid gap-3">
        <h3 className="font-ui text-[15px] font-semibold text-ink">{tx.compra}</h3>
        <p className="text-[15.5px] leading-relaxed text-ink-body max-w-[58ch]">
          {tx.peca}
        </p>
        <ol className="grid gap-2 list-none p-0 m-0">
          {[
            [tx.passo1, tx.passo1d],
            [tx.passo2, tx.passo2d],
            [tx.passo3, tx.passo3d],
            [tx.passo4, tx.passo4d],
            [tx.passo5, tx.passo5d]
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3 items-baseline">
              <span aria-hidden
                    className="shrink-0 w-6 h-6 rounded-full bg-surface-2 text-ink-muted
                               font-ui text-[12px] font-bold grid place-items-center">
                {i + 1}
              </span>
              <span className="text-[15px] leading-relaxed text-ink-body">
                <strong className="font-semibold text-ink">{t}</strong> - {d}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-[15px] leading-relaxed text-ink-body max-w-[58ch]">
          {tx.alfabetica(primeiras[0]!.namePt, tradicional[1]!.namePt)}
        </p>
      </div>

      {/* ── o objetivo, dito ── */}
      <div className="grid gap-2 border-t border-[color:var(--line-soft)] pt-5">
        <h3 className="font-ui text-[15px] font-semibold text-ink">
          {tx.objetivo}
        </h3>
        <p className="text-[15.5px] leading-relaxed text-ink-body max-w-[58ch]">
          {tx.objetivoTexto}
        </p>
      </div>

      {/* ── a ordem tradicional, inteira, com o lugar de cada letra ──────
          Não é decoração: é a ponte entre as duas ordens. Quem já ouviu o
          alfabeto em ordem alfabética pode procurar uma letra aqui e
          descobrir em que lição ela aparece. */}
      <details className="rounded-[var(--r-md)] border border-line bg-surface overflow-hidden">
        <summary className="cursor-pointer list-none p-4 font-ui text-[14.5px] font-semibold
                            text-ink hover:bg-surface-2 flex items-center justify-between gap-3">
          <span>{tx.verTradicional}</span>
          <span aria-hidden className="text-ink-muted">▾</span>
        </summary>
        <div className="px-4 pb-4 grid gap-3 border-t border-[color:var(--line-soft)] pt-4">
          <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted max-w-[58ch]">
            {tx.importante}
          </p>
          {/* A grade corre da DIREITA para a esquerda, como o alfabeto que
              ela mostra. Na primeira captura ela vinha da esquerda - o {{א}}
              no canto superior esquerdo -, e não há tela pior para esse
              deslize: o curso acabou de ensinar que a primeira letra é a
              mais à direita, e a lista do alfabeto dizia o contrário. O
              rótulo "lição N" continua em português dentro de cada célula,
              que é o seu próprio isolado. */}
          <ul dir="rtl"
              className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-2 list-none p-0 m-0">
            {tradicional.map(l => (
              <li key={l.id}
                  className="grid justify-items-center gap-0.5 rounded-[var(--r-sm)]
                             bg-surface-2 py-2">
                <He size="word">{l.letter}</He>
                <span className="font-ui text-[10.5px] text-ink-muted tabular-nums">
                  {tx.licao(l.lesson)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </details>

      <p className="font-ui text-[13.5px] text-ink-muted">
        {tx.aindaNaoViu}{' '}
        <Link href="/inicio"
              className="font-semibold text-[var(--accent)] underline underline-offset-4">
          {tx.comece}
        </Link>.
      </p>
    </Card>
  );
}
