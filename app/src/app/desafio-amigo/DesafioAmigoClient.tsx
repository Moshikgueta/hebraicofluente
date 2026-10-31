'use client';

/* A página do desafio com um amigo (28/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Lê o token do link (`?t=`), pede ao servidor as cinco palavras (que ele
 * confere pela assinatura) e faz uma pergunta por palavra: o sentido, entre
 * quatro dos cinco sentidos do próprio desafio. No fim, o placar, a Yael e o
 * convite para o curso. Nada é gravado nem contado. Sem áudio: as gravações
 * estão atrás do portão.
 */

import { useEffect, useMemo, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { LinkButton } from '@/components/ui/Button';
import { YaelDiz } from '@/components/aventura/Yael';
import { asset } from '@/lib/asset';
import { tx } from '@/i18n/telas/desafio-amigo';

type Palavra = { he: string; translit: string; pt: string };
type Estado = { fase: 'carregando' } | { fase: 'erro' } | { fase: 'jogo'; palavras: Palavra[] };

/* As opções de cada pergunta: a certa e três dos outros sentidos, numa ordem
   que depende só da posição (o mesmo link mostra sempre o mesmo desafio). */
export function opcoesDe(palavras: readonly Palavra[], i: number): string[] {
  const outras = palavras.map(p => p.pt).filter((_, k) => k !== i);
  const tres = [...outras.slice(i % outras.length), ...outras.slice(0, i % outras.length)].slice(0, 3);
  const todas = [palavras[i]!.pt, ...tres];
  const giro = (i * 2 + 1) % todas.length;
  return [...todas.slice(giro), ...todas.slice(0, giro)];
}

export function DesafioAmigoClient() {
  const [estado, setEstado] = useState<Estado>({ fase: 'carregando' });
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [fim, setFim] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('t') ?? '';
    if (!t) { setEstado({ fase: 'erro' }); return; }
    fetch(asset(`/api/desafio?t=${encodeURIComponent(t)}`))
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { palavras?: Palavra[] }) => {
        if (Array.isArray(d.palavras) && d.palavras.length > 0) setEstado({ fase: 'jogo', palavras: d.palavras });
        else setEstado({ fase: 'erro' });
      })
      .catch(() => setEstado({ fase: 'erro' }));
  }, []);

  const palavras = estado.fase === 'jogo' ? estado.palavras : [];
  const opcoes = useMemo(() => (palavras.length ? opcoesDe(palavras, i) : []), [palavras, i]);
  const atual = palavras[i];

  return (
    <div className="mx-auto grid w-full max-w-[560px] gap-6 px-4 py-8 sm:py-12">
      <header className="grid gap-2 text-center">
        <p className="m-0 font-ui text-[13px] font-bold uppercase tracking-[.1em] text-[var(--teal-ink)]">{tx.kicker}</p>
        <h1 className="m-0 text-[28px] sm:text-[34px] font-bold leading-tight text-balance">{tx.titulo}</h1>
        <p className="m-0 font-ui text-[16px] leading-relaxed text-ink-body text-pretty">{tx.intro}</p>
      </header>

      {estado.fase === 'carregando' && <p role="status" className="m-0 text-center font-ui text-[15px] text-ink-muted">{tx.carregando}</p>}
      {estado.fase === 'erro' && (
        <div className="grid gap-4 justify-items-center text-center">
          <p role="alert" className="m-0 font-ui text-[15px] text-ink-body">{tx.erro}</p>
          <LinkButton href="/curso-de-hebraico/" variant="secondary">{tx.conhecer}</LinkButton>
        </div>
      )}

      {estado.fase === 'jogo' && !fim && atual && (
        <section aria-labelledby="desafio-pergunta"
                 className="grid gap-5 rounded-[var(--r-lg)] border border-line bg-[var(--card)] p-6 shadow-[var(--sh)]">
          <p className="m-0 font-ui text-[13px] text-ink-muted tabular-nums">{tx.palavraN(i + 1, palavras.length)}</p>
          <div className="grid place-items-center py-2 text-[52px] leading-none"><He size="display">{atual.he}</He></div>
          <h2 id="desafio-pergunta" className="m-0 text-[19px] font-semibold">{tx.pergunta}</h2>
          <div className="grid gap-2.5">
            {opcoes.map(o => {
              const certa = o === atual.pt;
              const marcada = escolha === o;
              const tom = escolha == null ? 'border-line bg-surface'
                : certa ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                : marcada ? 'border-[var(--amber)] bg-[var(--amber-wash)]' : 'border-line bg-surface opacity-70';
              return (
                <button key={o} type="button" disabled={escolha != null}
                        onClick={() => { setEscolha(o); if (certa) setAcertos(n => n + 1); }}
                        className={`min-h-[52px] rounded-[var(--r-md)] border-2 px-4 text-left font-ui text-[16px] text-ink ${tom}`}>
                  {escolha != null && certa && <span aria-hidden className="mr-2">✓</span>}{o}
                </button>
              );
            })}
          </div>
          {escolha != null && (
            <div aria-live="polite" className="grid gap-3">
              <p className="m-0 font-ui text-[15.5px] leading-relaxed text-ink">
                <strong>{escolha === atual.pt ? tx.certo : tx.quase}</strong> {tx.seLe(atual.translit, atual.pt)}
              </p>
              <button type="button"
                      onClick={() => { if (i + 1 >= palavras.length) setFim(true); else { setI(i + 1); setEscolha(null); } }}
                      className="justify-self-start min-h-[48px] rounded-[var(--r-md)] bg-[var(--accent-bg)] px-5 font-ui text-[15px] font-semibold text-white">
                {i + 1 >= palavras.length ? tx.verResultado : tx.proxima}
              </button>
            </div>
          )}
        </section>
      )}

      {estado.fase === 'jogo' && fim && (
        <section className="grid gap-5 justify-items-center text-center rounded-[var(--r-lg)] border border-line bg-[var(--card)] p-6 shadow-[var(--sh)]">
          <p className="m-0 font-display text-[26px] font-bold">{tx.resultado(acertos, palavras.length)}</p>
          <YaelDiz humor={acertos === palavras.length ? 'comemora' : 'feliz'} tamanho={72}>{tx.falaFim}</YaelDiz>
          <p className="m-0 font-ui text-[15px] leading-relaxed text-ink-body max-w-[42ch]">{tx.convite}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href="/#experimente">{tx.experimentar}</LinkButton>
            <LinkButton href="/curso-de-hebraico/" variant="secondary">{tx.conhecer}</LinkButton>
          </div>
        </section>
      )}
    </div>
  );
}
