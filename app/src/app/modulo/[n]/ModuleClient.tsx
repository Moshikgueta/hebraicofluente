'use client';

/* The module opener: what this unit of the teaching plan covers, in which
   lesson, and what the learner will be able to read at the end of it. It is
   the workbook's own module page, and it is where the bridge words live. */

import Link from 'next/link';
import { He, HeSeq } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Prose, WorkbookLink } from '@/components/learn/Blocks';
import { useProgress } from '@/lib/state/store';
import type { CourseModule, Letter } from '@/lib/content';
import { isLessonComplete } from '@/lib/state/rules';

export function ModuleClient({ module: mod, letters }: { module: CourseModule; letters: Letter[] }) {
  const p = useProgress();
  const first = letters.find(l => !isLessonComplete(p.state, l.id)) ?? letters[0];

  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Link href="/mapa" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">← Mapa</Link>
        <Badge tone="accent">Módulo {mod.n} de 7</Badge>
        <h1 className="text-[27px] sm:text-[34px] font-bold leading-tight">{mod.titlePt}</h1>
        <p className="font-ui text-[15px] text-ink-muted"><Prose text={mod.subPt} /></p>
        {letters.length > 0 && (
          <div className="pt-2"><HeSeq items={letters.map(l => l.letter)} size="lg" /></div>
        )}
      </header>

      <Card className="p-6">
        <p className="text-[16px] leading-relaxed text-ink-body"><Prose text={mod.introPt} /></p>
      </Card>

      <Card className="p-6 grid gap-4">
        <h2 className="font-display text-[18px] font-semibold">As três lições</h2>
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
          Este módulo corresponde a uma unidade do plano de aulas: duas lições com
          conteúdo novo e uma terceira de prática. Estudando sozinho, trate cada
          lição como uma sessão — e não pule a terceira.
        </p>
        <ol className="grid gap-2">
          {mod.lessons.map(ls => (
            <li key={ls.n} className="flex items-baseline gap-4 py-2 border-t border-[color:var(--line-soft)]">
              <span className="font-ui text-[13px] font-semibold text-ink-muted tabular-nums w-[52px] shrink-0">
                Lição {ls.n}
              </span>
              <span className="text-[15px] text-ink-body">
                {ls.kind === 'practice'
                  ? 'Sem letra nova — jogos, correção e leitura em voz alta.'
                  : ls.letters?.length
                    ? ls.letters.map(id => letters.find(l => l.id === id))
                        .filter((l): l is Letter => !!l)
                        .map(l => l.namePt).join(' · ')
                    : ls.topicPt ? <Prose text={ls.topicPt} /> : ''}
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Card tone="wash" className="p-6 grid gap-3">
        <h2 className="font-display text-[18px] font-semibold">Ao terminar este módulo</h2>
        <ul className="grid gap-2">
          {mod.goalsPt.map((g, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-body">
              <span aria-hidden className="text-[var(--accent)] pt-0.5">✓</span>
              <span><Prose text={g} /></span>
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="mint" className="p-6">
        <p className="text-[16px] leading-relaxed text-ink"><Prose text={mod.milestonePt} /></p>
      </Card>

      {letters.length > 0 && (
        <Card className="p-6 grid gap-3">
          <h2 className="font-display text-[18px] font-semibold">As letras</h2>
          <ul className="grid gap-1">
            {letters.map(l => (
              <li key={l.id}>
                <Link href={`/licao/${l.id}`}
                      className="flex items-center gap-4 rounded-[var(--r-md)] p-2.5 hover:bg-surface-2">
                  <He size="lg" dim={!isLessonComplete(p.state, l.id)}>{l.letter}</He>
                  <span className="font-ui text-[15px] text-ink">{l.order}. {l.namePt}</span>
                  <span className="font-ui text-[13px] text-ink-muted">{l.sound}</span>
                  <span aria-hidden className="ml-auto text-ink-muted">
                    {isLessonComplete(p.state, l.id) ? '✓' : '→'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <WorkbookLink pages={mod.workbookPages} what="este módulo" />

      {first ? (
        <LinkButton href={`/licao/${first.id}`} size="lg" full>
          Começar pela letra {first.namePt}
        </LinkButton>
      ) : (
        /* Modules 6 and 7 have no letters — they have their own three-lesson
           route, and without this the opener was a dead end. */
        <LinkButton href={`/extra/${mod.n === 6 ? 'sem-o-ponto' : 'sons-modernos'}`} size="lg" full>
          Começar o módulo {mod.n}
        </LinkButton>
      )}
    </div>
  );
}
