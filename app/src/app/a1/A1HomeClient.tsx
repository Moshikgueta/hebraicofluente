'use client';

/* A página do curso Hebraico A1: onde estou, o que já sei, o que vem, quanto
   falta. A pergunta do gênero (se ainda não foi respondida), a barra do curso
   inteiro, e os módulos, cada um com as suas unidades e a porcentagem de
   unidades concluídas. Nada fica trancado: dá para abrir qualquer unidade,
   e a "próxima" é só uma sugestão (a primeira ainda não concluída). */

import Link from 'next/link';
import { Badge, Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { useProgress } from '@/lib/state/store';
import { cursoA1, type UnidadeA1 } from '@/lib/a1';
import { unidadeConcluida } from '@/lib/state/a1-estado';
import { GeneroA1 } from '@/components/a1/GeneroA1';
import { Misto } from '@/components/a1/A1Player';

export function A1HomeClient() {
  const p = useProgress();
  const curso = cursoA1();
  const a1 = p.state.a1;
  const porN = new Map(curso.unidades.map(u => [u.n, u]));
  const ordem = curso.modulos.flatMap(m => m.unidades);
  const feitas = ordem.filter(n => unidadeConcluida(a1, n)).length;
  const proxima = ordem.find(n => !unidadeConcluida(a1, n)) ?? null;
  const pct = ordem.length ? Math.round((feitas / ordem.length) * 100) : 0;
  const unidadeProxima = proxima != null ? porN.get(proxima) : undefined;

  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Badge tone="accent">Curso</Badge>
        <h1 className="text-[28px] sm:text-[34px] font-bold leading-tight m-0">Hebraico A1</h1>
        <p className="text-[16px] leading-relaxed text-ink-body m-0">
          <Misto texto="Do primeiro שָׁלוֹם a conversas do dia a dia em Israel: apresentar-se, comprar, pedir, perguntar o caminho, marcar um encontro." />
        </p>
        <div className="grid gap-1.5">
          <div className="h-2 rounded-full bg-surface-2 overflow-hidden"
            role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progresso no curso">
            <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
          </div>
          <p className="font-ui text-[14px] text-ink-muted m-0">
            {feitas} de {ordem.length} unidades concluídas ({pct}%)
          </p>
        </div>
      </header>

      {!a1.genero && <GeneroA1 />}

      {unidadeProxima && (
        <Card tone="wash" className="p-5 grid gap-3">
          <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">
            {feitas === 0 ? 'Comece por aqui' : 'Continue de onde parou'}
          </p>
          <p className="font-display text-[19px] font-semibold text-ink m-0">Unidade {unidadeProxima.n} · {unidadeProxima.tituloPt}</p>
          <p className="text-[14.5px] leading-relaxed text-ink-body m-0">{unidadeProxima.objetivoPt}</p>
          <LinkButton href={`/a1/unidade/${unidadeProxima.n}`} className="justify-self-start">Abrir a unidade</LinkButton>
        </Card>
      )}

      {curso.modulos.map(m => {
        const us = m.unidades.map(n => porN.get(n)).filter((u): u is UnidadeA1 => !!u);
        const prontas = us.filter(u => unidadeConcluida(a1, u.n)).length;
        const pm = us.length ? Math.round((prontas / us.length) * 100) : 0;
        return (
          <section key={m.n} className="grid gap-3" aria-labelledby={`mod-${m.n}`}>
            <div className="grid gap-1">
              <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">
                Módulo {m.n} · {prontas} de {us.length} ({pm}%)
              </p>
              <h2 id={`mod-${m.n}`} className="font-display text-[21px] font-semibold text-ink m-0">{m.tituloPt}</h2>
              <p className="text-[14.5px] leading-relaxed text-ink-body m-0">{m.objetivoPt}</p>
            </div>
            <ol className="grid gap-2 m-0 p-0 list-none">
              {us.map(u => {
                const feita = unidadeConcluida(a1, u.n);
                const best = a1.unidades[String(u.n)]?.best;
                return (
                  <li key={u.n}>
                    <Link href={`/a1/unidade/${u.n}`} className="block rounded-[var(--r-lg)] focus-visible:outline-2">
                      <Card tone={feita ? 'mint' : 'surface'} className="p-4 grid gap-1 hover:border-[var(--accent-soft)]">
                        <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">
                          Unidade {u.n}
                          {feita ? ' · concluída ✓' : u.n === proxima ? ' · próxima' : ''}
                          {best != null ? ` · melhor nota ${Math.round(best * 100)}%` : ''}
                          {!u.revisado ? ' · rascunho' : ''}
                        </p>
                        <p className="font-display text-[17px] font-semibold text-ink m-0">{u.tituloPt}</p>
                        <p className="text-[14px] leading-relaxed text-ink-body m-0">{u.objetivoPt}</p>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      {a1.genero && (
        <details className="font-ui text-[14px] text-ink-muted">
          <summary className="cursor-pointer min-h-[44px] flex items-center">Trocar o gênero dos exercícios</summary>
          <div className="pt-2"><GeneroA1 /></div>
        </details>
      )}
    </div>
  );
}
