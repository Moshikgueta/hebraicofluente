'use client';

/* A biblioteca de Raízes: cada fonte, com o nível, a forma de acesso e a data
 * de consulta, e as afirmações do percurso que ela sustenta. É o "de onde veio
 * isso?" do percurso inteiro, para quem quer continuar pesquisando. */

import { useState } from 'react';
import { raizes, type Fonte } from '@/lib/raizes';
import { StatusDaAfirmacao } from '@/components/raizes/Texto';

const NIVEIS: { n: Fonte['nivel']; nome: string; texto: string }[] = [
  { n: 'A', nome: 'Literatura acadêmica', texto: 'Artigos com revisão por pares, livros de editora universitária, monografias.' },
  { n: 'B', nome: 'Instituições e obras de referência', texto: 'Museus, governos regionais, universidades, bibliotecas, enciclopédias editadas.' },
  { n: 'C', nome: 'Fontes primárias', texto: 'Documentos da época, sempre lidos com crítica.' },
  { n: 'D', nome: 'Fontes oficiais contemporâneas', texto: 'Órgãos oficiais de hoje.' },
  { n: 'E', nome: 'Complementares', texto: 'Nunca sustentam sozinhas uma afirmação.' }
];

export function BibliotecaClient() {
  const r = raizes();
  const [busca, setBusca] = useState('');
  const q = busca.trim().toLocaleLowerCase('pt-BR');
  const casa = (f: Fonte) => !q || `${f.autor} ${f.titulo} ${f.publicacao ?? ''}`.toLocaleLowerCase('pt-BR').includes(q);
  const citam = (fid: string) => r.afirmacoes.filter(a => a.fontes.includes(fid));

  return (
    <div className="grid gap-9 pt-8">
      <header className="grid gap-3">
        <p className="rz-rot ocre m-0">Raízes Sefarditas</p>
        <h1 className="rz-pagina">Biblioteca</h1>
        <p className="rz-entrada m-0">
          {r.fontes.length} fontes sustentam as {r.afirmacoes.length} afirmações que aparecem no percurso.
        </p>
        <p className="rz-corpo !text-[16px] !text-[var(--suave)]">
          Uma afirmação que não pôde ser verificada não aparece no texto, e por isso também não está aqui.
        </p>
      </header>

      <section className="rz-fundo grid gap-3">
        <p className="rz-rot m-0">Como as fontes foram lidas</p>
        <p className="rz-corpo">
          A pesquisa desta edição foi feita por busca digital em fontes institucionais e acadêmicas. A busca devolve um trecho
          da página, e é esse trecho que sustenta cada afirmação. Conferir cada passagem no texto integral é trabalho da
          revisão humana, que ainda não aconteceu. Por isso cada fonte diz como foi lida.
        </p>
        <div className="grid gap-1.5 font-ui text-[14px] leading-relaxed text-[var(--corpo)]">
          <p className="m-0"><StatusDaAfirmacao status="VERIFICADO" /> uma fonte de nível A a D sustenta a frase.</p>
          <p className="m-0"><StatusDaAfirmacao status="CONTESTADO" /> historiadores discordam, e o texto mostra o debate.</p>
        </div>
        <dl className="m-0 grid gap-1.5 border-t border-[var(--pedra-escura)] pt-3">
          {NIVEIS.map(n => (
            <div key={n.n} className="grid grid-cols-[28px_1fr] gap-2 font-ui text-[13.5px] leading-relaxed text-[var(--corpo)]">
              <dt className="rz-numero text-[17px]">{n.n}</dt>
              <dd className="m-0"><span className="font-semibold text-[var(--tinta)]">{n.nome}.</span> {n.texto}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-8">
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
          Procurar por autor ou título
          <input type="search" value={busca} onChange={e => setBusca(e.target.value)} className="rz-campo font-normal" />
        </label>
        {NIVEIS.map(n => {
          const fs = r.fontes.filter(f => f.nivel === n.n && casa(f));
          if (fs.length === 0) return null;
          return (
            <div key={n.n} className="grid gap-2">
              <div className="rz-rubrica">
                <h2 className="rz-rot m-0">Nível {n.n} · {n.nome}</h2>
                <span className="rz-rot ml-auto tabular-nums">{fs.length}</span>
              </div>
              <ol className="m-0 p-0 list-none">
                {fs.map(f => {
                  const as = citam(f.id);
                  return (
                    <li key={f.id} id={f.id} className="grid gap-1.5 border-b border-[var(--linha)] py-4 scroll-mt-24">
                      <p className="rz-serif m-0 text-[15.5px] leading-relaxed text-[var(--tinta)] [overflow-wrap:anywhere]">{f.abnt}</p>
                      <p className="m-0 font-ui text-[12.5px] text-[var(--suave)]">
                        {f.id} · {f.tipo.replace(/-/g, ' ')} · {f.acesso === 'trecho-de-busca' ? 'lida por trecho de busca' : f.acesso === 'referencia-confirmada' ? 'só a referência confirmada' : f.acesso === 'arquivo-de-dados' ? 'arquivo de dados' : f.acesso} · consulta em {f.consulta}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-5">
                        {f.url && (
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="rz-link !text-[13px] min-h-[40px] inline-flex items-center">Abrir a fonte ↗</a>
                        )}
                        {as.length > 0 && (
                          <details className="group w-full">
                            <summary className="cursor-pointer list-none inline-flex min-h-[40px] items-center gap-1.5 font-ui text-[13px] font-semibold text-[var(--corpo)]">
                              <span aria-hidden className="inline-block transition-transform duration-150 group-open:rotate-90">›</span>
                              Sustenta {as.length} {as.length === 1 ? 'afirmação' : 'afirmações'}
                            </summary>
                            <ul className="m-0 grid gap-3 p-0 pt-1 list-none">
                              {as.map(a => (
                                <li key={a.id} className="grid gap-1 border-l-2 border-[var(--pedra-escura)] pl-3">
                                  <span className="flex flex-wrap items-center gap-3"><StatusDaAfirmacao status={a.status} /><span className="font-ui text-[12px] text-[var(--suave)]">{a.id}</span></span>
                                  <span className="rz-serif text-[15px] leading-relaxed text-[var(--corpo)]">{a.afirmacao}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </section>
    </div>
  );
}
