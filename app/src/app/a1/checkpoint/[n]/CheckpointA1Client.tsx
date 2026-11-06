'use client';

/* Um checkpoint do A1: uma rodada que MISTURA as unidades de vários módulos.
 * ─────────────────────────────────────────────────────────────────────────
 * Não é a última unidade de novo: os itens saem sorteados de todas as
 * unidades do checkpoint, na mesma proporção, e embaralhados entre si. Assim
 * não basta lembrar da aula de ontem. 20 itens, aprova com 70% (a régua de
 * sempre), tentativas livres, e cada tentativa é outro sorteio. O relatório
 * aponta as unidades onde os erros se juntaram. */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { A1Player } from '@/components/a1/A1Player';
import { hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { useProgress } from '@/lib/state/store';
import { rng, shuffled } from '@/lib/engine/rng';
import { cursoA1, indiceDeItens, type ItemLocalizado } from '@/lib/a1';
import { A1_APROVA } from '@/lib/state/a1-estado';

const TAMANHO = 20;

export function CheckpointA1Client({ n }: { n: number }) {
  const p = useProgress();
  useRegistroDeAudio();
  const cp = cursoA1().checkpoints.find(c => c.n === n);
  const [rodada, setRodada] = useState<{ semente: string; itens: ItemLocalizado[] } | null>(null);
  const [fim, setFim] = useState<{ nota: number; certas: number; total: number; erros: Record<number, number> } | null>(null);
  const [erros, setErros] = useState<Record<number, number>>({});
  const indice = indiceDeItens();
  const registro = p.state.a1.checkpoints[String(n)];

  const porUnidade = useMemo(() => {
    const m = new Map<number, ItemLocalizado[]>();
    for (const x of indice.values()) {
      if (x.daLeitura || x.item.t === 'aberta') continue;
      if ((x.item.t === 'ouvir' || x.item.t === 'ditado') && !hasAudio(x.item.audioId)) continue;
      m.set(x.n, [...(m.get(x.n) ?? []), x]);
    }
    return m;
  }, [indice]);

  if (!cp) notFound();

  const sortear = () => {
    const semente = `a1-cp${n}-${Date.now()}`;
    const r = rng(semente);
    const cada = Math.ceil(TAMANHO / cp.unidades.length);
    const escolhidos = cp.unidades.flatMap(u => shuffled(porUnidade.get(u) ?? [], r).slice(0, cada));
    setErros({});
    setFim(null);
    setRodada({ semente, itens: shuffled(escolhidos, r).slice(0, TAMANHO) });
  };

  const voltar = (
    <Link href="/a1" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">← Hebraico A1</Link>
  );

  if (fim && rodada) {
    const passou = fim.nota >= A1_APROVA;
    const fracas = Object.entries(fim.erros).filter(([, e]) => e >= 2).map(([u]) => Number(u)).sort((a, b) => a - b);
    const titulo = (u: number) => cursoA1().unidades.find(x => x.n === u)?.tituloPt ?? '';
    return (
      <div className="focus-col grid gap-5">
        <Milestone yael={false} tone={passou ? 'bom' : 'parcial'}
          kicker={`${cp.tituloPt} · ${fim.certas} de ${fim.total} (${Math.round(fim.nota * 100)}%)`}
          title={passou ? 'Checkpoint aprovado.' : 'Ainda não: o checkpoint passa com 70%.'}
          body={passou ? 'O que você aprendeu nesses módulos continua firme. Siga em frente.' : 'Reveja as unidades abaixo e tente de novo: cada tentativa é um sorteio novo.'} />
        {fracas.length > 0 && (
          <Card tone="wash" className="p-5 grid gap-2">
            <h2 className="font-display text-[18px] font-semibold text-ink m-0">Onde os erros se juntaram?</h2>
            <ul className="grid gap-1 m-0 p-0 list-none">
              {fracas.map(u => (
                <li key={u}><Link href={`/a1/unidade/${u}`} className="inline-flex min-h-[40px] items-center font-ui text-[15px] text-ink underline underline-offset-2">
                  Unidade {u}: {titulo(u)} ({fim.erros[u]} erros)
                </Link></li>
              ))}
            </ul>
          </Card>
        )}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="secondary" onClick={sortear}>Tentar de novo</Button>
          <LinkButton href="/a1">Voltar ao curso</LinkButton>
        </div>
      </div>
    );
  }

  if (rodada) {
    return (
      <div className="grid gap-3">
        <div className="focus-col">{voltar}</div>
        <A1Player key={rodada.semente} itens={rodada.itens.map(x => x.item)} prefixo={rodada.semente}
          genero={p.state.a1.genero?.valor ?? null} titulo={cp.tituloPt}
          onItem={(i, item, certo) => {
            const u = rodada.itens[i]!.n;
            p.responderItemA1(u, item, certo);
            if (!certo) setErros(e => ({ ...e, [u]: (e[u] ?? 0) + 1 }));
          }}
          onDone={r => { p.finishCheckpointA1(n, r.nota); setFim({ ...r, erros }); }} />
      </div>
    );
  }

  return (
    <div className="reading grid gap-5">
      {voltar}
      <div className="flex flex-wrap gap-2">
        <Badge tone="accent">Checkpoint {n}</Badge>
        {registro?.passedAt && <Badge tone="mint">Aprovado</Badge>}
      </div>
      <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight m-0">{cp.tituloPt}</h1>
      <p className="text-[16px] leading-relaxed text-ink-body m-0">
        {TAMANHO} exercícios misturados das Unidades {cp.unidades[0]} a {cp.unidades[cp.unidades.length - 1]}, sorteados a cada tentativa.
        Passa com 70%. No fim, você vê em que unidades os erros se juntaram.
      </p>
      {registro && registro.attempts > 0 && (
        <p className="font-ui text-[14px] text-ink-muted m-0">
          {registro.attempts} {registro.attempts === 1 ? 'tentativa' : 'tentativas'}{registro.best != null ? ` · melhor nota ${Math.round(registro.best * 100)}%` : ''}
        </p>
      )}
      <Button size="lg" onClick={sortear}>Começar o checkpoint</Button>
    </div>
  );
}
