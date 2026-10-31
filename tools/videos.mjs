/* Os vídeos do "Me explica, Moshik" (28/10/2026). Ver video/README.md.
   Separado do exportador para o teste poder chamar sem rodar a exportação. */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const TETO_DO_VIDEO = 25 * 1024 * 1024;

/** Copia video/<letra>.mp4 (e .vtt) para `destino` e devolve o manifesto. */
export function prepararVideos(origem, destino, letras) {
  rmSync(destino, { recursive: true, force: true });
  if (!existsSync(origem)) return [];
  const saida = [];
  for (const f of readdirSync(origem).sort()) {
    if (f === 'README.md' || f.startsWith('.')) continue;
    const m = /^([a-z-]+)\.(mp4|vtt)$/.exec(f);
    if (!m) throw new Error(`vídeo: ${f} não é <letra>.mp4 nem <letra>.vtt (ver video/README.md)`);
    if (!letras.has(m[1])) throw new Error(`vídeo: ${f} não tem o nome de uma letra do curso`);
    if (m[2] === 'vtt') {
      if (!existsSync(join(origem, `${m[1]}.mp4`))) throw new Error(`vídeo: ${f} é legenda de um vídeo que não existe`);
      continue;
    }
    if (statSync(join(origem, f)).size > TETO_DO_VIDEO) throw new Error(`vídeo: ${f} passa de 25 MiB`);
    mkdirSync(destino, { recursive: true });
    cpSync(join(origem, f), join(destino, f));
    const legenda = existsSync(join(origem, `${m[1]}.vtt`));
    if (legenda) cpSync(join(origem, `${m[1]}.vtt`), join(destino, `${m[1]}.vtt`));
    saida.push({ letra: m[1], legenda });
  }
  return saida;
}
