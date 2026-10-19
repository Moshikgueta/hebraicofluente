'use client';

/* "Minha revisão" do A1.
 * ─────────────────────────────────────────────────────────────────────────
 * Três rodadas, e o aluno escolhe:
 *   · Revisão do dia: o que venceu na fila de Leitner (o que ele errou e
 *     ainda não firmou), das caixas mais baixas primeiro, até 15. Se a fila
 *     está curta, completa com itens das duas últimas unidades concluídas
 *     ("aprendido recentemente").
 *   · Desafio rápido: 8 itens sorteados de TODAS as unidades concluídas, a
 *     revisão acumulativa.
 * A situação de cada item fica à vista, com os nomes que o aluno entende:
 * rever agora, rever logo, rever depois, dominado. Nada é escondido. Itens de
 * leitura ficam de fora: precisam do texto deles. */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge, Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { A1Player, Misto, type ResultadoA1 } from '@/components/a1/A1Player';
import { useProgress } from '@/lib/state/store';
import { today } from '@/lib/state/rules';
import { rng, shuffled } from '@/lib/engine/rng';
import { cursoA1, indiceDeItens, type ItemLocalizado } from '@/lib/a1';
import {
  NOME_DA_SITUACAO, paraRevisarHoje, situacaoRevisao, unidadeConcluida, type SituacaoRevisao
} from '@/lib/state/a1-estado';

const MAX_DO_DIA = 15;
const DESAFIO = 8;

type Rodada = { tipo: 'dia' | 'desafio'; itens: ItemLocalizado[]; semente: string };

export function RevisaoA1Client() {
  const p = useProgress();
  const a1 = p.state.a1;
  const hoje = today();
  const indice = indiceDeItens();
  const [rodada, setRodada] = useState<Rodada | null>(null);
  const [fim, setFim] = useState<ResultadoA1 | null>(null);

  const contagem = useMemo(() => {
    const c: Record<SituacaoRevisao, number> = { agora: 0, logo: 0, depois: 0, dominado: 0 };
    for (const [k, r] of Object.entries(a1.revisao)) if (indice.has(k)) c[situacaoRevisao(r, hoje)]++;
    return c;
  }, [a1.revisao, hoje, indice]);

  const concluidas = cursoA1().modulos.flatMap(m => m.unidades).filter(n => unidadeConcluida(a1, n));
  const doCurso = (n: number) => [...indice.values()].filter(x => x.n === n && !x.daLeitura && x.item.t !== 'aberta');

  const montarDoDia = (): Rodada => {
    const semente = `rev-${hoje}-${a1.dias[hoje] ?? 0}`;
    const vencidos = paraRevisarHoje(a1, hoje).map(k => indice.get(k)).filter((x): x is ItemLocalizado => !!x && !x.daLeitura);
    let itens = vencidos.slice(0, MAX_DO_DIA);
    if (itens.length < MAX_DO_DIA) {
      const recentes = concluidas.slice(-2).flatMap(doCurso).filter(x => !itens.some(y => y.chave === x.chave));
      itens = [...itens, ...shuffled(recentes, rng(semente)).slice(0, MAX_DO_DIA - itens.length)];
    }
    return { tipo: 'dia', itens, semente };
  };
  const montarDesafio = (): Rodada => {
    const semente = `desafio-${hoje}-${Date.now()}`;
    return { tipo: 'desafio', itens: shuffled(concluidas.flatMap(doCurso), rng(semente)).slice(0, DESAFIO), semente };
  };

  if (rodada && fim) {
    const pct = Math.round(fim.nota * 100);
    return (
      <div className="focus-col grid gap-5">
        <Milestone tone={fim.nota >= 0.7 ? 'bom' : 'parcial'}
          kicker={`${fim.certas} de ${fim.total} na primeira tentativa (${pct}%)`}
          title={rodada.tipo === 'dia' ? 'Revisão do dia feita.' : 'Desafio feito.'}
          body="O que você errou volta logo; o que acertou sobe de caixa e volta mais tarde. Quando um item sobe até o fim, ele fica dominado." />
        <div className="flex flex-wrap justify-center gap-2">
          <LinkButton href="/a1/meu-hebraico" variant="secondary">Ver Meu hebraico</LinkButton>
          <LinkButton href="/a1">Voltar ao curso</LinkButton>
        </div>
      </div>
    );
  }

  if (rodada) {
    return (
      <div className="grid gap-3">
        <div className="focus-col">
          <button type="button" onClick={() => setRodada(null)}
            className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
            ← Minha revisão
          </button>
        </div>
        <A1Player
          key={rodada.semente}
          itens={rodada.itens.map(x => x.item)}
          prefixo={rodada.semente}
          genero={a1.genero?.valor ?? null}
          titulo={rodada.tipo === 'dia' ? 'Revisão do dia' : 'Desafio rápido'}
          onItem={(i, item, certo) => p.responderItemA1(rodada.itens[i]!.n, item, certo)}
          onDone={r => { p.revisaoA1Feita(r.total); setFim(r); }}
        />
      </div>
    );
  }

  const vencidos = contagem.agora;
  const podeDia = vencidos > 0 || concluidas.length > 0;
  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Link href="/a1" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          ← Hebraico A1
        </Link>
        <Badge tone="accent">Revisão</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight m-0">Minha revisão</h1>
        <p className="text-[16px] leading-relaxed text-ink-body m-0">
          Cada exercício que você erra entra aqui e volta no dia certo: logo, se ainda está fraco; mais tarde, se você já acertou.
        </p>
      </header>

      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 m-0 p-0 list-none" aria-label="Situação dos seus exercícios">
        {(Object.keys(NOME_DA_SITUACAO) as SituacaoRevisao[]).map(sit => (
          <li key={sit}>
            <Card tone={sit === 'agora' && contagem.agora ? 'ember' : sit === 'dominado' ? 'mint' : 'surface'} className="p-4 grid gap-0.5 text-center">
              <span className="font-display text-[24px] font-bold text-ink">{contagem[sit]}</span>
              <span className="font-ui text-[13px] text-ink-body">{NOME_DA_SITUACAO[sit]}</span>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="p-5 grid gap-3">
        <h2 className="font-display text-[19px] font-semibold text-ink m-0">Revisão do dia</h2>
        <p className="text-[15px] leading-relaxed text-ink-body m-0">
          {vencidos > 0
            ? `${vencidos} ${vencidos === 1 ? 'exercício está' : 'exercícios estão'} para rever hoje${vencidos > MAX_DO_DIA ? `; a rodada leva os ${MAX_DO_DIA} mais fracos` : ''}.`
            : concluidas.length > 0
              ? 'Nada vencido hoje. A rodada traz exercícios das unidades que você concluiu por último.'
              : 'Ainda não há o que revisar. Faça os exercícios de uma unidade: o que você errar aparece aqui.'}
        </p>
        <Button onClick={() => { setFim(null); setRodada(montarDoDia()); }} disabled={!podeDia} className="justify-self-start">
          Começar a revisão
        </Button>
      </Card>

      <Card className="p-5 grid gap-3">
        <h2 className="font-display text-[19px] font-semibold text-ink m-0">Desafio rápido</h2>
        <p className="text-[15px] leading-relaxed text-ink-body m-0">
          {DESAFIO} exercícios sorteados de todas as unidades que você já concluiu, misturados. É o melhor jeito de ver se o começo do curso continua firme.
        </p>
        <Button variant="secondary" onClick={() => { setFim(null); setRodada(montarDesafio()); }} disabled={concluidas.length === 0}
          className="justify-self-start">
          Fazer o desafio
        </Button>
      </Card>

      <ErrosFrequentes />
    </div>
  );
}

/* Os itens errados mais vezes: o mapa do que ainda dá trabalho. */
function ErrosFrequentes() {
  const p = useProgress();
  const indice = indiceDeItens();
  const lista = Object.entries(p.state.a1.revisao)
    .filter(([k, r]) => indice.has(k) && r.erros > 0 && r.caixa < 4)
    .sort(([, a], [, b]) => b.erros - a.erros)
    .slice(0, 5);
  if (!lista.length) return null;
  return (
    <section className="grid gap-2" aria-labelledby="t-erros">
      <h2 id="t-erros" className="font-display text-[19px] font-semibold m-0">O que mais dá trabalho?</h2>
      <ul className="grid gap-2 m-0 p-0 list-none">
        {lista.map(([k, r]) => {
          const x = indice.get(k)!;
          return (
            <li key={k} className="rounded-[var(--r-md)] border border-line bg-surface px-4 py-3 grid gap-0.5">
              <span className="font-ui text-[12.5px] text-ink-muted">Unidade {x.n} · errado {r.erros} {r.erros === 1 ? 'vez' : 'vezes'}</span>
              <span className="text-[15px] text-ink-body"><Misto texto={enunciado(x)} /></span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Uma linha que lembra o exercício, sem resolvê-lo. */
export function enunciado(x: ItemLocalizado): string {
  const it = x.item;
  if ('q' in it && it.q) return it.q;
  if ('pt' in it && it.pt) return it.pt;
  return it.t === 'ditado' ? 'Ditado' : `Exercício da Unidade ${x.n}`;
}

