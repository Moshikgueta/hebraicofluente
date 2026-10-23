'use client';

/* Quem comprou (02/10/2026). Ver worker/src/api/vendas-admin.js.
 *
 * As últimas compras pagas ou estornadas: nome, e-mail, valor, meio, data e,
 * quando houver, o link de campanha de onde o pedido veio. Só leitura.
 * Desde 23/10/2026, também a origem da visita (lib/origem.ts) e a campanha,
 * e as compras de contas de administrador (os testes do dono) vão à parte.
 * Desde 05/10/2026, também se a pessoa já começou o curso, e até onde foi.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import { CodigoDoAdmin, pedeCodigo } from '@/components/platform/CodigoDoAdmin';
import { course, letterIds } from '@/lib/content-publico';
import { FONTES_PT } from '@/lib/painel-estatisticas';

type Venda = {
  orderId: string; curso: string; valorCentavos: number; metodo: string; parcelas: number;
  status: 'paid' | 'refunded'; pagoEm: number; parceria: string | null; origem?: string | null; campanha?: string | null;
  nome: string; email: string | null;
  estudouEm: number | null; concluidas: string[]; teste?: boolean;
};
type Estado = { tipo: 'carregando' } | { tipo: 'sem-sessao' } | { tipo: 'nao-admin' } | { tipo: 'codigo' } | { tipo: 'erro' }
  | { tipo: 'pronto'; vendas: Venda[] };

/* O endereço que o dono divulgou, para cada nome de parceria. */
const LINK: Record<string, string> = {
  sefarad: 'hebraicofluente.com.br/sefarad', bio: 'hebraicofluente.com.br/bio',
  stories: 'hebraicofluente.com.br/stories', dm: 'hebraicofluente.com.br/dm'
};

const reais = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const LETRAS = new Set(letterIds());
const quando = (ms: number) => new Date(ms).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export function VendasClient() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });

  const carregar = useCallback(async () => {
    try {
      const r = await fetch(asset('/api/admin/vendas'), { credentials: 'same-origin', cache: 'no-store' });
      if (r.status === 401) return setEstado({ tipo: 'sem-sessao' });
      if (await pedeCodigo(r)) return setEstado({ tipo: 'codigo' });
      if (r.status === 403) return setEstado({ tipo: 'nao-admin' });
      if (!r.ok) return setEstado({ tipo: 'erro' });
      const { vendas } = await r.json() as { vendas: Venda[] };
      setEstado({ tipo: 'pronto', vendas });
    } catch { setEstado({ tipo: 'erro' }); }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const reaisDeAlunos = estado.tipo === 'pronto' ? estado.vendas.filter(v => !v.teste) : [];
  const testes = estado.tipo === 'pronto' ? estado.vendas.filter(v => v.teste) : [];
  const pagas = reaisDeAlunos.filter(v => v.status === 'paid');
  const doLink = pagas.filter(v => v.parceria).length;

  return (
    <main className="mx-auto max-w-[760px] px-4 py-10 grid gap-5">
      <header className="grid gap-2">
        <h1 className="text-[26px] font-bold m-0">Vendas</h1>
        <p className="font-ui text-[16px] text-ink-body m-0">
          As compras pagas, da mais recente para a mais antiga. Quando a pessoa chegou por um link de campanha,
          a compra mostra qual. Compras feitas antes de 02/10/2026 aparecem sem essa informação.
        </p>
      </header>

      <div role="status" aria-live="polite" className="font-ui text-[16px] grid gap-3">
        {estado.tipo === 'carregando' && <p className="m-0">Carregando…</p>}
        {estado.tipo === 'sem-sessao' && (
          <p className="m-0">
            Entre com a conta de administrador.{' '}
            <Link href="/entrar/?next=/admin/vendas/" className="text-[var(--accent)] underline">Entrar</Link>
          </p>
        )}
        {estado.tipo === 'nao-admin' && <p className="m-0">Esta conta não tem acesso a este painel.</p>}
        {estado.tipo === 'codigo' && <CodigoDoAdmin onPronto={() => void carregar()} />}
        {estado.tipo === 'erro' && <p className="m-0">Não consegui carregar agora. Confira a internet e tente de novo.</p>}
        {estado.tipo === 'pronto' && reaisDeAlunos.length === 0 && <p className="m-0">Nenhuma compra de aluno ainda.</p>}
        {estado.tipo === 'pronto' && pagas.length > 0 && (
          <p className="m-0">
            <strong>{pagas.length}</strong> {pagas.length === 1 ? 'compra paga' : 'compras pagas'}
            {' · '}{reais(pagas.reduce((s, v) => s + v.valorCentavos, 0))}
            {' · '}{doLink} pelo link de campanha
          </p>
        )}
      </div>

      {reaisDeAlunos.map(v => <Cartao key={v.orderId} v={v} />)}

      {testes.length > 0 && (
        <details className="font-ui text-[15px]">
          <summary className="cursor-pointer">
            Testes do administrador ({testes.length}): compras de contas de ADMIN_EMAILS, fora dos totais
          </summary>
          <div className="grid gap-3 mt-3">
            {testes.map(v => <Cartao key={v.orderId} v={v} />)}
          </div>
        </details>
      )}
    </main>
  );
}

function Cartao({ v }: { v: Venda }) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-surface p-4 grid gap-1">
      <p className="font-ui text-[16px] m-0 break-words">
        <strong>{v.nome || 'Sem nome'}</strong>
        {' · '}<span className="break-all">{v.email ?? 'conta apagada'}</span>
      </p>
      <p className="font-ui text-[14px] text-ink-body m-0 break-all">
        {reais(v.valorCentavos)} · {v.metodo === 'pix' ? 'PIX' : v.parcelas > 1 ? `cartão em ${v.parcelas}x` : 'cartão'}
        {' · '}{quando(v.pagoEm)} · pedido {v.orderId}
      </p>
      {v.parceria && (
        <p className="font-ui text-[14px] m-0"><strong>Veio pelo link {LINK[v.parceria] ?? v.parceria}</strong></p>
      )}
      {v.origem && (
        <p className="font-ui text-[14px] m-0">
          Origem: {FONTES_PT[v.origem] ?? v.origem}{v.campanha ? ` · campanha ${v.campanha}` : ''}
        </p>
      )}
      {v.status === 'paid' && (
        <p className="font-ui text-[14px] m-0">
          {v.estudouEm === null
            ? 'Ainda não começou o curso.'
            : <>Estudou pela última vez em {quando(v.estudouEm)} · {v.concluidas.filter(id => LETRAS.has(id)).length} de {course.totalLetters} letras concluídas</>}
        </p>
      )}
      {v.status === 'refunded' && <p className="font-ui text-[14px] text-ink-muted m-0">Estornada</p>}
    </article>
  );
}
