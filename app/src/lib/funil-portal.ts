/* O que se abre no portal (a capa desde 23/10/2026).
 * Ver worker/src/api/estatisticas.js, `contarPortal`.
 *
 * Cada evento vai uma vez por visita: o funil é de pessoas, não de cliques.
 * Só o nome do evento sai do navegador. Falhar não avisa ninguém. */
import { asset } from '@/lib/asset';

export type EventoDoPortal =
  | 'visto'
  | 'jornada-hebraico' | 'jornada-israel' | 'jornada-raizes'
  | 'produto-alfabetizacao' | 'produto-hebraico-a1' | 'produto-israel-alem-do-roteiro' | 'produto-raizes-sefarditas'
  | 'palavra-ouvir' | 'palavra-revelar'
  | 'cta-curso' | 'cta-explorar'
  /* Mandados pela prévia do e-book (/previa), que é o app do livro e não usa
     este arquivo: estão aqui para o tipo bater com a lista do servidor. */
  | 'previa-visto' | 'previa-mochila-cheia' | 'previa-prato-pronto' | 'previa-diario-aberto' | 'previa-clique-curso'
  /* A página "Comece aqui" (/comece-aqui), o destino do link da bio. */
  | 'comece-visto' | 'comece-ler' | 'comece-israel' | 'comece-palavra' | 'comece-curso';

const enviados = new Set<EventoDoPortal>();

export function contarNoPortal(evento: EventoDoPortal): void {
  if (enviados.has(evento)) return;
  enviados.add(evento);
  try {
    /* `keepalive`: quase todo evento é um clique que navega, e um fetch comum
       morreria com a página. */
    void fetch(asset('/api/portal'), {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', keepalive: true,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evento })
    }).catch(() => {});
  } catch { /* sem fetch: segue sem contar */ }
}
