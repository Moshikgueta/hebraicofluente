'use client';

/* O texto de Raízes com as suas fontes.
 * ─────────────────────────────────────────────────────────────────────────
 * Cada frase factual do dado termina com [[R01-NNN]]. Aqui a marca vira um
 * botão pequeno, numerado na ordem do parágrafo, que abre logo abaixo o painel
 * da fonte: o que a afirmação diz, o status dela, a evidência, os limites e
 * as referências. Abre no lugar, e não numa janela por cima, para o leitor
 * não perder a frase de vista nem a ordem de leitura do leitor de tela.
 *
 * Uma marca que não está na matriz publicada (afirmação não verificada que
 * escapou para o texto) aparece como "fonte não encontrada", e o teste
 * tests/raizes.test.ts reprova antes de chegar aqui.
 */

import { Fragment, useId, useState } from 'react';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { afirmacao, fonte, partir, type Afirmacao } from '@/lib/raizes';

const NIVEL: Record<string, string> = {
  A: 'Literatura acadêmica',
  B: 'Instituição ou obra de referência',
  C: 'Fonte primária',
  D: 'Fonte oficial',
  E: 'Complementar'
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-ui text-[11px] font-semibold uppercase tracking-[.06em]
      ${debate ? 'bg-[var(--rz-terra-suave)] text-[var(--rz-terra)]' : 'bg-[var(--teal-soft)] text-[var(--teal-ink)]'}`}>
      {debate ? 'Em debate' : 'Verificada por busca'}
    </span>
  );
}

/** O painel de uma ou mais afirmações: o que a fonte sustenta e o que não. */
export function PainelDeFonte({ ids, id }: { ids: string[]; id?: string }) {
  return (
    <div id={id} className="grid gap-3 rounded-[var(--r-md)] border border-[var(--rz-pedra-borda)] bg-[var(--rz-pedra)] p-4">
      {ids.map(aid => {
        const a = afirmacao(aid);
        if (!a) {
          return <p key={aid} className="font-ui text-[13px] text-ink-muted m-0">Fonte {aid} não encontrada.</p>;
        }
        return (
          <div key={aid} className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusDaAfirmacao status={a.status} />
              <span className="font-ui text-[12px] text-ink-muted">{a.id}</span>
            </div>
            <p className="font-ui text-[14px] leading-relaxed text-ink m-0">{a.afirmacao}</p>
            <dl className="grid gap-1.5 font-ui text-[13px] leading-relaxed text-ink-body m-0">
              <div><dt className="inline font-semibold text-ink">O que a fonte diz: </dt><dd className="inline m-0">{a.evidencia}</dd></div>
              {a.interpretacoes && (
                <div><dt className="inline font-semibold text-ink">Interpretações: </dt><dd className="inline m-0">{a.interpretacoes}</dd></div>
              )}
              {a.limitacoes && (
                <div><dt className="inline font-semibold text-ink">Limites: </dt><dd className="inline m-0">{a.limitacoes}</dd></div>
              )}
            </dl>
            <ul className="grid gap-2 m-0 p-0 list-none">
              {a.fontes.map(fid => {
                const f = fonte(fid);
                if (!f) return null;
                return (
                  <li key={fid} className="font-ui text-[12.5px] leading-snug text-ink-body">
                    <span className="font-semibold text-ink">{f.autor}</span>. {f.titulo}
                    {f.publicacao ? `. ${f.publicacao}` : ''}{f.ano ? `, ${f.ano}` : ''}.{' '}
                    <span className="text-ink-muted">({NIVEL[f.nivel] ?? f.nivel}; {ACESSO[f.acesso] ?? f.acesso}; consulta em {f.consulta}.)</span>{' '}
                    {f.url && (
                      <a href={f.url} target="_blank" rel="noopener noreferrer"
                        className="text-[var(--rz-mar)] underline underline-offset-2 break-all">abrir a fonte</a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <Link href="/raizes/biblioteca" className="font-ui text-[12.5px] text-[var(--rz-mar)] underline underline-offset-2 justify-self-start">
        Ver todas as fontes na biblioteca
      </Link>
    </div>
  );
}

/** Um parágrafo do dado: texto, hebraico e botões de fonte. */
export function TextoComFontes({ texto, className = '' }: { texto: string; className?: string }) {
  const base = useId();
  const [aberta, setAberta] = useState<number | null>(null);
  const pedacos = partir(texto);
  let n = 0;
  const grupos: { ids: string[]; i: number }[] = [];
  return (
    <div className="grid gap-2">
      <p className={`font-ui text-[16px] leading-[1.7] text-ink-body m-0 ${className}`}>
        {pedacos.map((p, k) => {
          if (p.t === 'texto') return <Fragment key={k}>{p.v}</Fragment>;
          if (p.t === 'he') return <He key={k} size="inline">{p.v}</He>;
          const i = n++;
          grupos.push({ ids: p.ids, i });
          const aberto = aberta === i;
          return (
            <button
              key={k}
              type="button"
              aria-expanded={aberto}
              aria-controls={`${base}-${i}`}
              aria-label={`Fonte ${i + 1}: ${aberto ? 'fechar' : 'abrir'}`}
              onClick={() => setAberta(aberto ? null : i)}
              className={`mx-0.5 inline-flex min-h-[24px] min-w-[24px] -translate-y-[2px] items-center justify-center rounded-full border px-1.5
                align-middle font-ui text-[11px] font-semibold leading-none transition-colors
                ${aberto ? 'border-[var(--rz-mar)] bg-[var(--rz-mar)] text-[var(--cream)]' : 'border-[var(--rz-pedra-borda)] bg-[var(--rz-pedra)] text-[var(--rz-mar)] hover:border-[var(--rz-mar)]'}`}
            >
              {i + 1}
            </button>
          );
        })}
      </p>
      {grupos.map(g => (aberta === g.i ? <PainelDeFonte key={g.i} ids={g.ids} id={`${base}-${g.i}`} /> : null))}
    </div>
  );
}
