'use client';

/* O mapa do curso: uma linha do tempo vertical.
 * ─────────────────────────────────────────────────────────────────────────
 * Um marcador por módulo, ligado ao seguinte por um fio, e ao lado um cartão
 * com as letras daquele módulo. O caminho inteiro é visível desde o começo -
 * esconder a estrada é o que faz um curso parecer infinito -, mas o peso é
 * desigual de propósito: o módulo concluído tem o marcador cheio, o atual
 * tem borda teal e barra de progresso, e o que vem tem cadeado e 72% de
 * opacidade.
 *
 * Uma forma só, do telefone ao desktop. Antes eram duas - uma espinha no
 * telefone e um quadro de painéis no desktop -, dois desenhos para o mesmo
 * dado, e cada mudança de conteúdo tinha de ser feita nos dois. Os cartões
 * de letra são uma grade que embrulha sozinha, então a linha do tempo cabe
 * em 390px sem virar outra tela.
 *
 * Nada aqui é bloqueado de verdade: o cadeado diz "você ainda não chegou",
 * não "não pode entrar". Um adulto que quer espiar o módulo 6 pode.
 */

import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { useProgress } from '@/lib/state/store';
import { course, getLetter, type CourseModule } from '@/lib/content';
import { Prose } from '@/components/learn/Blocks';
import { isLessonComplete, STAGE_COUNT } from '@/lib/state/rules';
import { flagship } from '@/lib/catalog';

type Estado = 'feito' | 'agora' | 'adiante';

export function CourseMapClient() {
  const p = useProgress();
  const modulos = course.modules;
  const licoes = modulos.reduce((n, m) => n + m.lessons.length, 0);

  /* O módulo atual é o primeiro que ainda não fechou. */
  const indiceAtual = modulos.findIndex(m => !moduloCompleto(p.state, m));

  return (
    <div className="lg:rounded-[24px] lg:bg-[var(--card)] lg:border lg:border-line lg:shadow-[var(--sh)]
                    lg:p-10 lg:pb-11">
      <header className="flex items-end gap-5 flex-wrap mb-8">
        <div className="flex-1 min-w-[240px]">
          <p className="font-ui text-[13px] font-bold uppercase tracking-[.1em] text-[var(--teal)] mb-2">
            Meu curso
          </p>
          <h1 className="font-display text-[27px] sm:text-[31px] font-semibold leading-[1.1]
                         tracking-[-0.028em] mb-1">
            {flagship().titlePt}
          </h1>
          <p className="font-ui text-[16px] text-ink-muted">
            {modulos.length} módulos · {licoes} lições · {course.totalLetters} letras
          </p>
        </div>
        <p className="text-right">
          <span className="block font-display text-[34px] sm:text-[38px] font-semibold
                           tracking-[-0.03em] leading-none text-[var(--teal)] tabular-nums">
            {Math.round(p.progress * 100)}%
          </span>
          <span className="block font-ui text-[14px] text-ink-muted">concluído</span>
        </p>
      </header>

      <ol className="list-none p-0 m-0">
        {modulos.map((m, i) => {
          const estado: Estado = i < indiceAtual ? 'feito'
            : i === indiceAtual || indiceAtual === -1 ? 'agora'
            : 'adiante';
          return (
            <Trecho key={m.id} module={m} estado={estado} ultimo={i === modulos.length - 1} />
          );
        })}
      </ol>
    </div>
  );
}

function moduloCompleto(state: Parameters<typeof isLessonComplete>[0], m: CourseModule): boolean {
  if (m.letterIds.length === 0) return (state.lessons[m.id]?.stagesDone.length ?? 0) >= 3;
  const letras = m.letterIds.every(id => isLessonComplete(state, id));
  const cp = m.checkpoint ? !!state.checkpoints[m.checkpoint.id]?.passedAt : true;
  return letras && cp;
}

function Trecho({ module: m, estado, ultimo }: {
  module: CourseModule; estado: Estado; ultimo: boolean;
}) {
  const p = useProgress();
  const letras = m.letterIds.map(getLetter).filter(l => !!l);
  const feitas = letras.filter(l => isLessonComplete(p.state, l!.id)).length;
  const extra = letras.length === 0;
  const etapas = extra ? Math.min(3, p.state.lessons[m.id]?.stagesDone.length ?? 0) : feitas;
  const total = extra ? 3 : letras.length;
  const pct = total ? Math.round((etapas / total) * 100) : 0;
  const destino = extra
    ? `/modulo/${m.n}`
    : `/licao/${m.letterIds.find(id => !isLessonComplete(p.state, id)) ?? m.letterIds[0]}`;

  const TAG = {
    feito: { texto: 'Concluído', cor: 'text-[var(--teal-ink)]' },
    agora: { texto: 'Em andamento', cor: 'text-[var(--teal)]' },
    adiante: { texto: 'Em breve', cor: 'text-[#9AA29E]' }
  }[estado];

  return (
    <li className="grid grid-cols-[38px_minmax(0,1fr)] sm:grid-cols-[52px_minmax(0,1fr)] gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        <span
          aria-hidden
          className={`w-[38px] h-[38px] sm:w-11 sm:h-11 rounded-[14px] border-2 grid place-items-center shrink-0
            ${estado === 'feito' ? 'bg-[var(--teal)] border-[var(--teal)]'
              : estado === 'agora' ? 'bg-[var(--card)] border-[var(--teal)]'
              : 'bg-[var(--sand)] border-line'}`}
        >
          {estado === 'feito' && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.6 9.4 7 12.8 14.4 5.4" stroke="#fff" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {estado === 'agora' && <span className="w-[11px] h-[11px] rounded-full bg-[var(--teal)]" />}
          {estado === 'adiante' && (
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <rect x="3.6" y="7.8" width="10.8" height="7.4" rx="2" stroke="var(--locked)" strokeWidth="1.4" />
              <path d="M6.2 7.8V5.9a2.8 2.8 0 0 1 5.6 0v1.9" stroke="var(--locked)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        </span>
        {!ultimo && (
          <span aria-hidden className="flex-1 w-[2px] min-h-[26px]"
                style={{ background: estado === 'feito' ? 'var(--teal)' : 'var(--line)' }} />
        )}
      </div>

      <div className="pb-6 sm:pb-[26px]">
        <Link
          href={destino}
          className={`block rounded-[18px] border p-5 sm:px-6 sm:py-[22px] transition-shadow duration-[250ms]
            hover:shadow-[var(--sh)]
            ${estado === 'agora' ? 'bg-[var(--card)] border-[var(--teal)]'
              : estado === 'adiante' ? 'bg-[#FBFAF7] border-line opacity-[.72]'
              : 'bg-[var(--card)] border-line'}`}
        >
          <div className="flex items-center gap-3.5 flex-wrap mb-2.5">
            <span className={`font-ui text-[12.5px] font-bold uppercase tracking-[.1em] ${TAG.cor}`}>
              {TAG.texto}
            </span>
            <span className="font-ui text-[13.5px] text-ink-muted">
              Módulo {m.n} · {m.lessons.length} {m.lessons.length === 1 ? 'lição' : 'lições'}
            </span>
            <span className="flex-1" />
            {estado !== 'adiante' && (
              <span className="flex items-center gap-2.5 min-w-[150px]">
                <span className="flex-1 h-1.5 rounded-full bg-[var(--sand)] overflow-hidden">
                  <span className="block h-full rounded-full bg-[var(--teal)] transition-[width] duration-500"
                        style={{ width: `${pct}%` }} />
                </span>
                <span className="font-ui text-[13px] font-semibold text-[var(--teal)] tabular-nums">{pct}%</span>
              </span>
            )}
          </div>

          <p className={`font-display text-[19px] sm:text-[21px] font-semibold tracking-[-0.02em] mb-3.5
                         ${estado === 'adiante' ? 'text-ink-muted' : 'text-ink'}`}>
            {m.titlePt}
          </p>

          {extra ? (
            <p className="font-ui text-[14.5px] leading-[1.5] text-ink-muted">
              <Prose text={m.subPt} />
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {letras.map(L => {
                const feita = isLessonComplete(p.state, L!.id);
                const etapasFeitas = p.state.lessons[L!.id]?.stagesDone.length ?? 0;
                const comecada = etapasFeitas > 0 && !feita;
                return (
                  <span
                    key={L!.id}
                    title={`${L!.namePt}${feita ? ' - concluída' : comecada ? ` - ${etapasFeitas} de ${STAGE_COUNT} etapas` : ''}`}
                    className={`min-w-[46px] px-1.5 h-[50px] rounded-[12px] border grid place-items-center gap-px
                      ${feita ? 'bg-[var(--teal-soft)] border-[var(--edge-teal)]'
                        : comecada ? 'bg-[var(--card)] border-[var(--teal)]'
                        : 'bg-[var(--sand)] border-line'}`}
                  >
                    <He size="inline" tone={feita ? 'teal' : estado === 'adiante' ? 'muted' : 'navy'}
                        className="!text-[23px] !leading-[1.1]">
                      {L!.letter}
                    </He>
                    <span className={`font-ui text-[9.5px] tracking-[.04em]
                      ${feita ? 'text-[var(--teal-ink)]' : 'text-ink-muted'}`}>
                      {L!.namePt}
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </Link>
      </div>
    </li>
  );
}

export function CourseMapNotFound() {
  return <p className="font-ui text-[15px] text-ink-muted">Mapa não encontrado.</p>;
}
