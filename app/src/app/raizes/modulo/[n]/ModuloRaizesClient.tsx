'use client';

/* Um módulo de Raízes Sefarditas, em oito etapas: descobrir, contextualizar,
 * explorar, investigar, aplicar, refletir, consolidar, avançar.
 *
 * Nenhuma etapa tranca a seguinte: a ordem é a sugerida, e o aluno pode ir e
 * voltar. O que conclui o módulo são as atividades (lib/raizes.ts,
 * `progressoDoModulo`). A etapa aberta vai na URL (?etapa=), para o "Continuar
 * de onde parei" levar ao lugar exato, e a visita fica no progresso. */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button, LinkButton } from '@/components/ui/Button';
import { BlocoRaizes } from '@/components/raizes/Blocos';
import { useProgress } from '@/lib/state/store';
import { atividadeConcluida, chaveDaAtividade } from '@/lib/state/raizes-estado';
import {
  conquistasObtidas, modulo, moduloAberto, progressoDoModulo, raizes, type ModuloRaizes
} from '@/lib/raizes';

export function ModuloRaizesClient({ n }: { n: number }) {
  const p = useProgress();
  const m = modulo(n);
  const e = p.state.raizes;
  const [etapa, setEtapa] = useState<string | null>(null);
  const topo = useRef<HTMLHeadingElement>(null);

  /* A etapa da URL, depois de montar (a página é estática). */
  useEffect(() => {
    if (!m) return;
    const pedida = new URLSearchParams(window.location.search).get('etapa');
    setEtapa(m.etapas.some(x => x.id === pedida) ? pedida : m.etapas[0]!.id);
  }, [m]);

  /* Cada etapa aberta: URL, visita e "onde parei". */
  useEffect(() => {
    if (!m || !etapa || !p.ready) return;
    const rota = `/raizes/modulo/${n}?etapa=${etapa}`;
    window.history.replaceState(null, '', rota);
    p.visitarEtapaRaizes(n, etapa, rota);
  }, [etapa, m, n, p.ready]);

  if (!m) {
    return <p className="font-ui text-[15px] text-ink-body">Este módulo ainda está em preparação.</p>;
  }
  if (!moduloAberto(e, n)) {
    return (
      <div className="grid gap-4 reading">
        <h1 className="m-0 font-display text-[28px] font-bold">{m.titulo}</h1>
        <p className="m-0 font-ui text-[15px] text-ink-body">Este módulo abre quando o módulo {n - 1} estiver concluído.</p>
        <LinkButton href="/raizes" variant="secondary">Voltar à jornada</LinkButton>
      </div>
    );
  }

  const i = Math.max(0, m.etapas.findIndex(x => x.id === etapa));
  const atual = m.etapas[i]!;
  const prog = progressoDoModulo(e, m);
  const ir = (k: number) => {
    setEtapa(m.etapas[k]!.id);
    requestAnimationFrame(() => {
      topo.current?.focus({ preventScroll: true });
      topo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Link href="/raizes" prefetch={false} className="font-ui text-[13px] text-[var(--rz-mar)] underline underline-offset-2 justify-self-start">
          Raízes Sefarditas
        </Link>
        <p className="m-0 font-ui text-[12px] font-semibold uppercase tracking-[.1em] text-[var(--rz-terra)]">
          Módulo {m.n} · {m.periodo} · {m.regiao}
        </p>
        <h1 className="m-0 font-display text-[30px] sm:text-[40px] font-bold leading-[1.08]">{m.titulo}</h1>
        <div className="grid gap-1.5 max-w-[520px]">
          <div className="h-2 rounded-full bg-[var(--sand)] overflow-hidden" role="progressbar" aria-valuemin={0}
            aria-valuemax={prog.total} aria-valuenow={prog.feitas} aria-label="Atividades concluídas no módulo">
            <div className="h-full bg-[var(--rz-terra)]" style={{ width: `${(prog.feitas / Math.max(1, prog.total)) * 100}%` }} />
          </div>
          <p className="m-0 font-ui text-[13px] text-ink-muted">{prog.feitas} de {prog.total} atividades concluídas</p>
        </div>
        <details className="rounded-[var(--r-md)] border border-line bg-[var(--card)] p-3">
          <summary className="cursor-pointer font-ui text-[14px] font-semibold text-ink min-h-[28px]">O que você vai conseguir fazer</summary>
          <ul className="mt-2 grid gap-1.5 m-0 pl-5">
            {m.objetivos.map((o, k) => <li key={k} className="font-ui text-[14px] leading-relaxed text-ink-body">{o}</li>)}
          </ul>
        </details>
      </header>

      <nav aria-label="Etapas do módulo" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ol className="m-0 flex gap-2 p-0 list-none min-w-max">
          {m.etapas.map((x, k) => {
            const feita = etapaFeita(m, x.id, e);
            return (
              <li key={x.id}>
                <button type="button" onClick={() => ir(k)} aria-current={k === i ? 'step' : undefined}
                  className={`flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 font-ui text-[13px] font-semibold
                    ${k === i ? 'border-[var(--rz-terra)] bg-[var(--rz-terra)] text-white' : 'border-line bg-[var(--card)] text-ink-body hover:border-[var(--rz-terra)]'}`}>
                  <span className="tabular-nums">{k + 1}</span>
                  <span>{x.titulo}</span>
                  {feita && <span aria-label="concluída">✓</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <section className="grid gap-6" aria-labelledby="etapa-titulo">
        <div className="grid gap-1">
          <p className="m-0 font-ui text-[12px] font-semibold uppercase tracking-[.1em] text-ink-muted">
            Etapa {i + 1} de {m.etapas.length} · {atual.titulo}
          </p>
          <h2 id="etapa-titulo" ref={topo} tabIndex={-1} className="m-0 font-display text-[24px] sm:text-[30px] font-bold leading-tight outline-none scroll-mt-24">
            {atual.pergunta}
          </h2>
        </div>
        {atual.blocos.map((b, k) => <BlocoRaizes key={`${atual.id}-${k}`} b={b} m={m} />)}
        {atual.id === 'avancar' && <Fechamento m={m} />}
      </section>

      <nav aria-label="Navegar entre as etapas" className="flex flex-wrap justify-between gap-3 border-t border-line pt-5">
        {i > 0 ? <Button variant="secondary" onClick={() => ir(i - 1)}>← {m.etapas[i - 1]!.titulo}</Button> : <span />}
        {i < m.etapas.length - 1
          ? <Button onClick={() => ir(i + 1)}>{m.etapas[i + 1]!.titulo} →</Button>
          : <LinkButton href="/raizes">Voltar à jornada</LinkButton>}
      </nav>
    </div>
  );
}

/** Uma etapa conta como feita quando todas as atividades dela estão concluídas;
 *  etapa sem atividade, quando foi aberta. */
function etapaFeita(m: ModuloRaizes, id: string, e: ReturnType<typeof useProgress>['state']['raizes']): boolean {
  const etapa = m.etapas.find(x => x.id === id);
  if (!etapa) return false;
  const ats = etapa.blocos.filter(b => b.tipo === 'atividade').map(b => (b as { id: string }).id);
  if (ats.length === 0) return !!e?.etapas[chaveDaAtividade(m.n, id)];
  return ats.every(a => atividadeConcluida(e, chaveDaAtividade(m.n, a)));
}

function Fechamento({ m }: { m: ModuloRaizes }) {
  const p = useProgress();
  const e = p.state.raizes;
  const prog = progressoDoModulo(e, m);
  const r = raizes();
  const ganhas = conquistasObtidas(e);
  const daqui = r.conquistas.filter(c => ('modulo' in c.condicao ? c.condicao.modulo === m.n : c.condicao.atividade.startsWith(`m${String(m.n).padStart(2, '0')}:`)));
  const faltam = m.etapas.flatMap((x, k) => x.blocos
    .filter(b => b.tipo === 'atividade' && !atividadeConcluida(e, chaveDaAtividade(m.n, (b as { id: string }).id)))
    .map(b => ({ etapa: x.titulo, k, id: (b as { id: string }).id, enunciado: m.atividades[(b as { id: string }).id]?.enunciado ?? '' })));
  const proximo = r.modulos.find(x => x.n === m.n + 1);

  return (
    <section className="grid gap-4 rounded-[var(--r-lg)] border border-line bg-[var(--card)] p-5" aria-live="polite">
      {prog.concluido ? (
        <>
          <h3 className="m-0 font-display text-[20px] font-bold text-[var(--teal-ink)]">✓ Módulo {m.n} concluído</h3>
          <ul className="m-0 grid gap-1 p-0 list-none">
            {daqui.map(c => (
              <li key={c.id} className="font-ui text-[14.5px] text-ink-body">
                {ganhas.has(c.id) ? '✓ ' : ''}Conquista: <span className="font-semibold">{c.titulo}</span>
              </li>
            ))}
          </ul>
          {proximo && (
            <p className="m-0 font-ui text-[14.5px] leading-relaxed text-ink-body">
              Próximo: módulo {proximo.n}, «{proximo.titulo}». {proximo.estado === 'em-preparacao' ? 'Ele está em preparação e aparece na jornada quando estiver pronto.' : ''}
            </p>
          )}
        </>
      ) : (
        <>
          <h3 className="m-0 font-display text-[19px] font-bold">Faltam {faltam.length} {faltam.length === 1 ? 'atividade' : 'atividades'} para concluir o módulo</h3>
          <ul className="m-0 grid gap-1.5 pl-5">
            {faltam.map(f => (
              <li key={f.id} className="font-ui text-[14px] leading-relaxed text-ink-body">
                <span className="font-semibold">{f.etapa}:</span> {f.enunciado}
              </li>
            ))}
          </ul>
          <p className="m-0 font-ui text-[13px] text-ink-muted">{r.regras.conclusaoDoModulo}</p>
        </>
      )}
    </section>
  );
}
