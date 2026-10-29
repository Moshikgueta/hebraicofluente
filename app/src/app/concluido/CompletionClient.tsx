'use client';

/* The end of the course.
 *
 * Two rules from the brief shape this page, and both are about what it does
 * NOT do: nothing here is locked, and nothing here sells. The alphabet course
 * stays open forever, the next level is a door rather than a wall, and there
 * is no countdown, no scarcity and no "oferta". The conversion argument is the
 * course itself. */

import { He, HeSeq } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { AchievementBadge } from '@/components/game/Game';
import { useProgress } from '@/lib/state/store';
import { allLetters, course } from '@/lib/content';
import { ACHIEVEMENTS, isLessonComplete, isLessonMastered, REGRA_DA_CONCLUSAO } from '@/lib/state/rules';
import { CertificateCallout } from '@/app/certificado/CertificadoClient';
import { OfertaProximoCurso } from '@/components/platform/ProximoPasso';
import { fmt } from '@/i18n';
import { YaelDiz } from '@/components/aventura/Yael';
import { tx as falaDaYael } from '@/i18n/telas/aventura-yael';
import { tx } from '@/i18n/telas/painel-completion-client';

export function CompletionClient() {
  const p = useProgress();
  const letters = allLetters();
  /* Uma régua só (UXQA-005): "dominada" é `isLessonMastered`, a mesma que
     abre o exame e o certificado. */
  const mastered = letters.filter(l => isLessonMastered(p.state, l.id));
  const concluidasSemDominio = letters.filter(l => isLessonComplete(p.state, l.id) && !isLessonMastered(p.state, l.id));
  const finished = !!p.state.finalChallenge.completedAt;
  /* A página não afirma o que ainda não aconteceu (UXQA-015): "Você está
     lendo hebraico" e a lista do que se sabe fazer só com o alfabeto inteiro
     dominado. Antes disso, ela mostra onde o aluno está e o que falta. */
  const alfabetoDominado = mastered.length >= course.totalLetters;
  const faltam = letters.filter(l => !isLessonMastered(p.state, l.id));
  const conquistas = new Set(p.state.achievements.map(a => a.id).filter(id => ACHIEVEMENTS.some(d => d.id === id)));

  return (
    <div className="grid gap-6 reading">
      {/* First thing on the page once it exists: it is the thing they came
          back for, and it is the one part of this course that leaves it. */}
      <CertificateCallout />

      <Card tone="mint" className="p-7 sm:p-10 grid gap-5 text-center">
        {alfabetoDominado && (
          <YaelDiz humor="comemora" tamanho={84} className="justify-self-center">{falaDaYael.alfabeto}</YaelDiz>
        )}
        <Badge tone="mint">{finished ? tx.cursoConcluido : tx.ondeEsta}</Badge>
        <h1 className="text-[29px] sm:text-[38px] font-bold leading-[1.15]">
          {finished
            ? tx.consegueLer
            : alfabetoDominado
              ? tx.estaLendo
              : tx.seuCaminho}
        </h1>
        <p className="text-[17px] leading-relaxed text-ink-body max-w-[48ch] mx-auto">
          {alfabetoDominado
            ? tx.semanasAtras
            : `${tx.faltam(faltam.length)} ${REGRA_DA_CONCLUSAO}`}
        </p>
        <div className="py-2">
          <HeSeq items={letters.slice(0, 11).map(l => l.letter)} size="word" sep={null} />
          <div className="mt-2">
            <HeSeq items={letters.slice(11).map(l => l.letter)} size="word" sep={null} />
          </div>
        </div>
        <p className="font-display text-[40px] sm:text-[52px] font-bold tabular-nums text-ink">
          {mastered.length} / {course.totalLetters}
        </p>
        <p className="font-ui text-[13px] text-ink-muted">{tx.licoesConcluidas}</p>
        {!alfabetoDominado && (
          <div className="grid gap-2 justify-items-center">
            {concluidasSemDominio.length > 0 && (
              <p className="font-ui text-[14px] text-ink-body">
                {tx.abaixoDoDominio(concluidasSemDominio.length)}
              </p>
            )}
            <LinkButton href={`/licao/${faltam[0]!.id}`}>
              {isLessonComplete(p.state, faltam[0]!.id)
                ? fmt(tx.refazerDe, { nome: faltam[0]!.namePt })
                : fmt(tx.irParaLetra, { nome: faltam[0]!.namePt })}
            </LinkButton>
          </div>
        )}
      </Card>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          [tx.xpAcumulado, p.state.xp.toLocaleString(tx.localeDosNumeros)],
          [tx.maiorSequencia, fmt(tx.dias, { n: p.state.streak.longest })],
          [tx.conquistas, fmt(tx.conquistasDe, { n: conquistas.size, total: ACHIEVEMENTS.length })]
        ].map(([k, v]) => (
          <Card key={k} className="p-5 grid gap-1">
            <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">{k}</p>
            <p className="font-display text-[24px] font-bold text-ink tabular-nums">{v}</p>
          </Card>
        ))}
      </div>

      {p.state.achievements.length > 0 && (
        <section className="grid gap-3">
          <h2 className="font-display text-[18px] font-semibold">{tx.desbloqueou}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {p.state.achievements.map(a => (
              <AchievementBadge key={a.id} id={a.id} compact />
            ))}
          </div>
        </section>
      )}

      {alfabetoDominado && (
      <Card className="p-6 grid gap-3">
        <h2 className="font-display text-[18px] font-semibold">{tx.sabeFazer}</h2>
        <ul className="grid gap-2.5 text-[15px] leading-relaxed text-ink-body">
          {[
            tx.sabe1,
            tx.sabe2,
            tx.sabe3,
            tx.sabe4(<He size="inline">ספר</He>, <He size="inline">בית</He>, <He size="inline">שלום</He>),
            tx.sabe5,
            tx.sabe6
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden className="text-[var(--green)]">✓</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Card>
      )}

      {/* "E depois?" vem do catálogo e some sozinho para quem já comprou o
          curso seguinte - o botão daqui era fixo no A1 e não levava a lugar
          nenhum. A lista do que o próximo nível entrega mora em
          data/courses.json, junto do preço que o checkout cobra. */}
      <OfertaProximoCurso />

      <Card className="p-6 grid gap-3 justify-items-start">
        <p className="font-ui text-[15px] leading-relaxed text-ink-body">
          {tx.continuaAberto}
        </p>
        <LinkButton href="/mapa" variant="secondary">
          {tx.continuarRevisando}
        </LinkButton>
      </Card>
    </div>
  );
}
