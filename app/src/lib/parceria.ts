/* Parcerias (02/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Quem chega por hebraicofluente.com.br/sefarad (a associação sefardita,
 * @adsefaraditas) vem para a capa com `?parceria=sefarad`. A capa guarda o
 * nome neste aparelho, e o checkout mostra e pede o preço da parceria
 * (`price.parceriaBrl`) quando ele é menor que o preço do dia - hoje, R$ 147
 * também depois do fim do pré-lançamento.
 *
 * O navegador guarda só o NOME da parceria. O valor quem decide é o servidor,
 * pelo catálogo (worker/src/lib/catalog.js, `priceCents`), e a lista de nomes
 * válidos é a mesma dos dois lados.
 */
import type { CatalogCourse } from './catalog';

export const PARCERIAS: Record<string, { perfil: string }> = {
  sefarad: { perfil: '@adsefaraditas' }
};

const CHAVE = 'hf-parceria-v1';

const valida = (nome: unknown): nome is string => typeof nome === 'string' && nome in PARCERIAS;

/** Na capa: guarda a parceria que veio no endereço e limpa o endereço. */
export function guardarParceriaDaUrl(): void {
  try {
    const url = new URL(window.location.href);
    const nome = url.searchParams.get('parceria');
    if (!valida(nome)) return;
    localStorage.setItem(CHAVE, JSON.stringify({ nome, em: Date.now() }));
    url.searchParams.delete('parceria');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  } catch { /* sem armazenamento: segue sem parceria */ }
}

/** A parceria guardada neste aparelho, ou null. */
export function parceriaAtual(): string | null {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    return v && valida(v.nome) ? v.nome : null;
  } catch { return null; }
}

/** O preço da parceria, se houver e for menor que o do dia. */
export function precoDaParceria(c: CatalogCourse, nome: string | null): number | null {
  const p = c.price;
  return nome && valida(nome) && p.parceriaBrl && p.parceriaBrl > 0 && p.parceriaBrl < p.brl ? p.parceriaBrl : null;
}

/** O curso como o checkout deve mostrá-lo para quem veio da parceria. */
export function comParceria(c: CatalogCourse, nome: string | null): CatalogCourse {
  const v = precoDaParceria(c, nome);
  return v === null ? c : { ...c, price: { ...c.price, brl: v, listBrl: null, preLancamentoAte: null } };
}
