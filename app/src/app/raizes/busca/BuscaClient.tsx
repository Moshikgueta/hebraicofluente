'use client';

/* A busca de Raízes: lugares, personagens, artefatos, termos, seções e fontes.
 * Local e instantânea: o conteúdo já está no aparelho de quem tem acesso, e
 * o que se digita não vai a lugar nenhum. ?q= no endereço guarda a busca. */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { raizes } from '@/lib/raizes';
import { buscar, rotuloDoTipo } from '@/lib/raizes-jornada';
import { SemConteudo } from '@/app/raizes/RaizesHomeClient';

const SUGESTOES = ['Toledo', 'Maimônides', 'cristão-novo', 'Recife', 'judeu-espanhol', 'Amsterdã'];

export function BuscaClient() {
  const r = raizes();
  const [q, setQ] = useState('');
  useEffect(() => { setQ(new URLSearchParams(window.location.search).get('q') ?? ''); }, []);
  useEffect(() => {
    const url = q ? `/raizes/busca?q=${encodeURIComponent(q)}` : '/raizes/busca';
    window.history.replaceState(null, '', url);
  }, [q]);
  const achados = useMemo(() => (r.semConteudo ? [] : buscar(q)), [q, r.semConteudo]);
  if (r.semConteudo) return <SemConteudo />;

  return (
    <div className="grid gap-6 pt-8">
      <header className="grid gap-3">
        <p className="rz-rot ocre m-0">Raízes Sefarditas · Buscar</p>
        <h1 className="rz-pagina">O que você procura?</h1>
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
          Lugar, pessoa, termo, artefato ou assunto
          <input type="search" value={q} onChange={e => setQ(e.target.value)} autoFocus maxLength={80}
            className="rz-campo font-normal !text-[17px]" placeholder="Por exemplo: Lisboa" />
        </label>
        {!q && (
          <p className="m-0 flex flex-wrap gap-2">
            {SUGESTOES.map(s => <button key={s} type="button" className="rz-chip" onClick={() => setQ(s)}>{s}</button>)}
          </p>
        )}
      </header>
      <p className="m-0 font-ui text-[13px] text-[var(--suave)]" aria-live="polite">
        {q.trim().length < 2 ? 'Digite ao menos duas letras.' : achados.length ? `${achados.length} resultado${achados.length === 1 ? '' : 's'}.` : 'Nada encontrado. Tente outra grafia ou uma palavra só.'}
      </p>
      <ol className="rz-lista">
        {achados.map(i => (
          <li key={i.chave}>
            <Link href={i.rota} prefetch={false} className="grid gap-0.5 py-3 no-underline">
              <span className="rz-rot !text-[10.5px]">{rotuloDoTipo(i.tipo)}</span>
              <span className="rz-serif text-[18px] leading-snug text-[var(--titulo)]">{i.titulo}</span>
              <span className="font-ui text-[13.5px] leading-snug text-[var(--corpo)] line-clamp-2">{i.resumo}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
