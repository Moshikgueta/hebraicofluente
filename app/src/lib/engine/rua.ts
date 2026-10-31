/* O Hebraico na rua (28/10/2026, pedido do dono: "faz tudo", item 1).
 * ─────────────────────────────────────────────────────────────────────────
 * Fotos reais de placas de Israel (Wikimedia Commons, data/hebraico-na-rua.json).
 * Cada placa tem uma palavra do curso que aparece nela, e o exercício é achar
 * essa palavra: "esta placa tem uma palavra que você já lê; qual?".
 *
 * Nada de hebraico novo: a palavra e as opções são palavras do curso, com a
 * grafia do curso. A placa só aparece quando o aluno já lê a palavra (a régua
 * de leitura de sempre, com as letras concluídas), e nenhuma opção errada é
 * uma palavra que também está na placa (`naPlaca`).
 */

import type { Letter } from '@/lib/content';
import { clean } from '@/lib/hebrew';
import { alfabetoDe, consegueLer, palavrasLegiveis, vocabularioDoCurso, type PalavraDoCurso } from './palavras';
import { rng, shuffled } from './rng';

export type PlacaDaRua = {
  id: string; arquivo: string;
  /** A palavra do curso que o aluno procura na placa. */
  palavra: string;
  /** Todas as palavras do curso que aparecem na placa. */
  naPlaca: string[];
  mostraPt: string;
  autor: string; licenca: string; licencaUrl?: string; data?: string;
  pagina: string; largura: number; altura: number;
};

/** As placas que o aluno já pode ler, e quantas ainda esperam. */
export function placasParaLer(placas: readonly PlacaDaRua[], concluidas: readonly Letter[]) {
  const alfabeto = alfabetoDe(concluidas);
  const prontas = placas.filter(p => consegueLer(p.palavra, alfabeto));
  return { prontas, faltam: placas.length - prontas.length };
}

/** As três opções da placa: a palavra certa e duas que o aluno também lê e
 *  que NÃO estão na placa, numa ordem fixa por placa. */
export function opcoesDaPlaca(placa: PlacaDaRua, concluidas: readonly Letter[], todas: readonly Letter[]): PalavraDoCurso[] {
  const legiveis = palavrasLegiveis(vocabularioDoCurso(todas), alfabetoDe(concluidas));
  const certa = legiveis.find(w => clean(w.he) === clean(placa.palavra));
  if (!certa) return [];
  const fora = new Set(placa.naPlaca.map(clean));
  const sorteio = rng(`rua-${placa.id}`);
  const vistos = new Set([certa.pt]);
  const erradas = shuffled(legiveis.filter(w => !fora.has(clean(w.he))), sorteio)
    .filter(w => (vistos.has(w.pt) ? false : (vistos.add(w.pt), true)))
    .slice(0, 2);
  return shuffled([certa, ...erradas], rng(`rua-ordem-${placa.id}`));
}
