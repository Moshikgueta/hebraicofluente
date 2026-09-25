'use client';

/* Ler em voz alta, gravar e se ouvir.
 * ─────────────────────────────────────────────────────────────────────────
 * Quem lê só com os olhos acha que leu. Ouvir a própria leitura mostra o
 * que o olho esconde: a sílaba em que a voz hesitou, o ח que saiu como R
 * carioca, a palavra lida letra por letra. É o treino de fala que o curso
 * pode oferecer sem professor e sem servidor.
 *
 * ── privacidade, que é o desenho e não um detalhe ───────────────────────
 * A gravação NUNCA sai do aparelho: fica num `Blob` na memória da página, é
 * tocada por um endereço `blob:` local e some quando a pessoa grava de novo
 * ou sai da tela. Nada é enviado, nada é guardado. Por isso não há consentimento
 * a pedir além do do próprio navegador, que pergunta pelo microfone.
 *
 * O cabeçalho `Permissions-Policy` libera o microfone só para o próprio site
 * e só nas páginas do curso (worker/src/worker.js); no site público ele
 * continua bloqueado.
 *
 * Quando houver gravação do curso (`audioId`), o botão do original aparece ao
 * lado, para comparar. Sem ela, o valor continua: é se ouvir.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AudioButton, hasAudio } from './AudioButton';

type Estado = 'parado' | 'gravando' | 'gravado' | 'negado' | 'sem-suporte' | 'erro';

const formata = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function GravarLeitura({
  titulo = 'Leia em voz alta e se ouça',
  instrucao, audioId, maxSegundos = 90
}: {
  titulo?: string;
  /** O que ler: "Leia as sílabas acima, da direita para a esquerda." */
  instrucao: string;
  /** A gravação do curso, para comparar, quando existir. */
  audioId?: string | null;
  maxSegundos?: number;
}) {
  const [estado, setEstado] = useState<Estado>('parado');
  const [segundos, setSegundos] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const gravador = useRef<MediaRecorder | null>(null);
  const trilhas = useRef<MediaStream | null>(null);
  const pedacos = useRef<Blob[]>([]);
  const relogio = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Tudo o que prende o microfone ou a memória é solto aqui: ao parar, ao
     regravar e ao sair da página. Um microfone esquecido aberto mantém o
     indicador vermelho do navegador aceso - e isso assusta com razão. */
  const soltar = useCallback(() => {
    if (relogio.current) { clearInterval(relogio.current); relogio.current = null; }
    trilhas.current?.getTracks().forEach(t => t.stop());
    trilhas.current = null;
  }, []);

  useEffect(() => () => {
    soltar();
    if (gravador.current?.state === 'recording') gravador.current.stop();
  }, [soltar]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const parar = useCallback(() => {
    if (gravador.current?.state === 'recording') gravador.current.stop();
    soltar();
  }, [soltar]);

  /* O limite de tempo: uma gravação esquecida não fica aberta para sempre. */
  useEffect(() => {
    if (estado === 'gravando' && segundos >= maxSegundos) parar();
  }, [estado, segundos, maxSegundos, parar]);

  const gravar = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia
        || typeof MediaRecorder === 'undefined') {
      setEstado('sem-suporte');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      trilhas.current = stream;
      pedacos.current = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = e => { if (e.data.size) pedacos.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(pedacos.current, { type: rec.mimeType || 'audio/webm' });
        setUrl(antiga => { if (antiga) URL.revokeObjectURL(antiga); return URL.createObjectURL(blob); });
        setEstado('gravado');
      };
      gravador.current = rec;
      rec.start();
      setSegundos(0);
      setEstado('gravando');
      relogio.current = setInterval(() => setSegundos(s => s + 1), 1000);
    } catch (e) {
      soltar();
      const nome = (e as { name?: string })?.name;
      setEstado(nome === 'NotAllowedError' || nome === 'SecurityError' ? 'negado' : 'erro');
    }
  }, [soltar]);

  return (
    <section className="grid gap-3 rounded-[var(--r-lg)] border border-line bg-surface p-5"
             aria-label={titulo}>
      <div className="grid gap-1">
        <h3 className="font-display text-[17px] font-semibold m-0">{titulo}</h3>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body m-0">{instrucao}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {estado === 'gravando' ? (
          <>
            <Button size="md" onClick={parar}>Parar</Button>
            <span role="status" className="inline-flex items-center gap-2 font-ui text-[14px] text-ink-body">
              <span aria-hidden className="w-2.5 h-2.5 rounded-full bg-[var(--gold)] motion-safe:animate-pulse" />
              Gravando · {formata(segundos)}
            </span>
          </>
        ) : (
          <Button size="md" variant={estado === 'gravado' ? 'secondary' : 'primary'} onClick={gravar}>
            {estado === 'gravado' ? 'Gravar de novo' : 'Gravar minha leitura'}
          </Button>
        )}
        {hasAudio(audioId) && <AudioButton audioId={audioId!} label="Ouvir o original" size="sm" />}
      </div>

      {estado === 'gravado' && url && (
        <div className="grid gap-1.5">
          <p className="font-ui text-[13px] text-ink-muted m-0">A sua leitura:</p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={url} className="w-full max-w-[420px]" />
          <p className="font-ui text-[13px] text-ink-muted m-0">
            Ouça procurando onde a voz parou ou hesitou: é ali que vale ler de novo.
          </p>
        </div>
      )}

      {estado === 'negado' && (
        <p role="alert" className="font-ui text-[14px] text-ink-body m-0">
          O navegador não deixou usar o microfone. Para gravar, toque no cadeado ao lado do
          endereço do site e permita o microfone, depois tente de novo.
        </p>
      )}
      {estado === 'sem-suporte' && (
        <p role="alert" className="font-ui text-[14px] text-ink-body m-0">
          Este navegador não grava áudio. Tente pelo Chrome, Edge, Firefox ou Safari atualizados.
        </p>
      )}
      {estado === 'erro' && (
        <p role="alert" className="font-ui text-[14px] text-ink-body m-0">
          Não foi possível abrir o microfone. Confira se ele não está sendo usado por outro app.
        </p>
      )}

      <p className="font-ui text-[12.5px] text-ink-muted m-0">
        A gravação fica só neste aparelho e some quando você sai da página. Nada é enviado.
      </p>
    </section>
  );
}
