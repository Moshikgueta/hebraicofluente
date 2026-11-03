'use client';

import { useEffect } from 'react';
import { viewAction } from '@/app/c/[slug]/actions';

// Registra a leitura quando a pagina realmente abre no aparelho (pre-carregamento nao conta).
export function ViewTracker({ slug, destination }: { slug: string; destination: string }) {
  useEffect(() => {
    const t = setTimeout(() => void viewAction(slug, destination), 1500);
    return () => clearTimeout(t);
  }, [slug, destination]);
  return null;
}
