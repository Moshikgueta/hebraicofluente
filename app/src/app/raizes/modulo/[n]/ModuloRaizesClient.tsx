'use client';

/* Um módulo de Raízes Sefarditas como um capítulo: uma leitura só, contínua,
 * como no Israel Além do Roteiro (decisão do dono, 22/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * As oito partes do dado (descobrir, contextualizar, explorar, investigar,
 * aplicar, refletir, consolidar, avançar) viram SEÇÕES da mesma página, uma
 * embaixo da outra, com as atividades e os jogos no meio do texto. Nada
 * tranca: o sumário no alto leva a qualquer seção.
 *
 * O que conclui o módulo continua sendo as atividades (`progressoDoModulo`),
 * então certificado e conquistas não mudam. A seção que o aluno está lendo
 * vira o "onde parei" (`?etapa=`, o mesmo endereço de antes: os links antigos
 * continuam levando ao lugar certo). */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Heroi } from '@/components/raizes/Heroi';
import { SemConteudo } from '@/app/raizes/RaizesHomeClient';
import { BlocoRaizes } from '@/components/raizes/Blocos';
import { AberturaDoMaco } from '@/components/raizes/arquivo/AberturaDoMaco';
import { NarrativaComMapa } from '@/components/raizes/arquivo/NarrativaComMapa';
import { Selo } from '@/components/raizes/arquivo/Selo';
import { Gravura, VINHETA_DA_SECAO } from '@/components/raizes/ilustracoes/Gravuras';
import { useProgress } from '@/lib/state/store';
import { useAccount } from '@/lib/account/store';
import { atividadeConcluida, chaveDaAtividade } from '@/lib/state/raizes-estado';
import {
  conquistasObtidas, modulo, moduloAberto, progressoDoModulo, raizes, type ModuloRaizes
} from '@/lib/raizes';

export function ModuloRaizesClient({ n }: { n: number }) {
  const p = useProgress();
  const revisor = !!useAccount().session?.account.revisor;
  const m = modulo(n);
  const e = p.state.raizes;
  const [lendo, setLendo] = useState<string | null>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const aberto = !!m && moduloAberto(e, n, revisor);

  /* Abrir no lugar pedido (?etapa=, o "continuar de onde parei" e os links antigos). */
  useEffect(() => {
    if (!m || !aberto) return;
    const pedida = new URLSearchParams(window.location.search).get('etapa');
    if (!pedida || pedida === m.etapas[0]!.id) return;
    requestAnimationFrame(() => document.getElementById(`secao-${pedida}`)?.scrollIntoView({ block: 'start' }));
  }, [m, aberto]);

  /* A seção que passou do alto da tela é a que o aluno está lendo. */
  useEffect(() => {
    const el = raiz.current;
    if (!el || !aberto) return;
    const secoes = [...el.querySelectorAll<HTMLElement>('[data-secao]')];
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      let atual: string | null = null;
      for (const s of secoes) if (s.getBoundingClientRect().top < window.innerHeight * 0.4) atual = s.getAttribute('data-secao');
      setLendo(atual ?? secoes[0]?.getAttribute('data-secao') ?? null);
    };
    const pedir = () => { if (!quadro) quadro = requestAnimationFrame(medir); };
    window.addEventListener('scroll', pedir, { passive: true });
    medir();
    return () => { window.removeEventListener('scroll', pedir); cancelAnimationFrame(quadro); };
  }, [aberto, m]);

  /* A seção lida vira visita e "onde parei" (gravado só quando muda). */
  useEffect(() => {
    if (!m || !lendo || !p.ready) return;
    const rota = `/raizes/modulo/${n}?etapa=${lendo}`;
    window.history.replaceState(null, '', rota);
    p.visitarEtapaRaizes(n, lendo, rota);
  }, [lendo, m, n, p.ready]);

  if (raizes().semConteudo) return <SemConteudo />;
  if (!m) {
    return <p className="rz-corpo pt-8">Este módulo ainda está em preparação.</p>;
  }
  if (!aberto) {
    return (
      <div className="grid gap-4 pt-8">
        <h1 className="rz-pagina">{m.titulo}</h1>
        <p className="rz-corpo">Este módulo abre quando o módulo {n - 1} estiver concluído.</p>
        <Link href="/raizes" prefetch={false} className="rz-botao claro justify-self-start">Voltar à jornada</Link>
      </div>
    );
  }

  const prog = progressoDoModulo(e, m);
  const exp = m.experiencia;
  const mapas = Object.values(m.atividades).flatMap(a => (a.tipo === 'mapa' ? [a] : []));
  const lugares = mapas.flatMap(a => a.lugares);
  const proximo = raizes().modulos.find(x => x.n === m.n + 1);

  return (
    <div ref={raiz} className="grid gap-10">
      {exp?.abertura ? (
        <AberturaDoMaco kicker={`Módulo ${m.n} · ${m.regiao}`} titulo={m.titulo} subtitulo={m.periodo} legenda={exp.abertura.legenda}>
          <BarraDoModulo feitas={prog.feitas} total={prog.total} />
        </AberturaDoMaco>
      ) : (
        <Heroi kicker={`Módulo ${m.n} · ${m.regiao}`} titulo={m.titulo} subtitulo={m.periodo} pontos={lugares} desenho={mapas[0]?.desenho}>
          <BarraDoModulo feitas={prog.feitas} total={prog.total} />
        </Heroi>
      )}

      <Sumario m={m} lendo={lendo} e={e} />

      {m.etapas.map((x, k) => {
        const narrativa = exp?.narrativa?.etapa === x.id ? exp.narrativa : undefined;
        return (
          <section key={x.id} id={`secao-${x.id}`} data-secao={x.id} aria-labelledby={`t-${x.id}`} className="rz-secao grid gap-7 scroll-mt-20">
            <div className="grid gap-3">
              <div className="rz-rubrica">
                <span className="rz-numero text-[22px]">{String(k + 1).padStart(2, '0')}</span>
                <span className="rz-rot">{x.titulo}</span>
                {etapaFeita(m, x.id, e) && <span className="rz-rot ml-auto !text-[var(--teal-ink)]"><span aria-hidden>✓ </span>feita</span>}
              </div>
              <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                <h2 id={`t-${x.id}`} className="rz-h2">{x.pergunta}</h2>
                <Gravura nome={x.vinheta ?? VINHETA_DA_SECAO[x.id] ?? 'documento'} className="h-[58px] w-[78px] text-[var(--ocre)]" />
              </div>
            </div>
            {narrativa
              ? <NarrativaComMapa m={m} blocos={x.blocos} passos={narrativa.passos} />
              : x.blocos.map((b, j) => <BlocoRaizes key={`${x.id}-${j}`} b={b} m={m} />)}
            {x.id === 'avancar' && <Fechamento m={m} />}
          </section>
        );
      })}

      <nav aria-label="Depois deste módulo" className="flex flex-wrap justify-between gap-3 border-t border-[var(--tinta)] pt-5">
        <Link href="/raizes" prefetch={false} className="rz-botao claro">Voltar à jornada</Link>
        {proximo && proximo.estado !== 'em-preparacao' && (
          <Link href={`/raizes/modulo/${proximo.n}`} prefetch={false} className="rz-botao">Módulo {proximo.n} →</Link>
        )}
      </nav>
    </div>
  );
}

/** O sumário do capítulo: as seções, onde o aluno está e o que já fez. */
function Sumario({ m, lendo, e }: { m: ModuloRaizes; lendo: string | null; e: ReturnType<typeof useProgress>['state']['raizes'] }) {
  const prog = progressoDoModulo(e, m);
  return (
    <nav aria-label="Neste módulo" className="grid gap-3">
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
      <div className="flex items-baseline justify-between gap-3">
        <p className="rz-rot m-0">Neste módulo</p>
        <p className="m-0 font-ui text-[13px] text-[var(--suave)] tabular-nums" aria-live="polite">
          Seu resultado: <span className="font-semibold text-[var(--tinta)]">{prog.feitas} de {prog.total}</span> atividades
        </p>
      </div>
      <ol className="rz-lista">
        {m.etapas.map((x, k) => {
          const feita = etapaFeita(m, x.id, e);
          const aqui = lendo === x.id;
          return (
            <li key={x.id}>
              <a href={`#secao-${x.id}`} aria-current={aqui ? 'location' : undefined}
                className="grid grid-cols-[34px_1fr_auto] items-baseline gap-2 py-2.5 no-underline min-h-[44px]">
                <span className="rz-numero text-[17px]">{String(k + 1).padStart(2, '0')}</span>
                <span className={`rz-serif text-[16.5px] leading-snug ${aqui ? 'text-[var(--titulo)] font-[560]' : 'text-[var(--tinta)]'}`}>
                  {x.pergunta}
                  <span className="block font-ui text-[12px] font-normal uppercase tracking-[.14em] text-[var(--suave)]">{x.titulo}{aqui ? ' · você está aqui' : ''}</span>
                </span>
                <span aria-label={feita ? 'feita' : undefined} className="font-ui text-[14px] text-[var(--teal-ink)]">{feita ? '✓' : ''}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function BarraDoModulo({ feitas, total }: { feitas: number; total: number }) {
  return (
    <div className="grid gap-1.5 pt-2 max-w-[420px]">
      <div className="h-[3px] bg-white/20" role="progressbar" aria-valuemin={0}
        aria-valuemax={total} aria-valuenow={feitas} aria-label="Atividades concluídas no módulo">
        <div className="h-full bg-[#8FD6C8]" style={{ width: `${(feitas / Math.max(1, total)) * 100}%` }} />
      </div>
      <p className="rz-credito m-0 tabular-nums">{feitas} de {total} atividades concluídas</p>
    </div>
  );
}

/** Uma seção conta como feita quando todas as atividades dela estão concluídas;
 *  seção sem atividade, quando foi lida. */
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
  const faltam = m.etapas.flatMap(x => x.blocos
    .filter(b => b.tipo === 'atividade' && !atividadeConcluida(e, chaveDaAtividade(m.n, (b as { id: string }).id)))
    .map(b => ({ etapa: x.titulo, secao: x.id, id: (b as { id: string }).id, enunciado: m.atividades[(b as { id: string }).id]?.enunciado ?? '' })));
  const proximo = r.modulos.find(x => x.n === m.n + 1);

  return (
    <section className={`rz-nota ${prog.concluido ? 'teal' : ''} grid gap-3`} aria-live="polite">
      {prog.concluido ? (
        <>
          <div className="flex items-center gap-4 pb-1">
            <Selo tamanho={72} />
            <p className="rz-serif m-0 text-[21px] leading-tight text-[var(--tinta)]">Módulo {m.n} concluído.</p>
          </div>
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
                <a href={`#secao-${f.secao}`} className="font-semibold text-[var(--tinta)] underline underline-offset-2">{f.etapa}:</a> {f.enunciado}
              </li>
            ))}
          </ul>
          <p className="m-0 font-ui text-[13px] text-[var(--suave)]">{r.regras.conclusaoDoModulo}</p>
        </>
      )}
    </section>
  );
}
