'use client';

/* The module opener: what this unit of the teaching plan covers, in which
   lesson, and what the learner will be able to read at the end of it. It is
   the workbook's own module page, and it is where the bridge words live. */

import { tx } from '@/i18n/telas/licao-module-client';
import { GravacaoDoProfessor } from '@/components/learn/GravacaoDoProfessor';
import { somPt } from '@/lib/som-pt';
import { resumoDasLicoes } from '@/lib/resumo-licoes';
import Link from 'next/link';
import { He, HeSeq } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Prose } from '@/components/learn/Blocks';
import { useMemo } from 'react';
import { useProgress } from '@/lib/state/store';
import type { CourseModule, Letter } from '@/lib/content';
import { EXTRA_STAGE_COUNT, isLessonComplete } from '@/lib/state/rules';
import { course } from '@/lib/content-publico';
import { allLetters, extras, missaoDoModulo, revisaoDoModulo, segundoTextoDoModulo, textoDoModulo } from '@/lib/content';
import { CenaExploravel } from '@/components/aventura/CenaExploravel';
import { textoLidoId } from '@/lib/engine/textos';
import { missaoId } from '@/lib/engine/missao';
import { praticaId } from '@/lib/engine/pratica';
import { ehContraste, idDoSom, soOLadoDoPonto } from '@/lib/sons';

export function ModuleClient({ module: mod, letters }: { module: CourseModule; letters: Letter[] }) {
  const p = useProgress();
  /* A primeira lição por fazer, na ordem do plano: letra ou som. */
  const pendente = mod.lessons.flatMap(ls =>
    ls.som ? [{ href: `/som/${ls.som}`, id: idDoSom(ls.som), rotulo: ehContraste(ls.som) ? tx.osTresPares : tx.oSom(ls.nomePt ?? ls.som) }]
      : (ls.letters ?? []).map(id => ({ href: `/licao/${id}`, id, rotulo: tx.aLetra(letters.find(l => l.id === id)?.namePt ?? id) }))
  ).find(i => !isLessonComplete(p.state, i.id));
  const first = letters.find(l => !isLessonComplete(p.state, l.id)) ?? letters[0];
  const sons = mod.lessons.filter(ls => ls.som);
  const missao = missaoDoModulo(mod.n);
  const missaoFeita = !!p.state.firsts[missaoId(mod.n)];
  /* Só aparece depois de revisado: ver lib/engine/textos.ts. */
  const texto = textoDoModulo(mod.n);
  const revisao = revisaoDoModulo(mod.n);
  const segundo = segundoTextoDoModulo(mod.n);
  const segundoLido = !!p.state.firsts[textoLidoId(mod.n, false, 2)];
  const revisaoLida = !!p.state.firsts[textoLidoId(mod.n, true)];
  /* O módulo inteiro feito: letras e sons; no 6 e no 7, as três etapas de /extra. */
  const tudoFeito = !pendente && (letters.length > 0
    || (p.state.lessons[mod.id]?.stagesDone.length ?? 0) >= EXTRA_STAGE_COUNT);
  const cp = mod.checkpoint ? p.state.checkpoints[mod.checkpoint.id] : undefined;
  const passou = !!cp?.passedAt;
  const praticaFeita = !!p.state.firsts[praticaId(mod.n)];
  const proximo = course.modules.find(m => m.n === mod.n + 1);
  const todas = allLetters();
  const comecadas = useMemo(
    () => todas.filter(l => (p.state.lessons[l.id]?.stagesDone.length ?? 0) > 0),
    [todas, p.state.lessons]
  );
  const modulosComecados = useMemo(
    () => course.modules.filter(m => !m.letterIds.length && (p.state.lessons[m.id]?.stagesDone.length ?? 0) > 0).map(m => m.n),
    [p.state.lessons]
  );

  /* O checkpoint e a prática focada num cartão só (05/10/2026). Antes o
     checkpoint só aparecia no fim da última lição: quem voltava ao módulo
     não achava a porta. Terminado o módulo, o cartão sobe para o topo. */
  const fecho = (
    <Card tone={tudoFeito ? 'mint' : 'surface'} className="p-6 grid gap-3">
      <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">
        {tx.fechamento}{passou ? tx.aprovado : ''}
      </p>
      <h2 className="font-display text-[18px] font-semibold">
        {passou ? tx.passou
          : tudoFeito ? tx.terminou
          : tx.checkpointEPratica}
      </h2>
      <p className="text-[15px] leading-relaxed text-ink-body">
        {passou && cp?.best != null ? tx.melhorNota(Math.round(cp.best * 100)) : ''}
        {tx.oCheckpointMostra}
        {!tudoFeito && tx.abertos}
      </p>
      <div className="flex flex-wrap gap-2">
        {/* No topo, depois de tudo feito, a leitura de revisão vem junto. */}
        {revisao && tudoFeito && (
          <LinkButton href={`/modulo/${mod.n}/revisao`} variant="secondary">
            {revisaoLida ? tx.leituraDeRevisaoFeita : tx.leituraDeRevisao}
          </LinkButton>
        )}
        {mod.checkpoint && (
          <LinkButton href={`/checkpoint/${mod.n}`} variant={tudoFeito && !passou ? 'primary' : 'secondary'}>
            {passou ? tx.refazerCheckpoint : tx.fazerCheckpoint}
          </LinkButton>
        )}
        <LinkButton href={`/modulo/${mod.n}/pratica`} variant="secondary">
          {praticaFeita ? tx.praticaFeita : tx.pratica}
        </LinkButton>
      </div>
    </Card>
  );

  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Link href="/mapa" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">{tx.mapa}</Link>
        <Badge tone="accent">{tx.moduloDe(mod.n)}</Badge>
        <h1 className="text-[27px] sm:text-[34px] font-bold leading-tight">{mod.titlePt}</h1>
        <p className="font-ui text-[15px] text-ink-muted"><Prose text={mod.subPt} /></p>
        {letters.length > 0 && (
          <div className="pt-2"><HeSeq items={letters.map(l => l.letter)} size="lg" /></div>
        )}
      </header>

      {tudoFeito && fecho}

      <Card className="p-6">
        <p className="text-[16px] leading-relaxed text-ink-body"><Prose text={mod.introPt} /></p>
        <GravacaoDoProfessor id={`module-${mod.n}-welcome`} />
      </Card>

      <CenaExploravel modulo={mod.n} todas={todas} comecadas={comecadas} extras={extras()} modulosComecados={modulosComecados} />

      <Card className="p-6 grid gap-4">
        <h2 className="font-display text-[18px] font-semibold">{tx.asLicoes}</h2>
        {/* Contado dos dados, não escrito à mão: "as três lições" estava no
            módulo 5, que tem sete (auditoria de 01/10/2026, CONT-008). */}
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
          {resumoDasLicoes(mod.lessons)} {tx.sozinho}
        </p>
        <ol className="grid gap-2">
          {mod.lessons.map(ls => (
            <li key={ls.n} className="flex items-baseline gap-4 py-2 border-t border-[color:var(--line-soft)]">
              <span className="font-ui text-[13px] font-semibold text-ink-muted tabular-nums w-[52px] shrink-0">
                {tx.licao(ls.n)}
              </span>
              <span className="text-[15px] text-ink-body">
                {ls.kind === 'practice'
                  ? <Link href={`/modulo/${mod.n}/pratica`} className="underline underline-offset-2 hover:text-ink">
                      {tx.praticaSemLetra}
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
        <h2 className="font-display text-[18px] font-semibold">{tx.aoTerminar}</h2>
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
          <h2 className="font-display text-[18px] font-semibold">{tx.asLetras}</h2>
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
      {/* A leitura de revisão (05/10/2026): só palavras que o aluno já leu
          nas lições, para ler corrido antes do checkpoint. */}
      {revisao && (
        <Card tone={revisaoLida ? 'mint' : 'surface'} className="p-6 grid gap-3">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">
            {tx.revisaoTipo(revisao.tipoPt)}{revisaoLida ? tx.lida : ''}
          </p>
          <h2 className="font-display text-[18px] font-semibold">{revisao.tituloPt}</h2>
          <p className="text-[15px] leading-relaxed text-ink-body"><Prose text={revisao.introPt} /></p>
          <LinkButton href={`/modulo/${mod.n}/revisao`} variant="secondary" className="justify-self-start">
            {revisaoLida ? tx.lerDeNovo : tx.lerRevisao}
          </LinkButton>
        </Card>
      )}

      {texto && (
        <Card className="p-6 grid gap-3">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">
            {tx.leituraTipo(texto.tipoPt)}
          </p>
          <h2 className="font-display text-[18px] font-semibold">{texto.tituloPt}</h2>
          <p className="text-[15px] leading-relaxed text-ink-body"><Prose text={texto.introPt} /></p>
          <LinkButton href={`/modulo/${mod.n}/texto`} variant="secondary" className="justify-self-start">
            {tx.lerTexto}
          </LinkButton>
        </Card>
      )}

      {/* O segundo texto do módulo (28/10/2026). */}
      {segundo && (
        <Card tone={segundoLido ? 'mint' : 'surface'} className="p-6 grid gap-3">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">
            {tx.segundaLeituraTipo(segundo.tipoPt)}{segundoLido ? tx.lida : ''}
          </p>
          <h2 className="font-display text-[18px] font-semibold">{segundo.tituloPt}</h2>
          <p className="text-[15px] leading-relaxed text-ink-body"><Prose text={segundo.introPt} /></p>
          <LinkButton href={`/modulo/${mod.n}/texto-2`} variant="secondary" className="justify-self-start">
            {segundoLido ? tx.lerDeNovo : tx.lerTexto}
          </LinkButton>
        </Card>
      )}

      {/* A lição de prática (29/09/2026) agora está no cartão do fechamento,
          aberto em todos os módulos. Ver lib/engine/pratica.ts. */}
      {!tudoFeito && fecho}

      {missao && (
        <Card tone={missaoFeita ? 'mint' : 'surface'} className="p-6 grid gap-3">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">
            {tx.missaoDoModulo}{missaoFeita ? tx.cumprida : ''}
          </p>
          <h2 className="font-display text-[18px] font-semibold">{missao.tituloPt}</h2>
          <p className="text-[15px] leading-relaxed text-ink-body">{missao.situacaoPt}</p>
          <LinkButton href={`/modulo/${mod.n}/missao`} variant="secondary" className="justify-self-start">
            {missaoFeita ? tx.fazerDeNovo : tx.fazerMissao}
          </LinkButton>
        </Card>
      )}

      {sons.length > 0 && (
        <Card className="p-6 grid gap-3">
          <h2 className="font-display text-[18px] font-semibold">{tx.osSons}</h2>
          <ul className="grid gap-1">
            {sons.map(ls => {
              const feito = isLessonComplete(p.state, idDoSom(ls.som!));
              return (
                <li key={ls.som}>
                  <Link href={`/som/${ls.som}`}
                        className="flex items-center gap-4 rounded-[var(--r-md)] p-2.5 hover:bg-surface-2">
                    <He size="lg" dim={!feito}>{ls.he ?? ''}</He>
                    <span className="font-ui text-[15px] text-ink">{tx.licao(ls.n)}. {ls.nomePt}</span>
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
          {first && pendente.id === first.id ? tx.comecarPelaLetra(first.namePt) : tx.continuarCom(pendente.rotulo)}
        </LinkButton>
      ) : tudoFeito && mod.checkpoint && !passou ? (
        <LinkButton href={`/checkpoint/${mod.n}`} size="lg" full>
          {tx.checkpointDoModulo(mod.n)}
        </LinkButton>
      ) : tudoFeito && proximo ? (
        <LinkButton href={`/modulo/${proximo.n}`} size="lg" full>
          {tx.seguir(proximo.n)}
        </LinkButton>
      ) : first ? (
        <LinkButton href={`/licao/${first.id}`} size="lg" full>
          {tx.comecarPelaLetra(first.namePt)}
        </LinkButton>
      ) : (
        /* Modules 6 and 7 have no letters - they have their own three-lesson
           route, and without this the opener was a dead end. */
        <LinkButton href={`/extra/${mod.n === 6 ? 'sem-o-ponto' : 'sons-modernos'}`} size="lg" full>
          {tx.comecarModulo(mod.n)}
        </LinkButton>
      )}
    </div>
  );
}

