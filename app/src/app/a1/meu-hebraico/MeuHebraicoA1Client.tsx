'use client';

/* "Meu hebraico" do A1: o caderno do aluno.
 * ─────────────────────────────────────────────────────────────────────────
 * Onde estou, o que já sei, o que dá trabalho. Tudo calculado do progresso
 * guardado (state.a1), nada inventado:
 *   · as competências são acertos na primeira tentativa sobre respostas, por
 *     habilidade, e só aparecem a partir de 10 respostas;
 *   · as palavras aprendidas são as das unidades concluídas;
 *   · as difíceis são os exercícios na fila de revisão que ainda não subiram;
 *   · as conquistas são regras simples sobre o mesmo progresso. */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge, Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { Misto } from '@/components/a1/A1Player';
import { useProgress } from '@/lib/state/store';
import { today } from '@/lib/state/rules';
import {
  conquistasA1, cursoA1, indiceDeItens, palavrasAprendidas, palavrasDoCurso
} from '@/lib/a1';
import {
  dominio, HABILIDADES_A1, NOME_DA_HABILIDADE, paraRevisarHoje, unidadeConcluida
} from '@/lib/state/a1-estado';
import { stripNikud } from '@/lib/hebrew';
import { enunciado } from '../revisao/RevisaoA1Client';

export function MeuHebraicoA1Client() {
  const p = useProgress();
  const a1 = p.state.a1;
  const hoje = today();
  const ordem = cursoA1().modulos.flatMap(m => m.unidades);
  const feitas = ordem.filter(n => unidadeConcluida(a1, n)).length;
  const aprendidas = palavrasAprendidas(a1);
  const vencidos = paraRevisarHoje(a1, hoje).length;
  const todas = palavrasDoCurso();
  const favoritas = Object.entries(a1.favoritos).filter(([, v]) => v.on).map(([k]) => todas.get(k)).filter(x => !!x);
  const indice = indiceDeItens();
  const dificeis = Object.entries(a1.revisao)
    .filter(([k, r]) => indice.has(k) && r.caixa <= 1)
    .sort(([, a], [, b]) => b.erros - a.erros)
    .slice(0, 12);
  const conquistas = conquistasA1(a1);
  const ultimosDias = Object.entries(a1.dias).sort(([a], [b]) => b.localeCompare(a)).slice(0, 7);

  return (
    <div className="grid gap-7 reading">
      <header className="grid gap-3">
        <Link href="/a1" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          ← Hebraico A1
        </Link>
        <Badge tone="accent">Caderno</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight m-0">Meu hebraico</h1>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-label="Resumo">
        <Numero valor={`${feitas}/${ordem.length}`} rotulo="unidades concluídas" />
        <Numero valor={String(aprendidas.length)} rotulo="palavras aprendidas" />
        <Numero valor={String(p.state.xp)} rotulo="XP" />
        <Numero valor={String(vencidos)} rotulo="para rever hoje" link={vencidos ? '/a1/revisao' : undefined} />
      </section>

      <section className="grid gap-3" aria-labelledby="t-comp">
        <h2 id="t-comp" className="font-display text-[20px] font-semibold m-0">Competências</h2>
        <p className="font-ui text-[13.5px] text-ink-muted m-0">
          Acertos na primeira tentativa, por habilidade. Aparece a partir de 10 respostas.
        </p>
        <ul className="grid gap-2.5 m-0 p-0 list-none">
          {HABILIDADES_A1.map(h => {
            const d = dominio(a1, h);
            const v = a1.habilidades[h];
            const n = (v?.h ?? 0) + (v?.m ?? 0);
            const pct = d == null ? 0 : Math.round(d * 100);
            return (
              <li key={h} className="grid gap-1">
                <div className="flex items-baseline justify-between font-ui text-[14px]">
                  <span className="text-ink font-semibold">{NOME_DA_HABILIDADE[h]}</span>
                  <span className="text-ink-muted">{d == null ? `ainda sem dados (${n} de 10)` : `${pct}%`}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden" role="progressbar"
                  aria-label={NOME_DA_HABILIDADE[h]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                  <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-3" aria-labelledby="t-conq">
        <h2 id="t-conq" className="font-display text-[20px] font-semibold m-0">Conquistas do A1</h2>
        <ul className="grid gap-2 sm:grid-cols-2 m-0 p-0 list-none">
          {conquistas.map(c => (
            <li key={c.id}>
              <Card tone={c.feita ? 'mint' : 'surface'} className="p-4 grid gap-0.5 h-full">
                <span className="font-ui text-[14.5px] font-semibold text-ink">
                  <span aria-hidden>{c.feita ? '✓ ' : '○ '}</span>{c.tituloPt}
                  <span className="sr-only">{c.feita ? ' (conquistada)' : ' (ainda não)'}</span>
                </span>
                <span className="font-ui text-[13px] text-ink-muted">{c.comoPt}</span>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3" aria-labelledby="t-fav">
        <h2 id="t-fav" className="font-display text-[20px] font-semibold m-0">Palavras e frases guardadas</h2>
        {favoritas.length === 0 ? (
          <p className="font-ui text-[14px] text-ink-muted m-0">Toque na estrela ☆ ao lado de uma palavra ou de uma frase do diálogo para guardar aqui.</p>
        ) : (
          <ul className="grid gap-1.5 m-0 p-0 list-none">
            {favoritas.map(w => (
              <li key={w!.chave} className="flex flex-wrap items-baseline justify-between gap-x-4 rounded-[var(--r-md)] bg-surface-2 px-3 py-2">
                <He size="word">{w!.he}</He>
                <span className="font-ui text-[13.5px] text-ink-body">{w!.pt} · Unidade {w!.n}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3" aria-labelledby="t-dif">
        <h2 id="t-dif" className="font-display text-[20px] font-semibold m-0">O que ainda está difícil?</h2>
        {dificeis.length === 0 ? (
          <p className="font-ui text-[14px] text-ink-muted m-0">Nada por enquanto. O que você errar nos exercícios aparece aqui até firmar.</p>
        ) : (
          <>
            <ul className="grid gap-2 m-0 p-0 list-none">
              {dificeis.map(([k, r]) => {
                const x = indice.get(k)!;
                return (
                  <li key={k} className="rounded-[var(--r-md)] border border-line bg-surface px-4 py-3 grid gap-0.5">
                    <span className="font-ui text-[12.5px] text-ink-muted">Unidade {x.n} · errado {r.erros} {r.erros === 1 ? 'vez' : 'vezes'}</span>
                    <span className="text-[15px] text-ink-body"><Misto texto={enunciado(x)} /></span>
                  </li>
                );
              })}
            </ul>
            <LinkButton href="/a1/revisao" className="justify-self-start">Revisar agora</LinkButton>
          </>
        )}
      </section>

      <Aprendidas lista={aprendidas} />

      {ultimosDias.length > 0 && (
        <section className="grid gap-2" aria-labelledby="t-hist">
          <h2 id="t-hist" className="font-display text-[20px] font-semibold m-0">Histórico de revisão</h2>
          <ul className="grid gap-1 m-0 p-0 list-none font-ui text-[14px] text-ink-body">
            {ultimosDias.map(([d, n]) => (
              <li key={d} className="flex justify-between border-b border-[color:var(--line-soft)] py-1.5">
                <span>{d.split('-').reverse().join('/')}</span><span>{n} {n === 1 ? 'exercício' : 'exercícios'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Numero({ valor, rotulo, link }: { valor: string; rotulo: string; link?: string }) {
  const corpo = (
    <Card className="p-4 grid gap-0.5 text-center h-full">
      <span className="font-display text-[24px] font-bold text-ink">{valor}</span>
      <span className="font-ui text-[12.5px] text-ink-muted">{rotulo}</span>
    </Card>
  );
  return link ? <Link href={link} className="block rounded-[var(--r-lg)]">{corpo}</Link> : corpo;
}

/* As palavras aprendidas, com busca: pelo português ou pelo hebraico, com ou
   sem nikud. */
function Aprendidas({ lista }: { lista: { chave: string; he: string; pt: string; n: number }[] }) {
  const [busca, setBusca] = useState('');
  const filtradas = useMemo(() => {
    const b = busca.trim().toLowerCase();
    if (!b) return lista;
    const bh = stripNikud(b);
    return lista.filter(w => w.pt.toLowerCase().includes(b) || stripNikud(w.he).includes(bh));
  }, [busca, lista]);
  return (
    <section className="grid gap-3" aria-labelledby="t-apr">
      <h2 id="t-apr" className="font-display text-[20px] font-semibold m-0">Palavras aprendidas ({lista.length})</h2>
      {lista.length === 0 ? (
        <p className="font-ui text-[14px] text-ink-muted m-0">Conclua uma unidade (70% nos exercícios) e as palavras dela entram aqui.</p>
      ) : (
        <>
          <label className="grid gap-1 font-ui text-[13.5px] text-ink">
            Procurar
            <input type="search" value={busca} onChange={e => setBusca(e.target.value)}
              className="min-h-[44px] rounded-[var(--r-md)] border-2 border-line bg-surface px-3 text-[16px]" />
          </label>
          <ul className="grid gap-1.5 m-0 p-0 list-none max-h-[60vh] overflow-y-auto">
            {filtradas.map(w => (
              <li key={w.chave} className="flex flex-wrap items-baseline justify-between gap-x-4 rounded-[var(--r-md)] bg-surface-2 px-3 py-2">
                <He size="word">{w.he}</He>
                <span className="font-ui text-[13.5px] text-ink-body">{w.pt}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
