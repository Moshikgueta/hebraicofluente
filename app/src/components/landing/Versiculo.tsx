'use client';

/* O versículo, palavra por palavra - a prova no lugar da promessa.
 * ─────────────────────────────────────────────────────────────────────────
 * A página inteira existe para responder uma pergunta, e a resposta tem duas
 * metades que só valem juntas: sim, você vai DECODIFICAR; não, você não vai
 * ENTENDER. Texto nenhum convence disso. O que convence é a pessoa tocar
 * numa palavra e ver as duas coisas ao mesmo tempo na tela: o som sai, e o
 * sentido precisa de alguém que o traga.
 *
 * Por isso este bloco é um só componente com dois botões, e não dois blocos:
 * o som e o sentido aparecem no MESMO lugar, um ao lado do outro, e a
 * distância entre eles é o argumento.
 *
 * É a única página livre do site que mostra um texto antigo palavra por
 * palavra. O versículo é de domínio público e vem de `data/biblia.json`, que
 * é público de propósito - nada de material de aula viaja aqui (a régua está
 * em lib/content-publico.ts, e app/pacote.mjs confere no export publicado).
 */

import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import type { BibleVerse } from '@/lib/content-publico';

export function Versiculo({ v }: { v: BibleVerse }) {
  const [sel, setSel] = useState<number | null>(null);
  const palavra = sel === null ? null : v.words[sel] ?? null;

  return (
    <Card className="p-5 sm:p-8 grid gap-5 shadow-[0_2px_4px_rgba(27,33,31,.04),0_24px_48px_-32px_rgba(14,59,67,.3)]">
      <div className="flex items-center gap-2.5 flex-wrap">
        <Badge tone="accent">{v.fontePt}</Badge>
        <span className="font-ui text-[12.5px] text-ink-muted">
          toque numa palavra
        </span>
      </div>

      <div className="flex flex-wrap justify-center items-baseline gap-x-2.5 gap-y-1.5"
           dir="rtl" lang="he">
        {v.words.map((w, k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSel(s => (s === k ? null : k))}
            aria-pressed={sel === k}
            aria-label={`Palavra ${k + 1}: ${w.translit}`}
            className={`rounded-[var(--r-sm)] px-1.5 py-0.5 min-h-[44px]
                        transition-colors cursor-pointer
                        ${sel === k ? 'bg-[var(--accent-wash)]' : 'hover:bg-[var(--accent-wash)]'}`}
          >
            <He size="lg" tone={sel === k ? 'teal' : 'ink'}>{w.he}</He>
          </button>
        ))}
      </div>

      {/* A altura não muda quando a pessoa escolhe: a linha de baixo já está
          ocupada pelo convite, e um bloco que cresce empurra o versículo para
          fora da tela justo quando ela acabou de tocar nele. */}
      <div className="min-h-[92px] grid content-center gap-1 text-center
                      border-t border-[color:var(--line-soft)] pt-4">
        {palavra ? (
          <>
            <p className="font-display text-[19px] font-bold text-ink">{palavra.pt}</p>
            <p className="font-ui text-[14px] text-ink-muted">
              lê-se <strong className="font-semibold text-ink-body">{palavra.translit}</strong>
            </p>
            <p className="font-ui text-[13px] text-ink-muted">
              sem os pontos, num rolo de sinagoga: <He size="inline">{palavra.bare}</He>
            </p>
          </>
        ) : (
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body max-w-[46ch] mx-auto">
            São sete palavras. Depois do curso, você lê as sete em voz alta -
            e precisa de um dicionário para saber o que cinco delas querem dizer.
          </p>
        )}
      </div>

      <div className="grid gap-1 text-center">
        <p className="font-ui text-[15px] leading-relaxed text-ink-body">{v.pt}</p>
        <p className="font-ui text-[12.5px] text-ink-muted">
          A tradução é de uma versão em português. Elas variam, e é por isso que
          ler o original tem valor.
        </p>
      </div>
    </Card>
  );
}
