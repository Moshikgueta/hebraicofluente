'use client';

/* Meu domínio das letras (11/10/2026). A conta está em lib/dominio.ts; esta
 * tela só a mostra, sem número técnico nenhum: um nível em palavras por
 * habilidade, e o que vale praticar agora. */

import Link from 'next/link';
import { useMemo } from 'react';
import { He } from '@/components/hebrew/He';
import { Card, Skeleton } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { allLetters } from '@/lib/content';
import { useProgress } from '@/lib/state/store';
import {
  HABILIDADES, LIMIARES, NIVEL_PT, resumoDoDominio, type DominioDaLetra, type NivelDeDominio
} from '@/lib/dominio';

const COR: Record<NivelDeDominio, string> = {
  dominada: 'bg-[var(--teal-soft)] text-[var(--teal-ink)]',
  quase: 'bg-[var(--accent-wash)] text-ink',
  desenvolvimento: 'bg-[var(--gold-soft)] text-[var(--gold-ink)]',
  aprendendo: 'bg-[var(--gold-soft)] text-[var(--gold-ink)]',
  'poucos-dados': 'bg-surface-2 text-ink-muted'
};

const ORDEM_DA_TELA: readonly NivelDeDominio[] = ['dominada', 'quase', 'desenvolvimento', 'aprendendo', 'poucos-dados'];

export function DominioClient() {
  const p = useProgress();
  const letras = allLetters();
  const resumo = useMemo(() => resumoDoDominio(p.state, letras.map(l => l.id)), [p.state, letras]);
  const porId = useMemo(() => new Map(letras.map(l => [l.id, l])), [letras]);

  if (!p.ready) return <Skeleton className="h-64" />;

  return (
    <div className="grid gap-6 py-2">
      <header className="grid gap-2 max-w-[60ch]">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">
          <Link href="/meu-hebraico" className="hover:underline">Meu hebraico</Link> · Domínio
        </p>
        <h1 className="text-[28px] font-bold m-0">Meu domínio das letras</h1>
        <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
          Concluir uma lição não significa necessariamente dominar uma letra. Aqui, você acompanha seu
          progresso em três habilidades: reconhecer a letra, identificar seu som e lê-la dentro de
          palavras. Seu nível de domínio evolui conforme você pratica e revisa ao longo do tempo.
        </p>
      </header>

      {!resumo.letras.length ? (
        <Card className="p-5 grid gap-3">
          <p className="font-ui text-[15px] text-ink-body m-0">
            Assim que você fizer os primeiros exercícios, seu progresso começará a aparecer aqui.
          </p>
          <LinkButton href="/meu-hebraico" variant="secondary">Voltar ao painel</LinkButton>
        </Card>
      ) : (
        <>
          <section aria-label="Resumo" className="flex flex-wrap gap-2">
            {ORDEM_DA_TELA.filter(n => resumo.contagem[n] > 0).map(n => (
              <span key={n} className={`rounded-full px-3.5 py-1.5 font-ui text-[14px] font-semibold ${COR[n]}`}>
                {NIVEL_PT[n]}: {resumo.contagem[n]}
              </span>
            ))}
          </section>

          <dl className="grid sm:grid-cols-3 gap-2 m-0" aria-label="As três habilidades">
            {HABILIDADES.map(h => (
              <div key={h.id} className="rounded-[var(--r-md)] bg-surface-2 px-3 py-2">
                <dt className="font-ui text-[14px] font-semibold text-ink">{h.tituloPt}</dt>
                <dd className="font-ui text-[13.5px] leading-snug text-ink-muted m-0">{h.descricaoPt}</dd>
              </div>
            ))}
          </dl>

          {resumo.paraPraticar.length > 0 ? (
            <Card tone="wash" className="p-5 grid gap-3">
              <h2 className="text-[19px] font-semibold m-0">O que vale praticar agora?</h2>
              <ul className="grid gap-2 list-none p-0 m-0">
                {resumo.paraPraticar.map(d => {
                  const L = porId.get(d.letterId);
                  const h = HABILIDADES.find(x => x.id === d.praticar);
                  return (
                    <li key={d.letterId} className="flex items-center gap-3">
                      {L && <He size="lg">{L.letter}</He>}
                      <span className="font-ui text-[15px] text-ink-body">
                        <strong className="font-semibold text-ink">{L?.namePt}</strong>
                        {h ? `: ${h.resumoPt}` : ''}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <LinkButton href="/revisao" className="justify-self-start">Revisar estas letras</LinkButton>
            </Card>
          ) : (
            <Card tone="mint" className="p-5">
              <p className="font-ui text-[15px] leading-relaxed text-ink m-0">
                Nenhuma letra precisa de reforço especial agora. Uma leitura no
                {' '}<Link href="/leitura" className="underline">Laboratório de Leitura</Link> pode ajudar
                você a consolidar o que aprendeu.
              </p>
            </Card>
          )}

          <ul className="grid gap-3 sm:grid-cols-2 list-none p-0 m-0" aria-label="As letras que você já começou">
            {resumo.letras.map(d => <CartaoDaLetra key={d.letterId} d={d} glifo={porId.get(d.letterId)?.letter ?? ''} nome={porId.get(d.letterId)?.namePt ?? ''} />)}
          </ul>

          <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted m-0 max-w-[60ch]">
            Seu nível de domínio é calculado com base nas suas respostas e revisões. Para considerar uma
            letra dominada, precisamos observar bons resultados em dias diferentes.
          </p>
          <details className="max-w-[60ch]">
            <summary className="cursor-pointer min-h-[44px] flex items-center font-ui text-[14px] text-[var(--teal-ink)]">
              Como o nível é calculado?
            </summary>
            <ul className="grid gap-1.5 font-ui text-[13.5px] leading-relaxed text-ink-body list-disc pl-5 m-0 pt-1">
              <li>Com menos de {LIMIARES.minimoDeRespostas} respostas numa habilidade, aparece &quot;Dados insuficientes&quot;, em vez de um palpite.</li>
              <li>Um erro recente baixa o nível até você acertar de novo.</li>
              <li>&quot;Dominada&quot; pede {LIMIARES.dominada.seguidos} acertos seguidos, uma boa taxa de acertos e acertos em pelo menos {LIMIARES.dominada.dias} dias diferentes.</li>
              <li>Contam os exercícios corrigidos e a revisão. A sua própria avaliação no Laboratório de Leitura não entra nesta conta.</li>
            </ul>
          </details>
        </>
      )}
    </div>
  );
}

function CartaoDaLetra({ d, glifo, nome }: { d: DominioDaLetra; glifo: string; nome: string }) {
  return (
    <li className="rounded-[var(--r-lg)] border border-line bg-surface p-4 grid gap-3">
      <div className="flex items-center gap-3">
        <He size="xl">{glifo}</He>
        <div className="grid gap-1">
          <span className="font-display text-[18px] font-semibold text-ink">{nome}</span>
          <span className={`w-fit rounded-full px-2.5 py-0.5 font-ui text-[13px] font-semibold ${COR[d.geral]}`}>
            {NIVEL_PT[d.geral]}
          </span>
        </div>
      </div>
      <dl className="grid gap-1.5 m-0">
        {HABILIDADES.map(h => (
          <div key={h.id} className="flex items-center justify-between gap-3">
            <dt className="font-ui text-[14px] text-ink-body">{h.tituloPt}</dt>
            <dd className={`m-0 rounded-full px-2.5 py-0.5 font-ui text-[13px] ${COR[d.habilidades[h.id]]}`}>
              {NIVEL_PT[d.habilidades[h.id]]}
            </dd>
          </div>
        ))}
      </dl>
    </li>
  );
}
