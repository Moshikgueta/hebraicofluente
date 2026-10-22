'use client';

/* Personagens históricos: pessoas reais, e só o que a matriz sustenta.
 * ─────────────────────────────────────────────────────────────────────────
 * Sem retrato (não há retrato de época para quase nenhum deles, e um rosto
 * inventado seria pôr na tela o que ninguém viu): no lugar, as iniciais.
 * Sem fala em primeira pessoa. Cada vida leva aos lugares do Atlas e aos
 * módulos onde aparece. Abrir uma vida é uma descoberta (passaporte). */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { raizes } from '@/lib/raizes';
import { useProgress } from '@/lib/state/store';
import { TextoComFontes } from '@/components/raizes/Texto';
import { Guardar } from '@/components/raizes/Guardar';
import { SemConteudo } from '@/app/raizes/RaizesHomeClient';
import { semMarcas } from '@/lib/raizes-jornada';

const iniciais = (nome: string) => nome.split(/\s+/).filter(p => /^[A-ZÁÉÍÓÚÂÊÔ]/.test(p)).slice(0, 2).map(p => p[0]).join('');

export function PersonagensClient() {
  const r = raizes();
  const p = useProgress();
  const [aberto, setAberto] = useState<string | null>(null);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && r.personagens?.some(x => x.id === id)) {
      setAberto(id);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    }
  }, [r.personagens]);
  useEffect(() => { if (aberto) p.descobrirRaizes(`personagem:${aberto}`); }, [aberto]);

  if (r.semConteudo || !r.personagens?.length) return <SemConteudo />;
  const nomeDoLugar = (id: string) => r.atlas?.lugares.find(l => l.id === id)?.nome.replace(/ \(.*\)$/, '') ?? id;

  return (
    <div className="grid gap-8 pt-8">
      <header className="grid gap-3">
        <p className="rz-rot ocre m-0">Raízes Sefarditas · Personagens</p>
        <h1 className="rz-pagina">Pessoas que a história registrou</h1>
        <p className="rz-entrada m-0">Sábios, rabinos, poetas, comerciantes e historiadores: o que se sabe de cada um, com a fonte de cada frase.</p>
        <p className="m-0 font-ui text-[13.5px] leading-relaxed text-[var(--suave)]">
          Sem retratos: quase ninguém aqui tem imagem da época, e um rosto desenhado seria inventado. Ninguém fala em primeira pessoa.
        </p>
      </header>
      <ol className="m-0 grid gap-3 p-0 list-none">
        {r.personagens.map(x => {
          const ab = aberto === x.id;
          return (
            <li key={x.id} id={x.id} className="scroll-mt-20">
              <article className={`rz-pessoa ${ab ? 'aberta' : ''}`}>
                <button type="button" aria-expanded={ab} aria-controls={`vida-${x.id}`} onClick={() => setAberto(ab ? null : x.id)}
                  className="grid w-full grid-cols-[52px_1fr] items-center gap-3 text-left">
                  <span aria-hidden className="rz-monograma">{iniciais(x.nome)}</span>
                  <span className="grid gap-0.5">
                    <span className="rz-serif text-[19px] leading-snug text-[var(--titulo)]">{x.nome}</span>
                    <span className="font-ui text-[13px] text-[var(--suave)]">{x.quando ? `${x.quando} · ` : ''}{semMarcas(x.resumo)}</span>
                  </span>
                </button>
                {ab && (
                  <div id={`vida-${x.id}`} className="rz-revelado grid gap-3 pt-3">
                    {x.paragrafos.map((t, i) => <TextoComFontes key={i} texto={t} />)}
                    {x.lugares.length > 0 && (
                      <p className="m-0 font-ui text-[14px] text-[var(--corpo)]">
                        <span className="font-semibold text-[var(--tinta)]">No Atlas: </span>
                        {x.lugares.map((l, i) => (
                          <span key={l}>{i > 0 ? ', ' : ''}<Link href={`/raizes/atlas?lugar=${l}`} prefetch={false} className="rz-link">{nomeDoLugar(l)}</Link></span>
                        ))}
                      </p>
                    )}
                    <p className="m-0 font-ui text-[14px] text-[var(--corpo)]">
                      <span className="font-semibold text-[var(--tinta)]">Na jornada: </span>
                      {x.modulos.map((n, i) => (
                        <span key={n}>{i > 0 ? ', ' : ''}<Link href={`/raizes/modulo/${n}`} prefetch={false} className="rz-link">módulo {n}</Link></span>
                      ))}
                    </p>
                    <Guardar chave={`personagem:${x.id}`} className="justify-self-start" />
                  </div>
                )}
              </article>
            </li>
          );
        })}
      </ol>
      <p className="m-0 font-ui text-[13px] leading-relaxed text-[var(--suave)]">
        Outras figuras da história sefardita, como Gracia Mendes Nasi e Yehuda Halevi, entram aqui quando a pesquisa delas estiver na matriz de fontes.
      </p>
    </div>
  );
}
