'use client';

import { useEffect, useRef, useState } from 'react';
import { urlAmostra, type NomeAmostra } from '@/lib/amostra-audio';

/** Um tocador por seção: tocar outro clipe corta o anterior. As gravações vêm
 *  de /amostra-audio/ (lib/amostra-audio.ts), porque /audio/ é pago. */
export function useTocador() {
  const el = useRef<HTMLAudioElement | null>(null);
  const [tocando, setTocando] = useState<NomeAmostra | null>(null);
  useEffect(() => () => { el.current?.pause(); }, []);
  const tocar = (nome: NomeAmostra) => {
    el.current?.pause();
    const a = new Audio(urlAmostra(nome));
    el.current = a;
    setTocando(nome);
    a.onended = a.onerror = () => setTocando(t => (t === nome ? null : t));
    void a.play().catch(() => setTocando(null));
  };
  return { tocar, tocando };
}
