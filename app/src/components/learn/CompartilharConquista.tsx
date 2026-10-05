'use client';

/* O botão "Compartilhar no Instagram" de uma conquista (05/10/2026).
 * Ver lib/compartilhar.ts: a imagem é feita no aparelho e nada vai ao
 * servidor. No celular abre a folha de compartilhar (onde está o Instagram);
 * onde ela não existe, baixa a imagem. */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FRASES, LEGENDA, desenharConquista } from '@/lib/compartilhar';

export function CompartilharConquista({ id, quando, size = 'sm', variant = 'secondary' }: {
  id: string;
  /** Quando a conquista aconteceu (ISO). Sem ela, hoje. */
  quando?: string | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'quiet';
}) {
  const [estado, setEstado] = useState<'pronto' | 'gerando' | 'baixou' | 'erro'>('pronto');
  const frase = FRASES[id];
  if (!frase) return null;

  async function compartilhar() {
    setEstado('gerando');
    try {
      const data = new Date(quando || Date.now()).toLocaleDateString('pt-BR');
      const blob = await desenharConquista(frase!, data);
      const arquivo = new File([blob], `conquista-${id}.png`, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && nav.canShare?.({ files: [arquivo] })) {
        try { await nav.share({ files: [arquivo], text: LEGENDA }); }
        catch { /* a pessoa fechou a folha: não é erro */ }
        return setEstado('pronto');
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = arquivo.name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setEstado('baixou');
    } catch {
      setEstado('erro');
    }
  }

  return (
    <span className="inline-grid gap-1">
      <Button size={size} variant={variant} onClick={() => void compartilhar()} disabled={estado === 'gerando'}>
        {estado === 'gerando' ? 'Preparando a imagem…' : 'Compartilhar no Instagram'}
      </Button>
      {estado === 'baixou' && (
        <span role="status" className="font-ui text-[12.5px] text-ink-muted">
          A imagem foi baixada. Publique no Instagram pelo celular.
        </span>
      )}
      {estado === 'erro' && (
        <span role="alert" className="font-ui text-[12.5px] text-ink-muted">Não consegui gerar a imagem agora.</span>
      )}
    </span>
  );
}
