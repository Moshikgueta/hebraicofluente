'use client';

/* "Como foi esta lição?" (05/10/2026). Ver worker/src/api/avaliacoes.js.
 *
 * O resumo por lição, da mais difícil para a mais fácil, e os últimos
 * comentários. As avaliações são anônimas: aqui não aparece quem respondeu.
 * Só leitura.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import { course } from '@/lib/content-publico';
import { CodigoDoAdmin, pedeCodigo } from '@/components/platform/CodigoDoAdmin';

type Linha = { licao: string; facil: number; ok: number; dificil: number };
type Comentario = { licao: string; nota: 'facil' | 'ok' | 'dificil'; comentario: string; em: number };
type Estado = { tipo: 'carregando' } | { tipo: 'sem-sessao' } | { tipo: 'nao-admin' } | { tipo: 'codigo' } | { tipo: 'erro' }
  | { tipo: 'pronto'; licoes: Linha[]; comentarios: Comentario[] };

const NOME = new Map(course.letters.map(l => [l.id, `${l.namePt} ${l.letter}`]));
const nome = (id: string) => NOME.get(id) ?? id;
const NOTA = { facil: '😊 fácil', ok: '🙂 ok', dificil: '😓 difícil' } as const;
const quando = (ms: number) => new Date(ms).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const total = (l: Linha) => l.facil + l.ok + l.dificil;

export function AvaliacoesClient() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });

  const carregar = useCallback(async () => {
    try {
      const r = await fetch(asset('/api/admin/avaliacoes'), { credentials: 'same-origin', cache: 'no-store' });
      if (r.status === 401) return setEstado({ tipo: 'sem-sessao' });
      if (await pedeCodigo(r)) return setEstado({ tipo: 'codigo' });
      if (r.status === 403) return setEstado({ tipo: 'nao-admin' });
      if (!r.ok) return setEstado({ tipo: 'erro' });
      const { licoes, comentarios } = await r.json() as { licoes: Linha[]; comentarios: Comentario[] };
      /* A mais difícil primeiro: é a que pede atenção. */
      licoes.sort((a, b) => b.dificil / total(b) - a.dificil / total(a) || total(b) - total(a));
      setEstado({ tipo: 'pronto', licoes, comentarios });
    } catch { setEstado({ tipo: 'erro' }); }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  return (
    <main className="mx-auto max-w-[760px] px-4 py-10 grid gap-5">
      <header className="grid gap-2">
        <h1 className="text-[26px] font-bold m-0">Avaliações das lições</h1>
        <p className="font-ui text-[16px] text-ink-body m-0">
          O que os alunos responderam em &quot;Como foi esta lição?&quot;, no fim de cada letra. As respostas
          são anônimas. A lição com mais respostas &quot;difícil&quot; aparece primeiro.
        </p>
      </header>

      <div role="status" aria-live="polite" className="font-ui text-[16px] grid gap-3">
        {estado.tipo === 'carregando' && <p className="m-0">Carregando…</p>}
        {estado.tipo === 'sem-sessao' && (
          <p className="m-0">
            Entre com a conta de administrador.{' '}
            <Link href="/entrar/?next=/admin/avaliacoes/" className="text-[var(--accent)] underline">Entrar</Link>
          </p>
        )}
        {estado.tipo === 'nao-admin' && <p className="m-0">Esta conta não tem acesso a este painel.</p>}
        {estado.tipo === 'codigo' && <CodigoDoAdmin onPronto={() => void carregar()} />}
        {estado.tipo === 'erro' && <p className="m-0">Não consegui carregar agora. Confira a internet e tente de novo.</p>}
        {estado.tipo === 'pronto' && estado.licoes.length === 0 && <p className="m-0">Nenhuma avaliação ainda.</p>}
      </div>

      {estado.tipo === 'pronto' && estado.licoes.length > 0 && (
        <section className="grid gap-2">
          <h2 className="text-[19px] font-bold m-0">Por lição</h2>
          {estado.licoes.map(l => (
            <article key={l.licao} className="rounded-lg border border-[var(--line)] bg-surface p-4 grid gap-1">
              <p className="font-ui text-[16px] m-0"><strong>{nome(l.licao)}</strong> · {total(l)} {total(l) === 1 ? 'resposta' : 'respostas'}</p>
              <p className="font-ui text-[14px] text-ink-body m-0">
                {NOTA.facil}: {l.facil} · {NOTA.ok}: {l.ok} · {NOTA.dificil}: {l.dificil}
              </p>
            </article>
          ))}
        </section>
      )}

      {estado.tipo === 'pronto' && estado.comentarios.length > 0 && (
        <section className="grid gap-2">
          <h2 className="text-[19px] font-bold m-0">Comentários</h2>
          {estado.comentarios.map((c, i) => (
            <article key={i} className="rounded-lg border border-[var(--line)] bg-surface p-4 grid gap-1">
              <p className="font-ui text-[14px] text-ink-muted m-0">{nome(c.licao)} · {NOTA[c.nota]} · {quando(c.em)}</p>
              <p className="font-ui text-[16px] m-0 whitespace-pre-line break-words">{c.comentario}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
