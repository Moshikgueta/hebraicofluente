'use client';

/* Os exercícios de uma unidade do A1. Antes de tudo, o gênero (decisão 9):
   sem ele, a escrita livre não sabe que forma lembrar. No fim, a nota, que
   conclui a unidade a partir de 70% (a régua dos checkpoints). */

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LinkButton, Button } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { A1Player, type ResultadoA1 } from '@/components/a1/A1Player';
import { GeneroA1 } from '@/components/a1/GeneroA1';
import { useProgress } from '@/lib/state/store';
import { proximaUnidade, unidadeA1 } from '@/lib/a1';
import { A1_APROVA } from '@/lib/state/a1-estado';

export function ExerciciosA1Client({ n }: { n: number }) {
  const p = useProgress();
  const u = unidadeA1(n);
  const [rodada, setRodada] = useState(0);
  const [fim, setFim] = useState<ResultadoA1 | null>(null);
  if (!u) notFound();
  const genero = p.state.a1.genero?.valor ?? null;

  const voltar = (
    <Link href={`/a1/unidade/${n}`} className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
      ← Unidade {n}
    </Link>
  );

  if (!genero) {
    return <div className="focus-col grid gap-4">{voltar}<GeneroA1 /></div>;
  }

  if (fim) {
    const passou = fim.nota >= A1_APROVA;
    const pct = Math.round(fim.nota * 100);
    const prox = proximaUnidade(n);
    return (
      <div className="focus-col grid gap-5">
        <Milestone yael={false}
          tone={passou ? 'bom' : 'parcial'}
          kicker={`Unidade ${n} · ${fim.certas} de ${fim.total} na primeira tentativa (${pct}%)`}
          title={fim.nota >= 0.85 ? 'Você domina esta unidade.' : passou ? 'Unidade concluída.' : 'Quase lá.'}
          body={passou
            ? 'Cada questão errada voltou até você acertar. Quando quiser, faça de novo: a ordem muda.'
            : 'A unidade conta como concluída a partir de 70%. Releia a gramática e o diálogo, e tente de novo.'}
        >
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={() => { setFim(null); setRodada(r => r + 1); }}>Fazer de novo</Button>
            {passou && prox != null
              ? <LinkButton href={`/a1/unidade/${prox}`}>Próxima unidade</LinkButton>
              : <LinkButton href={`/a1/unidade/${n}`} variant={passou ? 'primary' : 'secondary'}>Voltar à unidade</LinkButton>}
          </div>
        </Milestone>
        <LinkButton href="/a1" variant="ghost" className="justify-self-center">Ver todas as unidades</LinkButton>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="focus-col">{voltar}</div>
      <A1Player
        key={rodada}
        itens={u.exercicios}
        prefixo={`a1-u${n}-r${rodada}`}
        genero={genero}
        titulo={`Unidade ${n} · exercícios`}
        onItem={(_, item, certo) => p.responderItemA1(n, item, certo)}
        onDone={r => { p.finishUnidadeA1(n, r.nota); setFim(r); }}
      />
    </div>
  );
}
