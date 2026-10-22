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
import { Heroi } from '@/components/raizes/Heroi';
import { SemConteudo } from '@/app/raizes/RaizesHomeClient';
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

  if (raizes().semConteudo) return <SemConteudo />;
  if (!m) {
    return <p className="rz-corpo pt-8">Este módulo ainda está em preparação.</p>;
  }
  if (!moduloAberto(e, n)) {
    return (
      <div className="grid gap-4 pt-8">
        <h1 className="rz-pagina">{m.titulo}</h1>
        <p className="rz-corpo">Este módulo abre quando o módulo {n - 1} estiver concluído.</p>
        <Link href="/raizes" prefetch={false} className="rz-botao claro justify-self-start">Voltar à jornada</Link>
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

  const lugares = Object.values(m.atividades).flatMap(a => (a.tipo === 'mapa' ? a.lugares : []));

  return (
    <div className="grid gap-8">
      <Heroi compacto kicker={`Módulo ${m.n} · ${m.regiao}`} titulo={m.titulo} subtitulo={m.periodo} pontos={lugares}>
        <div className="grid gap-1.5 pt-2 max-w-[420px]">
          <div className="h-[3px] bg-white/20" role="progressbar" aria-valuemin={0}
            aria-valuemax={prog.total} aria-valuenow={prog.feitas} aria-label="Atividades concluídas no módulo">
            <div className="h-full bg-[#8FD6C8]" style={{ width: `${(prog.feitas / Math.max(1, prog.total)) * 100}%` }} />
          </div>
          <p className="rz-credito m-0 tabular-nums">{prog.feitas} de {prog.total} atividades concluídas</p>
        </div>
      </Heroi>

      <details className="group border-y border-[var(--linha)]">
        <summary className="cursor-pointer list-none flex min-h-[48px] items-center gap-2 font-ui text-[14px] font-semibold text-[var(--tinta)]">
          <span aria-hidden className="inline-block transition-transform duration-150 group-open:rotate-90">›</span>
          O que você vai conseguir fazer
        </summary>
        <ol className="m-0 p-0 pb-3 list-none">
          {m.objetivos.map((o, k) => (
            <li key={k} className="grid grid-cols-[28px_1fr] gap-2 py-1.5">
              <span className="rz-numero text-[15px] pt-1">{k + 1}</span>
              <span className="rz-corpo !text-[16px]">{o}</span>
            </li>
          ))}
        </ol>
      </details>

      <nav aria-label="Etapas do módulo" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
        <ol className="m-0 flex gap-2 p-0 list-none min-w-max">
          {m.etapas.map((x, k) => {
            const feita = etapaFeita(m, x.id, e);
            return (
              <li key={x.id}>
                <button type="button" onClick={() => ir(k)} aria-current={k === i ? 'step' : undefined} className="rz-mini">
                  <span className="tabular-nums opacity-70">{k + 1}</span>
                  <span>{x.titulo}</span>
                  {feita && <span aria-label="concluída" className={k === i ? '' : 'text-[var(--teal-ink)]'}>✓</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <section className="grid gap-7" aria-labelledby="etapa-titulo">
        <div className="grid gap-3">
          <div className="rz-rubrica">
            <span className="rz-rot">Etapa {i + 1} de {m.etapas.length}</span>
            <span className="rz-rot ocre ml-auto">{atual.titulo}</span>
          </div>
          <h2 id="etapa-titulo" ref={topo} tabIndex={-1} className="rz-h2 outline-none scroll-mt-20">{atual.pergunta}</h2>
        </div>
        {atual.blocos.map((b, k) => <BlocoRaizes key={`${atual.id}-${k}`} b={b} m={m} />)}
        {atual.id === 'avancar' && <Fechamento m={m} />}
      </section>

      <nav aria-label="Navegar entre as etapas" className="flex flex-wrap justify-between gap-3 border-t border-[var(--tinta)] pt-5">
        {i > 0
          ? <button type="button" className="rz-botao claro" onClick={() => ir(i - 1)}>← {m.etapas[i - 1]!.titulo}</button>
          : <span />}
        {i < m.etapas.length - 1
          ? <button type="button" className="rz-botao" onClick={() => ir(i + 1)}>{m.etapas[i + 1]!.titulo} →</button>
          : <Link href="/raizes" prefetch={false} className="rz-botao">Voltar à jornada</Link>}
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
    <section className={`rz-nota ${prog.concluido ? 'teal' : ''} grid gap-3`} aria-live="polite">
      {prog.concluido ? (
        <>
          <p className="rz-rot m-0">✓ Módulo {m.n} concluído</p>
          <ul className="rz-lista">
            {daqui.map(c => (
              <li key={c.id} className="py-2.5 font-ui text-[15px] text-[var(--corpo)]">
                Conquista: <span className="rz-serif text-[17px] text-[var(--tinta)]">{c.titulo}</span> {ganhas.has(c.id) ? '✓' : ''}
              </li>
            ))}
          </ul>
          {proximo && (
            <p className="rz-corpo">
              Próximo: módulo {proximo.n}, «{proximo.titulo}». {proximo.estado === 'em-preparacao' ? 'Ele está em preparação e aparece na jornada quando estiver pronto.' : ''}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="rz-rot m-0">Faltam {faltam.length} {faltam.length === 1 ? 'atividade' : 'atividades'} para concluir o módulo</p>
          <ul className="rz-lista">
            {faltam.map(f => (
              <li key={f.id} className="py-2.5 font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">
                <span className="font-semibold text-[var(--tinta)]">{f.etapa}:</span> {f.enunciado}
              </li>
            ))}
          </ul>
          <p className="m-0 font-ui text-[13px] text-[var(--suave)]">{r.regras.conclusaoDoModulo}</p>
        </>
      )}
    </section>
  );
}
