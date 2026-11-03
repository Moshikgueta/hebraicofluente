/* O certificado do alfabeto, emitido pelo servidor (03/11/2026). Só
 * chamadas: quem decide é worker/src/api/certificado-alfa.js. Na build de
 * demonstração não há servidor, e a tela continua desenhando como antes. */
import { asset } from '@/lib/asset';
import type { CertificadoA1 } from '@/lib/a1-exame';

export const CERTIFICADO_NO_SERVIDOR = process.env.NEXT_PUBLIC_PLATFORM_API === 'worker';

export type SituacaoAlfa =
  | { situacao: 'emitido'; certificado: CertificadoA1 }
  | { situacao: 'prazo'; abreEm: string }
  | { situacao: 'falta' }
  | { situacao: 'pode'; nomeSugerido?: string };

async function chamar(metodo: 'GET' | 'POST', corpo?: unknown): Promise<SituacaoAlfa | { erro: string }> {
  try {
    const r = await fetch(asset('/api/certificado/alfabetizacao'), {
      method: metodo, credentials: 'same-origin', cache: 'no-store',
      ...(corpo === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) })
    });
    const j = await r.json().catch(() => ({})) as Record<string, unknown>;
    if (j.error === 'no-prazo' && typeof j.abreEm === 'string') return { situacao: 'prazo', abreEm: j.abreEm };
    if (!r.ok) return { erro: typeof j.error === 'string' ? j.error : `http-${r.status}` };
    return j as SituacaoAlfa;
  } catch {
    return { erro: 'rede' };
  }
}

export const situacaoDoCertificado = () => chamar('GET');
export const emitirCertificadoAlfa = (nome: string) => chamar('POST', { nome });
