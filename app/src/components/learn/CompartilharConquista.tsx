'use client';

/* O botão "Compartilhar no Instagram" de uma conquista (05/10/2026).
 * Ver lib/compartilhar.ts: a imagem é feita no aparelho e nada vai ao
 * servidor.
 *
 * A IMAGEM FICA PRONTA ANTES DO TOQUE (05/10/2026, o dono não conseguia
 * postar no fim do módulo). O iPhone só abre a folha de compartilhar se
 * `navigator.share` for chamado logo no toque; a primeira versão desenhava
 * a imagem depois do toque, o Safari recusava e o erro sumia em silêncio.
 * Agora ela é desenhada quando o botão aparece na tela, e o toque só
 * compartilha. Também vai SÓ o arquivo, sem texto: com texto junto, o
 * Instagram do iPhone pode receber o texto e largar a imagem.
 *
 * Se a folha não existe ou recusa, no celular a imagem abre na tela para a
 * pessoa salvar com um toque longo; no computador, ela é baixada.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { FRASES, desenharConquista } from '@/lib/compartilhar';

type Pronta = { arquivo: File; url: string };

export function CompartilharConquista({ id, quando, size = 'sm', variant = 'secondary' }: {
  id: string;
  /** Quando a conquista aconteceu (ISO). Sem ela, hoje. */
  quando?: string | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'quiet';
}) {
  const frase = FRASES[id];
  const raiz = useRef<HTMLSpanElement>(null);
  const [pronta, setPronta] = useState<Pronta | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const [baixou, setBaixou] = useState(false);

  /* Desenha quando o botão entra na tela: nas Conquistas pode haver muitos,
     e só os vistos gastam memória. */
  useEffect(() => {
    if (!frase || !raiz.current) return;
    let vivo = true, url = '';
    const fazer = async () => {
      try {
        const data = new Date(quando || Date.now()).toLocaleDateString('pt-BR');
        const blob = await desenharConquista(frase, data);
        if (!vivo) return;
        url = URL.createObjectURL(blob);
        setPronta({ arquivo: new File([blob], `conquista-${id}.jpg`, { type: 'image/jpeg' }), url });
      } catch { if (vivo) setFalhou(true); }
    };
    const io = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io?.disconnect(); void fazer(); } })
      : null;
    if (io) io.observe(raiz.current); else void fazer();
    return () => { vivo = false; io?.disconnect(); if (url) URL.revokeObjectURL(url); };
  }, [frase, id, quando]);

  if (!frase) return null;

  const celular = () => {
    try { return matchMedia('(pointer: coarse)').matches; } catch { return false; }
  };
  const baixar = (p: Pronta) => {
    const a = document.createElement('a');
    a.href = p.url; a.download = p.arquivo.name;
    document.body.appendChild(a); a.click(); a.remove();
    setBaixou(true);
  };
  const plano_b = (p: Pronta) => (celular() ? setMostrar(true) : baixar(p));

  function compartilhar() {
    if (!pronta) return;
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    const dados = { files: [pronta.arquivo] };
    /* Nada de await antes daqui: o toque precisa chegar inteiro ao share. */
    if (nav.share && nav.canShare?.(dados)) {
      nav.share(dados).catch((e: unknown) => {
        /* Fechar a folha é escolha da pessoa, não erro. Qualquer outra
           recusa cai no plano B, em vez de não fazer nada. */
        if (!(e instanceof DOMException && e.name === 'AbortError')) plano_b(pronta);
      });
      return;
    }
    plano_b(pronta);
  }

  return (
    <span ref={raiz} className="inline-grid gap-1">
      <Button size={size} variant={variant} onClick={compartilhar} disabled={!pronta}>
        {pronta || falhou ? 'Compartilhar no Instagram' : 'Preparando a imagem…'}
      </Button>
      {baixou && (
        <span role="status" className="font-ui text-[12.5px] text-ink-muted">
          A imagem foi baixada. Publique no Instagram pelo celular.
        </span>
      )}
      {falhou && (
        <span role="alert" className="font-ui text-[12.5px] text-ink-muted">Não consegui gerar a imagem agora.</span>
      )}
      {/* No <body>, e não aqui: o aviso de conquista nova anda com transform,
          e um fixed dentro dele ficaria preso ao aviso, embaixo da barra. */}
      {mostrar && pronta && createPortal(
        <div role="dialog" aria-modal="true" aria-label="A imagem da conquista"
             className="fixed inset-0 z-[70] bg-black/85 grid place-items-center p-4">
          <span className="grid gap-3 justify-items-center max-w-[360px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pronta.url} alt={frase} className="w-full max-h-[70vh] object-contain rounded-[12px]" />
            <span className="font-ui text-[14.5px] text-white text-center">
              Toque e segure na imagem para salvar no celular. Depois, publique no story do Instagram.
            </span>
            <Button variant="secondary" onClick={() => setMostrar(false)}>Fechar</Button>
          </span>
        </div>,
        document.body
      )}
    </span>
  );
}
