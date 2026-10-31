'use client';

/* O passaporte de Raízes: selos do que se estudou e explorou. Conta lugares,
 * rotas, artefatos e personagens abertos, e os mundos concluídos. Não fala de
 * quem a pessoa é: nenhum selo depende de dado de família, e nenhum vale
 * como documento de origem. */

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MiniMapa } from '@/components/raizes/MiniMapa';
import { useProgress } from '@/lib/state/store';
import { raizes } from '@/lib/raizes';
import { MUNDOS, descobertasRecentes, progressoDoMundo, rotuloDoTipo, selos } from '@/lib/raizes-jornada';
import { SemConteudo } from '@/app/raizes/RaizesHomeClient';

export function PassaporteClient() {
  const p = useProgress();
  const r = raizes();
  const router = useRouter();
  const [sel, setSel] = useState<string | null>(null);
  if (r.semConteudo) return <SemConteudo />;
  const e = p.state.raizes;
  const lista = selos(e);
  const ganhos = lista.filter(s => s.tem).length;
  const recentes = descobertasRecentes(e, 6);
  const total = Object.keys(e?.descobertas ?? {}).length;

  return (
    <div className="grid gap-8 pt-8">
      <header className="grid gap-3">
        <p className="rz-rot ocre m-0">Raízes Sefarditas · Passaporte</p>
        <h1 className="rz-pagina">Seu passaporte de viagem</h1>
        <p className="rz-entrada m-0">Cada selo marca uma parte da história que você estudou ou explorou. {ganhos} de {lista.length} selos, {total} descoberta{total === 1 ? '' : 's'}.</p>
      </header>

      {(r.atlas?.lugares.length ?? 0) > 0 && (() => {
        const todos = r.atlas!.lugares.filter(l => !l.area);
        const marcados = new Set(todos.filter(l => e?.descobertas?.[`lugar:${l.id}`]).map(l => l.id));
        const l = todos.find(x => x.id === sel);
        return (
          <section className="grid gap-3" aria-labelledby="mapa-viagem">
            <div className="rz-rubrica"><h2 id="mapa-viagem" className="rz-rot m-0">Seu mapa de viagem</h2><span className="rz-rot ml-auto tabular-nums">{marcados.size} de {todos.length}</span></div>
            <div className="rz-minimapa-moldura">
              <MiniMapa lugares={todos} marcados={marcados} selecionado={sel} onLugar={setSel} proporcao={1.25} rotulos={false}
                rotulo={`Mapa com ${todos.length} lugares; ${marcados.size} carimbados`} />
            </div>
            <p className="m-0 font-ui text-[13.5px] leading-relaxed text-[var(--corpo)]" aria-live="polite">
              {l
                ? <><span className="rz-serif text-[17px] text-[var(--titulo)]">{l.nome.replace(/ \(.*\)$/, '')}</span> · {marcados.has(l.id) ? 'carimbado' : 'ainda não aberto'}.{' '}
                    <button type="button" className="rz-link !text-[13.5px] min-h-[36px]" onClick={() => router.push(`/raizes/atlas?lugar=${l.id}`)}>Abrir no Atlas</button></>
                : 'Cada lugar que você abre no Atlas, num módulo ou numa página de cidade ganha um carimbo. Toque num ponto.'}
            </p>
          </section>
        );
      })()}

      <section className="grid gap-3" aria-labelledby="mundos">
        <div className="rz-rubrica"><h2 id="mundos" className="rz-rot m-0">Os cinco mundos</h2></div>
        <ol className="rz-lista">
          {MUNDOS.map(w => {
            const pw = progressoDoMundo(e, w);
            return (
              <li key={w.id} className="grid grid-cols-[44px_1fr_auto] gap-3 py-3">
                <span className="rz-numero text-[22px]">{w.n}</span>
                <span className="grid gap-0.5">
                  <span className="rz-serif text-[18px] text-[var(--tinta)]">{w.titulo}</span>
                  <span className="font-ui text-[13px] text-[var(--suave)]">{pw.concluido ? 'concluído' : pw.visitado ? 'visitado' : 'ainda não visitado'}</span>
                </span>
                <span className="font-ui text-[12.5px] tabular-nums text-[var(--suave)] pt-1">{pw.feitos}/{pw.total}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="grid gap-3" aria-labelledby="selos">
        <div className="rz-rubrica"><h2 id="selos" className="rz-rot m-0">Selos</h2><span className="rz-rot ml-auto tabular-nums">{ganhos} de {lista.length}</span></div>
        <ul className="m-0 grid grid-cols-1 gap-3 p-0 list-none sm:grid-cols-2">
          {lista.map(s => (
            <li key={s.id} className={`rz-selo-pass ${s.tem ? 'tem' : ''}`}>
              <span aria-hidden className="rz-selo-pass-marca">{s.tem ? '✓' : ''}</span>
              <span className="grid gap-0.5 min-w-0">
                <span className="rz-serif text-[17px] leading-snug text-[var(--titulo)]">{s.titulo}</span>
                <span className="font-ui text-[13px] text-[var(--corpo)]">{s.criterio}</span>
                <span className="font-ui text-[12px] tabular-nums text-[var(--suave)]">{s.tem ? 'Selo obtido' : s.progresso}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {recentes.length > 0 && (
        <section className="grid gap-3" aria-labelledby="recentes">
          <div className="rz-rubrica"><h2 id="recentes" className="rz-rot m-0">Últimas descobertas</h2></div>
          <ul className="rz-lista">
            {recentes.map(({ item }) => (
              <li key={item.chave}>
                <Link href={item.rota} prefetch={false} className="grid gap-0.5 py-3 no-underline">
                  <span className="rz-rot !text-[10.5px]">{rotuloDoTipo(item.tipo)}</span>
                  <span className="rz-serif text-[17px] text-[var(--titulo)]">{item.titulo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="rz-italico m-0 text-[15px] text-[var(--suave)]">
        O passaporte conta o que você estudou e explorou. Ele não diz nada sobre a origem da sua família e não vale como documento.
      </p>
      <p className="m-0"><Link href="/raizes/colecao" prefetch={false} className="rz-link">Ver a sua coleção</Link></p>
    </div>
  );
}
