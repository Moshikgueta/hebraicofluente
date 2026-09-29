'use client';

/* Identificar uma cópia do curso (29/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O conteúdo que cada aluno recebe leva uma marca invisível da conta dele
 * (worker/src/lib/marca.js). Achou o curso copiado num site, num grupo ou
 * num PDF? Copie um trecho de uma carta de cultura ou de um "Você sabia?"
 * de lá, cole aqui, e o painel diz de qual conta a cópia saiu.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { asset } from '@/lib/asset';

type Dono = { marca: string; accountId: number | null; email: string | null; criadaEm: number | null };
type Estado =
  | { tipo: 'vazio' } | { tipo: 'buscando' } | { tipo: 'sem-sessao' } | { tipo: 'nao-admin' }
  | { tipo: 'erro' } | { tipo: 'pronto'; donos: Dono[] };

const data = (ms: number | null) => (ms ? new Date(ms).toLocaleDateString('pt-BR') : '');

export function MarcaClient() {
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<Estado>({ tipo: 'vazio' });

  const buscar = async () => {
    setEstado({ tipo: 'buscando' });
    try {
      const r = await fetch(asset('/api/admin/marca'), {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto })
      });
      if (r.status === 401) return setEstado({ tipo: 'sem-sessao' });
      if (r.status === 403) return setEstado({ tipo: 'nao-admin' });
      if (!r.ok) return setEstado({ tipo: 'erro' });
      const { marcas } = await r.json() as { marcas: Dono[] };
      setEstado({ tipo: 'pronto', donos: marcas });
    } catch {
      setEstado({ tipo: 'erro' });
    }
  };

  return (
    <main className="mx-auto max-w-[720px] px-4 py-10 grid gap-5">
      <header className="grid gap-2">
        <h1 className="text-[26px] font-bold m-0">Identificar uma cópia</h1>
        <p className="font-ui text-[16px] text-ink-body m-0">
          Cada aluno recebe o curso com uma marca invisível da conta dele. Copie um trecho da
          cópia que você achou (o texto de uma carta de cultura ou de um &quot;Você sabia?&quot;
          serve), cole abaixo e clique em Identificar.
        </p>
      </header>

      <label className="grid gap-2 font-ui text-[15px] font-semibold">
        Trecho copiado
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-[var(--line)] bg-surface p-3 font-ui text-[15px] font-normal"
        />
      </label>
      <div>
        <Button onClick={buscar} disabled={!texto.trim() || estado.tipo === 'buscando'}>
          {estado.tipo === 'buscando' ? 'Procurando…' : 'Identificar'}
        </Button>
      </div>

      <div role="status" aria-live="polite" className="font-ui text-[16px] grid gap-3">
        {estado.tipo === 'sem-sessao' && (
          <p className="m-0">
            Entre com a conta de administrador.{' '}
            <Link href="/entrar/?next=/admin/marca/" className="text-[var(--accent)] underline">Entrar</Link>
          </p>
        )}
        {estado.tipo === 'nao-admin' && <p className="m-0">Esta conta não tem acesso a este painel.</p>}
        {estado.tipo === 'erro' && <p className="m-0">Não consegui consultar agora. Confira a internet e tente de novo.</p>}
        {estado.tipo === 'pronto' && estado.donos.length === 0 && (
          <p className="m-0">
            Nenhuma marca neste trecho. A marca só vai junto quando o texto é copiado e colado; um
            print, um texto redigitado ou um trecho que não é de carta de cultura nem de
            &quot;Você sabia?&quot; não a carregam.
          </p>
        )}
        {estado.tipo === 'pronto' && estado.donos.map(d => (
          <div key={d.marca} className="rounded-lg border border-[var(--line)] p-3">
            <p className="m-0"><strong>Marca {d.marca.toUpperCase()}</strong></p>
            {d.email
              ? <p className="m-0 break-all">Conta: <strong>{d.email}</strong> (marca criada em {data(d.criadaEm)})</p>
              : <p className="m-0">Esta marca não pertence a nenhuma conta atual (a conta pode ter sido apagada).</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
