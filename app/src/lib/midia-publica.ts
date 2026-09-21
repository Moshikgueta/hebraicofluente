/* O que existe em /public, olhado na BUILD.
 * ─────────────────────────────────────────────────────────────────────────
 * A landing tem dois lugares que ficam melhores com um arquivo e continuam
 * de pé sem ele: a camada de atmosfera do hero e o retrato do professor.
 *
 * O jeito comum de resolver isso é uma constante - `TEM_FOTO = true` - que
 * alguém edita junto com o upload. Ela erra sempre do mesmo jeito: o arquivo
 * entra e a constante não, ou a constante entra e o arquivo não, e aí a
 * página pede um recurso que devolve 404 bem na primeira tela.
 *
 * Aqui quem responde é o DISCO. Estas funções rodam em componente de
 * servidor, durante a build estática, e o resultado viaja como prop para o
 * cliente. Pôr o arquivo na pasta é tudo o que é preciso fazer; tirar o
 * arquivo desliga o recurso sozinho, sem deixar link quebrado.
 *
 * Nada aqui pode ser importado de componente de cliente: `node:fs` não
 * existe no navegador, e o empacotador falha em vez de avisar.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PUBLICO = join(process.cwd(), 'public');

/** O primeiro caminho que existe de verdade, ou `null`. */
export function primeiroQueExiste(candidatos: readonly string[]): string | null {
  for (const rel of candidatos) {
    if (existsSync(join(PUBLICO, rel))) return `/${rel}`;
  }
  return null;
}
