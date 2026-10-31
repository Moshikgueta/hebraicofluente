'use client';

/* Liga o envio das estatísticas de aprendizagem com a pessoa conectada, e
   desliga ao sair. Ver lib/estatisticas.ts. Não desenha nada. */

import { useEffect } from 'react';
import { useAccount } from '@/lib/account/store';
import { setAnalyticsSink } from '@/lib/analytics';
import { asset } from '@/lib/asset';
import { criarEnviador, INTERVALO_MS, type EventoEnviado } from '@/lib/estatisticas';

function mandar(lote: EventoEnviado[], saindo: boolean) {
  const url = asset('/api/estatisticas');
  const corpo = JSON.stringify({ eventos: lote });
  /* Saindo da página, o sendBeacon é o que chega: um fetch comum morre com
     ela. No resto, um fetch que ninguém espera. Falhar não avisa ninguém. */
  if (saindo && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try { if (navigator.sendBeacon(url, new Blob([corpo], { type: 'application/json' }))) return; } catch { /* segue */ }
  }
  void fetch(url, {
    method: 'POST', credentials: 'same-origin', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }, body: corpo
  }).catch(() => {});
}

export function EnvioDeEstatisticas() {
  const account = useAccount();
  const ligado = account.ready && account.signedIn;
  useEffect(() => {
    if (!ligado) return;
    const env = criarEnviador(mandar);
    setAnalyticsSink(evs => env.receber(evs));
    const t = window.setInterval(() => env.esvaziar(), INTERVALO_MS);
    const aoEsconder = () => { if (document.visibilityState === 'hidden') env.esvaziar(true); };
    const aoSair = () => env.esvaziar(true);
    document.addEventListener('visibilitychange', aoEsconder);
    window.addEventListener('pagehide', aoSair);
    return () => {
      env.esvaziar(true);
      setAnalyticsSink(null);
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', aoEsconder);
      window.removeEventListener('pagehide', aoSair);
    };
  }, [ligado]);
  return null;
}
