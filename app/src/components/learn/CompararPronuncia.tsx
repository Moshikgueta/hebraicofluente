'use client';

/* Comparar a própria pronúncia com a do curso, lado a lado.
 * ─────────────────────────────────────────────────────────────────────────
 * O "Gravar minha leitura" deixa o aluno se ouvir, mas não diz com o que
 * comparar. Este fecha o ciclo, item a item: escolher uma sílaba ou palavra
 * que tem gravação do curso, ouvir o modelo, gravar a sua, e então VER as
 * duas formas de onda, uma embaixo da outra e na mesma escala de tempo, e
 * OUVIR as duas em sequência - o modelo e logo depois a sua.
 *
 * Ver ajuda onde o ouvido ainda não sabe o que procurar: uma sílaba esticada
 * demais aparece mais comprida; um "ch" que não saiu raspado aparece sem o
 * trecho de ruído no começo. E não há nota: um corretor automático de
 * pronúncia em hebraico não é confiável hoje, e uma nota errada ensina pior
 * do que nota nenhuma. Quem julga é o ouvido do aluno, agora com régua.
 *
 * As duas ondas são cortadas no trecho da voz (`acharVoz`, lib/gravador.ts),
 * então o silêncio antes de apertar o botão não desalinha nada. Tocam por
 * Web Audio, do buffer decodificado, para que o corte seja exato.
 *
 * A gravação fica no aparelho, como no GravarLeitura: nada é enviado.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { hasAudio, useRegistroDeAudio } from './AudioButton';
import { urlDoClipe } from '@/lib/audio-registro';
import { acharVoz, barrasDoTrecho, paraMono, type Corte } from '@/lib/gravador';

export type ItemDeComparacao = { he: string; translit?: string | null; audioId: string | null };

type Onda = { buf: AudioBuffer; corte: Corte; barras: number[] };
type Estado = 'parado' | 'gravando' | 'pronto' | 'negado' | 'sem-suporte' | 'erro';

const MAX_S = 5;
const BARRAS_POR_S = 40;

/** O trecho da voz e as suas barras, na escala comum de BARRAS_POR_S. */
function ondaDe(buf: AudioBuffer): Onda {
  const mono = paraMono(Array.from({ length: buf.numberOfChannels }, (_, i) => buf.getChannelData(i)));
  const corte = acharVoz(mono, buf.sampleRate) ?? { inicio: 0, fim: Math.round(buf.duration * 1000) };
  return { buf, corte, barras: barrasDoTrecho(mono, buf.sampleRate, corte, BARRAS_POR_S) };
}

function Barras({ onda, largura, cor, rotulo }: { onda: Onda | null; largura: number; cor: string; rotulo: string }) {
  return (
    <div className="grid grid-cols-[52px_1fr] items-center gap-2">
      <span className="font-ui text-[12.5px] text-ink-muted">{rotulo}</span>
      <svg viewBox={`0 0 ${Math.max(largura, 1) * 4} 36`} preserveAspectRatio="none" className="w-full h-9" aria-hidden>
        {onda?.barras.map((a, i) => {
          const h = Math.max(1.5, a * 34);
          return <rect key={i} x={i * 4} y={18 - h / 2} width={2.6} height={h} rx={1} fill={cor} />;
        })}
      </svg>
    </div>
  );
}

export function CompararPronuncia({ itens, titulo = 'Compare a sua pronúncia com a do curso' }: {
  itens: readonly ItemDeComparacao[]; titulo?: string;
}) {
  useRegistroDeAudio();
  const comAudio = itens.filter(i => hasAudio(i.audioId));
  const [qual, setQual] = useState(0);
  const [estado, setEstado] = useState<Estado>('parado');
  const [modelo, setModelo] = useState<Onda | null>(null);
  const [minha, setMinha] = useState<Onda | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const tocando = useRef<AudioBufferSourceNode[]>([]);
  const item = comAudio[Math.min(qual, comAudio.length - 1)];

  const soltar = useCallback(() => {
    stream.current?.getTracks().forEach(t => t.stop());
    stream.current = null;
  }, []);
  useEffect(() => () => {
    soltar();
    tocando.current.forEach(s => { try { s.stop(); } catch { /* já parou */ } });
    void ctx.current?.close().catch(() => {});
  }, [soltar]);

  const contexto = () => {
    /* Criado dentro do toque: o iOS só deixa um AudioContext tocar assim. */
    if (!ctx.current) ctx.current = new AudioContext();
    void ctx.current.resume().catch(() => {});
    return ctx.current;
  };

  /* O modelo do item escolhido, decodificado uma vez. Trocar de item limpa a
     gravação da pessoa: comparar a sua sílaba "ma" com o modelo "mi" é ruído. */
  useEffect(() => {
    setModelo(null);
    setMinha(null);
    if (!item?.audioId || estado === 'gravando') return;
    let vivo = true;
    const url = urlDoClipe(item.audioId).split('#')[0]!;
    fetch(url, { credentials: 'same-origin' })
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then(dados => new Promise<AudioBuffer>((ok, falha) =>
        (ctx.current ?? new AudioContext()).decodeAudioData(dados, ok, falha)))
      .then(buf => { if (vivo) setModelo(ondaDe(buf)); })
      .catch(() => { /* sem o modelo, a comparação some; o botão de gravar continua */ });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.audioId]);

  const tocar = (ondas: Onda[]) => {
    const ac = contexto();
    tocando.current.forEach(s => { try { s.stop(); } catch { /* já parou */ } });
    let quando = ac.currentTime + 0.05;
    tocando.current = ondas.map(o => {
      const s = ac.createBufferSource();
      s.buffer = o.buf;
      s.connect(ac.destination);
      const dur = (o.corte.fim - o.corte.inicio) / 1000;
      s.start(quando, o.corte.inicio / 1000, dur);
      quando += dur + 0.45;
      return s;
    });
  };

  const gravar = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setEstado('sem-suporte');
      return;
    }
    const ac = contexto();
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      const pedacos: Blob[] = [];
      const r = new MediaRecorder(stream.current);
      r.ondataavailable = e => { if (e.data.size) pedacos.push(e.data); };
      r.onstop = async () => {
        soltar();
        try {
          const dados = await new Blob(pedacos, { type: r.mimeType || 'audio/webm' }).arrayBuffer();
          const buf = await new Promise<AudioBuffer>((ok, falha) => ac.decodeAudioData(dados, ok, falha));
          setMinha(ondaDe(buf));
          setEstado('pronto');
        } catch {
          setEstado('erro');
        }
      };
      rec.current = r;
      r.start();
      setEstado('gravando');
      /* Uma sílaba ou uma palavra: cinco segundos sobram, e o botão para antes. */
      setTimeout(() => { if (r.state === 'recording') r.stop(); }, MAX_S * 1000);
    } catch (e) {
      soltar();
      const nome = (e as { name?: string })?.name;
      setEstado(nome === 'NotAllowedError' || nome === 'SecurityError' ? 'negado' : 'erro');
    }
  };
  const parar = () => { if (rec.current?.state === 'recording') rec.current.stop(); };

  if (!comAudio.length || !item) return null;

  const largura = Math.max(modelo?.barras.length ?? 0, minha?.barras.length ?? 0);

  return (
    <section aria-label={titulo} className="grid gap-3 rounded-[var(--r-lg)] border border-line bg-surface p-5">
      <div className="grid gap-1">
        <h3 className="font-display text-[17px] font-semibold m-0">{titulo}</h3>
        <p className="font-ui text-[14px] leading-relaxed text-ink-body m-0">
          Escolha um item, ouça o modelo, grave o seu e compare: as duas ondas ficam na mesma escala de tempo.
        </p>
      </div>

      {comAudio.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Item para comparar">
          {comAudio.map((it, k) => (
            <button key={it.he} type="button" aria-pressed={k === qual} disabled={estado === 'gravando'}
                    onClick={() => { setQual(k); setEstado('parado'); }}
                    className={`min-h-[44px] min-w-[52px] px-3 rounded-[var(--r-md)] border
                      ${k === qual ? 'border-[var(--navy)] bg-[var(--accent-wash)]' : 'border-line bg-surface'}`}>
              <He size="word">{it.he}</He>
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-1.5 rounded-[var(--r-md)] bg-surface-2 p-3">
        <Barras onda={modelo} largura={largura} cor="var(--navy)" rotulo="Curso" />
        <Barras onda={minha} largura={largura} cor="var(--teal)" rotulo="Você" />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={() => modelo && tocar([modelo])} disabled={!modelo}
                className="min-h-[44px] px-4 rounded-[var(--r-md)] border border-line bg-surface font-ui text-[14px] disabled:opacity-50">
          ▶ Modelo {item.translit ? `(${item.translit})` : ''}
        </button>
        {estado === 'gravando' ? (
          <button type="button" onClick={parar}
                  className="min-h-[44px] px-4 rounded-[var(--r-md)] bg-[#D93025] text-white font-ui text-[14px] font-semibold">
            ■ Parar
          </button>
        ) : (
          <button type="button" onClick={gravar}
                  className="min-h-[44px] px-4 rounded-[var(--r-md)] bg-[var(--navy)] text-white font-ui text-[14px] font-semibold">
            ● {minha ? 'Gravar de novo' : 'Gravar a minha'}
          </button>
        )}
        {modelo && minha && (
          <>
            <button type="button" onClick={() => tocar([modelo, minha])}
                    className="min-h-[44px] px-4 rounded-[var(--r-md)] bg-[var(--teal)] text-white font-ui text-[14px] font-semibold">
              ▶ Ouvir os dois
            </button>
            <button type="button" onClick={() => tocar([minha])}
                    className="min-h-[44px] px-3 font-ui text-[14px] text-ink-body underline">
              Só a minha
            </button>
          </>
        )}
      </div>

      {estado === 'gravando' && (
        <p role="status" className="font-ui text-[14px] text-[#B3261E] m-0">Gravando… diga o item uma vez e toque em Parar.</p>
      )}
      {estado === 'negado' && (
        <p role="alert" className="font-ui text-[14px] text-ink-body m-0">
          O navegador não deixou usar o microfone. Toque no cadeado ao lado do endereço, permita o microfone e tente de novo.
        </p>
      )}
      {estado === 'sem-suporte' && (
        <p role="alert" className="font-ui text-[14px] text-ink-body m-0">Este navegador não grava áudio. Tente pelo Chrome, Edge, Firefox ou Safari atualizados.</p>
      )}
      {estado === 'erro' && (
        <p role="alert" className="font-ui text-[14px] text-ink-body m-0">Não consegui gravar ou ler a gravação. Tente de novo.</p>
      )}
      <p className="font-ui text-[12.5px] text-ink-muted m-0">A sua gravação fica só neste aparelho. Nada é enviado.</p>
    </section>
  );
}
