'use client';

/* The module opener: what this unit of the teaching plan covers, in which
   lesson, and what the learner will be able to read at the end of it. It is
   the workbook's own module page, and it is where the bridge words live. */

import { somPt } from '@/lib/som-pt';
import { resumoDasLicoes } from '@/lib/resumo-licoes';
import Link from 'next/link';
import { He, HeSeq } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Prose } from '@/components/learn/Blocks';
import { useProgress } from '@/lib/state/store';
import type { CourseModule, Letter } from '@/lib/content';
import { EXTRA_STAGE_COUNT, isLessonComplete } from '@/lib/state/rules';
import { course } from '@/lib/content-publico';
import { missaoDoModulo, textoDoModulo } from '@/lib/content';
import { missaoId } from '@/lib/engine/missao';
import { praticaId } from '@/lib/engine/pratica';
import { ehContraste, idDoSom, soOLadoDoPonto } from '@/lib/sons';

export function ModuleClient({ module: mod, letters }: { module: CourseModule; letters: Letter[] }) {
  const p = useProgress();
  /* A primeira lição por fazer, na ordem do plano: letra ou som. */
  const pendente = mod.lessons.flatMap(ls =>
    ls.som ? [{ href: `/som/${ls.som}`, id: idDoSom(ls.som), rotulo: ehContraste(ls.som) ? 'os três pares' : `o som ${ls.nomePt ?? ls.som}` }]
      : (ls.letters ?? []).map(id => ({ href: `/licao/${id}`, id, rotulo: `a letra ${letters.find(l => l.id === id)?.namePt ?? id}` }))
  ).find(i => !isLessonComplete(p.state, i.id));
  const first = letters.find(l => !isLessonComplete(p.state, l.id)) ?? letters[0];
  const sons = mod.lessons.filter(ls => ls.som);
  const missao = missaoDoModulo(mod.n);
  const missaoFeita = !!p.state.firsts[missaoId(mod.n)];
  /* Só aparece depois de revisado: ver lib/engine/textos.ts. */
  const texto = textoDoModulo(mod.n);
  /* O módulo inteiro feito: letras e sons; no 6 e no 7, as três etapas de /extra. */
  const tudoFeito = !pendente && (letters.length > 0
    || (p.state.lessons[mod.id]?.stagesDone.length ?? 0) >= EXTRA_STAGE_COUNT);
  const cp = mod.checkpoint ? p.state.checkpoints[mod.checkpoint.id] : undefined;
  const passou = !!cp?.passedAt;
  const praticaFeita = !!p.state.firsts[praticaId(mod.n)];
  const proximo = course.modules.find(m => m.n === mod.n + 1);

  /* O checkpoint e a prática focada num cartão só (05/10/2026). Antes o
     checkpoint só aparecia no fim da última lição: quem voltava ao módulo
     não achava a porta. Terminado o módulo, o cartão sobe para o topo. */
  const fecho = (
    <Card tone={tudoFeito ? 'mint' : 'surface'} className="p-6 grid gap-3">
      <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">
        Fechamento do módulo{passou ? ' · checkpoint aprovado ✓' : ''}
      </p>
      <h2 className="font-display text-[18px] font-semibold">
        {passou ? 'Você passou no checkpoint deste módulo'
          : tudoFeito ? 'Você terminou as lições. Agora, o checkpoint.'
          : 'Checkpoint e prática focada'}
      </h2>
      <p className="text-[15px] leading-relaxed text-ink-body">
        {passou && cp?.best != null ? `Sua melhor nota: ${Math.round(cp.best * 100)}%. ` : ''}
        O checkpoint mostra o que já está firme. A prática focada começa pelo que você errou neste módulo,
        sem nenhuma letra nova.
        {!tudoFeito && ' Os dois ficam abertos a qualquer momento, mas rendem mais depois das lições.'}
      </p>
      <div className="flex flex-wrap gap-2">
        {mod.checkpoint && (
          <LinkButton href={`/checkpoint/${mod.n}`} variant={tudoFeito && !passou ? 'primary' : 'secondary'}>
            {passou ? 'Refazer o checkpoint' : 'Fazer o checkpoint'}
          </LinkButton>
        )}
        <LinkButton href={`/modulo/${mod.n}/pratica`} variant="secondary">
          {praticaFeita ? 'Prática focada ✓' : 'Prática focada'}
        </LinkButton>
      </div>
    </Card>
  );

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

      {tudoFeito && fecho}

      <Card className="p-6">
        <p className="text-[16px] leading-relaxed text-ink-body"><Prose text={mod.introPt} /></p>
      </Card>

      <Card className="p-6 grid gap-4">
        <h2 className="font-display text-[18px] font-semibold">As lições</h2>
        {/* Contado dos dados, não escrito à mão: "as três lições" estava no
            módulo 5, que tem sete (auditoria de 01/10/2026, CONT-008). */}
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
          {resumoDasLicoes(mod.lessons)} Estudando sozinho, trate cada lição como uma sessão.
        </p>
        <ol className="grid gap-2">
          {mod.lessons.map(ls => (
            <li key={ls.n} className="flex items-baseline gap-4 py-2 border-t border-[color:var(--line-soft)]">
              <span className="font-ui text-[13px] font-semibold text-ink-muted tabular-nums w-[52px] shrink-0">
                Lição {ls.n}
              </span>
              <span className="text-[15px] text-ink-body">
                {ls.kind === 'practice'
                  ? <Link href={`/modulo/${mod.n}/pratica`} className="underline underline-offset-2 hover:text-ink">
                      Prática: sem letra nova - correção dos seus erros, letras parecidas e leitura em voz alta
                      {praticaFeita ? ' ✓' : ''}
                    </Link>
                  : ls.som
                    ? <Link href={`/som/${ls.som}`} className="underline underline-offset-2 hover:text-ink">
                        {ls.nomePt}: <Prose text={ls.topicPt ?? ''} />
                      </Link>
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
                  <span className="font-ui text-[13px] text-ink-muted">{somPt(soOLadoDoPonto(l).sound)}</span>
                  <span aria-hidden className="ml-auto text-ink-muted">
                    {isLessonComplete(p.state, l.id) ? '✓' : '→'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}


      {/* A missão fecha o módulo com uma situação de verdade, depois do
          checkpoint. Fica aqui, e não só no fim do checkpoint, porque é o
          módulo que ela fecha - e quem voltou para rever acha a porta. */}
      {texto && (
        <Card className="p-6 grid gap-3">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">
            Leitura do módulo · {texto.tipoPt}
          </p>
          <h2 className="font-display text-[18px] font-semibold">{texto.tituloPt}</h2>
          <p className="text-[15px] leading-relaxed text-ink-body">{texto.introPt}</p>
          <LinkButton href={`/modulo/${mod.n}/texto`} variant="secondary" className="justify-self-start">
            Ler o texto
          </LinkButton>
        </Card>
      )}

      {/* A lição de prática (29/09/2026) agora está no cartão do fechamento,
          aberto em todos os módulos. Ver lib/engine/pratica.ts. */}
      {!tudoFeito && fecho}

      {missao && (
        <Card tone={missaoFeita ? 'mint' : 'surface'} className="p-6 grid gap-3">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">
            Missão do módulo{missaoFeita ? ' · cumprida ✓' : ''}
          </p>
          <h2 className="font-display text-[18px] font-semibold">{missao.tituloPt}</h2>
          <p className="text-[15px] leading-relaxed text-ink-body">{missao.situacaoPt}</p>
          <LinkButton href={`/modulo/${mod.n}/missao`} variant="secondary" className="justify-self-start">
            {missaoFeita ? 'Fazer de novo' : 'Fazer a missão'}
          </LinkButton>
        </Card>
      )}

      {sons.length > 0 && (
        <Card className="p-6 grid gap-3">
          <h2 className="font-display text-[18px] font-semibold">Os sons</h2>
          <ul className="grid gap-1">
            {sons.map(ls => {
              const feito = isLessonComplete(p.state, idDoSom(ls.som!));
              return (
                <li key={ls.som}>
                  <Link href={`/som/${ls.som}`}
                        className="flex items-center gap-4 rounded-[var(--r-md)] p-2.5 hover:bg-surface-2">
                    <He size="lg" dim={!feito}>{ls.he ?? ''}</He>
                    <span className="font-ui text-[15px] text-ink">Lição {ls.n}. {ls.nomePt}</span>
                    <span aria-hidden className="ml-auto text-ink-muted">{feito ? '✓' : '→'}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {pendente ? (
        <LinkButton href={pendente.href} size="lg" full>
          {first && pendente.id === first.id ? `Começar pela letra ${first.namePt}` : `Continuar com ${pendente.rotulo}`}
        </LinkButton>
      ) : tudoFeito && mod.checkpoint && !passou ? (
        <LinkButton href={`/checkpoint/${mod.n}`} size="lg" full>
          Fazer o checkpoint do módulo {mod.n}
        </LinkButton>
      ) : tudoFeito && proximo ? (
        <LinkButton href={`/modulo/${proximo.n}`} size="lg" full>
          Seguir para o módulo {proximo.n}
        </LinkButton>
      ) : first ? (
        <LinkButton href={`/licao/${first.id}`} size="lg" full>
          Começar pela letra {first.namePt}
        </LinkButton>
      ) : (
        /* Modules 6 and 7 have no letters - they have their own three-lesson
           route, and without this the opener was a dead end. */
        <LinkButton href={`/extra/${mod.n === 6 ? 'sem-o-ponto' : 'sons-modernos'}`} size="lg" full>
          Começar o módulo {mod.n}
        </LinkButton>
      )}
    </div>
  );
}

