'use client';

/* Os depoimentos dos alunos (29/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O dono lê cada um e marca "aprovado" ou "recusado". Só dá para aprovar o
 * que o aluno autorizou publicar; o texto não se edita aqui. Pôr um aprovado
 * na página de vendas é um passo à parte, escolhido pelo dono.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { asset } from '@/lib/asset';

type Item = {
  id: number; email: string; nomeConta: string; texto: string; assinatura: string;
  publicar: boolean; contato: boolean; estado: 'novo' | 'aprovado' | 'recusado'; atualizadoEm: number;
};
type Estado = { tipo: 'carregando' } | { tipo: 'sem-sessao' } | { tipo: 'nao-admin' } | { tipo: 'erro' }
  | { tipo: 'pronto'; itens: Item[] };

const ESTADO_PT = { novo: 'Novo', aprovado: 'Aprovado', recusado: 'Recusado' } as const;
const data = (ms: number) => new Date(ms).toLocaleDateString('pt-BR');

export function DepoimentosClient() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const [aviso, setAviso] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const r = await fetch(asset('/api/admin/depoimentos'), { credentials: 'same-origin', cache: 'no-store' });
      if (r.status === 401) return setEstado({ tipo: 'sem-sessao' });
      if (r.status === 403) return setEstado({ tipo: 'nao-admin' });
      if (!r.ok) return setEstado({ tipo: 'erro' });
      const { depoimentos } = await r.json() as { depoimentos: Item[] };
      setEstado({ tipo: 'pronto', itens: depoimentos });
    } catch { setEstado({ tipo: 'erro' }); }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const julgar = async (id: number, novo: Item['estado']) => {
    setAviso(null);
    const r = await fetch(asset('/api/admin/depoimentos'), {
      method: 'PUT', credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, estado: novo })
    }).catch(() => null);
    if (!r || !r.ok) {
      setAviso(r?.status === 409 ? 'Este aluno não autorizou publicar: o depoimento não pode ser aprovado.'
        : 'Não consegui salvar agora. Tente de novo.');
      return;
    }
    await carregar();
  };

  return (
    <main className="mx-auto max-w-[760px] px-4 py-10 grid gap-5">
      <header className="grid gap-2">
        <h1 className="text-[26px] font-bold m-0">Depoimentos</h1>
        <p className="font-ui text-[16px] text-ink-body m-0">
          O que os alunos escreveram em /depoimento, os novos primeiro. Só dá para aprovar quem autorizou
          publicar. Aprovar não publica nada sozinho: é a lista de onde você escolhe o que vai para o site.
          Se o aluno retirar a autorização, o depoimento some daqui, e precisa sair do site em até 7 dias.
        </p>
      </header>

      <div role="status" aria-live="polite" className="font-ui text-[16px] grid gap-3">
        {estado.tipo === 'carregando' && <p className="m-0">Carregando…</p>}
        {estado.tipo === 'sem-sessao' && (
          <p className="m-0">
            Entre com a conta de administrador.{' '}
            <Link href="/entrar/?next=/admin/depoimentos/" className="text-[var(--accent)] underline">Entrar</Link>
          </p>
        )}
        {estado.tipo === 'nao-admin' && <p className="m-0">Esta conta não tem acesso a este painel.</p>}
        {estado.tipo === 'erro' && <p className="m-0">Não consegui carregar agora. Confira a internet e tente de novo.</p>}
        {estado.tipo === 'pronto' && estado.itens.length === 0 && <p className="m-0">Nenhum depoimento ainda.</p>}
        {aviso && <p className="m-0 text-[var(--ember)]">{aviso}</p>}
      </div>

      {estado.tipo === 'pronto' && estado.itens.map(d => (
        <article key={d.id} className="rounded-lg border border-[var(--line)] bg-surface p-4 grid gap-3">
          <p className="font-ui text-[13px] text-ink-muted m-0 break-all">
            <strong className="text-ink">{ESTADO_PT[d.estado]}</strong> · {data(d.atualizadoEm)} · {d.email}
            {d.nomeConta ? ` (${d.nomeConta})` : ''}
          </p>
          <blockquote className="m-0 text-[16px] leading-relaxed whitespace-pre-line">“{d.texto}”</blockquote>
          <p className="font-ui text-[14px] font-semibold m-0">- {d.assinatura}</p>
          <p className="font-ui text-[13px] m-0">
            {d.publicar ? 'Autorizou publicar.' : 'NÃO autorizou publicar: só para você ler.'}
            {' '}{d.contato ? 'Aceita um e-mail sobre o depoimento.' : 'Não quer ser contatado.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant={d.estado === 'aprovado' ? 'primary' : 'secondary'} disabled={!d.publicar}
                    onClick={() => julgar(d.id, 'aprovado')}>Aprovar</Button>
            <Button variant={d.estado === 'recusado' ? 'primary' : 'secondary'}
                    onClick={() => julgar(d.id, 'recusado')}>Recusar</Button>
          </div>
        </article>
      ))}
    </main>
  );
}
