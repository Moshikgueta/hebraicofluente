'use client';

/* O texto de Raízes com as suas fontes.
 * ─────────────────────────────────────────────────────────────────────────
 * Cada frase factual do dado termina com [[R01-NNN]]. Aqui a marca vira o
 * número discreto da coleção editorial (`.rz-marca`), numerado na ordem do
 * parágrafo, que abre logo abaixo o painel da fonte: o que a afirmação diz,
 * o status, a evidência, os limites e as referências. Abre no lugar, e não
 * numa janela por cima, para o leitor não perder a frase de vista nem a ordem
 * de leitura do leitor de tela.
 */

import { Fragment, useId, useState } from 'react';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { afirmacao, fonte, partir, type Afirmacao } from '@/lib/raizes';

const NIVEL: Record<string, string> = {
  A: 'literatura acadêmica',
  B: 'instituição ou obra de referência',
  C: 'fonte primária',
  D: 'fonte oficial',
  E: 'complementar'
};

const ACESSO: Record<string, string> = {
  'trecho-de-busca': 'lida por trecho de busca; falta a conferência no texto integral',
  'referencia-confirmada': 'só a existência da obra foi confirmada',
  'texto-integral': 'conferida no texto integral',
  'arquivo-de-dados': 'arquivo de dados usado diretamente'
};

export function StatusDaAfirmacao({ status }: { status: Afirmacao['status'] }) {
  const debate = status === 'CONTESTADO';
  return (
    <span className={`rz-rot inline-flex items-center gap-1.5 ${debate ? 'ocre' : '!text-[var(--teal-ink)]'}`}>
      <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${debate ? 'bg-[var(--ocre)]' : 'bg-[var(--teal)]'}`} />
      {debate ? 'Em debate' : 'Verificada por busca'}
    </span>
  );
}

/** O painel de uma ou mais afirmações: o que a fonte sustenta e o que não. */
export function PainelDeFonte({ ids, id }: { ids: string[]; id?: string }) {
  return (
    <div id={id} className="rz-painel grid gap-4">
      {ids.map(aid => {
        const a = afirmacao(aid);
        if (!a) return <p key={aid} className="font-ui text-[13px] text-[var(--suave)] m-0">Fonte {aid} não encontrada.</p>;
        return (
          <div key={aid} className="grid gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <StatusDaAfirmacao status={a.status} />
              <span className="font-ui text-[12px] text-[var(--suave)] tabular-nums">{a.id}</span>
            </div>
            <p className="rz-serif m-0 text-[16px] leading-relaxed text-[var(--tinta)]">{a.afirmacao}</p>
            <dl className="m-0 grid gap-1.5 font-ui text-[13.5px] leading-relaxed text-[var(--corpo)]">
              <div><dt className="inline font-semibold text-[var(--tinta)]">O que a fonte diz: </dt><dd className="inline m-0">{a.evidencia}</dd></div>
              {a.interpretacoes && (
                <div><dt className="inline font-semibold text-[var(--tinta)]">Interpretações: </dt><dd className="inline m-0">{a.interpretacoes}</dd></div>
              )}
              {a.limitacoes && (
                <div><dt className="inline font-semibold text-[var(--tinta)]">Limites: </dt><dd className="inline m-0">{a.limitacoes}</dd></div>
              )}
            </dl>
            <ol className="m-0 grid gap-2 pl-5 font-ui text-[12.5px] leading-snug text-[var(--corpo)]">
              {a.fontes.map(fid => {
                const f = fonte(fid);
                if (!f) return null;
                return (
                  <li key={fid} className="[overflow-wrap:anywhere]">
                    <span className="font-semibold text-[var(--tinta)]">{f.autor}</span>. {f.titulo}
                    {f.publicacao ? `. ${f.publicacao}` : ''}{f.ano ? `, ${f.ano}` : ''}.{' '}
                    <span className="text-[var(--suave)]">({NIVEL[f.nivel] ?? f.nivel}; {ACESSO[f.acesso] ?? f.acesso}; consulta em {f.consulta}.)</span>{' '}
                    {f.url && <a href={f.url} target="_blank" rel="noopener noreferrer" className="rz-link !text-[12.5px]">abrir a fonte ↗</a>}
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
      <Link href="/raizes/biblioteca" prefetch={false} className="rz-link !text-[13px] justify-self-start">Todas as fontes na biblioteca</Link>
    </div>
  );
}

/** Um parágrafo do dado: texto, hebraico e números de fonte. */
export function TextoComFontes({ texto, className = '' }: { texto: string; className?: string }) {
  const base = useId();
  const [aberta, setAberta] = useState<number | null>(null);
  const pedacos = partir(texto);
  let n = 0;
  const grupos: { ids: string[]; i: number }[] = [];
  return (
    <div className="grid gap-2">
      <p className={`rz-corpo ${className}`}>
        {pedacos.map((p, k) => {
          if (p.t === 'texto') return <Fragment key={k}>{p.v}</Fragment>;
          if (p.t === 'he') return <He key={k} size="inline">{p.v}</He>;
          const i = n++;
          grupos.push({ ids: p.ids, i });
          const aberto = aberta === i;
          return (
            <button key={k} type="button" className="rz-marca" aria-expanded={aberto} aria-controls={`${base}-${i}`}
              aria-label={`Fonte ${i + 1}: ${aberto ? 'fechar' : 'abrir'}`} onClick={() => setAberta(aberto ? null : i)}>
              {i + 1}
            </button>
          );
        })}
      </p>
      {grupos.map(g => (aberta === g.i ? <PainelDeFonte key={g.i} ids={g.ids} id={`${base}-${g.i}`} /> : null))}
    </div>
  );
}
