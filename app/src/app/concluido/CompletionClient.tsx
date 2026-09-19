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
import { isLessonComplete } from '@/lib/state/rules';
import { track } from '@/lib/analytics';
import { CertificateCallout } from '@/app/certificado/CertificadoClient';

const A1_SKILLS = [
  'Apresentação pessoal', 'Perguntas básicas', 'Verbos essenciais',
  'Situações do dia a dia', 'Conversação', 'Compreensão'
];

export function CompletionClient() {
  const p = useProgress();
  const letters = allLetters();
  const mastered = letters.filter(l => isLessonComplete(p.state, l.id));
  const finished = !!p.state.finalChallenge.completedAt;

  return (
    <div className="grid gap-6 reading">
      {/* First thing on the page once it exists: it is the thing they came
          back for, and it is the one part of this course that leaves it. */}
      <CertificateCallout />

      <Card tone="mint" className="p-7 sm:p-10 grid gap-5 text-center">
        <Badge tone="mint">{finished ? 'Curso concluído' : 'Onde você está'}</Badge>
        <h1 className="text-[29px] sm:text-[38px] font-bold leading-[1.15]">
          {finished
            ? 'Agora você consegue ler hebraico.'
            : 'Você está lendo hebraico.'}
        </h1>
        <p className="text-[17px] leading-relaxed text-ink-body max-w-[48ch] mx-auto">
          Há algumas semanas isto era um conjunto de símbolos.
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
        <p className="font-ui text-[13px] text-ink-muted">letras dominadas</p>
      </Card>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          ['XP acumulado', p.state.xp.toLocaleString('pt-BR')],
          ['Maior sequência', `${p.state.streak.longest} dias`],
          ['Conquistas', `${p.state.achievements.length} de 11`]
        ].map(([k, v]) => (
          <Card key={k} className="p-5 grid gap-1">
            <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">{k}</p>
            <p className="font-display text-[24px] font-bold text-ink tabular-nums">{v}</p>
          </Card>
        ))}
      </div>

      {p.state.achievements.length > 0 && (
        <section className="grid gap-3">
          <h2 className="font-display text-[18px] font-semibold">O que você desbloqueou</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {p.state.achievements.map(a => (
              <AchievementBadge key={a.id} id={a.id} compact />
            ))}
          </div>
        </section>
      )}

      <Card className="p-6 grid gap-3">
        <h2 className="font-display text-[18px] font-semibold">O que você sabe fazer agora</h2>
        <ul className="grid gap-2.5 text-[15px] leading-relaxed text-ink-body">
          {[
            'Reconhecer as 22 letras, impressas e em cursiva',
            'Reconhecer as cinco formas finais de relance',
            'Ler palavras vocalizadas com os sinais que o curso ensinou',
            <>Ler sem nikud, do jeito que aparece na rua — <He size="inline">ספר</He>, <He size="inline">בית</He>, <He size="inline">שלום</He></>,
            'Escrever as letras à mão, na direção certa',
            'Pronunciar os sons que o português não tem, sem trocá-los'
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden className="text-[var(--green)]">✓</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="wash" className="p-6 sm:p-8 grid gap-4">
        <Badge tone="accent">Hebraico A1</Badge>
        <h2 className="text-[22px] font-bold leading-snug">
          Você aprendeu a ler. Agora está pronto para começar a entender e falar.
        </h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-[15px] leading-relaxed text-ink-body">
          {A1_SKILLS.map(s => (
            <li key={s} className="flex gap-3">
              <span aria-hidden className="text-[var(--accent)]">→</span>{s}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3 pt-1">
          <LinkButton href="/mapa" variant="secondary">
            Continuar revisando
          </LinkButton>
          <button
            type="button"
            onClick={() => track('next_course_clicked')}
            className="inline-flex items-center justify-center min-h-[48px] px-5 rounded-[var(--r-md)]
                       bg-[var(--accent)] text-white font-ui font-medium text-[15px]"
          >
            Conhecer o próximo nível
          </button>
        </div>
        <p className="font-ui text-[12.5px] text-ink-muted">
          O curso de alfabetização continua aberto, sem prazo. Nada aqui é bloqueado.
        </p>
      </Card>
    </div>
  );
}
