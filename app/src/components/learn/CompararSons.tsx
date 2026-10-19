'use client';

/* Ouça a diferença: duas letras de som parecido, lado a lado (19/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Pedido do dono do curso, primeiro para o ר e o ח: para o ouvido
 * brasileiro os dois soam quase iguais. Cada cartão toca a gravação do
 * PROFESSOR daquela letra (data/gravacoes-professor.json, gravada pelo
 * painel /admin/gravar). Nunca voz sintética no lugar dela.
 *
 * Sem gravação, o cartão diz isso numa linha discreta e não mostra botão
 * que não toca. O exercício "você consegue identificar o som?" só aparece
 * quando TODAS as gravações existem: adivinhar entre um som e um silêncio
 * não treina ouvido nenhum.
 *
 * Reutilizável: qualquer letra pode trazer `compararSons` em letters.json,
 * com dois ou mais itens. Os acertos ficam só nesta tela, para o aluno se
 * situar; não contam nota e não travam nada.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { clipeDoPainel, urlDoClipe } from '@/lib/audio-registro';
import { gravacaoDoProfessor } from '@/lib/gravacoes-professor';
import type { Letter } from '@/lib/content';

type Comparacao = NonNullable<Letter['compararSons']>;
type Estado = 'parado' | 'carregando' | 'tocando' | 'pausado';

/** Um tocador só para o quadro: tocar um cartão corta o outro. */
function useTocador() {
  const el = useRef<HTMLAudioElement | null>(null);
  const [atual, setAtual] = useState<{ audioId: string | null; estado: Estado }>({ audioId: null, estado: 'parado' });
  const [falhou, setFalhou] = useState(false);

  useEffect(() => () => { el.current?.pause(); }, []);

  const tocar = useCallback((audioId: string, doComeco = true) => {
    const src = urlDoClipe(audioId);
    if (!el.current || el.current.dataset.src !== src) {
      el.current?.pause();
      el.current = new Audio(src);
      el.current.dataset.src = src;
      el.current.preload = 'auto';
    }
    const a = el.current;
    const corte = clipeDoPainel(audioId);
    const fim = corte?.fim != null ? corte.fim / 1000 : null;
    if (doComeco) a.currentTime = corte?.inicio != null ? corte.inicio / 1000 : 0;
    a.ontimeupdate = fim === null ? null : () => { if (a.currentTime >= fim) { a.pause(); setAtual({ audioId, estado: 'parado' }); } };
    a.onwaiting = () => setAtual({ audioId, estado: 'carregando' });
    a.onplaying = () => setAtual({ audioId, estado: 'tocando' });
    a.onended = () => setAtual({ audioId, estado: 'parado' });
    a.onerror = () => { setAtual({ audioId, estado: 'parado' }); setFalhou(true); };
    setFalhou(false);
    setAtual({ audioId, estado: a.readyState >= 3 ? 'tocando' : 'carregando' });
    void a.play().catch((e: unknown) => {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setAtual({ audioId, estado: 'parado' });
      setFalhou(true);
    });
  }, []);

  const pausar = useCallback(() => {
    el.current?.pause();
    setAtual(s => ({ ...s, estado: 'pausado' }));
  }, []);

  /** O botão de um cartão: toca, pausa ou continua, conforme o estado. */
  const alternar = useCallback((audioId: string) => {
    if (atual.audioId === audioId && atual.estado === 'tocando') return pausar();
    if (atual.audioId === audioId && atual.estado === 'pausado') return tocar(audioId, false);
    tocar(audioId);
  }, [atual, pausar, tocar]);

  return { atual, falhou, tocar, alternar };
}

export function CompararSons({ comparacao }: { comparacao: Comparacao }) {
  useRegistroDeAudio();
  const { atual, falhou, tocar, alternar } = useTocador();
  const itens = comparacao.itens.map(it => {
    const g = gravacaoDoProfessor(it.gravacao);
    const audioId = g && hasAudio(g.audioId) ? g.audioId : null;
    return { ...it, audioId };
  });
  const todas = itens.every(it => it.audioId);

  return (
    <div data-comparar-sons>
    <Card tone="wash" className="p-5 sm:p-6 grid gap-4">
      <h3 className="font-ui text-[17px] font-semibold text-ink m-0">
        <span aria-hidden>🎧 </span>Ouça a diferença:{' '}
        {itens.map((it, i) => (
          <span key={it.glifo}>
            {i > 0 && ' ou '}
            <He size="inline">{it.glifo}</He>
          </span>
        ))}
        ?
      </h3>
      <p className="text-[15px] leading-relaxed text-ink-body m-0">{comparacao.textoPt}</p>

      <ul className="grid grid-cols-2 gap-3 list-none p-0 m-0" dir="rtl">
        {itens.map(it => {
          const meu = atual.audioId != null && atual.audioId === it.audioId;
          const estado: Estado = meu ? atual.estado : 'parado';
          return (
            <li key={it.glifo} dir="ltr"
                className="rounded-[var(--r-md)] bg-surface border border-[color:var(--line-soft)] p-4 grid gap-3 content-start justify-items-center text-center">
              <He size="xl">{it.glifo}</He>
              <span className="font-ui text-[14px] font-semibold text-ink">{it.nomePt}</span>
              {it.audioId ? (
                <button type="button" onClick={() => alternar(it.audioId!)}
                        aria-label={`${estado === 'tocando' ? 'Pausar' : 'Ouvir'} o som de ${it.nomePt}`}
                        aria-pressed={estado === 'tocando'}
                        className="min-h-[48px] w-full rounded-[var(--r-md)] bg-[var(--accent-wash)] text-[var(--accent)]
                                   font-ui font-medium text-[15px] px-3 hover:brightness-95 active:scale-[.97]
                                   transition-transform duration-[var(--dur)] ease-[var(--ease)]">
                  {estado === 'carregando' ? 'Carregando...'
                    : estado === 'tocando' ? '❚❚ Pausar'
                    : estado === 'pausado' ? '▶ Continuar'
                    : '▶ Ouvir'}
                </button>
              ) : (
                <span className="font-ui text-[13px] text-ink-muted">Gravação em preparação.</span>
              )}
              {it.previaPt && <span className="font-ui text-[12.5px] text-ink-muted leading-snug">{it.previaPt}</span>}
            </li>
          );
        })}
      </ul>
      <p role="status" className="font-ui text-[13px] text-ink-muted m-0 empty:hidden">
        {falhou ? 'Não consegui tocar o áudio. Confira a conexão e toque de novo.' : ''}
      </p>

      {todas && <Identificar itens={itens as (typeof itens[number] & { audioId: string })[]} tocar={tocar} />}
    </Card>
    </div>
  );
}

/* ── você consegue identificar o som? ──────────────────────────────────── */
function Identificar({ itens, tocar }: {
  itens: { glifo: string; nomePt: string; audioId: string }[];
  tocar: (audioId: string) => void;
}) {
  const [alvo, setAlvo] = useState<number | null>(null);
  const [resposta, setResposta] = useState<number | null>(null);
  const [placar, setPlacar] = useState({ certos: 0, total: 0 });

  const novo = () => {
    const i = Math.floor(Math.random() * itens.length);
    setAlvo(i);
    setResposta(null);
    tocar(itens[i]!.audioId);
  };
  const responder = (i: number) => {
    if (alvo === null || resposta !== null) return;
    setResposta(i);
    setPlacar(p => ({ certos: p.certos + (i === alvo ? 1 : 0), total: p.total + 1 }));
  };
  const certo = alvo !== null && resposta === alvo;

  return (
    <div className="grid gap-3 border-t border-[color:var(--line-soft)] pt-4">
      <h4 className="font-ui text-[16px] font-semibold text-ink m-0">
        <span aria-hidden>👂 </span>Você consegue identificar o som?
      </h4>
      <div className="flex flex-wrap items-center gap-3">
        {alvo === null || resposta !== null ? (
          <Button onClick={novo}>{alvo === null ? 'Tocar um som' : 'Próximo som'}</Button>
        ) : (
          <Button variant="secondary" onClick={() => tocar(itens[alvo]!.audioId)}>Ouvir de novo</Button>
        )}
        {placar.total > 0 && (
          <span className="font-ui text-[13.5px] text-ink-muted">Acertos: {placar.certos} de {placar.total}</span>
        )}
      </div>
      {alvo !== null && (
        <div className="grid grid-cols-2 gap-3" dir="rtl" role="group" aria-label="Qual letra você ouviu?">
          {itens.map((it, i) => (
            <button key={it.glifo} type="button" dir="ltr" disabled={resposta !== null}
                    onClick={() => responder(i)} aria-label={it.nomePt}
                    className={`min-h-[64px] rounded-[var(--r-md)] border font-ui
                      ${resposta !== null && i === alvo ? 'border-[var(--teal-ink)] bg-[var(--teal-soft)]'
                        : resposta === i ? 'border-[var(--amber)] bg-[var(--amber-wash,#FBF1E2)]'
                        : 'border-line bg-surface'}`}>
              <He size="lg">{it.glifo}</He>
            </button>
          ))}
        </div>
      )}
      <p role="status" className="text-[15px] leading-relaxed m-0 empty:hidden">
        {resposta === null || alvo === null ? ''
          : certo ? `Isso! Era o ${itens[alvo]!.nomePt}.`
          : `Era o ${itens[alvo]!.nomePt}. Ouça os dois de novo e compare.`}
      </p>
    </div>
  );
}
