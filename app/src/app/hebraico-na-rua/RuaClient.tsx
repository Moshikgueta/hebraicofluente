'use client';

/* O Hebraico na rua (28/10/2026). As regras moram em lib/engine/rua.ts.
 * Uma placa por vez: a foto com o crédito, a pergunta, três palavras do curso
 * e, depois da resposta, a palavra como vem na placa (sem os pontos), a
 * leitura e o sentido. Sem nota, sem XP e nada novo no progresso: é leitura.
 */

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { FotoDaMissao } from '@/components/learn/FotoDaMissao';
import { YaelDiz } from '@/components/aventura/Yael';
import { allLetters, placasDaRua } from '@/lib/content';
import { letrasConcluidas } from '@/lib/vocabulario';
import { opcoesDaPlaca, placasParaLer } from '@/lib/engine/rua';
import { clean, stripNikud } from '@/lib/hebrew';
import { useProgress } from '@/lib/state/store';
import { tocarSom } from '@/lib/som-do-acerto';
import { tx } from '@/i18n/telas/academia-hebraico-na-rua';

export function RuaClient() {
  const p = useProgress();
  const todas = allLetters();
  const concluidas = useMemo(() => letrasConcluidas(p.state, todas), [p.state, todas]);
  const placas = placasDaRua();
  const { prontas, faltam } = placasParaLer(placas, concluidas);
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const atual = prontas[i];
  const opcoes = useMemo(() => (atual ? opcoesDaPlaca(atual, concluidas, todas) : []), [atual, concluidas, todas]);
  const certa = opcoes.find(o => atual && clean(o.he) === clean(atual.palavra));
  const fim = i >= prontas.length;

  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-2">
        <Link href="/leituras" className="inline-flex items-center min-h-[44px] w-fit font-ui text-[14px] text-[var(--teal-ink)]">← {tx.voltar}</Link>
        <h1 className="m-0 text-[27px] sm:text-[33px] font-bold leading-tight">{tx.titulo}</h1>
        <p className="m-0 font-ui text-[15.5px] leading-relaxed text-ink-body max-w-[60ch] text-pretty">{tx.intro}</p>
      </header>

      {placas.length === 0 && <p className="m-0 font-ui text-[15px] text-ink-body">{tx.emBreve}</p>}
      {placas.length > 0 && prontas.length === 0 && <p className="m-0 font-ui text-[15px] text-ink-body">{tx.nenhumaAinda}</p>}

      {atual && certa && (
        <section aria-labelledby="rua-pergunta" className="grid gap-4">
          <p className="m-0 font-ui text-[13px] text-ink-muted tabular-nums">{tx.placaN(i + 1, prontas.length)}</p>
          <FotoDaMissao key={atual.id} foto={atual} pasta="rua" inteira />
          <h2 id="rua-pergunta" className="m-0 text-[19px] font-semibold">{tx.pergunta}</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {opcoes.map(o => {
              const eCerta = o === certa;
              const tom = escolha == null ? 'border-line bg-surface'
                : eCerta ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                : escolha === o.he ? 'border-[var(--amber)] bg-[var(--amber-wash)]' : 'border-line bg-surface opacity-70';
              return (
                <button key={o.he} type="button" disabled={escolha != null}
                        onClick={() => { setEscolha(o.he); if (eCerta) tocarSom('acerto'); }}
                        aria-label={o.translit}
                        className={`grid place-items-center min-h-[72px] rounded-[var(--r-md)] border-2 px-2 ${tom}`}>
                  <He size="lg">{o.he}</He>
                </button>
              );
            })}
          </div>
          {escolha != null && (
            <div aria-live="polite" className="grid gap-3 rounded-[var(--r-lg)] bg-[var(--card)] border border-line p-4">
              <p className="m-0 font-ui text-[15.5px] text-ink">
                <strong>{escolha === certa.he ? tx.certo : tx.quase}</strong>{' '}
                {tx.naPlaca} <He size="lg">{stripNikud(certa.he)}</He>
              </p>
              <p className="m-0 font-ui text-[15px] text-ink-body">{tx.significa(certa.translit, certa.pt)}</p>
              <button type="button" onClick={() => { setI(i + 1); setEscolha(null); }}
                      className="justify-self-start min-h-[48px] rounded-[var(--r-md)] bg-[var(--accent-bg)] px-5 font-ui text-[15px] font-semibold text-white">
                {tx.proxima}
              </button>
            </div>
          )}
        </section>
      )}

      {prontas.length > 0 && fim && (
        <section className="grid gap-4 justify-items-start">
          <YaelDiz humor="comemora" tamanho={64}>{tx.todas(prontas.length)}</YaelDiz>
          <button type="button" onClick={() => { setI(0); setEscolha(null); }}
                  className="min-h-[48px] rounded-[var(--r-md)] border border-line bg-surface px-5 font-ui text-[15px] font-semibold text-ink">
            {tx.deNovo}
          </button>
        </section>
      )}
      {placas.length > 0 && faltam > 0 && <p className="m-0 font-ui text-[14px] text-ink-muted">{tx.faltam(faltam)}</p>}
    </div>
  );
}
