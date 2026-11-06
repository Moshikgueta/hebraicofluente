'use client';

/* O glossário inteiro: os termos de todos os módulos, sem repetir, com a fonte
 * de cada definição e os módulos onde o termo aparece. Filtro local. */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { raizes } from '@/lib/raizes';
import { glossario, normalizar } from '@/lib/raizes-jornada';
import { TextoComFontes, PainelDeFonte } from '@/components/raizes/Texto';
import { SemConteudo } from '@/app/raizes/RaizesHomeClient';

export function GlossarioClient() {
  const r = raizes();
  const termos = useMemo(() => (r.semConteudo ? [] : glossario()), [r.semConteudo]);
  const [f, setF] = useState('');
  const [fonte, setFonte] = useState<string | null>(null);
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
  }, []);
  if (r.semConteudo) return <SemConteudo />;
  const vistos = termos.filter(t => !f || normalizar(`${t.termo} ${t.definicao}`).includes(normalizar(f)));

  return (
    <div className="grid gap-6 pt-8">
      <header className="grid gap-3">
        <p className="rz-rot ocre m-0">Raízes Sefarditas · Glossário</p>
        <h1 className="rz-pagina">As palavras desta história</h1>
        <p className="rz-entrada m-0">{termos.length} termos, cada um com a fonte e os módulos onde aparece.</p>
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
          Filtrar
          <input type="search" value={f} onChange={e => setF(e.target.value)} maxLength={60} className="rz-campo font-normal" />
        </label>
      </header>
      <dl className="m-0 grid gap-0">
        {vistos.map(t => (
          <div key={t.id} id={t.id} className="grid gap-1.5 border-t border-[var(--linha)] py-4 scroll-mt-20">
            <dt className="rz-serif text-[20px] text-[var(--titulo)]">{t.termo}</dt>
            <dd className="m-0 grid gap-2">
              <TextoComFontes texto={t.definicao} />
              <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-[13px] text-[var(--suave)]">
                <span>Aparece em: {t.modulos.map((n, i) => <span key={n}>{i > 0 ? ', ' : ''}<Link href={`/raizes/modulo/${n}`} prefetch={false} className="rz-link !text-[13px]">módulo {n}</Link></span>)}</span>
                {t.afirmacoes.length > 0 && (
                  <button type="button" className="rz-link !text-[13px] min-h-[36px]" aria-expanded={fonte === t.id} onClick={() => setFonte(fonte === t.id ? null : t.id)}>
                    {fonte === t.id ? 'Fechar a fonte' : 'De onde vem'}
                  </button>
                )}
              </p>
              {fonte === t.id && <PainelDeFonte ids={t.afirmacoes} />}
            </dd>
          </div>
        ))}
      </dl>
      {!vistos.length && <p className="rz-corpo">Nenhum termo com essa palavra.</p>}
    </div>
  );
}
