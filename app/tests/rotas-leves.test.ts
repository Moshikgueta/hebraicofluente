/* As páginas leves não baixam o progresso do aluno (23/10/2026, velocidade no
 * celular). Em `ROTAS_LEVES` (lib/rotas.ts) o ProgressProvider não monta, então
 * `useProgress()` ali lançaria erro. Este teste segue os imports estáticos de
 * cada página leve e falha se algum chegar a lib/state/store.tsx, ou se um
 * motor pesado (o exame, a casca do aluno) voltar para o layout raiz. */
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROTAS_LEVES, isPublicRoute, rotaLeve } from '@/lib/rotas';
import { BASE } from '../next.config';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '../src');

function resolver(de: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = join(SRC, spec.slice(2));
  else if (spec.startsWith('.')) base = normalize(join(dirname(de), spec));
  else return null;
  for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    if (existsSync(base + ext) && !base.endsWith('/') && (ext || /\.(tsx?|mjs|js)$/.test(base))) return base + ext;
  }
  return null;
}

/** Imports estáticos (não `import type`, não `import()`). */
function importsDe(arquivo: string): string[] {
  const s = readFileSync(arquivo, 'utf8');
  const out: string[] = [];
  for (const m of s.matchAll(/^(?:import|export)\s+(?!type\b)[^;]*?from\s+'([^']+)'/gm)) {
    const r = resolver(arquivo, m[1]!);
    if (r) out.push(r);
  }
  return out;
}

/** O caminho de `de` até um arquivo que termina em `alvo`, ou null. */
function caminho(de: string, alvo: string): string[] | null {
  const veio = new Map<string, string | null>([[de, null]]);
  const fila = [de];
  while (fila.length) {
    const f = fila.shift()!;
    if (f.endsWith(alvo)) {
      const c: string[] = [];
      for (let x: string | null | undefined = f; x; x = veio.get(x)) c.push(x.replace(SRC + '/', ''));
      return c;
    }
    for (const g of importsDe(f)) if (!veio.has(g)) { veio.set(g, f); fila.push(g); }
  }
  return null;
}

const paginaDe = (rota: string) => join(SRC, 'app', rota === '/' ? '' : rota.slice(1), 'page.tsx');

describe('rotas leves', () => {
  it('toda rota leve é pública e tem página', () => {
    for (const r of ROTAS_LEVES) {
      expect(isPublicRoute(r), r).toBe(true);
      expect(existsSync(paginaDe(r)), r).toBe(true);
    }
  });

  it('nenhuma página leve chega ao progresso do aluno', () => {
    for (const r of ROTAS_LEVES) expect(caminho(paginaDe(r), 'lib/state/store.tsx'), r).toBeNull();
  });

  it('o layout raiz não importa o progresso, o exame nem a casca do aluno', () => {
    const layout = join(SRC, 'app/layout.tsx');
    for (const alvo of ['lib/state/store.tsx', 'lib/engine/exam.ts', 'components/shell/AppShell.tsx', 'components/shell/CourseGate.tsx'])
      expect(caminho(layout, alvo), alvo).toBeNull();
  });

  it('o pedaço `base` (next.config.ts) só junta o que o layout raiz já importa', () => {
    const layout = join(SRC, 'app/layout.tsx');
    const alvos = ['lib/catalog.ts', 'lib/content-publico.ts', 'lib/empresa.ts', 'lib/hebrew.ts', 'lib/raizes.ts',
      'lib/state/raizes-estado.ts', 'lib/account/types.ts', 'lib/account/store.tsx', 'lib/account/api.ts'];
    for (const a of alvos) {
      expect(BASE.test(join(SRC, a)), a).toBe(true);
      expect(caminho(layout, a), a).not.toBeNull();
    }
    /* e nada do curso pago nem do progresso entra nele */
    for (const fora of ['lib/state/store.tsx', 'lib/content-servidor.ts', 'lib/content.ts', 'lib/engine/exam.ts'])
      expect(BASE.test(join(SRC, fora)), fora).toBe(false);
    expect(BASE.test(join(SRC, '../content/letters.json'))).toBe(false);
  });

  it('a barra final e a lição não mudam a decisão', () => {
    expect(rotaLeve('/')).toBe(true);
    expect(rotaLeve('/curso-de-hebraico/')).toBe(true);
    expect(rotaLeve('/cursos')).toBe(false);
    expect(rotaLeve('/licao/alef/')).toBe(false);
    expect(rotaLeve('/perfil')).toBe(false);
  });
});
