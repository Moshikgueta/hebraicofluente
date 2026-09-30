'use client';

/* Os estornos que dependem do dono (30/09/2026). Ver worker/src/api/estornos-admin.js.
 *
 * Lista o mesmo que o lembrete diário. Nos "com você" e "falhou", o botão
 * "Já devolvi o dinheiro" fecha o pedido: o acesso perde os meses dele e o
 * pedido sai da lista. Pede confirmação, porque não tem volta.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { asset } from '@/lib/asset';
import { CodigoDoAdmin, pedeCodigo } from '@/components/platform/CodigoDoAdmin';

type Item = {
  orderId: string; estado: 'manual' | 'erro' | 'pendente' | 'pedido'; erro: string; tentativas: number;
  criadoEm: number; valorCentavos: number; metodo: string; email: string | null;
};
type Estado = { tipo: 'carregando' } | { tipo: 'sem-sessao' } | { tipo: 'nao-admin' } | { tipo: 'codigo' } | { tipo: 'erro' }
  | { tipo: 'pronto'; itens: Item[] };

const ESTADO_PT: Record<Item['estado'], string> = {
  manual: 'Com você: devolva por fora',
  erro: 'O estorno automático falhou: devolva por fora',
  pendente: 'Estorno automático ainda tentando',
  pedido: 'A Mercado Pago ainda não confirmou'
};
const reais = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const data = (ms: number) => new Date(ms).toLocaleDateString('pt-BR');

export function EstornosClient() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const r = await fetch(asset('/api/admin/estornos'), { credentials: 'same-origin', cache: 'no-store' });
      if (r.status === 401) return setEstado({ tipo: 'sem-sessao' });
      if (await pedeCodigo(r)) return setEstado({ tipo: 'codigo' });
      if (r.status === 403) return setEstado({ tipo: 'nao-admin' });
      if (!r.ok) return setEstado({ tipo: 'erro' });
      const { estornos } = await r.json() as { estornos: Item[] };
      setEstado({ tipo: 'pronto', itens: estornos });
    } catch { setEstado({ tipo: 'erro' }); }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const marcar = async (orderId: string) => {
    setAviso(null);
    const r = await fetch(asset('/api/admin/estornos/feito'), {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId })
    }).catch(() => null);
    setConfirmando(null);
    if (!r || !r.ok) {
      setAviso(r?.status === 409
        ? 'Este estorno é automático: quem confirma é a Mercado Pago.'
        : 'Não consegui salvar agora. Tente de novo.');
      return;
    }
    setAviso(`Pedido ${orderId}: devolução registrada e acesso fechado.`);
    await carregar();
  };

  return (
    <main className="mx-auto max-w-[760px] px-4 py-10 grid gap-5">
      <header className="grid gap-2">
        <h1 className="text-[26px] font-bold m-0">Estornos</h1>
        <p className="font-ui text-[16px] text-ink-body m-0">
          As desistências que ainda não terminaram com o dinheiro devolvido, as mesmas do lembrete diário.
          Quando o estorno está com você (PIX direto) ou falhou, devolva o dinheiro por fora e depois toque em
          &quot;Já devolvi o dinheiro&quot;: o acesso fecha e o pedido sai da lista.
        </p>
      </header>

      <div role="status" aria-live="polite" className="font-ui text-[16px] grid gap-3">
        {estado.tipo === 'carregando' && <p className="m-0">Carregando…</p>}
        {estado.tipo === 'sem-sessao' && (
          <p className="m-0">
            Entre com a conta de administrador.{' '}
            <Link href="/entrar/?next=/admin/estornos/" className="text-[var(--accent)] underline">Entrar</Link>
          </p>
        )}
        {estado.tipo === 'nao-admin' && <p className="m-0">Esta conta não tem acesso a este painel.</p>}
        {estado.tipo === 'codigo' && <CodigoDoAdmin onPronto={() => void carregar()} />}
        {estado.tipo === 'erro' && <p className="m-0">Não consegui carregar agora. Confira a internet e tente de novo.</p>}
        {estado.tipo === 'pronto' && estado.itens.length === 0 && <p className="m-0">Nenhum estorno pendente.</p>}
        {aviso && <p className="m-0 font-semibold">{aviso}</p>}
      </div>

      {estado.tipo === 'pronto' && estado.itens.map(e => {
        const comVoce = e.estado === 'manual' || e.estado === 'erro';
        return (
          <article key={e.orderId} className="rounded-lg border border-[var(--line)] bg-surface p-4 grid gap-2">
            <p className="font-ui text-[15px] m-0">
              <strong>{ESTADO_PT[e.estado]}</strong>
            </p>
            <p className="font-ui text-[14px] text-ink-body m-0 break-all">
              Pedido {e.orderId} · {reais(e.valorCentavos)} · {e.metodo === 'pix' ? 'PIX' : 'cartão'} · desistência em {data(e.criadoEm)}
              {' · '}{e.email ?? 'conta apagada'}
            </p>
            {e.erro && <p className="font-ui text-[13px] text-ink-muted m-0 break-all">Motivo: {e.erro}</p>}
            {comVoce && (
              confirmando === e.orderId ? (
                <div className="grid gap-2">
                  <p className="font-ui text-[14px] m-0">
                    Confirma que o dinheiro já voltou para a pessoa? O acesso ao curso fecha agora e isso não tem volta.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void marcar(e.orderId)}>Sim, já devolvi</Button>
                    <Button variant="ghost" onClick={() => setConfirmando(null)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div><Button variant="secondary" onClick={() => setConfirmando(e.orderId)}>Já devolvi o dinheiro</Button></div>
              )
            )}
          </article>
        );
      })}
    </main>
  );
}
