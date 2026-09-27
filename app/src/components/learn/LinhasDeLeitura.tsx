'use client';

/* As linhas de uma leitura corrida, com as ajudas a um toque.
 * ─────────────────────────────────────────────────────────────────────────
 * Saiu do texto do módulo (27/09/2026) para servir também às leituras bônus.
 * O texto vem primeiro e SOZINHO: sem transliteração e sem tradução na tela.
 * Ler é decifrar, e a muleta à vista faz o olho ir direto para o português.
 * As duas ajudas existem, a um toque, para a linha que travou ou para o
 * texto todo - e a pessoa decide quando pedir.
 */

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { He } from '@/components/hebrew/He';
import { AudioButton, hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { clipeDoPainel, urlDoClipe } from '@/lib/audio-registro';
import { stripNikud } from '@/lib/hebrew';

export type LinhaLida = { he: string; translit: string; pt: string; quem?: string; audioId?: string };

export function LinhasDeLeitura({ linhas, rotulo, semPontos = false, heClassName }: {
  linhas: readonly LinhaLida[];
  /** O que aparece em cima do texto: "Conversa no WhatsApp", "Gênesis 1:1-5". */
  rotulo: string;
  /** Texto escrito sem nikud, com a chave para mostrar os pontos. */
  semPontos?: boolean;
  /** Tamanho do hebraico: as leituras bônus têm linhas bem mais longas. */
  heClassName?: string;
}) {
  const [translit, setTranslit] = useState(false);
  const [traducao, setTraducao] = useState(false);
  const [pontos, setPontos] = useState(false);
  /* As linhas abertas uma a uma, para quem travou só numa. */
  const [abertas, setAbertas] = useState<Set<number>>(new Set());
  /* "Ouvir o texto inteiro": as linhas em sequência, acendendo a que toca.
     Só aparece com TODAS as linhas gravadas - um texto que para no meio
     ensina que a fala tem buracos. */
  useRegistroDeAudio();
  const [tocando, setTocando] = useState<number | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { player.current?.pause(); }, []);

  const todasGravadas = linhas.every(l => hasAudio(l.audioId));
  const tocarLinha = (i: number) => {
    const l = linhas[i];
    if (!l?.audioId) { setTocando(null); return; }
    const corte = clipeDoPainel(l.audioId);
    const el = new Audio(urlDoClipe(l.audioId));
    player.current?.pause();
    player.current = el;
    setTocando(i);
    const fim = corte?.fim != null ? corte.fim / 1000 : null;
    el.currentTime = corte?.inicio != null ? corte.inicio / 1000 : 0;
    const proxima = () => { el.onended = null; el.ontimeupdate = null; tocarLinha(i + 1); };
    el.onended = proxima;
    el.ontimeupdate = fim === null ? null : () => { if (el.currentTime >= fim) { el.pause(); proxima(); } };
    el.onerror = () => setTocando(null);
    void el.play().catch(() => setTocando(null));
  };
  const ouvirTexto = () => {
    if (tocando !== null) { player.current?.pause(); setTocando(null); return; }
    tocarLinha(0);
  };

  const mostra = (he: string) => (semPontos && !pontos ? stripNikud(he) : he);
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
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Ajudas de leitura">
        {semPontos && <Chave ativo={pontos} onClick={() => setPontos(v => !v)}>Mostrar os pontos</Chave>}
        <Chave ativo={translit} onClick={() => setTranslit(v => !v)}>Transliteração</Chave>
        <Chave ativo={traducao} onClick={() => setTraducao(v => !v)}>Tradução</Chave>
        {todasGravadas && (
          <Chave ativo={tocando !== null} onClick={ouvirTexto}>
            {tocando !== null ? '■ Parar' : '▶ Ouvir o texto inteiro'}
          </Chave>
        )}
      </div>

      <Card className="p-5 sm:p-6 grid gap-1">
        <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0 mb-2">{rotulo}</p>
        <ol className="list-none p-0 m-0 grid gap-2" dir="rtl">
          {linhas.map((l, i) => {
            const aberta = abertas.has(i);
            return (
              <li key={i} className="grid gap-1">
                {/* Numa conversa, o nome acima da linha - como no WhatsApp.
                    Só quando muda quem fala, para não repetir o nome à toa. */}
                {l.quem && l.quem !== linhas[i - 1]?.quem && (
                  <p dir="ltr" className={`font-ui text-[12.5px] font-semibold text-ink-muted m-0 px-2 ${i ? 'mt-2' : ''} text-right`}>
                    {l.quem}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => alterna(i)} aria-expanded={aberta}
                          aria-label={`Linha ${i + 1}: ${aberta ? 'esconder' : 'mostrar'} a ajuda`}
                          className={`flex-1 text-right rounded-[var(--r-md)] px-2 py-1 -mx-2 hover:bg-surface-2
                            ${tocando === i ? 'bg-[var(--accent-wash)]' : ''}`}>
                    <He size="lg" className={heClassName ?? '!text-[28px] sm:!text-[34px] !leading-[1.5]'}>{mostra(l.he)}</He>
                  </button>
                  {hasAudio(l.audioId) && <AudioButton audioId={l.audioId!} ariaLabel={`Ouvir a linha ${i + 1}`} size="sm" />}
                </div>
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
    </>
  );
}
