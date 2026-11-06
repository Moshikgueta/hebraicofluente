/* A trava da revisão nas frases (28/10/2026).
 *
 * As frases de data/sentences.json não tinham a trava `revisado` que os
 * mini-textos têm: uma frase escrita para o curso ia direto ao aluno. Agora
 * a que tem `"revisado": false` não sai do exportador (tools/export-content.mjs)
 * nem entra no roteiro de gravação (tools/gen-audio.mjs). Sem o campo, a
 * frase é das que já estavam no curso.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(__dirname, '..', '..');
type Frase = { id: string; revisado?: boolean };
const dado = (JSON.parse(readFileSync(join(raiz, 'data', 'sentences.json'), 'utf8')) as { sentences: Frase[] }).sentences;
const exportado = (JSON.parse(readFileSync(join(raiz, 'app', 'content', 'sentences.json'), 'utf8')) as { sentences: Frase[] }).sentences;

describe('as frases e a revisão', () => {
  it('o conteúdo exportado tem exatamente as frases aprovadas', () => {
    const aprovadas = dado.filter(f => f.revisado !== false).map(f => f.id).sort();
    expect(exportado.map(f => f.id).sort()).toEqual(aprovadas);
  });

  it('o exportador e o roteiro de gravação deixam de fora a não revisada', () => {
    expect(readFileSync(join(raiz, 'tools', 'export-content.mjs'), 'utf8'))
      .toContain('sentences.sentences.filter(s2 => s2.revisado !== false)');
    expect(readFileSync(join(raiz, 'tools', 'gen-audio.mjs'), 'utf8'))
      .toContain(".sentences.filter(f => f.revisado !== false)");
  });
});
