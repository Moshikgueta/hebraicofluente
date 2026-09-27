import { Suspense } from 'react';
import { BonusClient } from './BonusClient';

/* As leituras bônus. Atrás do portão (worker/src/gate.js, `/bonus`), como
   Recompensas: o conteúdo é pago e vem de /api/content. */
export default function BonusPage() {
  return <Suspense fallback={null}><BonusClient /></Suspense>;
}
