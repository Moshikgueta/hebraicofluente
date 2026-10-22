'use client';

/* A casa de Raízes Sefarditas: onde estou, o mapa da jornada, o que já
 * conquistei, e as portas para a biblioteca e o laboratório. Os módulos em
 * preparação aparecem como etapas da viagem, sem conteúdo e sem fingir que
 * existem: dizem que estão em preparação. */

import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';
import { useProgress } from '@/lib/state/store';
import {
  conquistasObtidas, modulo, moduloAberto, progressoDoModulo, progressoGeral, raizes
} from '@/lib/raizes';

/** "a, b, c nem d", a partir dos itens do certificado (que terminam em ; ou .). */
function listaComNem(itens: string[]): string {
  const l = itens.map(s => s.replace(/[;.]\s*$/, ''));
  return l.length < 2 ? (l[0] ?? '') : `${l.slice(0, -1).join(', ')} nem ${l[l.length - 1]}`;
}

export function RaizesHomeClient() {
  const p = useProgress();
  const r = raizes();
  const e = p.state.raizes;
  const geral = progressoGeral(e);
  const ganhas = conquistasObtidas(e);
  const continuar = e?.onde?.rota ?? '/raizes/modulo/1';
  const comecou = !!e?.onde;

  return (
    <div className="grid gap-8 reading">
      <header className="grid gap-4">
        <p className="m-0 font-ui text-[12px] font-semibold uppercase tracking-[.1em] text-[var(--rz-terra)]">
          Hebraico Fluente · História e memória
        </p>
        <h1 className="m-0 font-display text-[34px] sm:text-[44px] font-bold leading-[1.05]">{r.titulo}</h1>
        <p className="m-0 font-ui text-[17px] leading-relaxed text-ink-body max-w-[60ch]">{r.subtitulo}</p>
        <div className="grid gap-1.5 max-w-[520px]">
          <div className="h-2 rounded-full bg-[var(--sand)] overflow-hidden" role="progressbar"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={geral.pct} aria-label="Progresso no percurso">
            <div className="h-full bg-[var(--rz-terra)]" style={{ width: `${geral.pct}%` }} />
          </div>
          <p className="m-0 font-ui text-[13.5px] text-ink-muted">{geral.modulosFeitos} de {geral.total} módulos concluídos</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={continuar}>{comecou ? 'Continuar de onde parei' : 'Começar pelo módulo 1'}</LinkButton>
          <LinkButton href="/raizes/biblioteca" variant="secondary">Biblioteca de fontes</LinkButton>
        </div>
      </header>

      <aside className="grid gap-2 rounded-[var(--r-lg)] border-l-4 border-[var(--rz-terra)] bg-[var(--rz-pedra)] p-4 sm:p-5">
        <p className="m-0 font-ui text-[11px] font-semibold uppercase tracking-[.08em] text-[var(--rz-terra)]">Antes de começar</p>
        <p className="m-0 font-ui text-[15px] leading-relaxed text-ink">{r.aviso}</p>
        {!r.edicao.revisaoHumana && (
          <p className="m-0 font-ui text-[13.5px] leading-relaxed text-ink-body">
            {r.edicao.rotulo}. As fontes foram consultadas por busca em {r.edicao.atualizadoEm.split('-').reverse().join('/')};
            a conferência de cada passagem no texto integral, por especialistas, ainda não aconteceu.
          </p>
        )}
      </aside>

      <section className="grid gap-4" aria-labelledby="jornada">
        <h2 id="jornada" className="m-0 font-display text-[24px] sm:text-[28px] font-bold">A jornada</h2>
        <p className="m-0 font-ui text-[14.5px] leading-relaxed text-ink-muted max-w-[62ch]">{r.regras.desbloqueio}</p>
        <ol className="relative m-0 grid gap-3 p-0 list-none">
          {r.modulos.map((rm, i) => {
            const conteudo = modulo(rm.n);
            const aberto = moduloAberto(e, rm.n);
            const prog = conteudo ? progressoDoModulo(e, conteudo) : null;
            const estado = !conteudo ? 'Em preparação' : prog?.concluido ? 'Concluído' : aberto ? (prog && prog.feitas > 0 ? 'Em andamento' : 'Aberto') : 'Abre depois do anterior';
            const ultimo = i === r.modulos.length - 1;
            const corpo = (
              <div className={`grid gap-1.5 rounded-[var(--r-lg)] border p-4 sm:p-5 transition-colors
                ${aberto ? 'border-line bg-[var(--card)] hover:border-[var(--rz-mar)]' : 'border-dashed border-line bg-transparent'}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="m-0 font-ui text-[11.5px] font-semibold uppercase tracking-[.08em] text-[var(--rz-terra)]">
                    Módulo {rm.n} · {rm.periodo}
                  </p>
                  <span className={`font-ui text-[12px] font-semibold ${prog?.concluido ? 'text-[var(--teal-ink)]' : 'text-ink-muted'}`}>
                    {prog?.concluido ? '✓ ' : ''}{estado}
                  </span>
                </div>
                <h3 className={`m-0 font-display text-[18px] sm:text-[20px] font-bold leading-snug ${aberto ? 'text-ink' : 'text-ink-muted'}`}>{rm.titulo}</h3>
                <p className="m-0 font-ui text-[14px] leading-relaxed text-ink-body">{rm.resumo}</p>
                <p className="m-0 font-ui text-[12.5px] text-ink-muted">{rm.regiao}</p>
                {prog && (
                  <p className="m-0 font-ui text-[12.5px] text-ink-muted">{prog.feitas} de {prog.total} atividades concluídas</p>
                )}
              </div>
            );
            return (
              <li key={rm.n} className="relative grid grid-cols-[28px_1fr] gap-3">
                <div className="relative flex justify-center" aria-hidden>
                  {!ultimo && <span className="absolute top-8 bottom-[-12px] w-[2px] bg-[var(--rz-pedra-borda)]" />}
                  <span className={`relative mt-4 flex h-7 w-7 items-center justify-center rounded-full font-display text-[13px] font-bold
                    ${prog?.concluido ? 'bg-[var(--teal-solid)] text-white' : aberto ? 'bg-[var(--rz-terra)] text-white' : 'bg-[var(--sand)] text-ink-muted'}`}>
                    {rm.n}
                  </span>
                </div>
                {aberto ? <Link href={`/raizes/modulo/${rm.n}`} prefetch={false} className="block">{corpo}</Link> : corpo}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="grid gap-4" aria-labelledby="conquistas">
        <h2 id="conquistas" className="m-0 font-display text-[24px] font-bold">Conquistas</h2>
        <ul className="grid gap-3 sm:grid-cols-2 m-0 p-0 list-none">
          {r.conquistas.map(c => {
            const tem = ganhas.has(c.id);
            return (
              <li key={c.id} className={`grid gap-1 rounded-[var(--r-md)] border p-4 ${tem ? 'border-[var(--edge-teal)] bg-[var(--teal-soft)]' : 'border-line bg-[var(--card)]'}`}>
                <p className={`m-0 font-ui text-[14.5px] font-semibold ${tem ? 'text-[var(--teal-ink)]' : 'text-ink-muted'}`}>
                  {tem ? '✓ ' : ''}{c.titulo}
                </p>
                <p className="m-0 font-ui text-[13px] text-ink-body">{c.descricao}</p>
              </li>
            );
          })}
        </ul>
        <p className="m-0 font-ui text-[12.5px] text-ink-muted">
          As conquistas falam do que você estudou, nunca de quem você é ou de onde vem a sua família.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="grid content-start gap-2 rounded-[var(--r-lg)] border border-line bg-[var(--card)] p-5">
          <h2 className="m-0 font-display text-[19px] font-bold">Biblioteca</h2>
          <p className="m-0 font-ui text-[14px] leading-relaxed text-ink-body">
            Todas as fontes, com nível, forma de acesso e data de consulta, e cada afirmação que elas sustentam.
          </p>
          <Link href="/raizes/biblioteca" prefetch={false} className="font-ui text-[14px] font-semibold text-[var(--rz-mar)] underline underline-offset-2">Abrir a biblioteca</Link>
        </div>
        <div className="grid content-start gap-2 rounded-[var(--r-lg)] border border-dashed border-line p-5">
          <h2 className="m-0 font-display text-[19px] font-bold text-ink-muted">Laboratório de Memórias Familiares</h2>
          <p className="m-0 font-ui text-[14px] leading-relaxed text-ink-body">
            Em preparação, com o módulo 9. Vai ajudar a organizar uma pesquisa de família (árvore, fichas, diário, evidências)
            sem tirar conclusão automática sobre ascendência, e guardando os dados só no seu aparelho.
          </p>
        </div>
      </section>

      <section className="grid gap-2 rounded-[var(--r-lg)] border border-dashed border-line p-5">
        <h2 className="m-0 font-display text-[19px] font-bold text-ink-muted">{r.certificado.titulo}</h2>
        <p className="m-0 font-ui text-[14px] leading-relaxed text-ink-body">{r.certificado.nota}</p>
        <p className="m-0 font-ui text-[13px] leading-relaxed text-ink-muted">
          Ele vai certificar só a conclusão das atividades. Não certifica {listaComNem(r.certificado.naoCertifica)}.
        </p>
      </section>
    </div>
  );
}
