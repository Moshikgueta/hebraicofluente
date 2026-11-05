'use client';

/* Ler cardápios (05/11/2026, pedido do dono). As regras moram em
 * lib/engine/cardapio.ts. Um cardápio por vez, como chega em Israel: sem os
 * pontos, com o preço em shekels, e o botão para mostrar os pontos. Embaixo,
 * as perguntas (o mesmo componente de compreensão dos textos). Abre com o
 * alfabeto dominado. Sem nota e nada novo no progresso: é leitura. */

import Link from 'next/link';
import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { LinkButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Compreensao } from '@/components/learn/Compreensao';
import { allLetters, cardapiosDoCurso } from '@/lib/content';
import { perguntasDoCardapio, precoEm, type Cardapio } from '@/lib/engine/cardapio';
import { stripNikud } from '@/lib/hebrew';
import { alphabetComplete } from '@/lib/state/rules';
import { useProgress } from '@/lib/state/store';
import { tx } from '@/i18n/telas/academia-cardapios';

function QuadroDoCardapio({ c, pontos }: { c: Cardapio; pontos: boolean }) {
  const mostra = (he: string) => (pontos ? he : stripNikud(he));
  return (
    <div className="rounded-[18px] border-2 border-[var(--ink)] bg-[var(--card)] p-5 sm:p-6 grid gap-4 shadow-[var(--sh)]">
      <div className="text-center grid gap-1">
        <He size="xl">{mostra(c.he)}</He>
        <span className="font-ui text-[13px] text-ink-muted">{c.tipoPt}</span>
      </div>
      <ul className="grid gap-2.5 list-none p-0 m-0">
        {c.itens.map(it => (
          <li key={it.he} dir="rtl" className="flex items-baseline gap-3 border-b border-dashed border-line pb-2 last:border-b-0">
            <He size="lg">{mostra(it.he)}</He>
            <span aria-hidden className="flex-1 border-b border-dotted border-line translate-y-[-4px]" />
            <span dir="ltr" className="font-ui text-[17px] font-semibold text-ink tabular-nums">{precoEm(it.preco)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CardapiosClient() {
  const p = useProgress();
  const cardapios = cardapiosDoCurso();
  const [i, setI] = useState(0);
  const [pontos, setPontos] = useState(false);
  const aberto = p.ready && alphabetComplete(p.state, allLetters().map(l => l.id));
  const c = cardapios[i];

  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-2">
        <Link href="/leituras" className="inline-flex items-center min-h-[44px] w-fit font-ui text-[14px] text-[var(--teal-ink)]">← {tx.voltar}</Link>
        <h1 className="m-0 text-[27px] sm:text-[33px] font-bold leading-tight">{tx.titulo}</h1>
        <p className="m-0 font-ui text-[15.5px] leading-relaxed text-ink-body max-w-[60ch] text-pretty">{tx.intro}</p>
      </header>

      {p.ready && !aberto && (
        <Card tone="sand" className="p-6 grid gap-3">
          <h2 className="m-0 text-[20px] font-bold">{tx.trancadoTitulo}</h2>
          <p className="m-0 font-ui text-[15px] text-ink-body">{tx.trancadoTexto}</p>
          <LinkButton href="/meu-hebraico" className="justify-self-start">{tx.continuar}</LinkButton>
        </Card>
      )}

      {aberto && c && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 font-ui text-[13px] text-ink-muted tabular-nums">{tx.cardapioN(i + 1, cardapios.length)}</p>
            <button type="button" aria-pressed={pontos} onClick={() => setPontos(v => !v)}
                    className={`min-h-[40px] px-3.5 rounded-full border font-ui text-[14px]
                      ${pontos ? 'bg-[var(--navy)] border-[var(--navy)] text-white' : 'border-line bg-surface text-ink-body'}`}>
              {tx.mostrarPontos}
            </button>
          </div>
          <QuadroDoCardapio c={c} pontos={pontos} />
          <Compreensao
            key={c.id}
            id={`cardapio-${c.id}`}
            titulo={tx.entendeu}
            intro={tx.responda}
            perguntas={perguntasDoCardapio(c)}
            fecho={{ bom: tx.fechoBom, parcial: tx.fechoParcial }}
            aoCompletar={() => {}}
          />
          {cardapios.length > 1 && (
            <nav aria-label={tx.outros} className="flex flex-wrap gap-2">
              {cardapios.map((x, k) => (
                <button key={x.id} type="button" aria-current={k === i || undefined}
                        onClick={() => { setI(k); setPontos(false); window.scrollTo({ top: 0 }); }}
                        className={`min-h-[44px] px-4 rounded-full border font-ui text-[14px]
                          ${k === i ? 'bg-[var(--teal)] border-[var(--teal)] text-white' : 'border-line bg-[var(--card)] text-ink'}`}>
                  {x.nomePt}
                </button>
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
