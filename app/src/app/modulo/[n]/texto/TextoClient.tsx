'use client';

/* O mini-texto do módulo: ler um bilhete, uma mensagem, um cartão inteiro.
 * ─────────────────────────────────────────────────────────────────────────
 * O texto vem primeiro e SOZINHO: sem transliteração e sem tradução na tela.
 * Ler é decifrar, e a muleta à vista faz o olho ir direto para o português.
 * As duas ajudas existem, a um toque, para a linha que travou ou para o
 * texto todo - e a pessoa decide quando pedir.
 *
 * Depois, perguntas de compreensão em português, no mesmo componente das
 * checagens da lição: não vale nota, não tranca nada, e o motivo aparece
 * sempre. O motor e a regra da revisão estão em lib/engine/textos.ts. */

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { Compreensao } from '@/components/learn/Compreensao';
import { textoDoModulo, type CourseModule } from '@/lib/content';
import { stripNikud } from '@/lib/hebrew';

export function TextoClient({ module: mod }: { module: CourseModule }) {
  const texto = textoDoModulo(mod.n);
  const [translit, setTranslit] = useState(false);
  const [traducao, setTraducao] = useState(false);
  const [pontos, setPontos] = useState(false);
  /* As linhas abertas uma a uma, para quem travou só numa. */
  const [abertas, setAbertas] = useState<Set<number>>(new Set());

  if (!texto) {
    return (
      <div className="focus-col grid gap-5">
        <p className="text-[16px] text-ink-body m-0">Este módulo ainda não tem texto de leitura.</p>
        <LinkButton href={`/modulo/${mod.n}`} variant="secondary" className="justify-self-start">
          Voltar ao módulo
        </LinkButton>
      </div>
    );
  }

  const mostra = (he: string) => (texto.semPontos && !pontos ? stripNikud(he) : he);
  const alterna = (i: number) => setAbertas(s => {
    const n = new Set(s);
    if (n.has(i)) n.delete(i); else n.add(i);
    return n;
  });

  const Chave = ({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: string }) => (
    <button type="button" aria-pressed={ativo} onClick={onClick}
            className={`min-h-[44px] px-4 rounded-full border font-ui text-[14px] transition-colors
              ${ativo ? 'bg-[var(--teal-soft)] border-[var(--teal)] text-[var(--teal-ink)] font-semibold'
                      : 'border-line bg-surface text-ink-body hover:bg-surface-2'}`}>
      {children}
    </button>
  );

  return (
    <div className="focus-col grid gap-6">
      <header className="grid gap-3">
        <Link href={`/modulo/${mod.n}`}
              className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          ← Módulo {mod.n}
        </Link>
        <Badge tone="accent">Leitura do módulo {mod.n}</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight m-0">{texto.tituloPt}</h1>
        <p className="text-[16px] leading-relaxed text-ink-body m-0">{texto.introPt}</p>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Ajudas de leitura">
        {texto.semPontos && <Chave ativo={pontos} onClick={() => setPontos(v => !v)}>Mostrar os pontos</Chave>}
        <Chave ativo={translit} onClick={() => setTranslit(v => !v)}>Transliteração</Chave>
        <Chave ativo={traducao} onClick={() => setTraducao(v => !v)}>Tradução</Chave>
      </div>

      <Card className="p-5 sm:p-6 grid gap-1">
        <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0 mb-2">{texto.tipoPt}</p>
        <ol className="list-none p-0 m-0 grid gap-2" dir="rtl">
          {texto.linhas.map((l, i) => {
            const aberta = abertas.has(i);
            return (
              <li key={i} className="grid gap-1">
                <button type="button" onClick={() => alterna(i)} aria-expanded={aberta}
                        aria-label={`Linha ${i + 1}: ${aberta ? 'esconder' : 'mostrar'} a ajuda`}
                        className="text-right rounded-[var(--r-md)] px-2 py-1 -mx-2 hover:bg-surface-2">
                  <He size="lg" className="!text-[28px] sm:!text-[34px] !leading-[1.5]">{mostra(l.he)}</He>
                </button>
                {(translit || aberta) && (
                  <p dir="ltr" className="font-ui text-[14.5px] text-ink m-0 px-2 text-left">
                    <span className="font-semibold">{l.translit}</span>
                  </p>
                )}
                {(traducao || aberta) && (
                  <p dir="ltr" className="font-ui text-[14.5px] text-ink-muted m-0 px-2 text-left">{l.pt}</p>
                )}
              </li>
            );
          })}
        </ol>
        <p className="font-ui text-[13px] text-ink-muted m-0 mt-3">
          Toque numa linha para ver só a ajuda dela.
        </p>
      </Card>

      {texto.novas.length > 0 && (
        <Card tone="wash" className="p-5 grid gap-3">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">
            Palavras novas neste texto
          </p>
          <ul className="grid gap-2 list-none p-0 m-0">
            {texto.novas.map(w => (
              <li key={w.he} className="flex items-baseline gap-3 flex-wrap">
                <He size="word">{w.he}</He>
                <span className="font-ui text-[14px] text-ink">
                  <span className="font-semibold">{w.translit}</span>
                  <span className="text-ink-muted"> · {w.pt}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Compreensao
        id={`texto-${mod.n}`}
        titulo="Você entendeu?"
        intro="Responda pelo que leu. Não vale nota: o motivo aparece a cada resposta."
        perguntas={texto.perguntas}
        fecho={{
          bom: 'Você leu um texto inteiro em hebraico e entendeu. É para isto que o alfabeto serve.',
          parcial: 'Volte ao texto e toque nas linhas que travaram. Na segunda leitura ele fica mais fácil.'
        }}
      />

      <LinkButton href={`/modulo/${mod.n}`} variant="secondary" className="justify-self-start">
        Voltar ao módulo
      </LinkButton>
    </div>
  );
}
