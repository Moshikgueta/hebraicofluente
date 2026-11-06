/* O retorno de um erro entre duas letras (12/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * "Essa não é X" diz que errou; não diz o que olhar. Quando a troca é entre
 * duas letras, o curso já tem a frase que separa as duas: `contrastes`, em
 * letters.json, 40 pares revisados ("O ד tem um pequeno traço..."). Esta
 * função acha a frase de uma troca, nos dois sentidos, e devolve as duas
 * letras para a tela pô-las lado a lado. Sem frase revisada para o par, não
 * inventa: devolve null, e o retorno de sempre continua valendo.
 */
import type { Letter } from '@/lib/content';
import { FINAL_TO_BASE } from '@/lib/hebrew';

export type TrocaDeLetras = {
  textoPt: string;
  certa: { glifo: string; nome: string };
  escolhida: { glifo: string; nome: string };
};

export function trocaDeLetras(certa: string, escolhida: string, letras: readonly Letter[]): TrocaDeLetras | null {
  if (!certa || !escolhida || certa === escolhida) return null;
  const dono = (g: string) => letras.find(l => l.letter === g || l.finalForm === g)
    ?? letras.find(l => l.letter === (FINAL_TO_BASE[g] ?? g));
  const a = dono(certa), b = dono(escolhida);
  if (!a || !b || a.id === b.id) return null;
  const texto = a.contrastes?.[escolhida] ?? a.contrastes?.[b.letter]
    ?? b.contrastes?.[certa] ?? b.contrastes?.[a.letter] ?? null;
  if (!texto) return null;
  return {
    textoPt: texto,
    certa: { glifo: certa, nome: a.namePt },
    escolhida: { glifo: escolhida, nome: b.namePt }
  };
}
