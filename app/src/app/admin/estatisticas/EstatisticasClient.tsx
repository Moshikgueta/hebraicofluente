'use client';

/* Onde os alunos erram e onde param (30/09/2026). Só contadores, somados
 * por dia no servidor, sem identificar ninguém: ver
 * worker/src/api/estatisticas.js e lib/painel-estatisticas.ts. */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import { course } from '@/lib/content-publico';
import {
  ondeErram, ondeParam, ordemDoPlano, TIPO_PT, type Etapa, type Resposta
} from '@/lib/painel-estatisticas';

type Dados = { dias: number; desde: string; respostas: Resposta[]; etapas: Etapa[] };
type Estado = { tipo: 'carregando' } | { tipo: 'sem-sessao' } | { tipo: 'nao-admin' } | { tipo: 'erro' }
  | { tipo: 'pronto'; dados: Dados };

const pct = (x: number | null) => (x == null ? '-' : `${Math.round(x * 100)}%`);

export function EstatisticasClient() {
  const [dias, setDias] = useState(30);
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });

  const carregar = useCallback(async (d: number) => {
    setEstado({ tipo: 'carregando' });
    try {
      const r = await fetch(asset(`/api/admin/estatisticas?dias=${d}`), { credentials: 'same-origin', cache: 'no-store' });
      if (r.status === 401) return setEstado({ tipo: 'sem-sessao' });
      if (r.status === 403) return setEstado({ tipo: 'nao-admin' });
      if (!r.ok) return setEstado({ tipo: 'erro' });
      setEstado({ tipo: 'pronto', dados: await r.json() as Dados });
    } catch { setEstado({ tipo: 'erro' }); }
  }, []);
  useEffect(() => { void carregar(dias); }, [carregar, dias]);

  const nome = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of course.letters) m.set(l.id, `${l.namePt} ${l.letter}`);
    for (const mod of course.modules) {
      for (const ls of mod.lessons) if (ls.som) m.set(`som-${ls.som}`, `${ls.nomePt ?? ls.som}${ls.he ? ` ${ls.he}` : ''}`);
      if (!mod.letterIds.length) m.set(mod.id, `Módulo ${mod.n}: ${mod.titlePt}`);
    }
    return (id: string) => m.get(id) ?? id;
  }, []);

  const ordem = useMemo(() => ordemDoPlano(course.modules), []);

  return (
    <main className="mx-auto max-w-[860px] px-4 py-10 grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-[26px] font-bold m-0">Onde os alunos erram e onde param</h1>
        <p className="font-ui text-[15px] text-ink-body m-0">
          Só contagens, sem nome nem conta de ninguém. Cada etapa conta uma vez por aluno (a primeira vez que
          ele a conclui); cada resposta conta sempre.
        </p>
        <label className="font-ui text-[14px] flex items-center gap-2">
          Período:
          <select value={dias} onChange={e => setDias(Number(e.target.value))}
                  className="min-h-[44px] rounded-md border border-[var(--line)] bg-surface px-2">
            <option value={7}>últimos 7 dias</option>
            <option value={30}>últimos 30 dias</option>
            <option value={90}>últimos 90 dias</option>
            <option value={365}>último ano</option>
          </select>
        </label>
      </header>

      <div role="status" aria-live="polite" className="font-ui text-[15px]">
        {estado.tipo === 'carregando' && <p className="m-0">Carregando…</p>}
        {estado.tipo === 'sem-sessao' && (
          <p className="m-0">Entre com a conta de administrador.{' '}
            <Link href="/entrar/?next=/admin/estatisticas/" className="text-[var(--accent)] underline">Entrar</Link></p>
        )}
        {estado.tipo === 'nao-admin' && <p className="m-0">Esta conta não tem acesso a este painel.</p>}
        {estado.tipo === 'erro' && <p className="m-0">Não consegui carregar agora. Tente de novo.</p>}
      </div>

      {estado.tipo === 'pronto' && (() => {
        const erros = ondeErram(estado.dados.respostas);
        const param = ondeParam(estado.dados.etapas, ordem);
        const totalRespostas = estado.dados.respostas.reduce((a, r) => a + r.total, 0);
        return (
          <>
            <section className="grid gap-3">
              <h2 className="text-[20px] font-semibold m-0">Onde mais erram</h2>
              <p className="font-ui text-[14px] text-ink-muted m-0">
                {totalRespostas} respostas no período. Aparecem só as combinações de tipo e lição com pelo menos
                10 respostas, da maior taxa de erro para a menor.
              </p>
              {erros.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full font-ui text-[14px] border-collapse">
                    <thead><tr className="text-left text-ink-muted">
                      <th className="py-2 pr-3">Lição</th><th className="py-2 pr-3">Tipo de exercício</th>
                      <th className="py-2 pr-3 text-right">Respostas</th><th className="py-2 text-right">Erro</th>
                    </tr></thead>
                    <tbody>{erros.map(r => (
                      <tr key={`${r.licao}|${r.kind}`} className="border-t border-[color:var(--line-soft)]">
                        <td className="py-2 pr-3">{nome(r.licao)}</td>
                        <td className="py-2 pr-3">{TIPO_PT[r.kind] ?? r.kind}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{r.total}</td>
                        <td className="py-2 text-right tabular-nums font-semibold">{pct(r.taxa)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="font-ui text-[14px] m-0">Ainda não há respostas bastantes para comparar.</p>}
            </section>

            <section className="grid gap-3">
              <h2 className="text-[20px] font-semibold m-0">Onde param</h2>
              <p className="font-ui text-[14px] text-ink-muted m-0">
                Na ordem do curso: quantos alunos concluíram a primeira etapa de cada lição e quantos chegaram à última.
                Uma queda grande de uma lição para a seguinte mostra onde as pessoas desistem.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full font-ui text-[14px] border-collapse">
                  <thead><tr className="text-left text-ink-muted">
                    <th className="py-2 pr-3">Lição</th><th className="py-2 pr-3 text-right">Começaram</th>
                    <th className="py-2 pr-3 text-right">Terminaram</th><th className="py-2 text-right">Terminaram %</th>
                  </tr></thead>
                  <tbody>{param.map(l => (
                    <tr key={l.id} className="border-t border-[color:var(--line-soft)]">
                      <td className="py-2 pr-3">{nome(l.id)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{l.comecaram}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{l.terminaram}</td>
                      <td className="py-2 text-right tabular-nums">{pct(l.taxa)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          </>
        );
      })()}
    </main>
  );
}
