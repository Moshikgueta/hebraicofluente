'use client';

/* Decide de onde veio a visita, na primeira página que ela abre, e guarda
   no aparelho. Ver lib/origem.ts. Não desenha nada. */

import { useEffect } from 'react';
import { registrarOrigem } from '@/lib/origem';

export function RegistroDeOrigem() {
  useEffect(() => { registrarOrigem(); }, []);
  return null;
}
