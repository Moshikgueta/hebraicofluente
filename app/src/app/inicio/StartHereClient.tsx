'use client';

/* "Comece aqui" — before the first letter.
 *
 * This is the workbook's Página 0, and its central choice carries over: the
 * vowel signs are taught BY SOUND, not by name. A beginner needs to know that
 * this mark says "a"; whether it is called patach or kamats is a detail for
 * the appendix. Two signs for one sound is the actual difficulty, and naming
 * them first hides it. */

import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { AudioButton } from '@/components/learn/AudioButton';
import { Prose } from '@/components/learn/Blocks';
import type { NikudIntro, NikudSound } from '@/lib/content';

const SOUND_LABEL: Record<string, string> = {
  a: 'o som A', e: 'o som E', i: 'o som I', o: 'o som O', u: 'o som U',
  sheva: 'sem vogal'
};

export function StartHereClient({ sounds, intro }: { sounds: NikudSound[]; intro: NikudIntro }) {
  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Link href="/mapa" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">← Mapa</Link>
        <Badge tone="teal">Comece aqui</Badge>
        <h1 className="text-[27px] sm:text-[34px] font-bold leading-tight">Como o hebraico funciona</h1>
      </header>

      <Card className="p-6 grid gap-4">
        <h2 className="font-display text-[19px] font-semibold">Da direita para a esquerda</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          O hebraico se lê e se escreve da direita para a esquerda. A primeira letra
          de uma palavra é a que está mais à direita — o contrário do português, e é
          a única coisa que você precisa desaprender.
        </p>
        <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
          <He size="xl">שָׁלוֹם</He>
          <p className="font-ui text-[12px] uppercase tracking-[.1em] text-ink-muted">
            ← começa aqui
          </p>
        </div>
      </Card>

      <Card className="p-6 grid gap-4">
        <h2 className="font-display text-[19px] font-semibold">{intro.title}</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          <Prose text={intro.lead} />
        </p>
        {/* The workbook's own correction to the usual "22 letras, todas
            consoantes": four of them double as vowel carriers, and a beginner
            who is not told that hits it on the third lesson and concludes the
            rule was a lie. */}
        <p className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-4">
          <Prose text={intro.correction} />
        </p>
      </Card>

      <section className="grid gap-4">
        <div className="grid gap-1">
          <h2 className="text-[21px] font-bold">Os sinais de vogal</h2>
          <p className="font-ui text-[14px] text-ink-muted max-w-[52ch]">
            Aprenda pelo SOM, não pelo nome. Vários sinais diferentes fazem o mesmo
            som — é essa a dificuldade de verdade, e é ela que este quadro resolve.
          </p>
        </div>

        {sounds.map(s => (
          <Card key={s.sound} className="p-5 grid gap-3">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-[22px] font-bold text-[var(--teal-band)]">
                {s.sound === 'sheva' ? '—' : s.sound}
              </span>
              <span className="font-ui text-[14px] text-ink-muted">{SOUND_LABEL[s.sound] ?? s.sound}</span>
            </div>
            <ul className="grid sm:grid-cols-2 gap-2">
              {s.signs.map(g => (
                <li key={g.demo}
                    className="flex items-center gap-4 rounded-[var(--r-md)] bg-surface-2 px-4 py-3">
                  <He size="lg">{g.demo}</He>
                  <span className="min-w-0 grid gap-0.5">
                    <span className="font-ui text-[14px] text-ink">{g.namePt}</span>
                    <span className="font-ui text-[12.5px] text-ink-muted leading-snug">
                      <Prose text={g.position} />
                    </span>
                  </span>
                  <span className="ml-auto"><AudioButton audioId={g.audioId} label="" size="sm" /></span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>

      <Card tone="wash" className="p-6 grid gap-3">
        <h2 className="font-display text-[18px] font-semibold">Como praticar de verdade</h2>
        <ul className="grid gap-2.5 text-[15px] leading-relaxed text-ink-body">
          <li className="flex gap-3"><span aria-hidden className="text-[var(--teal-band)]">→</span>
            Leia em voz alta. Sempre. Ouvir o próprio som é metade do aprendizado.</li>
          <li className="flex gap-3"><span aria-hidden className="text-[var(--teal-band)]">→</span>
            Pouco e todo dia bate muito de vez em quando.</li>
          <li className="flex gap-3"><span aria-hidden className="text-[var(--teal-band)]">→</span>
            Errar faz parte: o que você erra volta na revisão, no dia certo.</li>
          <li className="flex gap-3"><span aria-hidden className="text-[var(--teal-band)]">→</span>
            Escreva à mão. É o que fixa a forma da letra.</li>
        </ul>
      </Card>

      <LinkButton href="/licao/mem" size="lg" full>Ir para a primeira letra</LinkButton>
    </div>
  );
}
