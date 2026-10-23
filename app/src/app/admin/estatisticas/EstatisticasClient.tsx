'use client';

/* Onde os alunos erram e onde param (30/09/2026). Só contadores, somados
 * por dia no servidor, sem identificar ninguém: ver
 * worker/src/api/estatisticas.js e lib/painel-estatisticas.ts. */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import { CodigoDoAdmin, pedeCodigo } from '@/components/platform/CodigoDoAdmin';
import { course } from '@/lib/content-publico';
import {
  crescimentoPorFonte, funilDaDemo, funilDaPrevia, funilDoComece, funilDoPortal, MOTIVOS_PT, ondeErram, ondeParam, ordemDoPlano, TIPO_PT,
  type Etapa, type PedidosDaFonte, type Resposta
} from '@/lib/painel-estatisticas';

type Campanha = { origem: string; visitas: number };
type Dados = { dias: number; desde: string; respostas: Resposta[]; etapas: Etapa[]; campanhas?: Campanha[]; demo?: { etapa: string; n: number }[]; portal?: { evento: string; n: number }[]; motivos?: { motivo: string; n: number }[];
  porFonte?: { evento: string; fonte: string; n: number }[]; pedidos?: PedidosDaFonte[] };
type Estado = { tipo: 'carregando' } | { tipo: 'sem-sessao' } | { tipo: 'nao-admin' } | { tipo: 'codigo' } | { tipo: 'erro' }
  | { tipo: 'pronto'; dados: Dados };

const pct = (x: number | null) => (x == null ? '-' : `${Math.round(x * 100)}%`);
const pct1 = (x: number | null) => (x == null ? '-' : `${(x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`);
const reais = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function Crescimento({ dados }: { dados: Dados }) {
  const { linhas, total } = crescimentoPorFonte(dados.porFonte || [], dados.pedidos || []);
  return (
    <section className="grid gap-3">
      <h2 className="text-[20px] font-semibold m-0">Crescimento por origem</h2>
      <p className="font-ui text-[14px] text-ink-muted m-0">
        De onde veio cada visita (a primeira página dela, pelo link de campanha, pela UTM ou pelo site que mandou a
        pessoa) e o que ela fez: abriu a página de venda, abriu o checkout, criou um pedido, pagou. A conversão é
        compras sobre visitas da página de venda da mesma origem. Receita = pagos no período, sem os estornados.
        Detalhe de cada compra em <Link href="/admin/vendas" className="underline">Quem comprou</Link>.
      </p>
      {linhas.length ? (
        <div className="overflow-x-auto">
          <table className="w-full font-ui text-[14px] border-collapse">
            <thead><tr className="text-left text-ink-muted">
              <th className="py-2 pr-3">Origem</th><th className="py-2 pr-3 text-right">Página de venda</th>
              <th className="py-2 pr-3 text-right">Checkout</th><th className="py-2 pr-3 text-right">Pedidos</th>
              <th className="py-2 pr-3 text-right">Compras</th><th className="py-2 pr-3 text-right">Conversão</th>
              <th className="py-2 pr-3 text-right">Receita</th><th className="py-2 text-right">Estornos</th>
            </tr></thead>
            <tbody>
              {linhas.map(l => (
                <tr key={l.fonte} className="border-t border-[color:var(--line-soft)]">
                  <td className="py-2 pr-3">{l.nome}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{l.venda}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{l.checkout}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{l.pedidos}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{l.compras}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{pct1(l.conversao)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{reais(l.receitaCentavos)}</td>
                  <td className="py-2 text-right tabular-nums">{l.estornos}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-[color:var(--line)] font-semibold">
                <td className="py-2 pr-3">Total</td>
                <td className="py-2 pr-3 text-right tabular-nums">{total.venda}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{total.checkout}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{total.pedidos}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{total.compras}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{pct1(total.conversao)}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{reais(total.receitaCentavos)}</td>
                <td className="py-2 text-right tabular-nums">{total.estornos}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : <p className="font-ui text-[14px] m-0">Ainda não há visitas nem pedidos com origem neste período.</p>}
    </section>
  );
}

export function EstatisticasClient() {
  const [dias, setDias] = useState(30);
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });

  const carregar = useCallback(async (d: number) => {
    setEstado({ tipo: 'carregando' });
    try {
      const r = await fetch(asset(`/api/admin/estatisticas?dias=${d}`), { credentials: 'same-origin', cache: 'no-store' });
      if (r.status === 401) return setEstado({ tipo: 'sem-sessao' });
      if (await pedeCodigo(r)) return setEstado({ tipo: 'codigo' });
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
        {estado.tipo === 'codigo' && <CodigoDoAdmin onPronto={() => void carregar(dias)} />}
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

            <Crescimento dados={estado.dados} />

            <section className="grid gap-3">
              <h2 className="text-[20px] font-semibold m-0">A capa (portal)</h2>
              <p className="font-ui text-[14px] text-ink-muted m-0">
                O que os visitantes fizeram na capa, contando cada pessoa uma vez por visita. A porcentagem é
                sobre quem viu a capa. Depois dela, o teste grátis da página de venda está logo abaixo, e as
                compras estão em <Link href="/admin/vendas" className="underline">Quem comprou</Link>.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full font-ui text-[14px] border-collapse">
                  <thead><tr className="text-left text-ink-muted">
                    <th className="py-2 pr-3">Onde</th><th className="py-2 pr-3">O quê</th>
                    <th className="py-2 pr-3 text-right">Pessoas</th><th className="py-2 text-right">De quem viu</th>
                  </tr></thead>
                  <tbody>{funilDoPortal(estado.dados.portal || []).map(l => (
                    <tr key={l.evento} className="border-t border-[color:var(--line-soft)]">
                      <td className="py-2 pr-3 text-ink-muted">{l.grupo}</td>
                      <td className="py-2 pr-3">{l.nome}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{l.n}</td>
                      <td className="py-2 text-right tabular-nums">{pct(l.deQuemViu)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-3">
              <h2 className="text-[20px] font-semibold m-0">Comece aqui (link da bio)</h2>
              <p className="font-ui text-[14px] text-ink-muted m-0">
                A página /comece-aqui, para onde vai o link da bio do Instagram. Cada pessoa conta uma vez por
                visita; a porcentagem é sobre quem abriu a página. Quantas tocaram no link está em Links de
                campanha (bio); quem escolheu ler hebraico segue no teste grátis, logo abaixo.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full font-ui text-[14px] border-collapse">
                  <thead><tr className="text-left text-ink-muted">
                    <th className="py-2 pr-3">O quê</th>
                    <th className="py-2 pr-3 text-right">Pessoas</th><th className="py-2 text-right">De quem abriu</th>
                  </tr></thead>
                  <tbody>{funilDoComece(estado.dados.portal || []).map(l => (
                    <tr key={l.evento} className="border-t border-[color:var(--line-soft)]">
                      <td className="py-2 pr-3">{l.nome}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{l.n}</td>
                      <td className="py-2 text-right tabular-nums">{pct(l.deQuemAbriu)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-3">
              <h2 className="text-[20px] font-semibold m-0">Prévia do e-book (Instagram)</h2>
              <p className="font-ui text-[14px] text-ink-muted m-0">
                A prévia grátis de Israel Além do Óbvio em /previa, aberta pelo link que vai no direct a quem
                comenta EBOOK. Cada pessoa conta uma vez por visita; a porcentagem é sobre quem abriu a prévia.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full font-ui text-[14px] border-collapse">
                  <thead><tr className="text-left text-ink-muted">
                    <th className="py-2 pr-3">O quê</th>
                    <th className="py-2 pr-3 text-right">Pessoas</th><th className="py-2 text-right">De quem abriu</th>
                  </tr></thead>
                  <tbody>{funilDaPrevia(estado.dados.portal || []).map(l => (
                    <tr key={l.evento} className="border-t border-[color:var(--line-soft)]">
                      <td className="py-2 pr-3">{l.nome}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{l.n}</td>
                      <td className="py-2 text-right tabular-nums">{pct(l.deQuemAbriu)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-3">
              <h2 className="text-[20px] font-semibold m-0">Teste grátis da página de venda</h2>
              <p className="font-ui text-[14px] text-ink-muted m-0">
                Quantos visitantes chegaram a cada etapa do teste do Álef, contando cada pessoa uma vez por visita.
                A porcentagem é sobre quem viu o teste. Uma queda grande de uma etapa para a seguinte mostra onde
                as pessoas desistem.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full font-ui text-[14px] border-collapse">
                  <thead><tr className="text-left text-ink-muted">
                    <th className="py-2 pr-3">Etapa</th><th className="py-2 pr-3 text-right">Pessoas</th>
                    <th className="py-2 text-right">De quem viu</th>
                  </tr></thead>
                  <tbody>{funilDaDemo(estado.dados.demo || []).map(l => (
                    <tr key={l.etapa} className="border-t border-[color:var(--line-soft)]">
                      <td className="py-2 pr-3">{l.nome}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{l.n}</td>
                      <td className="py-2 text-right tabular-nums">{pct(l.deQuemViu)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-3">
              <h2 className="text-[20px] font-semibold m-0">Motivos de desistência</h2>
              <p className="font-ui text-[14px] text-ink-muted m-0">
                O que as pessoas escolheram ao desistir da compra. É opcional, então nem toda desistência
                aparece aqui. Não identifica ninguém.
              </p>
              {(estado.dados.motivos || []).length === 0 ? (
                <p className="font-ui text-[15px] m-0">Nenhum motivo informado no período.</p>
              ) : (
                <ul className="list-none p-0 m-0 grid gap-1 font-ui text-[15px]">
                  {[...(estado.dados.motivos || [])].sort((a, b) => b.n - a.n).map(m => (
                    <li key={m.motivo} className="flex justify-between gap-4 border-t border-[color:var(--line-soft)] py-2">
                      <span>{MOTIVOS_PT[m.motivo as keyof typeof MOTIVOS_PT] ?? m.motivo}</span>
                      <span className="tabular-nums font-semibold">{m.n}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="grid gap-3">
              <h2 className="text-[20px] font-semibold m-0">Links de campanha</h2>
              <p className="font-ui text-[14px] text-ink-muted m-0">
                Visitas que entraram pelo link curto. O da bio leva à página Comece aqui; os outros, ao teste
                grátis. Robôs de pré-visualização não contam.
              </p>
              <ul className="list-none p-0 m-0 grid gap-1 font-ui text-[15px]">
                {['sefarad', 'bio', 'stories', 'dm'].map(origem => (
                  <li key={origem} className="flex justify-between gap-4 border-t border-[color:var(--line-soft)] py-2">
                    <span>hebraicofluente.com.br/{origem}</span>
                    <span className="tabular-nums font-semibold">
                      {(estado.dados.campanhas || []).find(c => c.origem === origem)?.visitas ?? 0} visitas
                    </span>
                  </li>
                ))}
              </ul>
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
