/* Até onde os visitantes chegam no teste grátis da capa (03/10/2026).
 * Ver worker/src/api/estatisticas.js, `contarDemo`.
 *
 * Cada etapa vai uma vez por visita: refazer o teste não conta de novo, e o
 * funil é de pessoas, não de cliques. Só o nome da etapa sai do navegador.
 * Falhar não avisa ninguém: estatística perdida não é problema do visitante. */
import { asset } from '@/lib/asset';

export type EtapaDaDemo =
  | 'visto' | 'reconhecer' | 'comparar' | 'vogais' | 'escrever' | 'achar' | 'ler' | 'pronto' | 'cta';

const enviadas = new Set<EtapaDaDemo>();

export function contarEtapaDaDemo(etapa: EtapaDaDemo): void {
  if (enviadas.has(etapa)) return;
  enviadas.add(etapa);
  try {
    /* `keepalive`: o clique no botão final navega para o checkout, e um
       fetch comum morreria com a página. */
    void fetch(asset('/api/demo'), {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', keepalive: true,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ etapa })
    }).catch(() => {});
  } catch { /* sem fetch: segue sem contar */ }
}
