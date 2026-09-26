'use client';

/* Os erros que os alunos apontaram, agrupados por exercício.
 * ─────────────────────────────────────────────────────────────────────────
 * Três alunos apontando a mesma questão viram UM cartão com "3 relatos", e
 * não três linhas soltas: o que importa é qual questão está errada, e quantas
 * vezes isso incomodou alguém. O cartão mostra a questão como os alunos a
 * viram - enunciado, hebraico, alternativas, a certa e as escolhidas - e os
 * motivos e comentários de cada um. "Resolvido" fecha todos os relatos
 * daquela questão de uma vez.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { asset } from '@/lib/asset';

type Foto = {
  enunciado: string; hebraico: string; opcoes: string[];
  certa: string; escolhida: string; acertou: boolean;
};
type Relato = {
  id: number; exercicio: string; tipo: string; letra: string; rota: string;
  motivo: string; comentario: string; foto: Foto; criado_em: number; resolvido_em: number | null;
};
type Carga = 'carregando' | 'sem-sessao' | 'nao-admin' | 'erro' | 'pronto';

const MOTIVO: Record<string, string> = {
  resposta: 'A resposta certa está errada',
  hebraico: 'Erro no hebraico ou nos pontos',
  audio: 'O áudio está errado',
  confuso: 'O enunciado está confuso',
  outro: 'Outro'
};

const data = (t: number) => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const temHebraico = (t: string) => /[֐-׿]/.test(t);
const Texto = ({ t }: { t: string }) => (temHebraico(t) ? <He size="word">{t}</He> : <>{t}</>);

export function RelatosClient() {
  const [carga, setCarga] = useState<Carga>('carregando');
  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [todos, setTodos] = useState(false);

  const carregar = useCallback(() => {
    fetch(asset(`/api/admin/relatos${todos ? '?todos=1' : ''}`), { credentials: 'same-origin', cache: 'no-store' })
      .then(async r => {
        if (r.status === 401) return setCarga('sem-sessao');
        if (r.status === 403) return setCarga('nao-admin');
        if (!r.ok) return setCarga('erro');
        setRelatos(((await r.json()) as { relatos: Relato[] }).relatos);
        setCarga('pronto');
      })
      .catch(() => setCarga('erro'));
  }, [todos]);

  useEffect(() => { carregar(); }, [carregar]);

  /* Um grupo por exercício, o mais relatado primeiro; empate, o mais recente. */
  const grupos = useMemo(() => {
    const m = new Map<string, Relato[]>();
    for (const r of relatos) m.set(r.exercicio, [...(m.get(r.exercicio) ?? []), r]);
    return [...m.values()].sort((a, b) =>
      b.length - a.length || Math.max(...b.map(x => x.criado_em)) - Math.max(...a.map(x => x.criado_em)));
  }, [relatos]);

  const resolver = async (exercicio: string, reabrir = false) => {
    const r = await fetch(asset('/api/admin/relatos/resolver'), {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercicio, reabrir })
    });
    if (r.ok) carregar();
  };

  if (carga !== 'pronto') {
    const texto = {
      carregando: 'Carregando os relatos…',
      'sem-sessao': 'Entre com a conta de administrador para ver os relatos.',
      'nao-admin': 'Esta conta não tem acesso ao painel.',
      erro: 'Não consegui carregar os relatos. Confira a internet e recarregue a página.'
    }[carga];
    return (
      <main className="mx-auto max-w-[760px] px-4 py-10 grid gap-4">
        <h1 className="text-[26px] font-bold m-0">Relatos de erro</h1>
        <p className="font-ui text-[16px] text-ink-body m-0" role={carga === 'carregando' ? 'status' : 'alert'}>{texto}</p>
        {carga === 'sem-sessao' && (
          <Link href="/entrar/?next=/admin/relatos/" className="font-ui text-[16px] text-[var(--accent)] underline">Entrar</Link>
        )}
      </main>
    );
  }

  const abertos = grupos.filter(g => g.some(r => r.resolvido_em === null)).length;

  return (
    <main className="mx-auto max-w-[760px] px-4 py-6 grid gap-5">
      <header className="grid gap-2">
        <nav className="flex gap-4 font-ui text-[13px]">
          <Link href="/admin/gravar/" className="text-ink-muted underline">Gravar pronúncias</Link>
          <span className="text-ink font-semibold">Relatos de erro</span>
        </nav>
        <h1 className="text-[26px] sm:text-[30px] font-bold leading-tight m-0">Relatos de erro</h1>
        <p className="font-ui text-[15px] text-ink-body m-0">
          {abertos === 0 ? 'Nenhuma questão com relato aberto.' : `${abertos} questão(ões) com relato aberto.`}
        </p>
        <label className="flex items-center gap-2 font-ui text-[14px] text-ink-body">
          <input type="checkbox" checked={todos} onChange={e => setTodos(e.target.checked)} className="w-5 h-5" />
          Mostrar também os resolvidos
        </label>
      </header>

      <ul className="list-none p-0 m-0 grid gap-4">
        {grupos.map(g => {
          const r0 = g[0]!;
          const f = r0.foto;
          const aberto = g.some(r => r.resolvido_em === null);
          return (
            <li key={r0.exercicio}
                className={`rounded-[var(--r-lg)] border p-5 grid gap-3 ${aberto ? 'border-line bg-surface' : 'border-line bg-surface-2 opacity-75'}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="font-ui text-[12.5px] text-ink-muted m-0">
                  <strong className="text-ink">{g.length} relato{g.length > 1 ? 's' : ''}</strong>
                  {' · '}{r0.tipo} · letra {r0.letra} · <code>{r0.exercicio}</code>
                </p>
                <button type="button" onClick={() => resolver(r0.exercicio, !aberto)}
                        className={`min-h-[40px] px-3 rounded-full font-ui text-[13.5px] font-semibold
                          ${aberto ? 'bg-[var(--teal)] text-white' : 'border border-line text-ink-body'}`}>
                  {aberto ? '✓ Resolvido' : 'Reabrir'}
                </button>
              </div>

              <div className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-2">
                <p className="font-ui text-[15px] font-semibold text-ink m-0">{f.enunciado}</p>
                {f.hebraico && <div className="text-center"><He size="lg">{f.hebraico}</He></div>}
                {f.opcoes.length > 0 && (
                  <ul className="list-none p-0 m-0 grid gap-1.5">
                    {f.opcoes.map((o, k) => (
                      <li key={k} className={`flex items-center justify-between gap-2 rounded-[var(--r-sm)] px-3 py-1.5 font-ui text-[14.5px]
                        ${o === f.certa ? 'bg-[var(--teal-soft)] text-[var(--teal-ink)]' : 'bg-surface text-ink-body'}`}>
                        <Texto t={o} />
                        <span className="text-[12px]">
                          {o === f.certa ? 'a certa' : ''}
                          {g.some(r => r.foto.escolhida === o && o !== r.foto.certa) ? ' · escolhida' : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <ul className="list-none p-0 m-0 grid gap-2">
                {g.map(r => (
                  <li key={r.id} className="font-ui text-[14px] text-ink-body">
                    <span className="text-ink-muted">{data(r.criado_em)} · </span>
                    <strong>{MOTIVO[r.motivo] ?? r.motivo}</strong>
                    {r.foto.acertou ? ' (acertou a questão)' : ''}
                    {r.comentario && <span className="block mt-0.5 pl-3 border-l-2 border-line">“{r.comentario}”</span>}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
