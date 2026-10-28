'use client';

import { Card } from '@/components/ui/Card';
import { AchievementBadge, ProgressBar } from '@/components/game/Game';
import { useProgress } from '@/lib/state/store';
import { ACHIEVEMENTS, isLessonComplete, isLessonMastered } from '@/lib/state/rules';
import { CartaDaLetra, type EstadoDaCarta } from '@/components/aventura/CartaDaLetra';
import { Diario } from '@/components/aventura/Diario';
import { Yael } from '@/components/aventura/Yael';
import { useMemo } from 'react';
import { allLetters, course, cultureCards, cultureUnlocked } from '@/lib/content';
import Link from 'next/link';
import { cartasCompradas, saldo } from '@/lib/loja';
import { CompartilharConquista } from '@/components/learn/CompartilharConquista';
import { podeCompartilhar } from '@/lib/compartilhar';
import { tx } from '@/i18n/telas/academia-achievements-client';
import { ContadorDeLeitura } from '@/components/learn/ContadorDeLeitura';
import { CartaoMeuNome } from '@/components/learn/MeuNome';
import { AntesEDepois } from '@/components/platform/AntesEDepois';
import { CartaoSemana } from '@/components/platform/Painel';
import { CartaoDominio } from '@/components/platform/CartaoDominio';

export function AchievementsClient() {
  const p = useProgress();
  const have = new Set(p.state.achievements.map(a => a.id));
  const colecao = useMemo(() => {
    const cartas = [...allLetters()].sort((a, b) => a.order - b.order).map(letter => ({
      letter,
      estado: (isLessonMastered(p.state, letter.id) ? 'dominada'
        : isLessonComplete(p.state, letter.id) ? 'concluida' : 'adiante') as EstadoDaCarta
    }));
    return { cartas, ganhas: cartas.filter(c => c.estado !== 'adiante').length };
  }, [p.state]);

  return (
    <div className="grid gap-6">
      {/* "Seu progresso", e não "Conquistas" (28/10/2026): o botão que traz
          aqui se chama Progresso, e a página abria com 17 cartões trancados,
          deixando os números do aluno lá embaixo. Agora vêm os números, e nas
          conquistas as ganhas antes das que faltam. */}
      <h1 className="text-[27px] sm:text-[33px] font-bold">{tx.titulo}</h1>

      <Card className="p-5 grid gap-3">
        <h2 className="font-display text-[17px] font-semibold">{tx.seusNumeros}</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            [tx.xp, p.state.xp],
            [tx.letras, `${p.mastered}/${course.totalLetters}`],
            [tx.sequencia, p.streak],
            [tx.recorde, p.state.streak.longest]
          ].map(([k, v]) => (
            <div key={String(k)} className="grid gap-0.5">
              <dt className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">{k}</dt>
              <dd className="font-display text-[22px] font-bold text-ink tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Vieram do painel (28/10/2026, painel mais curto): o domínio por
          habilidade, as palavras que o aluno lê, o antes e depois, a semana e
          o nome. Cada um some sozinho enquanto não tem o que mostrar. */}
      <CartaoDominio />
      {Object.values(p.state.lessons).some(l => (l?.stagesDone.length ?? 0) >= 5) && <ContadorDeLeitura />}
      <AntesEDepois />
      <CartaoSemana />
      <CartaoMeuNome />

      {/* O Diário de descobertas (28/10/2026, master prompt 3.0): o que o
          aluno fez, com a data, os lugares visitados e as palavras que lê. */}
      <Diario state={p.state} letras={allLetters()} modulos={course.modules}
              comecadas={allLetters().filter(l => (p.state.lessons[l.id]?.stagesDone.length ?? 0) > 0)} />

      {/* A coleção de letras (28/10/2026, a aventura ilustrada): o alfabeto
          que o aluno montou, na ordem do curso. A carta ganha leva à lição
          da letra, para rever. */}
      <section id="colecao" aria-labelledby="t-colecao" className="grid gap-3 scroll-mt-20">
        <div className="grid gap-2">
          <div className="flex items-end justify-between gap-3">
            <h2 id="t-colecao" className="font-display text-[17px] font-semibold">{tx.colecao}</h2>
            {/* A Yael, a companheira da aventura, guarda a coleção. */}
            <Yael className="w-[64px] -mb-1 shrink-0" />
          </div>
          <ProgressBar value={colecao.ganhas / Math.max(1, colecao.cartas.length)}
                       label={tx.deTotal(colecao.ganhas, colecao.cartas.length)} />
          <p className="m-0 font-ui text-[13.5px] text-ink-muted">
            {tx.colecaoTexto}
          </p>
        </div>
        <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 list-none p-0 m-0">
          {colecao.cartas.map(c => (
            <li key={c.letter.id}>
              <CartaDaLetra letter={c.letter} estado={c.estado} href={`/licao/${c.letter.id}`} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="t-conquistas" className="grid gap-3">
        <div className="grid gap-2">
          <h2 id="t-conquistas" className="font-display text-[17px] font-semibold">{tx.conquistas}</h2>
          <ProgressBar
            value={ACHIEVEMENTS.length ? have.size / ACHIEVEMENTS.length : 0}
            label={tx.deTotal(have.size, ACHIEVEMENTS.length)}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[...ACHIEVEMENTS].sort((a, b) => Number(have.has(b.id)) - Number(have.has(a.id))).map(a => (
            <div key={a.id} className="grid gap-2 content-start">
              <AchievementBadge id={a.id} unlocked={have.has(a.id)} />
              {/* Só a conquista feita, e só a que tem frase (lib/compartilhar.ts). */}
              {have.has(a.id) && podeCompartilhar(a.id) && (
                <CompartilharConquista id={a.id} variant="quiet"
                  quando={p.state.achievements.find(x => x.id === a.id)?.unlockedAt} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* The other kind of unlock: not a badge for doing something, a card
          worth reading. Kept next to the badges because both are the part of
          the course that is not work. */}
      <Link
        href="/historia"
        className="flex items-center justify-between gap-4 rounded-[var(--r-md)] border
                   border-line bg-surface px-4 py-3.5 hover:bg-surface-2 transition-colors"
      >
        <span className="grid gap-0.5 min-w-0">
          <span className="font-ui text-[14.5px] font-medium text-ink">
            {tx.viagem}
          </span>
          <span className="font-ui text-[12.5px] text-ink-muted">
            {tx.cartasAbertas(cultureUnlocked(p.mastered).length + cultureCards().filter(c => c.unlockAt > p.mastered && cartasCompradas(p.state).has(c.id)).length, cultureCards().length)}
          </span>
        </span>
        <span aria-hidden className="text-ink-muted">→</span>
      </Link>

      <Link
        href="/loja"
        className="flex items-center justify-between gap-4 rounded-[var(--r-md)] border
                   border-line bg-surface px-4 py-3.5 hover:bg-surface-2 transition-colors"
      >
        <span className="grid gap-0.5 min-w-0">
          <span className="font-ui text-[14.5px] font-medium text-ink">{tx.recompensas}</span>
          <span className="font-ui text-[12.5px] text-ink-muted">
            {tx.saldo(saldo(p.state).toLocaleString(tx.localeNumero))}
          </span>
        </span>
        <span aria-hidden className="text-ink-muted">→</span>
      </Link>

      <Card className="p-5 grid gap-3">
        <h2 className="font-display text-[17px] font-semibold">{tx.recomecar}</h2>
        {/* "Da conta" e não "deste navegador": agora o apagar também limpa o
            servidor, e prometer menos do que o botão faz é pior do que o
            contrário - a pessoa acharia que o progresso volta noutro
            aparelho. */}
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted max-w-[52ch]">
          {tx.recomecarTexto}
        </p>
        <button
          type="button"
          onClick={() => { if (confirm(tx.confirmarApagar)) p.reset(); }}
          className="justify-self-start min-h-[44px] px-4 rounded-[var(--r-md)] border border-line
                     font-ui text-[14px] text-ink-muted hover:text-ink hover:bg-surface-2"
        >
          {tx.apagar}
        </button>
      </Card>
    </div>
  );
}
