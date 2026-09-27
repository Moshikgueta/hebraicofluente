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

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Badge, Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { Compreensao } from '@/components/learn/Compreensao';
import { GravarLeitura } from '@/components/learn/GravarLeitura';
import { AudioButton, hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { clipeDoPainel, urlDoClipe } from '@/lib/audio-registro';
import { textoDoModulo, type CourseModule } from '@/lib/content';
import { stripNikud } from '@/lib/hebrew';
import { useProgress } from '@/lib/state/store';
import { textoLidoId } from '@/lib/engine/textos';

export function TextoClient({ module: mod }: { module: CourseModule }) {
  const texto = textoDoModulo(mod.n);
  const p = useProgress();
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

  const todasGravadas = texto.linhas.every(l => hasAudio(l.audioId));
  const tocarLinha = (i: number) => {
    const l = texto.linhas[i];
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
        {todasGravadas && (
          <Chave ativo={tocando !== null} onClick={ouvirTexto}>
            {tocando !== null ? '■ Parar' : '▶ Ouvir o texto inteiro'}
          </Chave>
        )}
      </div>

      <Card className="p-5 sm:p-6 grid gap-1">
        <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0 mb-2">{texto.tipoPt}</p>
        <ol className="list-none p-0 m-0 grid gap-2" dir="rtl">
          {texto.linhas.map((l, i) => {
            const aberta = abertas.has(i);
            return (
              <li key={i} className="grid gap-1">
                {/* Numa conversa, o nome acima da linha - como no WhatsApp.
                    Só quando muda quem fala, para não repetir o nome à toa. */}
                {l.quem && l.quem !== texto.linhas[i - 1]?.quem && (
                  <p dir="ltr" className={`font-ui text-[12.5px] font-semibold text-ink-muted m-0 px-2 ${i ? 'mt-2' : ''} text-right`}>
                    {l.quem}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => alterna(i)} aria-expanded={aberta}
                          aria-label={`Linha ${i + 1}: ${aberta ? 'esconder' : 'mostrar'} a ajuda`}
                          className={`flex-1 text-right rounded-[var(--r-md)] px-2 py-1 -mx-2 hover:bg-surface-2
                            ${tocando === i ? 'bg-[var(--accent-wash)]' : ''}`}>
                    <He size="lg" className="!text-[28px] sm:!text-[34px] !leading-[1.5]">{mostra(l.he)}</He>
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

      {/* Ler o texto inteiro em voz alta é a leitura corrida de verdade: sem
          parar em cada palavra. Gravar e se ouvir mostra onde a voz travou. */}
      <GravarLeitura
        titulo="Leia o texto em voz alta"
        instrucao="Leia o texto inteiro, sem parar em cada palavra, grave e se ouça. Depois leia de novo e compare."
      />

      {texto.novas.length > 0 && (
        <Card tone="wash" className="p-5 grid gap-3">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">
            Palavras novas neste texto
          </p>
          <ul className="grid gap-2 list-none p-0 m-0">
            {texto.novas.map(w => (
              <li key={w.he} className="flex items-baseline gap-3 flex-wrap">
                <He size="word">{w.he}</He>
                {hasAudio(w.audioId) && <AudioButton audioId={w.audioId!} ariaLabel={`Ouvir ${w.translit}`} size="sm" />}
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
        /* Respondidas as perguntas, o texto conta como lido, e as palavras
           novas dele passam a fazer parte do vocabulário do aluno. */
        aoCompletar={() => p.markFirst(textoLidoId(mod.n))}
      />
      {p.state.firsts[textoLidoId(mod.n)] && texto.novas.length > 0 && (
        <p className="font-ui text-[14px] text-[var(--teal-ink)] m-0">
          ✓ As palavras novas deste texto entraram no seu vocabulário e no treino de palavras à mão.
        </p>
      )}

      <LinkButton href={`/modulo/${mod.n}`} variant="secondary" className="justify-self-start">
        Voltar ao módulo
      </LinkButton>
    </div>
  );
}
