'use client';

/* A biblioteca de Raízes: cada fonte, com o nível, a forma de acesso e a data
 * de consulta, e as afirmações do percurso que ela sustenta. É o "de onde veio
 * isso?" do percurso inteiro, para quem quer continuar pesquisando. */

import { useState } from 'react';
import Link from 'next/link';
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
    <div className="grid gap-8 reading">
      <header className="grid gap-3">
        <Link href="/raizes" prefetch={false} className="font-ui text-[13px] text-[var(--rz-mar)] underline underline-offset-2 justify-self-start">
          Raízes Sefarditas
        </Link>
        <h1 className="m-0 font-display text-[32px] sm:text-[40px] font-bold leading-tight">Biblioteca</h1>
        <p className="m-0 font-ui text-[16px] leading-relaxed text-ink-body max-w-[62ch]">
          {r.fontes.length} fontes sustentam as {r.afirmacoes.length} afirmações que aparecem no percurso.
          Uma afirmação que não pôde ser verificada não aparece no texto, e por isso também não está aqui.
        </p>
      </header>

      <section className="grid gap-3 rounded-[var(--r-lg)] border-l-4 border-[var(--rz-terra)] bg-[var(--rz-pedra)] p-4 sm:p-5">
        <h2 className="m-0 font-display text-[19px] font-bold">Como as fontes foram lidas</h2>
        <p className="m-0 font-ui text-[14.5px] leading-relaxed text-ink-body">
          A pesquisa desta edição foi feita por busca digital em fontes institucionais e acadêmicas. A busca devolve um trecho
          da página, e é esse trecho que sustenta cada afirmação. Conferir cada passagem no texto integral é trabalho da
          revisão humana, que ainda não aconteceu. Por isso cada fonte diz como foi lida.
        </p>
        <p className="m-0 font-ui text-[14.5px] leading-relaxed text-ink-body">
          <StatusDaAfirmacao status="VERIFICADO" /> quer dizer que uma fonte de nível A a D sustenta a frase.{' '}
          <StatusDaAfirmacao status="CONTESTADO" /> quer dizer que historiadores discordam, e o texto mostra o debate.
        </p>
        <dl className="grid gap-1.5 m-0">
          {NIVEIS.map(n => (
            <div key={n.n} className="font-ui text-[13.5px] leading-relaxed text-ink-body">
              <dt className="inline font-semibold text-ink">Nível {n.n}, {n.nome}: </dt><dd className="inline m-0">{n.texto}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-4">
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-ink max-w-[420px]">
          Procurar por autor ou título
          <input type="search" value={busca} onChange={e => setBusca(e.target.value)}
            className="min-h-[44px] rounded-[var(--r-md)] border border-line bg-[var(--card)] px-3 font-ui text-[15px] font-normal text-ink" />
        </label>
        {NIVEIS.map(n => {
          const fs = r.fontes.filter(f => f.nivel === n.n && casa(f));
          if (fs.length === 0) return null;
          return (
            <div key={n.n} className="grid gap-3">
              <h2 className="m-0 font-display text-[20px] font-bold">Nível {n.n} · {n.nome}</h2>
              <ul className="grid gap-3 m-0 p-0 list-none">
                {fs.map(f => {
                  const as = citam(f.id);
                  return (
                    <li key={f.id} id={f.id} className="grid gap-2 rounded-[var(--r-md)] border border-line bg-[var(--card)] p-4 scroll-mt-24">
                      <p className="m-0 font-ui text-[14px] leading-relaxed text-ink [overflow-wrap:anywhere]">{f.abnt}</p>
                      <p className="m-0 font-ui text-[12.5px] text-ink-muted">
                        {f.id} · {f.tipo.replace(/-/g, ' ')} · {f.acesso === 'trecho-de-busca' ? 'lida por trecho de busca' : f.acesso === 'referencia-confirmada' ? 'só a referência confirmada' : f.acesso === 'arquivo-de-dados' ? 'arquivo de dados' : f.acesso} · consulta em {f.consulta}
                      </p>
                      {f.url && (
                        <a href={f.url} target="_blank" rel="noopener noreferrer"
                          className="justify-self-start font-ui text-[13px] text-[var(--rz-mar)] underline underline-offset-2 break-all">Abrir a fonte</a>
                      )}
                      {as.length > 0 && (
                        <details>
                          <summary className="cursor-pointer font-ui text-[13px] font-semibold text-ink-body min-h-[28px]">
                            Sustenta {as.length} {as.length === 1 ? 'afirmação' : 'afirmações'}
                          </summary>
                          <ul className="mt-2 grid gap-2 m-0 p-0 list-none">
                            {as.map(a => (
                              <li key={a.id} className="grid gap-1 font-ui text-[13.5px] leading-relaxed text-ink-body">
                                <span className="flex flex-wrap items-center gap-2"><StatusDaAfirmacao status={a.status} /><span className="text-ink-muted">{a.id}</span></span>
                                <span>{a.afirmacao}</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
