'use client';

/* A cena do módulo para explorar com o dedo (28/10/2026). As regras moram em
 * `lib/cena-exploravel.ts`; aqui fica só a tela.
 * ─────────────────────────────────────────────────────────────────────────
 * O desenho é o mesmo `Cenario` do mapa, decorativo. Por cima dele, um botão
 * de verdade por ponto (posição em porcentagem do desenho), com o nome em
 * português para o leitor de tela. O toque abre o cartão embaixo com a
 * palavra, a leitura, o sentido e o áudio, e marca o ponto como visto.
 *
 * "Visto" vale só nesta visita: não há campo novo no progresso, nem XP. A
 * cena é um jeito de rever as palavras do módulo, não uma tarefa.
 */

import { useMemo, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { AudioButton } from '@/components/learn/AudioButton';
import { Cenario, LUGAR, type IdDoCenario } from '@/components/aventura/Cenarios';
import { descobertasDaCena } from '@/lib/cena-exploravel';
import type { Letter } from '@/lib/content';
import type { Extras } from '@/lib/engine/extras';

const W = 320, H = 120;

export function CenaExploravel({ modulo, todas, comecadas, extras, modulosComecados }: {
  modulo: number;
  todas: readonly Letter[];
  comecadas: readonly Letter[];
  extras: Extras | null;
  /** Dos módulos sem letra (6 e 7), os que o aluno já começou. */
  modulosComecados: readonly number[];
}) {
  const pontos = useMemo(
    () => descobertasDaCena(modulo, todas, comecadas, extras, modulosComecados),
    [modulo, todas, comecadas, extras, modulosComecados]
  );
  const [aberto, setAberto] = useState<string | null>(null);
  const [vistos, setVistos] = useState<ReadonlySet<string>>(new Set());
  if (pontos.length === 0) return null;

  const atual = pontos.find(p => p.he === aberto) ?? null;
  const tocar = (he: string) => {
    setAberto(he);
    setVistos(v => new Set(v).add(he));
  };
  const lugar = LUGAR[modulo as IdDoCenario];

  return (
    <section aria-labelledby="cena-titulo"
             className="grid overflow-hidden rounded-[var(--r-lg)] border border-line bg-[var(--card)] shadow-[var(--sh)]">
      <div className="grid gap-1 px-5 pt-5 pb-3 sm:px-6">
        <h2 id="cena-titulo" className="m-0 font-display text-[18px] font-semibold text-balance">
          Explore {lugar.pt.split(',')[0]}
        </h2>
        <p className="m-0 font-ui text-[14px] leading-snug text-ink-muted text-pretty">
          Toque nos pontos do desenho: cada um é uma palavra do curso.
        </p>
      </div>

      {/* Os botões ficam fora do recorte do desenho: o ponto da beira não é cortado. */}
      <div className="relative aspect-[8/3]">
        <div className="hf-cena absolute inset-0 overflow-hidden border-y border-line">
          <Cenario n={modulo as IdDoCenario} vivo />
        </div>
        {pontos.map(p => {
          const visto = vistos.has(p.he);
          const ativo = aberto === p.he;
          return (
            <button key={p.he} type="button" onClick={() => tocar(p.he)}
                    aria-pressed={ativo}
                    aria-label={`${p.palavra.pt}${visto ? ', visto' : ''}`}
                    style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full
                               focus-visible:outline-offset-0">
              {!visto && <span aria-hidden className="hf-cena-pulso absolute w-6 h-6 rounded-full bg-white/70" />}
              <span aria-hidden
                    className={`relative grid place-items-center w-[22px] h-[22px] rounded-full border-2 font-ui text-[12px] font-bold
                                shadow-[0_1px_3px_rgba(0,0,0,.35)] transition-transform duration-150 group-active:scale-90
                                ${ativo ? 'bg-[var(--gold-solid)] border-white text-white scale-110'
                                  : visto ? 'bg-[var(--teal)] border-white text-white'
                                  : 'bg-white border-[var(--navy)] text-[var(--navy)]'}`}>
                {visto ? '✓' : ''}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 px-5 py-4 sm:px-6 min-h-[132px] content-center" aria-live="polite">
        {atual ? (
          atual.legivel ? (
            <div key={atual.he} className="flex items-center gap-4 il-entra">
              <span className="text-[34px] leading-none"><He size="word">{atual.palavra.he}</He></span>
              <span className="grid gap-0.5 flex-1 min-w-0">
                {atual.palavra.translit && <span className="font-ui text-[16px] font-semibold text-ink">{atual.palavra.translit}</span>}
                <span className="font-ui text-[14.5px] text-ink-muted">{atual.palavra.pt}</span>
                {atual.palavra.comPontos && (
                  <span className="font-ui text-[13px] text-ink-muted">
                    Com os pontos: <He size="inline">{atual.palavra.comPontos}</He>
                  </span>
                )}
              </span>
              <AudioButton audioId={atual.palavra.audioId ?? null} label="Ouvir"
                           ariaLabel={`Ouvir ${atual.palavra.translit ?? atual.palavra.pt}`} size="sm" />
            </div>
          ) : (
            <p key={atual.he} className="m-0 font-ui text-[15px] leading-snug text-ink-body il-entra">
              <strong className="font-semibold text-ink">{atual.palavra.pt[0]!.toUpperCase() + atual.palavra.pt.slice(1)}.</strong>{' '}
              {atual.faltaModulo
                ? `A palavra em hebraico aparece aqui quando você começar o módulo ${atual.faltaModulo}.`
                : `A palavra em hebraico aparece aqui quando você começar a letra ${atual.falta?.namePt ?? 'que falta'}.`}
            </p>
          )
        ) : (
          <p className="m-0 font-ui text-[14.5px] text-ink-muted">Nenhum ponto aberto ainda.</p>
        )}
        <p className="m-0 font-ui text-[13px] text-ink-muted tabular-nums">
          {vistos.size === pontos.length
            ? `Você encontrou as ${pontos.length} palavras do lugar.`
            : `${vistos.size} de ${pontos.length} encontradas`}
        </p>
      </div>
    </section>
  );
}
